import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isRoutineFeatureEnabled } from '../../../../lib/routines/flags';
import { routinePublication, routineVisibility } from '../../../../lib/routines/publication';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  if (!isRoutineFeatureEnabled()) return NextResponse.json({ error: 'feature_disabled' }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.routine_id || '');
  const name = String(body.name || '').trim();
  const ideal = String(body.ideal_text || '').trim();
  if (!id || !name || !ideal) return NextResponse.json({ error: 'required' }, { status: 400 });
  const { data: existing } = await supabase.from('routines').select('*').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const linkedJourneyId = body.linked_journey_id || null;
  if (linkedJourneyId) {
    const { data: journey } = await supabase.from('journeys').select('id').eq('id', linkedJourneyId).eq('owner_id', user.id).maybeSingle();
    if (!journey) return NextResponse.json({ error: 'journey_not_found' }, { status: 404 });
  }
  const scheduleType = ['daily', 'weekdays', 'weekly_target'].includes(body.schedule_type)
    ? body.schedule_type
    : existing.schedule_type;
  const privacy = routineVisibility(body.privacy || existing.privacy);
  const patch = {
    name, ideal_text: ideal, minimum_text: String(body.minimum_text || '').trim() || null,
    schedule_type: scheduleType,
    weekdays: Array.isArray(body.weekdays) ? body.weekdays.map(Number).filter((day) => day >= 0 && day <= 6) : existing.weekdays,
    weekly_target: scheduleType === 'weekly_target' ? Math.max(1, Math.min(7, Number(body.weekly_target) || existing.weekly_target || 1)) : null,
    period: body.period || existing.period || 'anytime', privacy,
    linked_journey_id: linkedJourneyId,
  };
  const { data, error } = await supabase.from('routines').update(patch).eq('id', id).eq('owner_id', user.id).select('*').single();
  if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
  const publicationRow = routinePublication(body, user.id, id, privacy);
  const { data: existingPublication } = await supabase.from('media').select('id').eq('routine_id', id).eq('user_id', user.id).maybeSingle();
  let publication = null;
  if (!publicationRow && existingPublication) {
    const { error: publicationError } = await supabase.from('media').delete().eq('id', existingPublication.id).eq('user_id', user.id);
    if (publicationError) return NextResponse.json({ error: 'db', detail: publicationError.message }, { status: 500 });
  } else if (publicationRow && existingPublication) {
    const { data: savedPublication, error: publicationError } = await supabase.from('media').update(publicationRow).eq('id', existingPublication.id).eq('user_id', user.id).select('*').single();
    if (publicationError) return NextResponse.json({ error: 'db', detail: publicationError.message }, { status: 500 });
    publication = savedPublication;
  } else if (publicationRow) {
    const { data: savedPublication, error: publicationError } = await supabase.from('media').insert(publicationRow).select('*').single();
    if (publicationError) return NextResponse.json({ error: 'db', detail: publicationError.message }, { status: 500 });
    publication = savedPublication;
  }
  try { await supabase.from('events').insert({ user_id: user.id, name: 'routine_frequency_adjusted', meta: { routine_id: id, source_screen: 'routines' } }); } catch {}
  return NextResponse.json({ routine: { ...data, publication } });
}
