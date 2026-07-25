import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cria um desafio (caminhada junta, sem vencedor)
export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const toId = body.toId;
  const title = String(body.title || '').trim();
  const days = parseInt(body.days, 10);
  if (!toId || toId === user.id || title.length < 3 || title.length > 80 || ![7, 14, 30].includes(days)) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // desafio é entre quem se segue (qualquer direção)
  const [a, b] = await Promise.all([
    supabase.from('profile_follows').select('follower_id').eq('follower_id', user.id).eq('following_id', toId).maybeSingle(),
    supabase.from('profile_follows').select('follower_id').eq('follower_id', toId).eq('following_id', user.id).maybeSingle(),
  ]);
  if (!a.data && !b.data) return NextResponse.json({ error: 'not-connected' }, { status: 403 });

  // uma dupla só pode ter um desafio aberto por vez
  const { data: existing } = await supabase.from('challenges')
    .select('id')
    .or(`and(from_id.eq.${user.id},to_id.eq.${toId}),and(from_id.eq.${toId},to_id.eq.${user.id})`)
    .in('status', ['pending', 'active'])
    .limit(1);
  if (existing && existing.length) return NextResponse.json({ error: 'exists' }, { status: 409 });

  const { data, error } = await supabase.from('challenges')
    .insert({ from_id: user.id, to_id: toId, title, days, status: 'pending' })
    .select('id').single();
  if (error) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

// Aceita ou recusa
export async function PATCH(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, action } = body;
  if (!id || !['accept', 'decline'].includes(action)) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const { data: ch } = await supabase.from('challenges').select('*').eq('id', id).maybeSingle();
  if (!ch || ch.to_id !== user.id || ch.status !== 'pending') return NextResponse.json({ error: 'not-allowed' }, { status: 403 });

  const patch = action === 'accept'
    ? { status: 'active', accepted_at: new Date().toISOString() }
    : { status: 'declined' };
  const { error } = await supabase.from('challenges').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: 'db' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
