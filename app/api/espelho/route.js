import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { analisar, podeMostrar } from '../../../lib/espelho';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// O espelho é privado: só analisa a própria pessoa, e só para ela.
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ espelho: null }, { status: 401 });

    const { data: prof } = await supabase.from('profiles')
      .select('espelho_em, espelho_visto').eq('id', user.id).maybeSingle();

    const { data: js } = await supabase.from('journeys')
      .select('id, created_at').eq('owner_id', user.id)
      .order('created_at', { ascending: false }).limit(1);
    const j = (js || [])[0];
    if (!j) return NextResponse.json({ espelho: null });

    const { data: ups } = await supabase.from('updates')
      .select('id, day_number, kind, text, created_at')
      .eq('journey_id', j.id).order('day_number', { ascending: true }).limit(200);
    const dias = ups || [];
    if (!dias.length) return NextResponse.json({ espelho: null });

    const ultimo = dias[dias.length - 1];
    const diasCorridos = Math.floor((Date.now() - new Date(j.created_at).getTime()) / 86400000);
    const escritos = dias.filter((u) => (u.text || '').trim().length >= 12).length;

    const ok = podeMostrar({
      diasCorridos,
      diasEscritos: escritos,
      ultimoDiaFoiRuim: ultimo.kind === 'setback',
      ultimaVez: prof?.espelho_em || null,
    });
    if (!ok) return NextResponse.json({ espelho: null });

    const espelho = analisar(dias, getLocale());
    return NextResponse.json({ espelho: espelho || null });
  } catch {
    return NextResponse.json({ espelho: null });
  }
}

// marca que já foi mostrado — só volta daqui a 10 dias
export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    await supabase.from('profiles').update({ espelho_em: new Date().toISOString() }).eq('id', user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
