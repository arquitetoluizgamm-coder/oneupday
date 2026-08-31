import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';
import { biblicalMessageForDay } from '../../../lib/biblicalMessages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LANGUAGE = {
  pt: 'português do Brasil',
  en: 'English',
  es: 'español',
};

function clean(value, max) {
  return String(value || '').replace(/```/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit(`biblical-message:${user.id}`, 12, 3600000)) {
    return NextResponse.json({ error: 'rate' }, { status: 429 });
  }

  const locale = getLocale();
  const selected = biblicalMessageForDay(user.id, locale);
  const base = {
    date: selected.dateKey,
    passageId: selected.id,
    reference: selected.reference,
  };
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ ...base, ...selected.fallback, generated: false });

  const system = `Você escreve mensagens bíblicas breves para o One Up Day em ${LANGUAGE[locale] || LANGUAGE.en}.

Regras obrigatórias:
- explique o significado da passagem em linguagem simples;
- não copie, não recite e não coloque entre aspas o texto da Bíblia;
- use apenas a referência e o tema fornecidos;
- não fale como se fosse Deus e não diga que recebeu uma revelação;
- não faça promessas de cura, sucesso, dinheiro ou resultado garantido;
- não use culpa, medo, ameaça ou julgamento religioso;
- acolha sem substituir orientação médica, psicológica ou pastoral;
- conecte o ensinamento a um pequeno gesto possível para hoje;
- não invente fatos sobre a pessoa;
- responda somente JSON válido.

Formato:
{"title":"até 70 caracteres","explanation":"2 ou 3 frases, até 430 caracteres","application":"1 frase prática, até 180 caracteres"}`;

  const prompt = `Referência: ${selected.reference}\nTema já verificado: ${selected.theme}\nExplique o sentido sem reproduzir o versículo.`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        max_tokens: 260,
        temperature: 0.45,
      }),
    });
    if (!response.ok) return NextResponse.json({ ...base, ...selected.fallback, generated: false });
    const json = await response.json();
    const raw = String(json.choices?.[0]?.message?.content || '')
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(raw);
    const title = clean(parsed.title, 70);
    const explanation = clean(parsed.explanation, 430);
    const application = clean(parsed.application, 180);
    if (!title || !explanation || !application) throw new Error('invalid_message');
    if (/[“”«»"]/.test(`${title} ${explanation} ${application}`)) throw new Error('quoted_verse');
    return NextResponse.json({ ...base, title, explanation, application, generated: true });
  } catch {
    return NextResponse.json({ ...base, ...selected.fallback, generated: false });
  }
}
