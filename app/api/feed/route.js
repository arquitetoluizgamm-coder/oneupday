import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { buildHistoriaFeedItems } from '../../../lib/historias';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE = 8;
const VALID_KINDS = new Set(['step', 'win', 'setback', 'learned']);

// uma historia a cada 4 posts reais
const CADENCIA_HISTORIA = 4;

export async function GET(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const url = new URL(req.url);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
  const scope = url.searchParams.get('scope') || 'all';
  const kind = url.searchParams.get('kind') || '';
  const locale = getLocale();

  const { data: me } = await supabase.from('profiles').select('muted_cats').eq('id', user.id).maybeSingle();
  const mutedCats = new Set((me?.muted_cats || '').split(',').filter(Boolean));

  const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  const blocked = new Set((blk || []).map((item) => item.blocked_id));

  let targetIds = [];
  if (scope === 'following') {
    const { data: fl } = await supabase.from('follows').select('journey_id').eq('user_id', user.id);
    let followedJourneyIds = (fl || []).map((item) => item.journey_id);

    const { data: pf } = await supabase.from('profile_follows').select('following_id').eq('follower_id', user.id);
    const followedProfiles = [...new Set((pf || []).map((item) => item.following_id))];

    if (followedProfiles.length) {
      const { data: ownerJourneys } = await supabase.from('journeys').select('id').in('owner_id', followedProfiles).eq('visibility', 'public');
      followedJourneyIds = followedJourneyIds.concat((ownerJourneys || []).map((journey) => journey.id));
    }

    const uniqueJourneyIds = [...new Set(followedJourneyIds)];
    if (!uniqueJourneyIds.length) return NextResponse.json({ items: [] });

    const { data: followedJourneys } = await supabase.from('journeys').select('id, owner_id, category').in('id', uniqueJourneyIds);
    targetIds = (followedJourneys || [])
      .filter((journey) => !blocked.has(journey.owner_id) && !mutedCats.has(journey.category))
      .map((journey) => journey.id);
  } else {
    // inclui as próprias jornadas: sua história também aparece no seu feed
    // públicas + as "só seguidores" que ESTE usuário pode ver.
    // A RLS já filtra: quem não segue simplesmente não recebe a linha.
    const { data: publicJourneys } = await supabase.from('journeys')
      .select('id, owner_id, category')
      .in('visibility', ['public', 'followers'])
      .order('created_at', { ascending: false })
      .limit(80);

    targetIds = (publicJourneys || [])
      .filter((journey) => !blocked.has(journey.owner_id) && !mutedCats.has(journey.category))
      .map((journey) => journey.id);
  }

  // pessoas de exemplo removidas do feed: só gente real aqui
  const demoItems = [];
  if (!targetIds.length && !demoItems.length) return NextResponse.json({ items: [] });

  let updates = [];
  if (targetIds.length) {
    let updatesQuery = supabase.from('updates')
      .select('id, day_number, kind, text, alt, photo_url, video_url, journey_id, created_at, next_step, next_when, closed_by')
      .in('journey_id', targetIds);

    if (VALID_KINDS.has(kind)) updatesQuery = updatesQuery.eq('kind', kind);

    // janela ampla: o feed agrupa por jornada, então precisamos de muitas linhas
    // para não perder jornadas atrás de quem postou vários dias seguidos
    const { data: rows } = await updatesQuery
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(400);

    const all = rows || [];
    // uma linha por jornada (a mais recente), mantendo a ordem de recência
    const seen = new Set();
    updates = [];
    for (const u of all) {
      if (seen.has(u.journey_id)) continue;
      seen.add(u.journey_id);
      updates.push(u);
    }
  }

  const journeyIds = [...new Set(updates.map((item) => item.journey_id))];
  const { data: journeys } = journeyIds.length
    ? await supabase.from('journeys').select('id, slug, title, category, owner_id, cover_color, total_days, editorial_seed').in('id', journeyIds)
    : { data: [] };
  const journeyMap = {};
  (journeys || []).forEach((journey) => { journeyMap[journey.id] = journey; });

  const ownerIds = [...new Set((journeys || []).map((journey) => journey.owner_id))];
  const { data: profiles } = ownerIds.length
    ? await supabase.from('profiles').select('id, name, avatar_color, avatar_url, handle').in('id', ownerIds)
    : { data: [] };
  const profileMap = {};
  (profiles || []).forEach((profile) => { profileMap[profile.id] = profile; });

  const uids = updates.map((item) => item.id);
  const guard = (pr) => Promise.resolve(pr).then((r) => r).catch(() => ({ data: [] }));

  const [encR, tracksR, supEncR, statsR, moodR, allUpsR, mediaR] = await Promise.all([
    updates.length ? guard(supabase.from('encouragements').select('update_id').eq('user_id', user.id).in('update_id', uids)) : { data: [] },
    updates.length ? guard(supabase.from('updates').select('id, track_title, track_artist, track_audio_url').in('id', uids).not('track_audio_url', 'is', null)) : { data: [] },
    updates.length ? guard(supabase.from('encouragements').select('update_id, user_id').in('update_id', uids)) : { data: [] },
    journeyIds.length ? guard(supabase.from('journey_stats').select('journey_id, current_day, progress_pct').in('journey_id', journeyIds)) : { data: [] },
    ownerIds.length ? guard(supabase.from('profiles').select('id, mood, mood_at').in('id', ownerIds).not('mood', 'is', null)) : { data: [] },
    journeyIds.length ? guard(supabase.from('updates').select('id, journey_id, day_number, kind, text, alt, photo_url, video_url, created_at').in('journey_id', journeyIds)) : { data: [] },
    scope === 'all' ? guard(supabase.from('media').select('*').eq('visibility', 'public').order('created_at', { ascending: false }).limit(60)) : { data: [] },
  ]);

  const myEnc = new Set((encR.data || []).map((e) => e.update_id));
  const trackByUpdate = {};
  (tracksR.data || []).forEach((item) => { trackByUpdate[item.id] = { title: item.track_title, artist: item.track_artist, audio_url: item.track_audio_url }; });
  const statsByJourney = {};
  (statsR.data || []).forEach((st) => { statsByJourney[st.journey_id] = st; });
  const ownerMoodById = {};
  (moodR.data || []).forEach((mp) => { if (mp.mood_at && (Date.now() - new Date(mp.mood_at).getTime() < 30 * 3600 * 1000)) ownerMoodById[mp.id] = mp.mood; });

  const comebackByUpdate = {};
  {
    const daysByJourney = {};
    (allUpsR.data || []).forEach((u) => { (daysByJourney[u.journey_id] ||= []).push(u.day_number || 0); });
    Object.values(daysByJourney).forEach((arr) => arr.sort((a, b) => a - b));
    (allUpsR.data || []).forEach((u) => {
      const arr = daysByJourney[u.journey_id] || [];
      let prev = null;
      for (const d of arr) { if (d < (u.day_number || 0)) prev = d; else break; }
      if (prev !== null) { const gap = (u.day_number || 0) - prev; if (gap >= 3) comebackByUpdate[u.id] = gap; }
    });
  }

  const supEnc = supEncR.data || [];
  const supIds = [...new Set(supEnc.map((e) => e.user_id))];
  const mediaRows = (mediaR.data || []).filter((m) => !blocked.has(m.user_id));
  const mediaOwnerIds = [...new Set(mediaRows.map((m) => m.user_id))];
  const mediaIds = mediaRows.map((m) => m.id);

  // Nivel ONE por dias distintos registrados, nunca por curtidas.
  const levelOwnerIds = [...new Set([...ownerIds, ...mediaOwnerIds])];
  const levelJourneysR = levelOwnerIds.length ? await guard(supabase.from('journeys').select('id, owner_id').in('owner_id', levelOwnerIds)) : { data: [] };
  const levelJourneyRows = levelJourneysR.data || [];
  const levelJourneyIds = [...new Set(levelJourneyRows.map((j) => j.id))];
  const levelUpsR = levelJourneyIds.length ? await guard(supabase.from('updates').select('journey_id, day_number').in('journey_id', levelJourneyIds)) : { data: [] };
  const ownerByJourney = {};
  levelJourneyRows.forEach((j) => { ownerByJourney[j.id] = j.owner_id; });
  const daysByLevelOwner = {};
  (levelUpsR.data || []).forEach((u) => { const owner = ownerByJourney[u.journey_id]; if (owner) (daysByLevelOwner[owner] ||= new Set()).add(Number(u.day_number) || 0); });
  const levelFor = (owner) => {
    const count = daysByLevelOwner[owner]?.size || 0;
    if (!count) return null;
    const rank = count >= 30 ? 6 : count >= 15 ? 5 : count >= 7 ? 4 : count >= 3 ? 3 : count >= 1 ? 2 : 1;
    const colors = { 1: '#87957A', 2: '#6F927D', 3: '#5F8790', 4: '#5C7D86', 5: '#C47152', 6: '#B58A42' };
    return { rank, color: colors[rank] };
  };

  const [supProfR, mediaProfR, mediaEncR] = await Promise.all([
    supIds.length ? guard(supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', supIds)) : { data: [] },
    mediaOwnerIds.length ? guard(supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', mediaOwnerIds)) : { data: [] },
    mediaIds.length ? guard(supabase.from('encouragements').select('media_id').eq('user_id', user.id).in('media_id', mediaIds)) : { data: [] },
  ]);

  const supProfiles = {};
  (supProfR.data || []).forEach((pr) => { supProfiles[pr.id] = pr; });
  const supportersByUpdate = {};
  supEnc.forEach((e) => {
    (supportersByUpdate[e.update_id] ||= []);
    const pr = supProfiles[e.user_id];
    if (pr && supportersByUpdate[e.update_id].length < 12) supportersByUpdate[e.update_id].push({ name: pr.name, handle: pr.handle, avatar_url: pr.avatar_url, avatar_color: pr.avatar_color });
  });

  const mediaProf = {};
  (mediaProfR.data || []).forEach((pr) => { mediaProf[pr.id] = pr; });
  const mediaEncSet = new Set((mediaEncR.data || []).map((e) => e.media_id));

  // ---- raio: pode desafiar? (seguem um ao outro e sem desafio aberto) ----
  const canChallenge = new Set();
  try {
    const candIds = [...new Set([...ownerIds, ...mediaOwnerIds])].filter((id) => id !== user.id);
    if (candIds.length) {
      const [f1, f2, open] = await Promise.all([
        guard(supabase.from('profile_follows').select('following_id').eq('follower_id', user.id).in('following_id', candIds)),
        guard(supabase.from('profile_follows').select('follower_id').eq('following_id', user.id).in('follower_id', candIds)),
        guard(supabase.from('challenges').select('from_id, to_id').in('status', ['pending', 'active']).or(`from_id.eq.${user.id},to_id.eq.${user.id}`)),
      ]);
      const iFollow = new Set((f1.data || []).map((r) => r.following_id));
      const followsMe = new Set((f2.data || []).map((r) => r.follower_id));
      const busyWithMe = new Set((open.data || []).flatMap((c) => [c.from_id, c.to_id]));
      candIds.forEach((id) => { if (iFollow.has(id) && followsMe.has(id) && !busyWithMe.has(id)) canChallenge.add(id); });
    }
  } catch {}

  // ---- desafio ativo do dono do post (linha embaixo do card) ----
  const challengeByOwner = {};
  try {
    const chOwnerIds = [...new Set([...ownerIds, ...mediaOwnerIds])];
    if (chOwnerIds.length) {
      const inList = chOwnerIds.join(',');
      const { data: chs } = await supabase.from('challenges')
        .select('id, title, from_id, to_id, created_at')
        .eq('status', 'active')
        .or(`from_id.in.(${inList}),to_id.in.(${inList})`)
        .order('created_at', { ascending: false })
        .limit(40);
      const chList = chs || [];
      const missing = [...new Set(chList.flatMap((c) => [c.from_id, c.to_id]))]
        .filter((id) => !profileMap[id] && !mediaProf[id]);
      const extra = {};
      if (missing.length) {
        const { data: xs } = await supabase.from('profiles').select('id, name, avatar_url, avatar_color').in('id', missing);
        (xs || []).forEach((p) => { extra[p.id] = p; });
      }
      const prof = (id) => profileMap[id] || mediaProf[id] || extra[id] || {};
      chList.forEach((c) => {
        const packed = {
          id: c.id, title: c.title,
          from: { name: prof(c.from_id).name, avatar_url: prof(c.from_id).avatar_url, avatar_color: prof(c.from_id).avatar_color },
          to: { name: prof(c.to_id).name, avatar_url: prof(c.to_id).avatar_url, avatar_color: prof(c.to_id).avatar_color },
        };
        if (!challengeByOwner[c.from_id]) challengeByOwner[c.from_id] = packed;
        if (!challengeByOwner[c.to_id]) challengeByOwner[c.to_id] = packed;
      });
    }
  } catch {}
  const mediaFeed = mediaRows.map((m) => ({ id: 'media-' + m.id, media: true, mediaId: m.id, url: m.url, kind: m.kind, caption: m.caption || '', created_at: m.created_at, owner: { ...(mediaProf[m.user_id] || {}), one_level: levelFor(m.user_id) }, encouraged: mediaEncSet.has(m.id), challenge: challengeByOwner[m.user_id] || null, challengeable: canChallenge.has(m.user_id) }));
  const mediaTotal = mediaFeed.length;

  // ---- a jornada é um post só: dias agrupados, navegáveis no card ----
  const fullDaysByJourney = {};
  (allUpsR.data || []).forEach((u) => { (fullDaysByJourney[u.journey_id] ||= []).push(u); });
  Object.values(fullDaysByJourney).forEach((arr) => arr.sort((a, b) => ((a.day_number || 0) - (b.day_number || 0)) || (new Date(a.created_at) - new Date(b.created_at))));
  const dayIds = [];
  Object.values(fullDaysByJourney).forEach((arr) => arr.slice(-60).forEach((u) => dayIds.push(u.id)));
  // ============================================================
  // AS MENÇÕES DO LOTE
  //
  // Entra aqui, junto com apoios e faixas dos dias, e não lá em
  // cima: o card do feed mostra o registro do topo E os outros dias
  // pelo paginador. Consultando só os ids do topo, os @ dos demais
  // dias apareceriam como texto solto, sem link — funcionando pela
  // metade, sem erro nenhum aparecendo. `dayIds` já é a lista
  // completa do que vai para a tela.
  //
  // Uma consulta para o lote inteiro, no mesmo padrão do resto:
  // por registro seria uma consulta por card.
  //
  // O perfil vem junto (`profiles(...)`) porque o que vale é o
  // handle ATUAL de quem foi marcado — o @ escrito no texto pode
  // estar velho se a pessoa trocou de handle depois.
  // ============================================================
  const idsParaMencao = [...new Set([...uids, ...dayIds])];
  const [encAllR, tracksAllR, mencoesR] = await Promise.all([
    dayIds.length ? guard(supabase.from('encouragements').select('update_id').eq('user_id', user.id).in('update_id', dayIds)) : { data: [] },
    dayIds.length ? guard(supabase.from('updates').select('id, track_title, track_artist, track_audio_url').in('id', dayIds).not('track_audio_url', 'is', null)) : { data: [] },
    idsParaMencao.length ? guard(supabase.from('mentions').select('update_id, profile:profiles!mentions_profile_id_fkey(id, name, handle, avatar_color)').in('update_id', idsParaMencao)) : { data: [] },
  ]);

  // { update_id: { handle_sem_arroba: perfil } }
  const mencoesPorUpdate = {};
  (mencoesR.data || []).forEach((m) => {
    const p = m.profile;
    if (!p || !p.handle) return;
    const chave = String(p.handle).trim().toLowerCase().replace(/^@+/, '');
    (mencoesPorUpdate[m.update_id] ||= {})[chave] = p;
  });
  const myEncAll = new Set((encAllR.data || []).map((e) => e.update_id));
  (tracksAllR.data || []).forEach((item) => { trackByUpdate[item.id] = { title: item.track_title, artist: item.track_artist, audio_url: item.track_audio_url }; });

  // capítulos: quais passos eu acompanho e qual passo cada dia fechou
  const meusPassos = new Set();
  const passoFechadoPor = {};
  try {
    const idsDia = updates.map((u) => u.id);
    if (idsDia.length) {
      const { data: sf } = await supabase.from('step_follows').select('update_id').eq('user_id', user.id).in('update_id', idsDia);
      (sf || []).forEach((r) => meusPassos.add(r.update_id));
      const { data: fechados } = await supabase.from('updates')
        .select('next_step, next_when, closed_by').in('closed_by', idsDia);
      (fechados || []).forEach((r) => { if (r.closed_by) passoFechadoPor[r.closed_by] = { step: r.next_step, when: r.next_when }; });
    }
  } catch {}

  const realItems = updates.map((item) => {
    const journey = journeyMap[item.journey_id];
    if (!journey) return null;
    const daysArr = (fullDaysByJourney[item.journey_id] || []).slice(-60).map((u) => ({
      id: u.id, day_number: u.day_number, kind: u.kind, text: u.text, alt: u.alt || '', photo_url: u.photo_url, video_url: u.video_url, created_at: u.created_at,
      encouraged: myEncAll.has(u.id), track: trackByUpdate[u.id] || null, comeback: comebackByUpdate[u.id] || null,
      mencoes: mencoesPorUpdate[u.id] || null,
      nextStep: u.closed_by ? null : (u.next_step || null), nextWhen: u.next_when || null,
      stepFollowing: meusPassos.has(u.id), closes: passoFechadoPor[u.id] || null,
    }));
    return {
      ...item,
      days: daysArr.length > 1 ? daysArr : null,
      challenge: challengeByOwner[journey.owner_id] || null,
      challengeable: canChallenge.has(journey.owner_id),
      journey: { slug: journey.slug, title: journey.title, category: journey.category, total_days: journey.total_days, editorial_seed: journey.editorial_seed === true, current_day: (statsByJourney[journey.id] || {}).current_day || 0, progress_pct: (statsByJourney[journey.id] || {}).progress_pct || 0 },
      owner: { ...(profileMap[journey.owner_id] || {}), mood: ownerMoodById[journey.owner_id] || null, one_level: levelFor(journey.owner_id) },
      own: journey.owner_id === user.id,
      track: trackByUpdate[item.id] || null,
      nextStep: item.closed_by ? null : (item.next_step || null), nextWhen: item.next_when || null,
      stepFollowing: meusPassos.has(item.id), closes: passoFechadoPor[item.id] || null,
      encouraged: myEnc.has(item.id),
      supporters: supportersByUpdate[item.id] || [],
      comeback: comebackByUpdate[item.id] || null,
      // { handle: perfil } de quem foi marcado neste registro
      mencoes: mencoesPorUpdate[item.id] || null,
    };
  }).filter(Boolean);

  const merged = [...realItems, ...mediaFeed].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  // Histórias editoriais entram no mesmo fluxo, mas não ficam coladas umas
  // nas outras. A cada dois posts de pessoas reais, uma jornada editorial
  // aparece. O cursor continua sendo o offset do feed, então a cadência não
  // reinicia quando a próxima página é carregada.
  // Jornadas editoriais entram dia a dia no feed. Assim a Lia não aparece
  // como um bloco único com sete capítulos escondidos: cada dia pode ocupar
  // seu lugar na cadência, exatamente como um post real.
  // Primeiro separamos por jornada. Sem isso, como os seeds costumam ser
  // inseridos juntos, o feed entrega os sete dias da mesma história em fila
  // e as outras demonstrações ficam escondidas atrás da primeira página.
  const editorialQueues = new Map();
  merged
    .filter((item) => item.journey?.editorial_seed)
    .forEach((item) => {
      const days = item.days?.length ? item.days : [item];
      const key = item.journey?.slug || item.journey_id || item.id;
      const queue = days.map((day) => ({
        ...item,
        id: day.id,
        day_number: day.day_number,
        kind: day.kind,
        text: day.text,
        alt: day.alt || '',
        photo_url: day.photo_url,
        video_url: day.video_url,
        created_at: day.created_at,
        days: null,
        journey: {
          ...item.journey,
          current_day: day.day_number || item.journey.current_day,
          progress_pct: item.journey.total_days
            ? Math.min(100, Math.round(((day.day_number || 0) / item.journey.total_days) * 100))
            : item.journey.progress_pct,
        },
        track: day.track || null,
        nextStep: day.nextStep || null,
        nextWhen: day.nextWhen || null,
        stepFollowing: !!day.stepFollowing,
        closes: day.closes || null,
        encouraged: !!day.encouraged,
        comeback: day.comeback || null,
        mencoes: day.mencoes || null,
      })).sort((a, b) => {
        // Demonstrações são capítulos: o feed começa pelo Dia 1 para a
        // pessoa entender a transformação antes de chegar ao desfecho.
        const day = (a.day_number || 0) - (b.day_number || 0);
        return day || (new Date(a.created_at || 0) - new Date(b.created_at || 0));
      });
      editorialQueues.set(key, [...(editorialQueues.get(key) || []), ...queue]);
    });

  // Round-robin entre jornadas: Paulo, Lia, Davi... só depois volta para o
  // próximo dia de Paulo. Assim a demonstração mostra caminhos diferentes,
  // em vez de parecer uma única história repetida.
  const editorialItems = [];
  const queues = [...editorialQueues.values()];
  while (queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      if (queue.length) editorialItems.push(queue.shift());
    }
  }
  const organicItems = merged.filter((item) => !item.journey?.editorial_seed);
  const mixed = [];
  let editorialIndex = 0;
  organicItems.forEach((item, index) => {
    mixed.push(item);
    if ((index + 1) % 2 === 0 && editorialItems[editorialIndex]) {
      mixed.push(editorialItems[editorialIndex++]);
    }
  });
  mixed.push(...editorialItems.slice(editorialIndex));
  const feedSource = editorialItems.length ? mixed : merged;
  const pageItems = feedSource.slice(offset, offset + PAGE);

  // ---- historias intercaladas: uma a cada 4 posts reais ----
  // A conta usa o offset da pagina para a cadencia nao reiniciar a
  // cada rolagem: sem isso, duas historias caem coladas na emenda.
  const historias = editorialItems.length ? [] : buildHistoriaFeedItems(locale);
  const comHistorias = [];
  if (historias.length) {
    for (let i = 0; i < pageItems.length; i++) {
      comHistorias.push(pageItems[i]);
      const posicao = offset + i + 1;
      if (posicao % CADENCIA_HISTORIA === 0) {
        const h = historias[Math.floor(posicao / CADENCIA_HISTORIA - 1) % historias.length];
        if (h) comHistorias.push({ ...h, id: `${h.id}-${posicao}` });
      }
    }
  } else {
    comHistorias.push(...pageItems);
  }

  // quando os posts reais acabam, o resto da pagina vira historia:
  // e melhor um feed com historia do que um feed vazio
  const faltam = Math.max(0, PAGE - comHistorias.length);
  const demoStart = Math.max(0, offset - feedSource.length);
  const cauda = faltam > 0
    ? [...demoItems, ...historias].slice(demoStart, demoStart + faltam)
    : [];

  return NextResponse.json({ items: [...comHistorias, ...cauda] });
}
