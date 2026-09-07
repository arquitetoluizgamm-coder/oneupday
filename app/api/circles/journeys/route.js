import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { canManageCircle } from '../../../../lib/circles/policy.mjs';
import { rateLimit } from '../../../../lib/ratelimit';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:journey:${user.id}`, 40, 3600000)) return bad('rate_limited', 429);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const action = String(body.action || 'join');
  if (!circleId) return bad('circle_required');
  if (action === 'create') {
    const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
    if (!canManageCircle(member)) return bad('manager_required', 403);
    const title = String(body.title || '').trim();
    const totalDays = Math.max(1, Math.min(366, Number(body.total_days) || 30));
    if (title.length < 3 || title.length > 160) return bad('invalid_journey');
    const { data, error } = await supabase.from('circle_journey_templates').insert({ circle_id: circleId, created_by: user.id, title, description: String(body.description || '').trim(), objective: String(body.objective || '').trim(), total_days: totalDays, guidance: Array.isArray(body.guidance) ? body.guidance : [], status: 'active' }).select('id,title,total_days').single();
    return error ? bad('journey_create_failed', 403) : NextResponse.json({ journey: data }, { status: 201 });
  }
  if (action === 'join') {
    const templateId = String(body.template_id || '');
    const { data, error } = await supabase.from('circle_member_journeys').insert({ circle_id: circleId, template_id: templateId, user_id: user.id }).select('id,template_id,status,current_day').single();
    return error ? bad('journey_join_failed', 403) : NextResponse.json({ journey: data }, { status: 201 });
  }
  return bad('invalid_action');
}

export async function PATCH(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const status = ['active','paused','completed','left'].includes(body.status) ? body.status : 'active';
  const currentDay = Math.max(0, Math.min(366, Number(body.current_day) || 0));
  const patch = { status, current_day: currentDay, progress: body.progress && typeof body.progress === 'object' ? body.progress : {}, completed_at: status === 'completed' ? new Date().toISOString() : null };
  const { data, error } = await supabase.from('circle_member_journeys').update(patch).eq('id', String(body.member_journey_id || '')).eq('user_id', user.id).select('id,status,current_day,completed_at').single();
  return error ? bad('journey_update_failed', 403) : NextResponse.json({ journey: data });
}
