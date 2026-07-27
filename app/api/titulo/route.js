import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// AJUDA COM O TÍTULO — em dois tempos, e de propósito
//
// O caminho óbvio seria a IA devolver cinco títulos prontos e a
// pessoa escolher um. Não é o que fazemos aqui, e a razão é o
// próprio problema que estamos tentando resolver:
//
//   se todo mundo escolhe de um cardápio parecido, o feed fica
//   MAIS uniforme, não menos.
//
// Então são dois tempos:
//
//   'pergunta' — a IA lê "Água" e devolve UMA pergunta sobre o
//     que falta ser concreto ali. Ela não propõe nada.
//
//   'titulo' — com a resposta da pessoa em mãos, monta UM título
//     usando os números e as palavras que ELA deu.
//
// O resultado tem a cara de quem escreveu, porque as informações
// específicas vieram dela. A IA só deu forma.
//
// Tudo isso é opcional: sem chave, sem rede ou com resposta
// ruim, o wizard segue exatamente como era, com o campo livre.
// ============================================================
export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({}, { status: 503 });

  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  if (!rateLimit('titulo:' + user.id, 30, 3600000)) return NextResponse.json({}, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const rascunho = String(body.rascunho || '').trim().slice(0, 80);
  const resposta = String(body.resposta || '').trim().slice(0, 200);
  if (rascunho.length < 2) return NextResponse.json({}, { status: 400 });

  const lang = getLocale() === 'en' ? 'English' : 'português do Brasil';
  const modo = resposta ? 'titulo' : 'pergunta';

  const system = modo === 'pergunta'
    ? [
        'Alguém está criando uma jornada pessoal num app e escreveu só uma palavra ou duas.',
        'Devolva UMA pergunta que descubra o que falta para aquilo virar algo concreto:',
        'quantidade, frequência, duração ou o momento do dia — o que fizer mais sentido para o assunto.',
        'Uma pergunta só, no máximo 12 palavras, em ' + lang + ', terminando em "?".',
        'Não proponha nenhum título. Não dê exemplos de resposta. Não elogie.',
        'Nunca pergunte sobre sentimento, motivo profundo ou autoestima.',
        'Responda só com a pergunta.',
      ].join(' ')
    : [
        'Alguém está criando uma jornada pessoal num app.',
        'Escreva UM título curto a partir do rascunho e da resposta que a pessoa deu.',
        'Máximo 60 caracteres, em ' + lang + ', sem ponto final, sem aspas.',
        // A regra que impede a IA de "melhorar" inventando:
        'Use SOMENTE informação que está no rascunho ou na resposta. Nunca invente número, prazo ou detalhe.',
        'Comece por um verbo quando couber ("Beber 1,8 L de água por dia").',
        'Nada de motivação, adjetivo de valor, emoji, dois-pontos ou subtítulo.',
        'Responda só com o título.',
      ].join(' ');

  const entrada = modo === 'pergunta'
    ? `Rascunho: "${rascunho}"`
    : `Rascunho: "${rascunho}"\nResposta da pessoa: "${resposta}"`;

  try {
    const corte = AbortSignal.timeout ? AbortSignal.timeout(9000) : undefined;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: corte,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: entrada }],
        max_tokens: 60, temperature: 0.4,
      }),
    });
    if (!r.ok) return NextResponse.json({}, { status: 502 });
    const j = await r.json();
    let texto = (j.choices?.[0]?.message?.content || '').trim()
      .replace(/^["“]|["”]$/g, '').replace(/\s+/g, ' ');

    if (modo === 'pergunta') {
      const proibido = /sentindo|sente|orgulh|autoestima|feeling|proud/i;
      if (!texto.endsWith('?') || texto.length < 10 || texto.length > 90 || proibido.test(texto)) {
        return NextResponse.json({}, { status: 502 });
      }
      return NextResponse.json({ pergunta: texto });
    }

    texto = texto.replace(/[.]+$/, '').split('\n')[0].trim();
    if (texto.length < 4 || texto.length > 80) return NextResponse.json({}, { status: 502 });
    return NextResponse.json({ titulo: texto.slice(0, 80) });
  } catch {
    return NextResponse.json({}, { status: 502 });
  }
}
