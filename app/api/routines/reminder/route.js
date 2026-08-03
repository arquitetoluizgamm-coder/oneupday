import { NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { sendPush, pushReady } from '../../../../lib/push';
import { isRoutineFeatureEnabled } from '../../../../lib/routines/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin() { return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } }); }
function authorised(req) { const secret = process.env.CRON_SECRET; return !secret || req.headers.get('authorization') === `Bearer ${secret}`; }

export async function GET(req) {
  if (!authorised(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!isRoutineFeatureEnabled() || !pushReady()) return NextResponse.json({ sent: 0, disabled: true });
  const sb = admin(); const today = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const { data: routines } = await sb.from('routines').select('id, owner_id, status, pause_until').eq('status', 'active');
  const active = (routines || []).filter((routine) => !routine.pause_until || routine.pause_until < today);
  if (!active.length) return NextResponse.json({ sent: 0 });
  const owners = [...new Set(active.map((routine) => routine.owner_id))];
  const [{ data: profiles }, { data: logs }, { data: subs }] = await Promise.all([
    sb.from('profiles').select('id, push_on, notif_paused').in('id', owners),
    sb.from('routine_logs').select('routine_id, owner_id, log_date, state').in('routine_id', active.map((routine) => routine.id)).eq('log_date', today),
    sb.from('push_subs').select('*').in('user_id', owners),
  ]);
  const pref = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]));
  const done = new Set((logs || []).map((log) => log.routine_id));
  const byOwner = {};
  (subs || []).forEach((sub) => { (byOwner[sub.user_id] ||= []).push(sub); });
  let sent = 0;
  for (const ownerId of owners) {
    const p = pref[ownerId] || {};
    if (p.push_on === false || p.notif_paused || !byOwner[ownerId]) continue;
    const due = active.find((routine) => routine.owner_id === ownerId && !done.has(routine.id));
    if (!due) continue;
    const payload = { title: 'Sua rotina continua aqui', body: 'Quer voltar hoje pela versão mínima?', url: '/rotinas', tag: 'oud-routine' };
    for (const sub of byOwner[ownerId]) {
      const result = await sendPush(sub, payload);
      if (result.status === 404 || result.status === 410) await sb.from('push_subs').delete().eq('id', sub.id);
      if (result.ok) sent += 1;
    }
  }
  return NextResponse.json({ sent, date: today });
}
