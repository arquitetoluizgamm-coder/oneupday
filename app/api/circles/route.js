import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { circleAuth } from '../../../lib/circles/server';
import { canCreateCircle, canManageCircle, circleSlug, normalizeCircleSettings } from '../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../lib/dono';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function responseError(error, status = 400, detail) {
  return NextResponse.json({ error, ...(detail ? { detail } : {}) }, { status });
}

export async function GET() {
  const { supabase, user } = await circleAuth();
  if (!user) return responseError('authentication_required', 401);
  const { data, error } = await supabase.from('circle_members')
    .select('role, status, display_name, joined_at, circles(id, slug, name, description, cover_path, settings, status, updated_at)')
    .eq('user_id', user.id).eq('status', 'active').order('joined_at', { ascending: false });
  if (error) return responseError('circles_unavailable', 503, error.message);
  return NextResponse.json({ circles: data || [] });
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return responseError('authentication_required', 401);
  if (!rateLimit(`circle:create:${user.id}`, 5, 86400000)) return responseError('rate_limited', 429);

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const welcome = String(body.welcome_message || '').trim();
  const rules = Array.isArray(body.rules) ? body.rules.map((rule) => String(rule || '').trim()).filter(Boolean) : [];
  if (name.length < 3 || name.length > 80 || rules.length === 0) return responseError('invalid_circle');

  const { data: profile } = await supabase.from('profiles')
    .select('is_professional_verified').eq('id', user.id).maybeSingle();
  if (!canCreateCircle(profile)) return responseError('verified_professional_required', 403);

  const baseSlug = circleSlug(body.slug || name);
  if (!baseSlug) return responseError('invalid_circle_slug');
  const settings = normalizeCircleSettings(body.settings || {});
  let result = await supabase.rpc('create_circle', {
    p_name: name,
    p_slug: baseSlug,
    p_description: description,
    p_welcome_message: welcome,
    p_rules: rules,
    p_settings: settings,
  });
  if (result.error?.code === '23505') {
    result = await supabase.rpc('create_circle', {
      p_name: name,
      p_slug: `${baseSlug.slice(0, 63)}-${randomUUID().slice(0, 6)}`,
      p_description: description,
      p_welcome_message: welcome,
      p_rules: rules,
      p_settings: settings,
    });
  }
  if (result.error) return responseError('circle_create_failed', 400, result.error.message);
  const circle = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!circle?.id || !circle?.slug) return responseError('circle_create_failed', 500);
  try { await supabase.from('events').insert({ user_id: user.id, name: 'circle_created', meta: { circle_id: circle.id } }); } catch {}
  return NextResponse.json({ circle }, { status: 201 });
}

export async function PATCH(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return responseError('authentication_required', 401);
  if (!rateLimit(`circle:update:${user.id}`, 60, 3600000)) return responseError('rate_limited', 429);

  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const action = String(body.action || '');
  if (!circleId) return responseError('circle_required');

  const { data: member } = await supabase.from('circle_members')
    .select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canManageCircle(member)) return responseError('manager_required', 403);
  const admin = clienteServico();
  if (!admin) return responseError('service_unavailable', 503);

  let patch = null;
  let auditAction = '';
  if (action === 'cover') {
    const coverPath = String(body.cover_path || '');
    if (!coverPath.startsWith(`${circleId}/`)) return responseError('invalid_cover_path');
    patch = { cover_path: coverPath };
    auditAction = 'circle_cover_updated';
  } else if (action === 'details') {
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const welcomeMessage = String(body.welcome_message || '').trim();
    if (name.length < 3 || name.length > 80 || description.length > 5000 || welcomeMessage.length > 5000) {
      return responseError('invalid_circle_details');
    }
    patch = { name, description, welcome_message: welcomeMessage };
    auditAction = 'circle_details_updated';
  } else if (action === 'settings') {
    const { data: currentCircle } = await admin.from('circles').select('settings').eq('id', circleId).maybeSingle();
    if (!currentCircle) return responseError('circle_not_found', 404);
    patch = { settings: normalizeCircleSettings({ ...(currentCircle.settings || {}), ...(body.settings || {}) }) };
    auditAction = 'circle_settings_updated';
  } else if (action === 'rules') {
    const rules = Array.isArray(body.rules) ? body.rules.map((rule) => String(rule || '').trim()).filter(Boolean) : [];
    if (!rules.length || rules.length > 50 || rules.some((rule) => rule.length > 1000)) return responseError('invalid_circle_rules');
    const { data: circle } = await admin.from('circles').select('current_rules_version').eq('id', circleId).maybeSingle();
    if (!circle) return responseError('circle_not_found', 404);
    const nextVersion = Number(circle.current_rules_version || 0) + 1;
    const { error: rulesError } = await admin.from('circle_rules').insert({
      circle_id: circleId,
      version: nextVersion,
      rules,
      created_by: user.id,
      requires_reaccept: body.requires_reaccept === true,
    });
    if (rulesError) return responseError('rules_update_failed', 500, rulesError.message);
    patch = { current_rules_version: nextVersion };
    auditAction = 'circle_rules_updated';
  } else if (action === 'close') {
    if (member.role !== 'owner') return responseError('owner_required', 403);
    patch = { status: 'closed' };
    auditAction = 'circle_closed';
  } else {
    return responseError('invalid_action');
  }

  const { error } = await admin.from('circles').update(patch).eq('id', circleId);
  if (error) return responseError('circle_update_failed', 500, error.message);

  if (action === 'details') {
    const { error: publicationError } = await admin.from('circle_feed_publications').update({
      circle_name: patch.name,
      circle_description: patch.description,
    }).eq('circle_id', circleId).eq('status', 'active');
    if (publicationError) console.error('[circles] feed publication sync failed', { code: publicationError.code, message: publicationError.message });
  }

  if (action === 'close') {
    const withdrawnAt = new Date().toISOString();
    const { data: publications, error: publicationError } = await admin.from('circle_feed_publications')
      .select('id,invite_id')
      .eq('circle_id', circleId)
      .eq('status', 'active');
    if (!publicationError && publications?.length) {
      await admin.from('circle_feed_publications').update({ status: 'withdrawn', withdrawn_at: withdrawnAt }).in('id', publications.map((item) => item.id));
      await admin.from('circle_invites').update({ status: 'revoked', revoked_at: withdrawnAt }).in('id', publications.map((item) => item.invite_id)).eq('status', 'pending');
    } else if (publicationError) {
      console.error('[circles] feed publication close failed', { code: publicationError.code, message: publicationError.message });
    }
  }

  await admin.from('circle_audit_logs').insert({
    circle_id: circleId,
    actor_id: user.id,
    action: auditAction,
    target_type: 'circle',
    target_id: circleId,
  });
  return NextResponse.json({ ok: true });
}
