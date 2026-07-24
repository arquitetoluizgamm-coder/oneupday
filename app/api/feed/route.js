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
    const { data: publicJourneys } = await supabase.from('journeys')
      .select('id, owner_id, category')
      .eq('visibility', 'public')
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(80);

    targetIds = (publicJourneys || [])
      .filter((journey) => !blocked.has(journey.owner_id) && !mutedCats.has(journey.category))
      .map((journey) => journey.id);
  }

  const demoItems = scope === 'all'
    ? buildDemoFeedItems(locale).filter((item) => !mutedCats.has(item.journey.category) && (!kind || item.kind === kind))
    : [];
  let realTotal = 0;
  if (targetIds.length) {
    let cq = supabase.from('updates').select('*', { count: 'exact', head: true }).in('journey_id', targetIds);
    if (VALID_KINDS.has(kind)) cq = cq.eq('kind', kind);
    const { count } = await cq;
    realTotal = count || 0;
  }

  if (!targetIds.length && !demoItems.length) return NextResponse.json({ items: [] });

  let updates = [];
  if (targetIds.length && offset < realTotal) {
    let updatesQuery = supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, journey_id')
      .in('journey_id', targetIds);

    if (VALID_KINDS.has(kind)) updatesQuery = updatesQuery.eq('kind', kind);

    const { data: rows } = await updatesQuery
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + PAGE - 1);

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

  const myEnc = new Set();
  if (updates.length) {
    try {
      const { data: encouragements } = await supabase
        .from('encouragements')
        .select('update_id')
        .eq('user_id', user.id)
        .in('update_id', updates.map((item) => item.id));
      (encouragements || []).forEach((item) => myEnc.add(item.update_id));
    } catch {}
  }

  const trackByUpdate = {};
  if (updates.length) {
    try {
      const { data: tracks } = await supabase
        .from('updates')
        .select('id, track_title, track_artist, track_audio_url')
        .in('id', updates.map((item) => item.id))
        .not('track_audio_url', 'is', null);
      (tracks || []).forEach((item) => {
        trackByUpdate[item.id] = { title: item.track_title, artist: item.track_artist, audio_url: item.track_audio_url };
      });
    } catch {}
  }

  const supportersByUpdate = {};
  if (updates.length) {
    try {
      const { data: encs } = await supabase.from('encouragements').select('update_id, user_id').in('update_id', updates.map((item) => item.id));
      const supIds = [...new Set((encs || []).map((e) => e.user_id))];
      const supProfiles = {};
      if (supIds.length) {
        const { data: sp } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', supIds);
        (sp || []).forEach((pr) => { supProfiles[pr.id] = pr; });
      }
      (encs || []).forEach((e) => {
        (supportersByUpdate[e.update_id] ||= []);
        const pr = supProfiles[e.user_id];
        if (pr && supportersByUpdate[e.update_id].length < 12) supportersByUpdate[e.update_id].push({ name: pr.name, handle: pr.handle, avatar_url: pr.avatar_url, avatar_color: pr.avatar_color });
      });
    } catch {}
  }

  const statsByJourney = {};
  if (journeyIds.length) {
    try {
      const { data: js } = await supabase.from('journey_stats').select('journey_id, current_day, progress_pct').in('journey_id', journeyIds);
      (js || []).forEach((st) => { statsByJourney[st.journey_id] = st; });
    } catch {}
  }

  const ownerMoodById = {};
  try {
    const { data: mps } = await supabase.from('profiles').select('id, mood, mood_at').in('id', ownerIds).not('mood', 'is', null);
    (mps || []).forEach((mp) => { if (mp.mood_at && (Date.now() - new Date(mp.mood_at).getTime() < 30 * 3600 * 1000)) ownerMoodById[mp.id] = mp.mood; });
  } catch {}

  const comebackByUpdate = {};
  if (journeyIds.length) {
    try {
      const { data: allUps } = await supabase.from('updates').select('id, journey_id, day_number').in('journey_id', journeyIds);
      const daysByJourney = {};
      (allUps || []).forEach((u) => { (daysByJourney[u.journey_id] ||= []).push(u.day_number || 0); });
      Object.values(daysByJourney).forEach((arr) => arr.sort((a, b) => a - b));
      updates.forEach((u) => {
        const arr = daysByJourney[u.journey_id] || [];
        let prev = null;
        for (const d of arr) { if (d < (u.day_number || 0)) prev = d; else break; }
        if (prev !== null) { const gap = (u.day_number || 0) - prev; if (gap >= 3) comebackByUpdate[u.id] = gap; }
      });
    } catch {}
  }

  const realItems = updates.map((item) => {
    const journey = journeyMap[item.journey_id];
    if (!journey) return null;
    return {
      ...item,
      journey: { slug: journey.slug, title: journey.title, category: journey.category, total_days: journey.total_days, current_day: (statsByJourney[journey.id] || {}).current_day || 0, progress_pct: (statsByJourney[journey.id] || {}).progress_pct || 0 },
      owner: { ...(profileMap[journey.owner_id] || {}), mood: ownerMoodById[journey.owner_id] || null },
      track: trackByUpdate[item.id] || null,
      encouraged: myEnc.has(item.id),
      supporters: supportersByUpdate[item.id] || [],
      comeback: comebackByUpdate[item.id] || null,
    };
  }).filter(Boolean);

  // fotos/vídeos do álbum (públicos) entram no feed, depois dos posts reais
  let mediaFeed = [];
  if (scope === 'all') {
    try {
      const { data: mrows } = await supabase.from('media').select('id, url, kind, caption, user_id, created_at').eq('visibility', 'public').order('created_at', { ascending: false }).limit(60);
      const rows = (mrows || []).filter((m) => !blocked.has(m.user_id) && m.user_id !== user.id);
      const mIds = [...new Set(rows.map((m) => m.user_id))];
      const mp = {};
      if (mIds.length) { const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', mIds); (profs || []).forEach((pr) => { mp[pr.id] = pr; }); }
      mediaFeed = rows.map((m) => ({ id: 'media-' + m.id, media: true, mediaId: m.id, url: m.url, kind: m.kind, caption: m.caption || '', created_at: m.created_at, owner: mp[m.user_id] || {}, encouraged: false }));
      try {
        const { data: myE } = await supabase.from('encouragements').select('media_id').eq('user_id', user.id).in('media_id', mediaFeed.map((x) => x.mediaId));
        const eset = new Set((myE || []).map((e) => e.media_id));
        mediaFeed.forEach((it) => { it.encouraged = eset.has(it.mediaId); });
      } catch {}
    } catch {}
  }
  const mediaTotal = mediaFeed.length;

  const afterReal = Math.max(0, PAGE - realItems.length);
  const mediaStart = Math.max(0, offset - realTotal);
  const mediaSlice = afterReal > 0 ? mediaFeed.slice(mediaStart, mediaStart + afterReal) : [];

  const afterMedia = Math.max(0, PAGE - realItems.length - mediaSlice.length);
  const demoStart = Math.max(0, offset - realTotal - mediaTotal);
  const demoSlice = afterMedia > 0 ? demoItems.slice(demoStart, demoStart + afterMedia) : [];

  return NextResponse.json({ items: [...realItems, ...mediaSlice, ...demoSlice] });
}
