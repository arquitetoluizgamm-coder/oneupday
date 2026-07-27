import { NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// ACOMPANHAR UMA JORNADA SEM CRIAR CONTA
//
// Quem chega por um link compartilhado pede, com um toque, para
// ser avisada do próximo capítulo. Sem formulário, sem senha,
// sem e-mail. Vira audiência antes de virar usuária.
//
// A rota usa a chave de serviço porque a tabela é trancada (RLS
// ligada, nenhuma política) — ninguém escreve nela pela API
// pública, nem mesmo quem está logado.
//
// ---- O QUE ESTA ROTA GUARDA ----
// Apenas a inscrição de push que o navegador gerou: um endereço
// opaco e duas chaves de criptografia. Sem nome, sem e-mail, sem
// IP. E a pessoa revoga quando quiser, no próprio navegador.
//
// ---- POR QUE SÓ JORNADA PÚBLICA ----
// Acompanhar sem conta só faz sentido no que já é público. Se a
// jornada for de seguidores ou privada, a rota recusa — senão
// bastaria descobrir o endereço para receber conteúdo que a
// pessoa restringiu.
// ============================================================
function admin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || '');
  const sub = body.sub || {};

  if (!slug || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: 'invalido' }, { status: 400 });
  }

  const sb = admin();

  const { data: j } = await sb.from('journeys')
    .select('id, visibility').eq('slug', slug).maybeSingle();

  if (!j) return NextResponse.json({ error: 'nao-encontrada' }, { status: 404 });
  if (j.visibility !== 'public') {
    return NextResponse.json({ error: 'nao-publica' }, { status: 403 });
  }

  const { error } = await sb.from('jornada_seguidores').upsert({
    journey_id: j.id,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  }, { onConflict: 'journey_id,endpoint' });

  if (error) {
    const falta = /does not exist|schema cache/i.test(error.message || '');
    return NextResponse.json({
      error: 'salvar',
      dica: falta ? 'rode supabase/acompanhar-sem-conta.sql' : error.message,
    }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Deixar de acompanhar. Sem confirmação e sem pergunta: quem pediu
// para sair, sai. Fazer alguém justificar a saída é o oposto do que
// este produto promete.
export async function DELETE(req) {
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || '');
  const endpoint = String(body.endpoint || '');
  if (!slug || !endpoint) return NextResponse.json({ error: 'invalido' }, { status: 400 });

  const sb = admin();
  const { data: j } = await sb.from('journeys').select('id').eq('slug', slug).maybeSingle();
  if (!j) return NextResponse.json({ ok: true });

  await sb.from('jornada_seguidores').delete()
    .eq('journey_id', j.id).eq('endpoint', endpoint);

  return NextResponse.json({ ok: true });
}
