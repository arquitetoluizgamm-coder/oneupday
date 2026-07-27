import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// PERGUNTAS SOBRE O ASSUNTO DA JORNADA
//
// A camada 2. A camada 1 (lib/perguntas.js) já cobre a
// SITUAÇÃO — dia 1, depois de um dia difícil, passo em aberto.
// Esta cobre o ASSUNTO: litros, minutos, páginas, quilômetros.
//
// Ela é estritamente ADITIVA. Se a chave não existir, se a rede
// cair, se o modelo devolver bobagem: o compositor continua com
// as perguntas da camada 1 e ninguém percebe falta.
//
// Só o dono da jornada pede, e só sobre a própria jornada — a
// consulta filtra por owner_id, então nem por engano isto vira
// uma janela para a jornada de outra pessoa.
// ============================================================
export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ perguntas: [] });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ perguntas: [] }, { status: 401 });
  if (!rateLimit('perg:' + user.id, 20, 3600000)) return NextResponse.json({ perguntas: [] });

  const { journeyId } = await req.json().catch(() => ({}));
  const { data: j } = await supabase.from('journeys')
    .select('id, title, goal, category, total_days')
    .eq('id', journeyId).eq('owner_id', user.id).maybeSingle();
  if (!j) return NextResponse.json({ perguntas: [] }, { status: 404 });

  const { data: ups } = await supabase.from('updates')
    .select('day_number, text').eq('journey_id', j.id)
    .order('day_number', { ascending: false }).limit(3);

  const contexto = [
    `Jornada: "${j.title}"`,
    j.goal ? `Objetivo: ${j.goal}` : '',
    `Duração: ${j.total_days || '?'} dias`,
    (ups || []).length ? 'Últimos registros:\n' + (ups || []).map((u) => `- Dia ${u.day_number}: ${(u.text || '').slice(0, 100)}`).join('\n') : '',
  ].filter(Boolean).join('\n');

  const lang = getLocale() === 'en' ? 'English' : 'português do Brasil';
  const system = [
    'Você escreve perguntas curtas para ajudar alguém a registrar o dia da própria jornada num app.',
    'Devolva EXATAMENTE 3 perguntas, uma por linha, sem numerar, sem marcador, sem aspas.',
    'Cada pergunta: no máximo 10 palavras, em ' + lang + ', terminando em "?".',
    // As três regras que separam uma pergunta útil de uma pergunta vazia:
    'Pergunte sobre o que a pessoa FEZ, mediu ou tentou — nunca sobre o que ela sente.',
    'Use as unidades e o assunto desta jornada (litros, minutos, páginas, quilômetros, o que couber).',
    'Nunca pressuponha que a pessoa conseguiu nem que falhou. Nada de elogio, cobrança ou motivação.',
    'Proibido: "como você está se sentindo", "você está orgulhoso", "por que você não conseguiu".',
  ].join(' ');

  try {
    const corte = AbortSignal.timeout ? AbortSignal.timeout(9000) : undefined;
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: corte,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: contexto }],
        max_tokens: 120, temperature: 0.6,
      }),
    });
    if (!r.ok) return NextResponse.json({ perguntas: [] });
    const jr = await r.json();
    const bruto = (jr.choices?.[0]?.message?.content || '').split('\n');

    // Validação. O que não passar é descartado — perguntas demais
    // é problema menor que uma pergunta ruim na frente de alguém.
    const proibido = /sentindo|sente|orgulh|parab|por que voc[êe] n[ãa]o|feeling|proud|congrat|why didn/i;
    const perguntas = bruto
      .map((l) => l.replace(/^\s*[-*\d.)\s]+/, '').replace(/^["“]|["”]$/g, '').trim())
      .filter((l) => l.endsWith('?') && l.length >= 12 && l.length <= 90 && !proibido.test(l))
      .slice(0, 3);

    return NextResponse.json({ perguntas });
  } catch {
    return NextResponse.json({ perguntas: [] });
  }
}
