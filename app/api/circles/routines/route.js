import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { canManageCircle } from '../../../../lib/circles/policy.mjs';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const action = String(body.action || 'join');
  if (!circleId) return bad('circle_required');
  if (action === 'create') {
    const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
    if (!canManageCircle(member)) return bad('manager_required', 403);
    const title = String(body.title || '').trim();
    if (title.length < 3 || title.length > 160) return bad('invalid_routine');
    const { data, error } = await supabase.from('circle_routines').insert({ circle_id: circleId, created_by: user.id, title, description: String(body.description || '').trim(), schedule: body.schedule && typeof body.schedule === 'object' ? body.schedule : {}, status: 'active' }).select('id,title').single();
    return error ? bad('routine_create_failed', 403) : NextResponse.json({ routine: data }, { status: 201 });
  }
  if (action === 'join') {
    const { data, error } = await supabase.from('circle_routine_members').insert({ circle_id: circleId, routine_id: String(body.routine_id || ''), user_id: user.id }).select('id,routine_id,status').single();
    return error ? bad('routine_join_failed', 403) : NextResponse.json({ membership: data }, { status: 201 });
  }
  if (action === 'checkin') {
    const { data, error } = await supabase.from('circle_routine_checkins').insert({ circle_id: circleId, routine_id: String(body.routine_id || ''), user_id: user.id, checkin_date: body.checkin_date || new Date().toISOString().slice(0, 10), note: String(body.note || '').trim() }).select('id,checkin_date,note').single();
    return error ? bad('routine_checkin_failed', 403) : NextResponse.json({ checkin: data }, { status: 201 });
  }
  return bad('invalid_action');
}
