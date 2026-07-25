import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Diagnóstico do feed: mostra por que uma jornada aparece (ou não).
// Abra logado: https://oneupday.app/api/feed-debug
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'nao logado' }, { status: 401 });

  const out = { user_id: user.id, passos: {} };

  // 1. jornadas que ESTE usuário consegue ler (RLS aplicada)
  const jr = await supabase.from('journeys')
    .select('id, slug, title, owner_id, visibility, is_public, category, created_at')
    .order('created_at', { ascending: false }).limit(50);
  const journeys = jr.data || [];
  out.passos['1_jornadas_visiveis'] = {
    erro: jr.error ? jr.error.message : null,
    total: journeys.length,
    lista: journeys.map((j) => ({
      titulo: j.title, slug: j.slug, visibility: j.visibility, is_public: j.is_public,
      minha: j.owner_id === user.id, criada: j.created_at,
    })),
  };

  // 2. quais entram no filtro do feed (visibility = 'public')
  const pubs = journeys.filter((j) => j.visibility === 'public');
  out.passos['2_publicas_para_o_feed'] = {
    total: pubs.length,
    fora_do_feed: journeys.filter((j) => j.visibility !== 'public')
      .map((j) => ({ titulo: j.title, visibility: j.visibility || '(vazio)' })),
  };

  // 3. cada jornada pública tem atualização? (sem update, não aparece)
  const ids = pubs.map((j) => j.id);
  let ups = [];
  if (ids.length) {
    const r = await supabase.from('updates')
      .select('id, journey_id, day_number, text, created_at')
      .in('journey_id', ids).order('created_at', { ascending: false }).limit(400);
    out.passos['3_erro_lendo_updates'] = r.error ? r.error.message : null;
    ups = r.data || [];
  }
  const byJourney = {};
  ups.forEach((u) => { (byJourney[u.journey_id] ||= []).push(u); });
  out.passos['3_dias_por_jornada'] = pubs.map((j) => ({
    titulo: j.title,
    dias: (byJourney[j.id] || []).length,
    ultimo: (byJourney[j.id] || [])[0]?.created_at || null,
    texto_do_ultimo: ((byJourney[j.id] || [])[0]?.text || '').slice(0, 40),
    PROBLEMA: (byJourney[j.id] || []).length === 0 ? 'SEM NENHUM DIA REGISTRADO — nao aparece no feed' : null,
  }));

  // 4. categorias silenciadas por este usuário
  const { data: me } = await supabase.from('profiles').select('muted_cats, notif_paused').eq('id', user.id).maybeSingle();
  const muted = (me?.muted_cats || '').split(',').filter(Boolean);
  out.passos['4_categorias_silenciadas'] = {
    lista: muted,
    jornadas_escondidas_por_isso: pubs.filter((j) => muted.includes(j.category)).map((j) => j.title),
  };

  // 5. bloqueios
  const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  const blocked = new Set((blk || []).map((b) => b.blocked_id));
  out.passos['5_bloqueios'] = {
    total: blocked.size,
    jornadas_escondidas_por_isso: pubs.filter((j) => blocked.has(j.owner_id)).map((j) => j.title),
  };

  // 6. resultado esperado no feed
  const esperado = pubs
    .filter((j) => (byJourney[j.id] || []).length > 0)
    .filter((j) => !muted.includes(j.category) && !blocked.has(j.owner_id))
    .map((j) => ({ titulo: j.title, dias: (byJourney[j.id] || []).length }));
  out.RESULTADO = {
    deve_aparecer_no_feed: esperado.length,
    jornadas: esperado,
  };

  return NextResponse.json(out);
}
