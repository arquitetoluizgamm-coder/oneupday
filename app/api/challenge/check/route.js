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

  // remover a foto de um dia (a presença fica)
  if (body.removePhoto) {
    const dk = String(body.dayKey || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dk)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    await supabase.from('challenge_checks').update({ photo_url: null })
      .eq('challenge_id', id).eq('user_id', user.id).eq('day_key', dk);
    return NextResponse.json({ ok: true });
  }

  const photoUrl = typeof body.photoUrl === 'string' && body.photoUrl.length > 0 && body.photoUrl.length < 500 ? body.photoUrl : null;
  const dayKey = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const row = { challenge_id: id, user_id: user.id, day_key: dayKey };
  if (photoUrl) row.photo_url = photoUrl;
  const { error } = await supabase.from('challenge_checks').insert(row);
  if (error) {
    const msg = String(error.message || '').toLowerCase();
    if (msg.includes('duplicate')) {
      // já marcou hoje: se veio foto, carimba o dia
      if (photoUrl) {
        await supabase.from('challenge_checks').update({ photo_url: photoUrl })
          .eq('challenge_id', id).eq('user_id', user.id).eq('day_key', dayKey);
      }
    } else if (photoUrl && msg.includes('photo_url')) {
      // coluna ainda não existe (SQL pendente): registra sem foto
      await supabase.from('challenge_checks').insert({ challenge_id: id, user_id: user.id, day_key: dayKey });
    } else {
      return NextResponse.json({ error: 'db' }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, dayKey });
}
