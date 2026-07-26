import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Exclusão de jornada pelo servidor.
// Motivo: se a política de escrita da tabela não estiver no ar, o
// delete pelo navegador apaga ZERO linhas e não devolve erro — a
// pessoa clica e nada acontece, sem explicação. Aqui a posse é
// conferida antes e o resultado é sempre informado.
export async function POST(req) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });

    const { id } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ error: 'id' }, { status: 400 });

    // 1. confere a posse com a sessão da própria pessoa
    const { data: j } = await supabase.from('journeys').select('id, owner_id').eq('id', id).maybeSingle();
    if (!j) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    if (j.owner_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const db = (url && key) ? createAdmin(url, key, { auth: { persistSession: false } }) : supabase;

    // 2. limpa o que aponta para a jornada sem vínculo automático
    try { await db.from('notifications').delete().eq('journey_id', id); } catch {}
    try { await db.from('envelopes').delete().eq('journey_id', id); } catch {}

    // 3. apaga a jornada (updates, follows e afins caem junto por cascata)
    const { error, count } = await db.from('journeys').delete({ count: 'exact' }).eq('id', id);
    if (error) return NextResponse.json({ error: 'db', detalhe: error.message }, { status: 500 });
    if (!count) return NextResponse.json({ error: 'nada' }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'erro' }, { status: 500 });
  }
}
