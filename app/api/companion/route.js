import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  // Só os dados do próprio usuário (RLS garante).
  const { data: journeys } = await supabase.from('journeys')
    .select('id, title, total_days, goal, moment, created_at').eq('owner_id', user.id);
  const list = journeys || [];
  if (!list.length) return NextResponse.json({ text: '' });

  const ids = list.map(j => j.id);
  const { data: updates } = await supabase.from('updates')
    .select('journey_id, day_number, kind, text, created_at').in('journey_id', ids)
    .order('created_at', { ascending: false }).limit(40);
  const ups = updates || [];

  // Resumo compacto (fatos), sem expor nada de terceiros.
  const lines = [];
  for (const j of list) {
    const ju = ups.filter(u => u.journey_id === j.id);
    const days = new Set(ju.map(u => u.day_number)).size;
    const setbacks = ju.filter(u => u.kind === 'setback').length;
    lines.push(`Jornada "${j.title}" (meta ${j.total_days} dias, começou ${new Date(j.created_at).toISOString().slice(0,10)}): ${days} dias registrados, ${setbacks} recaídas. Motivo: ${j.goal || '-'}.`);
    ju.slice(0, 6).forEach(u => lines.push(`  - Dia ${u.day_number} [${u.kind}]: ${(u.text || '').slice(0, 140)}`));
  }
  const facts = lines.join('\n');

  const locale = getLocale();
  const lang = locale === 'pt' ? 'português do Brasil' : 'English';
  const system = [
    'Você é uma companhia de progresso do app One Up Day.',
    'Você NÃO é terapeuta e não faz diagnóstico nem tratamento psicológico ou médico.',
    'Com base APENAS nos dados do próprio usuário abaixo, escreva de 2 a 4 frases curtas, calorosas e específicas que:',
    '- lembrem a pessoa de um progresso que ela pode ter esquecido;',
    '- valorizem a constância, inclusive ter voltado depois de recaídas;',
    '- sugiram UM próximo passo pequeno e concreto.',
    'Nunca compare a pessoa com outros. Nunca faça a pessoa se sentir insuficiente.',
    'Se os dados sugerirem crise ou risco, incentive gentilmente procurar apoio profissional (no Brasil, CVV 188).',
    `Escreva em ${lang}, em tom de amigo próximo, sem clichês motivacionais genéricos.`,
  ].join(' ');

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: facts }],
        max_tokens: 220, temperature: 0.7,
      }),
    });
    if (!resp.ok) return NextResponse.json({ error: 'llm' }, { status: 502 });
    const j = await resp.json();
    const text = j.choices?.[0]?.message?.content?.trim() || '';
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: 'llm' }, { status: 502 });
  }
}
