import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!rateLimit('diary-up:' + user.id, 6, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || '').trim().slice(0, 1800);
  if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
  const lang = getLocale() === 'pt' ? 'português do Brasil' : getLocale() === 'es' ? 'español' : 'English';
  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: `Você é o Up, um companheiro breve de diário privado. Responda em ${lang} com duas frases acolhedoras e específicas. Não diagnostique, não dê tratamento, não faça perguntas invasivas e não use clichês. Se houver sinal de risco, incentive procurar ajuda profissional local.` }, { role: 'user', content: text }], max_tokens: 120, temperature: 0.65 }) });
    if (!resp.ok) return NextResponse.json({ error: 'llm' }, { status: 502 });
    const data = await resp.json();
    return NextResponse.json({ text: data.choices?.[0]?.message?.content?.trim() || '' });
  } catch { return NextResponse.json({ error: 'llm' }, { status: 502 }); }
}
