import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const PAGE = 8;

export async function GET(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });
  const offset = Math.max(0, parseInt(new URL(req.url).searchParams.get('offset') || '0', 10));

  const { data: me } = await supabase.from('profiles').select('muted_cats').eq('id', user.id).maybeSingle();
  const mutedCats = new Set((me?.muted_cats || '').split(',').filter(Boolean));
  const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  const blocked = new Set((blk || []).map(b => b.blocked_id));

  const scope = new URL(req.url).searchParams.get('scope') || 'all';
  let targetIds = [];
  if (scope === 'following') {
    const { data: fl } = await supabase.from('follows').select('journey_id').eq('user_id', user.id);
    let fids = (fl || []).map(f => f.journey_id);
    const { data: pf } = await supabase.from('profile_follows').select('following_id').eq('follower_id', user.id);
    const pids = [...new Set((pf || []).map(f => f.following_id))];
    if (pids.length) {
      const { data: oj } = await supabase.from('journeys').select('id').in('owner_id', pids).eq('visibility', 'public');
      fids = fids.concat((oj || []).map(j => j.id));
    }
    fids = [...new Set(fids)];
    if (!fids.length) return NextResponse.json({ items: [] });
    const { data: fj } = await supabase.from('journeys').select('id, owner_id, category').in('id', fids);
    targetIds = (fj || []).filter(j => !blocked.has(j.owner_id) && !mutedCats.has(j.category)).map(j => j.id);
  } else {
    const { data: pub } = await supabase.from('journeys')
      .select('id, owner_id, category').eq('visibility', 'public').neq('owner_id', user.id)
      .order('created_at', { ascending: false }).limit(80);
    targetIds = (pub || []).filter(j => !blocked.has(j.owner_id) && !mutedCats.has(j.category)).map(j => j.id);
  }
  if (!targetIds.length) return NextResponse.json({ items: [] });

  const { data: ups } = await supabase.from('updates')
    .select('id, day_number, kind, text, photo_url, video_url, journey_id')
    .in('journey_id', targetIds).order('created_at', { ascending: false }).order('id', { ascending: false })
    .range(offset, offset + PAGE - 1);
  const list = ups || [];
  const jIds = [...new Set(list.map(u => u.journey_id))];
  const { data: js } = await supabase.from('journeys').select('id, slug, title, category, owner_id').in('id', jIds);
  const jMap = {}; (js || []).forEach(j => { jMap[j.id] = j; });
  const oIds = [...new Set((js || []).map(j => j.owner_id))];
  const { data: profs } = await supabase.from('profiles').select('id, name, avatar_color, avatar_url, handle').in('id', oIds);
  const pMap = {}; (profs || []).forEach(pr => { pMap[pr.id] = pr; });

  const myEnc = new Set();
  try {
    const { data: enc } = await supabase.from('encouragements').select('update_id').eq('user_id', user.id).in('update_id', list.map(u => u.id));
    (enc || []).forEach(e => myEnc.add(e.update_id));
  } catch { }

  const trackByUpdate = {};
  try {
    const { data: utr } = await supabase.from('updates').select('id, track_title, track_artist, track_audio_url').in('id', list.map(u => u.id)).not('track_audio_url', 'is', null);
    (utr || []).forEach(u => { trackByUpdate[u.id] = { title: u.track_title, artist: u.track_artist, audio_url: u.track_audio_url }; });
  } catch { /* colunas de música ainda não instaladas */ }

  const items = list.map(u => {
    const j = jMap[u.journey_id]; if (!j) return null;
    return { ...u, journey: { slug: j.slug, title: j.title, category: j.category }, owner: pMap[j.owner_id] || {}, track: trackByUpdate[u.id] || null, encouraged: myEnc.has(u.id) };
  }).filter(Boolean);
  return NextResponse.json({ items });
}
