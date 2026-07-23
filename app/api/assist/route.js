import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { mode, journeyId, draft } = body;
  const { data: journey } = await supabase.from('journeys')
    .select('id, title, goal, total_days').eq('id', journeyId).eq('owner_id', user.id).maybeSingle();
  if (!journey) return NextResponse.json({ error: 'notfound' }, { status: 404 });

  const { data: ups } = await supabase.from('updates')
    .select('day_number, kind, text').eq('journey_id', journeyId)
    .order('day_number', { ascending: false }).limit(6);
  const ctx = `Jornada: "${journey.title}". Motivo: ${journey.goal || '-'}.\nÚltimos passos:\n` +
    (ups || []).map(u => `- Dia ${u.day_number} [${u.kind}]: ${(u.text || '').slice(0, 120)}`).join('\n');

  const lang = getLocale() === 'pt' ? 'português do Brasil' : 'English';
  let system, prompt;
  if (mode === 'write') {
    system = `Você ajuda alguém a escrever um update curto e honesto da própria jornada no app One Up Day. Primeira pessoa, 1-2 frases, humilde e real, sem clichê motivacional. Se houver rascunho, melhore mantendo a voz da pessoa. Escreva em ${lang}. Responda só com o texto do update, sem aspas.`;
    prompt = ctx + `\n\nRascunho: ${draft || '(vazio)'}`;
  } else {
    system = `Você sugere UM próximo passo pequeno e concreto para amanhã, baseado na jornada. Uma frase curta, gentil, específica, factível em minutos. Não compare com ninguém. Escreva em ${lang}. Responda só com a sugestão.`;
    prompt = ctx;
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], max_tokens: 120, temperature: 0.7 }),
    });
    if (!r.ok) return NextResponse.json({ error: 'llm' }, { status: 502 });
    const j = await r.json();
    return NextResponse.json({ text: (j.choices?.[0]?.message?.content || '').trim() });
  } catch (e) { return NextResponse.json({ error: 'llm' }, { status: 502 }); }
}
