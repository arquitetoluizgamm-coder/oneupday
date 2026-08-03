import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { isRoutineFeatureEnabled } from '../../../../lib/routines/flags';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req) {
  if (!isRoutineFeatureEnabled()) return NextResponse.json({ error: 'feature_disabled' }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.routine_id || '');
  if (!id) return NextResponse.json({ error: 'routine_id' }, { status: 400 });
  const { error } = await supabase.from('routines').delete().eq('id', id).eq('owner_id', user.id);
  if (error) return NextResponse.json({ error: 'db', detail: error.message }, { status: 500 });
  try { await supabase.from('events').insert({ user_id: user.id, name: 'routine_deleted', meta: { routine_id: id, source_screen: 'routines' } }); } catch {}
  return NextResponse.json({ ok: true });
}
