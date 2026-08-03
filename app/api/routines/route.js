import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { isRoutineFeatureEnabled } from '../../../lib/routines/flags';
import { localDate, dateDiff } from '../../../lib/routines/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bad(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function auth() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function event(supabase, userId, name, properties = {}) {
  try { await supabase.from('events').insert({ user_id: userId, name, meta: properties }); }
  catch { try { await supabase.from('events').insert({ user_id: userId, name }); } catch {} }
}

export async function GET() {
  if (!isRoutineFeatureEnabled()) return bad('feature_disabled', 404);
  const { supabase, user } = await auth();
  if (!user) return bad('auth', 401);

  const [{ data: routines, error }, { data: logs }, { data: journeys }] = await Promise.all([
    supabase.from('routines').select('*').eq('owner_id', user.id).neq('status', 'archived').order('created_at', { ascending: true }),
    supabase.from('routine_logs').select('*').eq('owner_id', user.id).order('log_date', { ascending: false }).limit(500),
    supabase.from('journeys').select('id, title').eq('owner_id', user.id).order('created_at', { ascending: false }),
  ]);
  if (error) return NextResponse.json({ error: 'migration_required', detail: error.message }, { status: 503 });
  return NextResponse.json({ routines: routines || [], logs: logs || [], journeys: journeys || [] });
}

export async function POST(req) {
  if (!isRoutineFeatureEnabled()) return bad('feature_disabled', 404);
  const { supabase, user } = await auth();
  if (!user) return bad('auth', 401);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');

  if (action === 'create') {
    const name = String(body.name || '').trim().slice(0, 120);
    const ideal = String(body.ideal_text || '').trim().slice(0, 240);
    const minimum = String(body.minimum_text || '').trim().slice(0, 240) || null;
    if (!name || !ideal) return bad('required');
    const scheduleType = ['daily', 'weekdays', 'weekly_target'].includes(body.schedule_type) ? body.schedule_type : 'daily';
    const weekdays = Array.isArray(body.weekdays) ? body.weekdays.map(Number).filter((n) => n >= 0 && n <= 6) : [];
    const weeklyTarget = scheduleType === 'weekly_target' ? Math.max(1, Math.min(7, Number(body.weekly_target) || 1)) : null;
    if (scheduleType === 'weekdays' && weekdays.length === 0) return bad('weekdays_required');
    const journeyId = body.linked_journey_id || null;
    if (journeyId) {
      const { data: journey } = await supabase.from('journeys').select('id').eq('id', journeyId).eq('owner_id', user.id).maybeSingle();
      if (!journey) return bad('journey_not_found', 404);
    }
    const { data, error } = await supabase.from('routines').insert({
      owner_id: user.id, name, ideal_text: ideal, minimum_text: minimum,
      schedule_type: scheduleType, weekdays, weekly_target: weeklyTarget,
      start_date: body.start_date || localDate(), preferred_time: body.preferred_time || null,
      period: body.period || 'anytime', linked_journey_id: journeyId,
      privacy: ['private', 'milestones', 'profile'].includes(body.privacy) ? body.privacy : 'private',
    }).select('*').single();
    if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
    await event(supabase, user.id, 'routine_created', { routine_id: data.id, linked_to_journey: !!journeyId, schedule_type: scheduleType, minimum_enabled: !!minimum, privacy: data.privacy, source_screen: 'routines' });
    return NextResponse.json({ routine: data });
  }

  const routineId = String(body.routine_id || '');
  if (!routineId) return bad('routine_id');
  const { data: routine } = await supabase.from('routines').select('*').eq('id', routineId).eq('owner_id', user.id).maybeSingle();
  if (!routine) return bad('not_found', 404);

  if (action === 'log') {
    const state = ['ideal', 'minimum', 'not_today'].includes(body.state) ? body.state : null;
    if (!state) return bad('state');
    const logDate = body.log_date || localDate();
    const { data: previousLogs } = await supabase.from('routine_logs').select('log_date, state').eq('routine_id', routineId).order('log_date', { ascending: false }).limit(30);
    const previousPresence = (previousLogs || []).find((log) => log.state === 'ideal' || log.state === 'minimum');
    const intentionalPause = (previousLogs || []).some((log) => log.state === 'paused' && log.log_date < logDate);
    const returning = !!previousPresence && (intentionalPause || dateDiff(previousPresence.log_date, logDate) >= 3);
    const { data, error } = await supabase.from('routine_logs').upsert({ routine_id: routineId, owner_id: user.id, log_date: logDate, state, note: String(body.note || '').trim().slice(0, 500) || null }, { onConflict: 'routine_id,log_date' }).select('*').single();
    if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
    await event(supabase, user.id, state === 'ideal' ? 'routine_ideal_completed' : state === 'minimum' ? 'routine_minimum_completed' : 'routine_not_today_selected', { routine_id: routineId, return_after_pause: returning, source_screen: 'routines' });
    if (returning) await event(supabase, user.id, 'routine_return_detected', { routine_id: routineId, source_screen: 'routines' });
    return NextResponse.json({ log: data, returning });
  }

  if (action === 'pause') {
    const until = body.pause_until || null;
    const note = String(body.pause_note || '').trim().slice(0, 240) || null;
    const { data, error } = await supabase.from('routines').update({ status: 'paused', pause_until: until, pause_note: note }).eq('id', routineId).eq('owner_id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
    const today = localDate();
    await supabase.from('routine_logs').upsert({ routine_id: routineId, owner_id: user.id, log_date: today, state: 'paused' }, { onConflict: 'routine_id,log_date' });
    await event(supabase, user.id, 'routine_paused', { routine_id: routineId, source_screen: 'routines' });
    return NextResponse.json({ routine: data });
  }

  if (action === 'resume') {
    const { data, error } = await supabase.from('routines').update({ status: 'active', pause_until: null, pause_note: null }).eq('id', routineId).eq('owner_id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
    await event(supabase, user.id, 'routine_resumed', { routine_id: routineId, source_screen: 'routines' });
    return NextResponse.json({ routine: data });
  }

  if (action === 'archive') {
    const { data, error } = await supabase.from('routines').update({ status: 'archived' }).eq('id', routineId).eq('owner_id', user.id).select('*').single();
    if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
    await event(supabase, user.id, 'routine_archived', { routine_id: routineId, source_screen: 'routines' });
    return NextResponse.json({ routine: data });
  }

  return bad('action');
}
