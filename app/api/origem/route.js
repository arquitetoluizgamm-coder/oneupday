import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { clienteServico } from '../../../lib/dono';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Grava de onde veio quem se cadastrou — uma vez só, na primeira vez.
export async function POST(req) {
  const { origem } = await req.json().catch(() => ({}));
  const valor = String(origem || '').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 40);
  if (!valor) return NextResponse.json({ ok: false });

  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false });   // visitante ainda não tem perfil

  const admin = clienteServico();
  if (!admin) return NextResponse.json({ ok: false });

  // A primeira origem é definitiva. Sem o `is null`, uma visita
  // futura por outro link reescreveria a história e o grupo que
  // realmente trouxe a pessoa perderia o crédito.
  try {
    await admin.from('profiles').update({ origem: valor })
      .eq('id', user.id).is('origem', null);
  } catch { }

  return NextResponse.json({ ok: true });
}
