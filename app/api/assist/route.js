import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit('assist:' + user.id, 30, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });

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

  const locale = getLocale();
  const lang = locale === 'pt' ? 'português do Brasil' : locale === 'es' ? 'español' : 'English';
  let system, prompt, wantsJson = false;
  if (mode === 'congratulate') {
    system = `Você é a Upi, uma presença acolhedora do One Up Day. Escreva uma única mensagem curta de parabéns em ${lang}, personalizada a partir da jornada concluída. Reconheça a constância e o caminho, sem exagero, sem competição e sem inventar detalhes. Responda apenas com a mensagem, sem aspas.`;
    prompt = ctx + '\n\nA jornada foi concluída. Escreva uma mensagem calorosa de 1 ou 2 frases.';
  } else if (mode === 'polish') {
    wantsJson = true;
    system = `Você ajuda alguém a transformar um registro curto em um post melhor para uma rede social de evolução pessoal chamada One Up Day.

Regras:
- escreva em ${lang};
- primeira pessoa;
- preserve o fato escrito pela pessoa, sem inventar conquista, emoção ou contexto;
- tom humano, simples, honesto;
- sem clichês motivacionais;
- sem conselho médico, terapêutico ou diagnóstico;
- se o dia for difícil, acolha sem dramatizar;
- crie 3 versões curtas: simples, emocional e direta.

Responda apenas JSON válido neste formato:
{"options":[{"label":"Simples","text":"..."},{"label":"Emocional","text":"..."},{"label":"Direta","text":"..."}]}`;
    prompt = ctx + `\n\nEstado escolhido: ${body.kind || 'step'}\nRascunho da pessoa: ${draft || '(vazio)'}`;
  } else if (mode === 'write') {
    system = `Você ajuda alguém a escrever um update curto e honesto da própria jornada no app One Up Day. Primeira pessoa, 1-2 frases, humilde e real, sem clichê motivacional. Se houver rascunho, melhore mantendo a voz da pessoa. Escreva em ${lang}. Responda só com o texto do update, sem aspas.`;
    prompt = ctx + `\n\nRascunho: ${draft || '(vazio)'}`;
  } else {
    system = `Você sugere UM próximo passo pequeno e concreto para amanhã, baseado na jornada. Uma frase curta, gentil, específica, factível em minutos. Não compare com ninguém. Escreva em ${lang}. Responda só com a sugestão.`;
    prompt = ctx;
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], max_tokens: wantsJson ? 260 : 120, temperature: 0.7 }),
    });
    if (!r.ok) return NextResponse.json({ error: 'llm' }, { status: 502 });
    const j = await r.json();
    const content = (j.choices?.[0]?.message?.content || '').trim();
    if (wantsJson) {
      try {
        const clean = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(clean);
        const options = Array.isArray(parsed.options) ? parsed.options
          .map((o) => ({ label: String(o.label || '').slice(0, 32), text: String(o.text || '').trim().slice(0, 500) }))
          .filter((o) => o.text)
          .slice(0, 3) : [];
        if (options.length) return NextResponse.json({ options });
      } catch {}
      return NextResponse.json({ error: 'invalid_json' }, { status: 502 });
    }
    return NextResponse.json({ text: content });
  } catch (e) { return NextResponse.json({ error: 'llm' }, { status: 502 }); }
}
