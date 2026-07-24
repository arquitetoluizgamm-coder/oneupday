import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ people: [] });

  const following = new Set([user.id]);
  try { const { data: pf } = await supabase.from('profile_follows').select('following_id').eq('follower_id', user.id); (pf || []).forEach((f) => following.add(f.following_id)); } catch {}
  const blocked = new Set();
  try { const { data: blk } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id); (blk || []).forEach((b) => blocked.add(b.blocked_id)); } catch {}

  const { data: journeys } = await supabase.from('journeys')
    .select('id, slug, title, owner_id').eq('visibility', 'public')
    .order('created_at', { ascending: false }).limit(60);

  const people = []; const seen = new Set();
  for (const j of (journeys || [])) {
    if (!j.owner_id || following.has(j.owner_id) || blocked.has(j.owner_id) || seen.has(j.owner_id)) continue;
    seen.add(j.owner_id);
    people.push({ ownerId: j.owner_id, journeySlug: j.slug, journeyTitle: j.title });
    if (people.length >= 10) break;
  }
  const ids = people.map((p) => p.ownerId);
  if (ids.length) {
    const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids);
    const pm = {}; (profs || []).forEach((p) => { pm[p.id] = p; });
    people.forEach((p) => { const pr = pm[p.ownerId] || {}; p.name = pr.name; p.handle = pr.handle; p.avatar_url = pr.avatar_url; p.avatar_color = pr.avatar_color; });
  }
  return NextResponse.json({ people: people.filter((p) => p.name) });
}
