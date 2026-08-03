import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isRoutineFeatureEnabled } from '../../../../lib/routines/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isRoutineFeatureEnabled()) return NextResponse.json({ error: 'feature_disabled' }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.routine_id || '');
  const { data: routine } = await supabase.from('routines').select('id, name, privacy').eq('id', id).eq('owner_id', user.id).maybeSingle();
  if (!routine) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const milestone = String(body.milestone || '');
  if (routine.privacy === 'private' && !milestone) return NextResponse.json({ error: 'private' }, { status: 403 });
  const text = milestone || `Estou mantendo ${routine.name} presente, um dia de cada vez.`;
  try { await supabase.from('events').insert({ user_id: user.id, name: 'routine_milestone_shared', meta: { routine_id: id, source_screen: 'routines' } }); } catch {}
  return NextResponse.json({ title: routine.name, text });
}
