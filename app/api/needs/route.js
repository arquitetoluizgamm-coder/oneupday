import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const LOW = ['down', 'anxious', 'tired'];

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ people: [] });

  const ids = new Set();
  try { const { data: pf } = await supabase.from('profile_follows').select('following_id').eq('follower_id', user.id); (pf || []).forEach((f) => ids.add(f.following_id)); } catch {}
  try {
    const { data: fl } = await supabase.from('follows').select('journey_id').eq('user_id', user.id);
    const jids = [...new Set((fl || []).map((f) => f.journey_id))];
    if (jids.length) { const { data: js } = await supabase.from('journeys').select('owner_id').in('id', jids); (js || []).forEach((j) => ids.add(j.owner_id)); }
  } catch {}
  ids.delete(user.id);
  if (!ids.size) return NextResponse.json({ people: [] });

  let people = [];
  try {
    const { data: profs } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color, mood, mood_at').in('id', [...ids]);
    const now = Date.now();
    people = (profs || [])
      .filter((p) => p.mood && LOW.includes(p.mood) && p.mood_at && (now - new Date(p.mood_at).getTime() < 30 * 3600 * 1000))
      .slice(0, 8)
      .map((p) => ({ id: p.id, name: p.name, handle: p.handle, avatar_url: p.avatar_url, avatar_color: p.avatar_color, mood: p.mood }));
  } catch {}
  return NextResponse.json({ people });
}
