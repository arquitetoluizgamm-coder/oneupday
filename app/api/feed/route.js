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
  const demoSlice = demoItems.slice(offset, offset + PAGE);
  const realOffset = Math.max(0, offset - demoItems.length);
  const realLimit = Math.max(0, PAGE - demoSlice.length);

  if (!targetIds.length && !demoSlice.length) return NextResponse.json({ items: [] });

  let updates = [];
  if (targetIds.length && realLimit > 0) {
    let updatesQuery = supabase.from('updates')
      .select('id, day_number, kind, text, photo_url, video_url, journey_id')
      .in('journey_id', targetIds);

    if (VALID_KINDS.has(kind)) updatesQuery = updatesQuery.eq('kind', kind);

    const { data: rows } = await updatesQuery
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(realOffset, realOffset + realLimit - 1);

    updates = rows || [];
  }

  const journeyIds = [...new Set(updates.map((item) => item.journey_id))];
  const { data: journeys } = journeyIds.length
    ? await supabase.from('journeys').select('id, slug, title, category, owner_id, cover_color').in('id', journeyIds)
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

  const realItems = updates.map((item) => {
    const journey = journeyMap[item.journey_id];
    if (!journey) return null;
    return {
      ...item,
      journey: { slug: journey.slug, title: journey.title, category: journey.category },
      owner: profileMap[journey.owner_id] || {},
      track: trackByUpdate[item.id] || null,
      encouraged: myEnc.has(item.id),
    };
  }).filter(Boolean);

  return NextResponse.json({ items: [...demoSlice, ...realItems] });
}
