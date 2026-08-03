import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isRoutineFeatureEnabled } from '../../../../lib/routines/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  if (!isRoutineFeatureEnabled()) return NextResponse.json({ error: 'feature_disabled' }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.routine_id || '');
  const name = String(body.name || '').trim().slice(0, 120);
  const ideal = String(body.ideal_text || '').trim().slice(0, 240);
  if (!id || !name || !ideal) return NextResponse.json({ error: 'required' }, { status: 400 });
  const patch = {
    name, ideal_text: ideal, minimum_text: String(body.minimum_text || '').trim().slice(0, 240) || null,
    schedule_type: ['daily', 'weekdays', 'weekly_target'].includes(body.schedule_type) ? body.schedule_type : 'daily',
    weekdays: Array.isArray(body.weekdays) ? body.weekdays.map(Number).filter((day) => day >= 0 && day <= 6) : [],
    weekly_target: body.schedule_type === 'weekly_target' ? Math.max(1, Math.min(7, Number(body.weekly_target) || 1)) : null,
    period: body.period || 'anytime', privacy: ['private', 'milestones', 'profile'].includes(body.privacy) ? body.privacy : 'private',
    linked_journey_id: body.linked_journey_id || null,
  };
  const { data, error } = await supabase.from('routines').update(patch).eq('id', id).eq('owner_id', user.id).select('*').single();
  if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
  try { await supabase.from('events').insert({ user_id: user.id, name: 'routine_frequency_adjusted', meta: { routine_id: id, source_screen: 'routines' } }); } catch {}
  return NextResponse.json({ routine: data });
}
