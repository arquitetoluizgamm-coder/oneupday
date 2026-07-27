import { NextResponse } from 'next/server';
import { textoDaPessoa } from '../../../lib/registro';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Momentos do feed: transformação, o amanhã dos outros e quem voltou.
// Três blocos que dão temperaturas diferentes ao feed.
export async function GET() {
  const vazio = { transformacoes: [], amanha: [], retornos: [] };
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(vazio, { status: 401 });

    const { data: me } = await supabase.from('profiles').select('muted_cats').eq('id', user.id).maybeSingle();
    const mutedCats = new Set((me?.muted_cats || '').split(',').filter(Boolean));
    const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
    const blocked = new Set((blk || []).map((b) => b.blocked_id));

    // jornadas visíveis (a RLS já corta o que não pode ser visto)
    const { data: js } = await supabase.from('journeys')
      .select('id, slug, title, owner_id, category, total_days, created_at')
      .in('visibility', ['public', 'followers'])
      .order('created_at', { ascending: false })
      .limit(80);

    const journeys = (js || []).filter((j) => !blocked.has(j.owner_id) && !mutedCats.has(j.category));
    if (!journeys.length) return NextResponse.json(vazio);

    const jIds = journeys.map((j) => j.id);
    const jById = {}; journeys.forEach((j) => { jById[j.id] = j; });

    const [{ data: ups }, { data: stats }, { data: profs }] = await Promise.all([
      supabase.from('updates').select('id, journey_id, day_number, photo_url, text, created_at')
        .in('journey_id', jIds).order('day_number', { ascending: true }).limit(1200),
      supabase.from('journey_stats').select('journey_id, current_day, progress_pct').in('journey_id', jIds),
      supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color')
        .in('id', [...new Set(journeys.map((j) => j.owner_id))]),
    ]);

    const pById = {}; (profs || []).forEach((p) => { pById[p.id] = p; });
    const statBy = {}; (stats || []).forEach((s) => { statBy[s.journey_id] = s; });

    const porJornada = {};
    (ups || []).forEach((u) => {
      (porJornada[u.journey_id] = porJornada[u.journey_id] || []).push(u);
    });

    const dono = (j) => pById[j.owner_id] || {};

    // ---------- 1. ANTES & DEPOIS ----------
    // primeira foto da jornada + a mais recente, com distância real entre elas
    const transformacoes = [];
    for (const j of journeys) {
      const lista = porJornada[j.id] || [];
      const comFoto = lista.filter((u) => u.photo_url);
      if (comFoto.length < 2) continue;
      const antes = comFoto[0];
      const depois = comFoto[comFoto.length - 1];
      const salto = (depois.day_number || 0) - (antes.day_number || 0);
      if (salto < 5) continue;                       // precisa ter caminho percorrido
      transformacoes.push({
        journeySlug: j.slug, journeyTitle: j.title,
        owner: dono(j),
        antes: { url: antes.photo_url, day: antes.day_number || 1 },
        depois: { url: depois.photo_url, day: depois.day_number || 0 },
        salto,
        quando: depois.created_at,
      });
    }
    transformacoes.sort((a, b) => new Date(b.quando || 0) - new Date(a.quando || 0));

    // ---------- 2. O AMANHÃ DOS OUTROS ----------
    // quem começou hoje e quem está perto de fechar a meta
    const agora = new Date();
    const hojeBRT = new Date(agora.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
    const amanha = [];
    for (const j of journeys) {
      if (j.owner_id === user.id) continue;
      const st = statBy[j.id] || {};
      const dia = st.current_day || 0;
      const total = j.total_days || 0;
      const p = dono(j);
      if (!p.name) continue;

      const criadaEm = (j.created_at || '').slice(0, 10);
      if (criadaEm === hojeBRT && dia <= 1) {
        amanha.push({ tipo: 'comecou', owner: p, journeySlug: j.slug, journeyTitle: j.title, dia: 1, total });
        continue;
      }
      if (total > 0 && dia > 0) {
        const faltam = total - dia;
        if (faltam >= 0 && faltam <= 1) {
          amanha.push({ tipo: faltam === 0 ? 'chegou' : 'termina', owner: p, journeySlug: j.slug, journeyTitle: j.title, dia, total });
        } else if ([7, 30, 60, 100].includes(dia + 1)) {
          amanha.push({ tipo: 'marco', owner: p, journeySlug: j.slug, journeyTitle: j.title, dia: dia + 1, total });
        }
      }
    }

    // ---------- 3. RETORNOS ----------
    // voltou depois de dias parada: o coração da marca
    const retornos = [];
    const limite = Date.now() - 5 * 24 * 3600 * 1000;
    for (const j of journeys) {
      if (j.owner_id === user.id) continue;
      const lista = (porJornada[j.id] || []).slice().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      if (lista.length < 2) continue;
      const ultimo = lista[lista.length - 1];
      const anterior = lista[lista.length - 2];
      if (new Date(ultimo.created_at).getTime() < limite) continue;
      const dias = Math.floor((new Date(ultimo.created_at) - new Date(anterior.created_at)) / 86400000);
      if (dias < 3) continue;
      const p = dono(j);
      if (!p.name) continue;
      const txt = (ultimo.text || '').trim();
      retornos.push({
        owner: p, journeySlug: j.slug, journeyTitle: j.title,
        dias, dia: ultimo.day_number || 0,
        frase: textoDaPessoa(txt).slice(0, 120),
        quando: ultimo.created_at,
      });
    }
    retornos.sort((a, b) => new Date(b.quando || 0) - new Date(a.quando || 0));

    return NextResponse.json({
      transformacoes: transformacoes.slice(0, 4),
      amanha: amanha.slice(0, 5),
      retornos: retornos.slice(0, 4),
    });
  } catch {
    return NextResponse.json(vazio);
  }
}
