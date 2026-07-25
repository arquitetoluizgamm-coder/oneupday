import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Marca presença de hoje no desafio (1 por dia, fuso BRT)
export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).maybeSingle();
  if (!ch || ch.status !== 'active' || (ch.from_id !== user.id && ch.to_id !== user.id)) {
    return NextResponse.json({ error: 'not-allowed' }, { status: 403 });
  }

  const dayKey = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const { error } = await supabase.from('challenge_checks').insert({ challenge_id: id, user_id: user.id, day_key: dayKey });
  if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
    return NextResponse.json({ error: 'db' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, dayKey });
}
