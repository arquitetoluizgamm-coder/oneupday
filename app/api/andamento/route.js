import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// EM ANDAMENTO + HOJE
// As histórias que a pessoa está acompanhando e ainda não terminaram,
// mais o próprio capítulo aberto dela esperando na porta de entrada.
export async function GET() {
  const vazio = { andamento: [], hoje: null };
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(vazio, { status: 401 });

    // ---------- 1. o meu capítulo aberto ----------
    let hoje = null;
    try {
      const { data: js } = await supabase.from('journeys').select('id, slug, title')
        .eq('owner_id', user.id).order('created_at', { ascending: false }).limit(1);
      const j = (js || [])[0];
      if (j) {
        const { data: ups } = await supabase.from('updates')
          .select('id, day_number, next_step, next_when, closed_by, created_at')
          .eq('journey_id', j.id).order('created_at', { ascending: false }).limit(5);
        const lista = ups || [];
        const ultimo = lista[0];
        const dayKey = (ms) => new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10);
        const postouHoje = ultimo ? dayKey(new Date(ultimo.created_at).getTime()) === dayKey(Date.now()) : false;
        const aberto = lista.find((u) => u.next_step && !u.closed_by);
        hoje = {
          slug: j.slug, titulo: j.title,
          dia: (ultimo?.day_number || 0) + (postouHoje ? 0 : 1),
          postouHoje,
          passo: aberto && !postouHoje ? aberto.next_step : '',
          quando: aberto && !postouHoje ? (aberto.next_when || '') : '',
        };
      }
    } catch {}

    // ---------- 2. capítulos que eu acompanho ----------
    const andamento = [];
    try {
      const { data: sf } = await supabase.from('step_follows')
        .select('update_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      const ids = (sf || []).map((r) => r.update_id);
      if (ids.length) {
        const { data: ups } = await supabase.from('updates')
          .select('id, journey_id, day_number, next_step, closed_by').in('id', ids);
        const lista = ups || [];
        const jIds = [...new Set(lista.map((u) => u.journey_id))];
        const fechadoIds = lista.map((u) => u.closed_by).filter(Boolean);

        const [{ data: js }, { data: fechados }] = await Promise.all([
          supabase.from('journeys').select('id, slug, title, owner_id, total_days').in('id', jIds),
          fechadoIds.length
            ? supabase.from('updates').select('id, text, day_number').in('id', fechadoIds)
            : Promise.resolve({ data: [] }),
        ]);
        const jBy = {}; (js || []).forEach((j) => { jBy[j.id] = j; });
        const fBy = {}; (fechados || []).forEach((f) => { fBy[f.id] = f; });

        const donos = [...new Set((js || []).map((j) => j.owner_id))];
        const { data: profs } = donos.length
          ? await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', donos)
          : { data: [] };
        const pBy = {}; (profs || []).forEach((p) => { pBy[p.id] = p; });

        const { data: stats } = jIds.length
          ? await supabase.from('journey_stats').select('journey_id, current_day').in('journey_id', jIds)
          : { data: [] };
        const stBy = {}; (stats || []).forEach((s) => { stBy[s.journey_id] = s.current_day || 0; });

        for (const u of lista) {
          const j = jBy[u.journey_id]; if (!j) continue;
          const p = pBy[j.owner_id]; if (!p?.name) continue;
          const dia = stBy[j.id] || u.day_number || 0;
          const total = j.total_days || 0;

          if (u.closed_by && fBy[u.closed_by]) {
            const r = fBy[u.closed_by];
            andamento.push({
              tipo: 'voltou', owner: p, slug: j.slug, passo: u.next_step || '',
              resultado: (r.text || '').slice(0, 100), dia: r.day_number || dia,
            });
          } else if (total > 0 && total - dia >= 0 && total - dia <= 2) {
            andamento.push({ tipo: 'quase', owner: p, slug: j.slug, dia, total });
          } else {
            andamento.push({ tipo: 'esperando', owner: p, slug: j.slug, passo: u.next_step || '', dia });
          }
        }
        // quem voltou primeiro: é o que a pessoa quer ver
        andamento.sort((a, b) => (a.tipo === 'voltou' ? -1 : 0) - (b.tipo === 'voltou' ? -1 : 0));
      }
    } catch {}

    return NextResponse.json({ andamento: andamento.slice(0, 8), hoje });
  } catch {
    return NextResponse.json(vazio);
  }
}
