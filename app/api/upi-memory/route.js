import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { rateLimit } from '../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QUESTIONS = {
  pt: [
    'O que você não quer esquecer sobre quem você é hoje?',
    'Qual parte de você ainda está tentando, mesmo devagar?',
    'O que fez você começar essa fase da sua vida?',
    'Que medo você quer atravessar sem precisar vencer tudo hoje?',
    'O que você gostaria que seu eu do futuro lembrasse deste momento?',
    'Qual pequeno sinal mostra que você ainda não desistiu?',
    'O que você está aprendendo sobre voltar?',
  ],
  en: [
    "What do you not want to forget about who you are today?",
    'What part of you is still trying, even slowly?',
    'What made you begin this season of your life?',
    'What fear do you want to move through without winning everything today?',
    'What would you like your future self to remember about this moment?',
    'What small sign shows you have not given up?',
    'What are you learning about coming back?',
  ],
  es: [
    '¿Qué no quieres olvidar sobre quién eres hoy?',
    '¿Qué parte de ti sigue intentando, aunque sea despacio?',
    '¿Qué te hizo empezar esta etapa de tu vida?',
    '¿Qué miedo quieres atravesar sin tener que vencer todo hoy?',
    '¿Qué te gustaría que tu yo del futuro recordara de este momento?',
    '¿Qué pequeña señal muestra que no te rendiste?',
    '¿Qué estás aprendiendo sobre volver?',
  ],
};

function todayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function questionFor(locale, dateKey) {
  const list = QUESTIONS[locale] || QUESTIONS.en;
  const seed = Number(dateKey.replaceAll('-', '')) || 0;
  const index = seed % list.length;
  return { key: `daily:${dateKey}:${index}`, text: list[index] };
}

function compactAnswer(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).trimEnd() + '...';
}

export async function GET() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  const locale = getLocale();
  const day = todayKey();
  const question = questionFor(locale, day);
  const sourceId = `daily:${day}`;

  const [{ data: today }, { data: memories, error }] = await Promise.all([
    sb.from('upi_memories').select('*')
      .eq('user_id', user.id).eq('source_type', 'daily_question').eq('source_id', sourceId)
      .maybeSingle(),
    sb.from('upi_memories').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ]);

  if (error) return NextResponse.json({ error: 'missing_table' }, { status: 503 });

  return NextResponse.json({ question, today: today || null, memories: memories || [] });
}

export async function POST(req) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit('upi-memory:' + user.id, 12, 3600000)) {
    return NextResponse.json({ error: 'rate' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const answer = String(body.answer || '').trim().slice(0, 1200);
  if (!answer) return NextResponse.json({ error: 'empty' }, { status: 400 });

  const locale = getLocale();
  const day = todayKey();
  const question = questionFor(locale, day);
  const sourceId = `daily:${day}`;

  const payload = {
    user_id: user.id,
    source_type: 'daily_question',
    source_id: sourceId,
    kind: 'identity',
    title: question.text,
    body: answer,
    summary: compactAnswer(answer),
    happened_on: day,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb.from('upi_memories')
    .upsert(payload, { onConflict: 'user_id,source_type,source_id' })
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });
  return NextResponse.json({ memory: data });
}
