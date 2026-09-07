import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { canModerateCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';
import { rateLimit } from '../../../../lib/ratelimit';

const REASONS = new Set(['harassment','offensive','privacy','spam','inappropriate','other']);
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:report:${user.id}`, 20, 86400000)) return bad('rate_limited', 429);
  const body = await request.json().catch(() => ({}));
  const targetType = ['post','comment','member'].includes(body.target_type) ? body.target_type : '';
  const reason = REASONS.has(body.reason) ? body.reason : 'other';
  if (!body.circle_id || !body.target_id || !targetType) return bad('invalid_report');
  const { data, error } = await supabase.from('circle_reports').insert({ circle_id: body.circle_id, reporter_id: user.id, target_type: targetType, target_id: body.target_id, reason, details: String(body.details || '').trim() }).select('id,status').single();
  return error ? bad('report_not_allowed', 403) : NextResponse.json({ report: data }, { status: 201 });
}

export async function PATCH(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canModerateCircle(member)) return bad('moderator_required', 403);
  const status = ['reviewing','resolved','dismissed'].includes(body.status) ? body.status : 'reviewing';
  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const { error } = await admin.from('circle_reports').update({ status, handled_by: user.id }).eq('id', String(body.report_id || '')).eq('circle_id', circleId);
  return error ? bad('report_update_failed', 500) : NextResponse.json({ ok: true });
}
