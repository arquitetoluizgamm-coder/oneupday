import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { getLocale } from '../../../lib/locale';
import { buildDemoFeedItems } from '../../../lib/demoStories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE = 8;
const VALID_KINDS = new Set(['step', 'win', 'setback', 'learned']);

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
    const { data: publicJourneys } = await supabase.from('journeys')
      .select('id, owner_id, category')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(80);

    targetIds = (publicJourneys || [])
      .filter((journey) => !blocked.has(journey.owner_id) && !mutedCats.has(journey.category))
      .map((journey) => journey.id);
  }

  let demoItems = [];
  try { if (scope === 'all') demoItems = buildDemoFeedItems(locale).filter((item) => !mutedCats.has(item.journey.category) && (!kind || item.kind === kind)); } catch {}
  if (!targetIds.length && !demoItems.length) return NextResponse.json({ items: [] });

  let updates = [];
  if (targetIds.length) {
    let updatesQuery = supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, journey_id, created_at')
      .in('journey_id', targetIds);

    if (VALID_KINDS.has(kind)) updatesQuery = updatesQuery.eq('kind', kind);

    const { data: rows } = await updatesQuery
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(0, Math.min(offset + PAGE, 300) - 1);

    updates = rows || [];
  }

  const journeyIds = [...new Set(updates.map((item) => item.journey_id))];
  const { data: journeys } = journeyIds.length
    ? await supabase.from('journeys').select('id, slug, title, category, owner_id, cover_color, total_days').in('id', journeyIds)
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
    journeyIds.length ? guard(supabase.from('updates').select('id, journey_id, day_number, kind, text, photo_url, video_url, created_at').in('journey_id', journeyIds)) : { data: [] },
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
  const mediaFeed = mediaRows.map((m) => ({ id: 'media-' + m.id, media: true, mediaId: m.id, url: m.url, kind: m.kind, caption: m.caption || '', created_at: m.created_at, owner: mediaProf[m.user_id] || {}, encouraged: mediaEncSet.has(m.id), challenge: challengeByOwner[m.user_id] || null }));
  const mediaTotal = mediaFeed.length;

  // ---- a jornada é um post só: dias agrupados, navegáveis no card ----
  const fullDaysByJourney = {};
  (allUpsR.data || []).forEach((u) => { (fullDaysByJourney[u.journey_id] ||= []).push(u); });
  Object.values(fullDaysByJourney).forEach((arr) => arr.sort((a, b) => ((a.day_number || 0) - (b.day_number || 0)) || (new Date(a.created_at) - new Date(b.created_at))));
  const dayIds = [];
  Object.values(fullDaysByJourney).forEach((arr) => arr.slice(-60).forEach((u) => dayIds.push(u.id)));
  const [encAllR, tracksAllR] = await Promise.all([
    dayIds.length ? guard(supabase.from('encouragements').select('update_id').eq('user_id', user.id).in('update_id', dayIds)) : { data: [] },
    dayIds.length ? guard(supabase.from('updates').select('id, track_title, track_artist, track_audio_url').in('id', dayIds).not('track_audio_url', 'is', null)) : { data: [] },
  ]);
  const myEncAll = new Set((encAllR.data || []).map((e) => e.update_id));
  (tracksAllR.data || []).forEach((item) => { trackByUpdate[item.id] = { title: item.track_title, artist: item.track_artist, audio_url: item.track_audio_url }; });

  const seenJourney = new Set();
  const realItems = updates.map((item) => {
    const journey = journeyMap[item.journey_id];
    if (!journey) return null;
    if (seenJourney.has(item.journey_id)) return null; // dias já agrupados no post da jornada
    seenJourney.add(item.journey_id);
    const daysArr = (fullDaysByJourney[item.journey_id] || []).slice(-60).map((u) => ({
      id: u.id, day_number: u.day_number, kind: u.kind, text: u.text, photo_url: u.photo_url, video_url: u.video_url, created_at: u.created_at,
      encouraged: myEncAll.has(u.id), track: trackByUpdate[u.id] || null, comeback: comebackByUpdate[u.id] || null,
    }));
    return {
      ...item,
      days: daysArr.length > 1 ? daysArr : null,
      challenge: challengeByOwner[journey.owner_id] || null,
      journey: { slug: journey.slug, title: journey.title, category: journey.category, total_days: journey.total_days, current_day: (statsByJourney[journey.id] || {}).current_day || 0, progress_pct: (statsByJourney[journey.id] || {}).progress_pct || 0 },
      owner: { ...(profileMap[journey.owner_id] || {}), mood: ownerMoodById[journey.owner_id] || null },
      own: journey.owner_id === user.id,
      track: trackByUpdate[item.id] || null,
      encouraged: myEnc.has(item.id),
      supporters: supportersByUpdate[item.id] || [],
      comeback: comebackByUpdate[item.id] || null,
    };
  }).filter(Boolean);

  const merged = [...realItems, ...mediaFeed].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const pageItems = merged.slice(offset, offset + PAGE);
  const demoNeeded = Math.max(0, PAGE - pageItems.length);
  const demoStart = Math.max(0, offset - merged.length);
  const demoSlice = demoNeeded > 0 ? demoItems.slice(demoStart, demoStart + demoNeeded) : [];
  return NextResponse.json({ items: [...pageItems, ...demoSlice] });
}
