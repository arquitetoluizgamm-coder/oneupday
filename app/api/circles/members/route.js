import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { canManageCircle, canModerateCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function GET(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const circleId = new URL(request.url).searchParams.get('circleId');
  if (!circleId) return bad('circle_required');
  const { data, error } = await supabase.from('circle_members')
    .select('id,user_id,role,status,display_name,joined_at,profiles:profiles!circle_members_user_id_fkey(id,name,avatar_url,avatar_color)')
    .eq('circle_id', circleId).eq('status', 'active').order('joined_at');
  return error ? bad('members_private', 403) : NextResponse.json({ members: data || [] });
}

export async function PATCH(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const targetUserId = String(body.user_id || '');
  const action = String(body.action || '');
  const { data: actor } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canModerateCircle(actor)) return bad('moderator_required', 403);
  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const { data: circle } = await admin.from('circles').select('owner_id').eq('id', circleId).maybeSingle();
  const { data: target } = await admin.from('circle_members').select('id,role,status').eq('circle_id', circleId).eq('user_id', targetUserId).maybeSingle();
  if (!circle || !target || targetUserId === circle.owner_id) return bad('target_not_allowed', 403);
  if (target.role === 'admin' && actor.role !== 'owner') return bad('owner_required', 403);

  let patch;
  let auditAction;
  if (action === 'set_role') {
    if (actor.role !== 'owner' || !['admin','moderator','member'].includes(body.role)) return bad('owner_required', 403);
    patch = { role: body.role };
    auditAction = 'permission_changed';
  } else if (action === 'suspend') {
    if (!canModerateCircle(actor)) return bad('moderator_required', 403);
    patch = { status: 'suspended', suspended_until: null };
    auditAction = 'member_suspended';
  } else if (action === 'restore') {
    if (!canManageCircle(actor) || target.status !== 'suspended') return bad('manager_required', 403);
    patch = { status: 'active', suspended_until: null };
    auditAction = 'member_restored';
  } else if (action === 'remove') {
    patch = { status: 'removed', suspended_until: null };
    auditAction = 'member_removed';
  } else if (action === 'block') {
    if (!canManageCircle(actor)) return bad('manager_required', 403);
    patch = { status: 'blocked', suspended_until: null };
    auditAction = 'member_blocked';
  } else return bad('invalid_action');

  const { error } = await admin.from('circle_members').update(patch).eq('id', target.id).eq('circle_id', circleId);
  if (error) return bad('member_update_failed', 500);
  await admin.from('circle_notification_preferences').update({ enabled: action === 'restore' }).eq('circle_id', circleId).eq('user_id', targetUserId);
  await admin.from('circle_moderation_actions').insert({ circle_id: circleId, actor_id: user.id, action: auditAction, target_type: 'member', target_id: targetUserId, reason: String(body.reason || '') });
  await admin.from('circle_audit_logs').insert({ circle_id: circleId, actor_id: user.id, action: auditAction, target_type: 'member', target_id: targetUserId });
  return NextResponse.json({ ok: true });
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'leave' || !body.circle_id) return bad('invalid_action');
  const { error } = await supabase.rpc('leave_circle', { p_circle_id: body.circle_id });
  return error ? bad('leave_failed', 400) : NextResponse.json({ ok: true });
}
