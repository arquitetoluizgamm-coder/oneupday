import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '../../../lib/supabase/server';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GUARDAR UMA JORNADA
//
// Recebe o que a pessoa escreveu antes de ter conta. Só isso.
//
// A rota NUNCA lê a tabela. Não existe GET aqui e não vai existir:
// o cofre se escreve de fora e se lê só de dentro do painel. Se um
// dia alguém precisar listar inscrições numa tela, que seja numa
// rota de admin autenticada — não aqui.
//
// ------------------------------------------------------------
// DUAS DECISÕES QUE PARECEM DETALHE E NÃO SÃO
//
// 1 · O TOKEN NASCE AQUI, NÃO NO BANCO.
//
//     A tabela tem `default gen_random_uuid()`, e seria natural
//     deixar o banco gerar e pedir o valor de volta com
//     `.select('token')`. Não funciona: a RLS não libera SELECT
//     para ninguém, então o retorno viria vazio — o cofre
//     bloqueando a própria rota, como deve.
//
//     Gerando aqui, a gente sabe o token sem precisar ler nada.
//
// 2 · É `insert`, NÃO `upsert`.
//
//     `upsert` faz INSERT ... ON CONFLICT DO UPDATE, e a parte do
//     UPDATE exigiria uma policy de UPDATE nesta tabela. Uma policy
//     dessas, num lugar onde ninguém pode dar SELECT, ainda deixaria
//     alguém sobrescrever a jornada de outra pessoa mirando o
//     e-mail dela às cegas.
//
//     Uma policy a mais no cofre por causa de conveniência de
//     formulário é um preço que não vale. Segunda inscrição com o
//     mesmo e-mail bate no índice único, e a gente trata como
//     sucesso: a primeira jornada continua guardada. Se ela quiser
//     trocar, diz na resposta — e do outro lado tem gente.
// ============================================================

const MAX_JORNADA = 280;   // uma frase, não um texto. Cabe "voltar a
                           // correr, parei há dois anos depois de uma
                           // lesão e nunca mais consegui" com folga.
const MAX_EMAIL = 160;

// Deliberadamente simples. E-mail de verdade só se prova mandando
// mensagem — que é exatamente o que vai acontecer depois. Aqui o
// objetivo é barrar engano de digitação, não fazer perícia.
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  let corpo;
  try { corpo = await req.json(); } catch { corpo = null; }
  if (!corpo) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const jornada = String(corpo.jornada || '').trim().slice(0, MAX_JORNADA);
  const email = String(corpo.email || '').trim().toLowerCase().slice(0, MAX_EMAIL);
  const locale = String(corpo.locale || '').slice(0, 8) || null;
  const origem = String(corpo.origem || '').slice(0, 60) || null;

  if (jornada.length < 3) return NextResponse.json({ error: 'jornada' }, { status: 400 });
  if (!RE_EMAIL.test(email)) return NextResponse.json({ error: 'email' }, { status: 400 });

  // Limite por IP. A página é pública e sem login, então é o único
  // identificador que existe. 5 por hora: quem erra o e-mail e tenta
  // de novo passa tranquilo; quem quer encher a tabela, não.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'sem-ip';
  if (!rateLimit(`invite:${ip}`, 5, 3600000)) {
    return NextResponse.json({ error: 'muitas_tentativas' }, { status: 429 });
  }

  const token = randomUUID();
  const supabase = createClient();

  const { error } = await supabase
    .from('invite_requests')
    .insert({ jornada, email, locale, origem, token });

  if (error) {
    // 23505 = índice único. É a segunda inscrição do mesmo e-mail.
    // Para a pessoa, a jornada dela está guardada — e está, desde a
    // primeira vez. Ela não precisa levar erro na cara por isso.
    // Não devolvo token: o antigo continua valendo e eu não posso
    // lê-lo daqui.
    if (error.code === '23505') return NextResponse.json({ ok: true, token: null });
    return NextResponse.json({ error: 'falhou' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, token });
}
