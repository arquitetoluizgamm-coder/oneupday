import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { clienteServico, ehDono } from '../../../../lib/dono';
import { reprocessarPendentes } from '../../../../lib/moderacao';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// AS DUAS PORTAS DESTA ROTA
//
// 1) O CRON da Vercel, com CRON_SECRET no cabeçalho: varre a fila
//    inteira e reprocessa. É a rede de segurança para o caso de
//    ninguém comentar nada por um dia — aí o reprocessamento
//    oportunista (que roda junto com cada comentário novo) nunca
//    dispara e a fila ficaria parada.
//
// 2) VOCÊ, logado, a partir de /admin/comentarios: publicar ou
//    recusar um comentário específico, ou mandar reprocessar tudo
//    na hora sem esperar o cron.
//
// Fora essas duas, a rota não faz nada.
// ============================================================
export async function POST(req) {
  const sb = clienteServico();
  if (!sb) return NextResponse.json({ error: 'sem chave de servico' }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const acao = String(body.acao || 'reprocessar');

  // porta 1 — cron
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') || '';
  const url = new URL(req.url);
  const viaCron = !!secret && (auth === `Bearer ${secret}` || url.searchParams.get('key') === secret);

  // porta 2 — dono logado
  let viaDono = false;
  if (!viaCron) {
    const user = (await createClient().auth.getUser()).data?.user;
    viaDono = ehDono(user);
  }
  if (!viaCron && !viaDono) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });

  // --- decisão humana sobre um comentário ---
  if (acao === 'publicar' || acao === 'recusar') {
    if (!viaDono) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ error: 'sem id' }, { status: 400 });
    const status = acao === 'publicar' ? 'published' : 'blocked';
    const { error } = await sb.from('comments').update({ status }).eq('id', id).eq('status', 'pending');
    if (error) return NextResponse.json({ error: 'falhou' }, { status: 500 });
    return NextResponse.json({ ok: true, status });
  }

  // --- reprocessar a fila ---
  const conta = await reprocessarPendentes(sb, viaCron ? 100 : 50);
  return NextResponse.json({ ok: true, ...conta });
}

// O cron da Vercel chama por GET.
export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') || '';
  const url = new URL(req.url);
  const viaCron = !!secret && (auth === `Bearer ${secret}` || url.searchParams.get('key') === secret);
  if (!viaCron) return NextResponse.json({ error: 'sem permissao' }, { status: 403 });
  const sb = clienteServico();
  if (!sb) return NextResponse.json({ error: 'sem chave de servico' }, { status: 500 });
  const conta = await reprocessarPendentes(sb, 100);
  return NextResponse.json({ ok: true, ...conta });
}
