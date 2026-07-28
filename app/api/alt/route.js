import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';
import { ALT_MAX } from '../../../lib/alt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// DESCRIÇÃO DE IMAGEM
//
// Gera um rascunho de texto alternativo. Rascunho, não decisão:
// quem publicou vê o texto num campo editável antes de postar, e
// pode reescrever ou apagar.
//
// A instrução é curta mas cada linha responde a um erro conhecido
// de descrição automática:
//
//   - Não adivinhar idade, etnia, gênero nem emoção. Um modelo
//     olhando um rosto responde essas coisas com confiança e
//     erra. E o erro vira a legenda oficial de alguém.
//
//   - Não interpretar a cena ("uma pessoa determinada"). Quem
//     não vê a imagem quer saber o que está lá, não o que a
//     máquina achou que aquilo significa.
//
//   - Uma frase. O leitor de tela lê tudo, sem pular. Descrição
//     longa é ruído para quem depende dela.
//
// Se a chave não estiver configurada, a rota responde 503 e o
// app usa a reserva factual de lib/alt.js. O recurso degrada;
// não quebra.
// ============================================================
export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit('alt:' + user.id, 40, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });

  const { url } = await req.json().catch(() => ({}));
  // Só imagem do nosso próprio armazenamento. Sem isto, a rota
  // vira um leitor de URL arbitrária pago pela nossa chave.
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!url || typeof url !== 'string' || !base || !url.startsWith(base)) {
    return NextResponse.json({ error: 'url' }, { status: 400 });
  }

  const locale = getLocale();
  const lang = locale === 'en' ? 'English' : locale === 'es' ? 'español' : 'português do Brasil';
  const system = [
    'Você descreve uma imagem para alguém que não pode vê-la, num app de jornadas pessoais.',
    'Escreva UMA frase, no máximo 140 caracteres, em ' + lang + '.',
    'Descreva apenas o que está visível: objetos, lugar, ação, texto legível na imagem.',
    'NUNCA suponha idade, etnia, gênero, profissão, emoção ou estado de saúde de ninguém.',
    'Se houver pessoas, diga "uma pessoa" ou "duas pessoas" e o que estão fazendo.',
    'Não interprete, não elogie, não use adjetivos de valor.',
    'Não comece com "imagem de" nem "foto de".',
    'Responda só com a frase.',
  ].join(' ');

  try {
    const corte = AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: corte,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: [{ type: 'image_url', image_url: { url, detail: 'low' } }] },
        ],
        max_tokens: 80,
        temperature: 0.2,
      }),
    });
    if (!r.ok) return NextResponse.json({ error: 'llm' }, { status: 502 });
    const j = await r.json();
    let texto = (j.choices?.[0]?.message?.content || '').trim().replace(/^["“]|["”]$/g, '');
    // Cinto e suspensório: se o modelo desobedecer o formato, corta.
    texto = texto.replace(/^\s*(imagem|foto|image|photo)\s+(de|of|com)\s+/i, '');
    if (texto.length > ALT_MAX) texto = texto.slice(0, ALT_MAX - 1).trimEnd() + '…';
    if (texto.length < 8) return NextResponse.json({ error: 'curto' }, { status: 502 });
    return NextResponse.json({ alt: texto });
  } catch {
    return NextResponse.json({ error: 'llm' }, { status: 502 });
  }
}
