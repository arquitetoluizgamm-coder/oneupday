import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { rateLimit } from '../../../lib/ratelimit';

const BLOCKED = [
  'vai se matar', 'se mata', 'idiota', 'imbecil', 'retardado', 'lixo', 'fracassado',
  'loser', 'idiot', 'stupid', 'kill yourself', 'go die', 'you are worthless',
];

function locallyUnsafe(text) {
  const value = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED.some(word => value.includes(word));
}

async function aiUnsafe(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return false;
  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.results?.[0]?.flagged;
  } catch { return false; }
}

export async function GET(req) {
  const url = new URL(req.url);
  const updateId = url.searchParams.get('updateId');
  const mediaId = url.searchParams.get('mediaId');
  const challengeId = url.searchParams.get('challengeId');
  const col = challengeId ? 'challenge_id' : mediaId ? 'media_id' : 'update_id';
  const val = challengeId || mediaId || updateId;
  if (!val) return NextResponse.json({ comments: [] });
  const supabase = createClient();
  const { data: comments } = await supabase.from('comments')
    .select('id, user_id, parent_id, body, created_at').eq(col, val)
    .eq('status', 'published').order('created_at', { ascending: true }).limit(50);
  const ids = [...new Set((comments || []).map(c => c.user_id))];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, name, avatar_url, avatar_color').in('id', ids)
    : { data: [] };
  const map = {}; (profiles || []).forEach(p => { map[p.id] = p; });
  return NextResponse.json({ comments: (comments || []).map(c => ({ ...c, author: map[c.user_id] || {} })) });
}

export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit(`comment:${user.id}`, 20, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const updateId = String(body.updateId || '');
  const mediaId = body.mediaId ? String(body.mediaId) : '';
  const challengeId = body.challengeId ? String(body.challengeId) : '';
  const col = challengeId ? 'challenge_id' : mediaId ? 'media_id' : 'update_id';
  const val = challengeId || mediaId || updateId;
  const text = String(body.text || '').trim();
  const parentId = body.parentId ? String(body.parentId) : null;
  if (!val || !text || text.length > 500) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (challengeId) {
    const { data: ch } = await supabase.from('challenges').select('id, status').eq('id', challengeId).maybeSingle();
    if (!ch || ch.status === 'declined') return NextResponse.json({ error: 'notfound' }, { status: 404 });
  } else if (mediaId) {
    const { data: m } = await supabase.from('media').select('user_id, visibility').eq('id', mediaId).maybeSingle();
    if (!m || (m.visibility === 'private' && m.user_id !== user.id)) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  } else {
    const { data: update } = await supabase.from('updates').select('journey_id').eq('id', updateId).maybeSingle();
    if (!update) return NextResponse.json({ error: 'notfound' }, { status: 404 });
    const { data: journey } = await supabase.from('journeys').select('visibility, owner_id').eq('id', update.journey_id).maybeSingle();
    if (!journey || (journey.visibility !== 'public' && journey.owner_id !== user.id)) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  }
  if (parentId) {
    const { data: parent } = await supabase.from('comments').select('id').eq('id', parentId).eq(col, val).eq('status', 'published').maybeSingle();
    if (!parent) return NextResponse.json({ error: 'invalid_parent' }, { status: 400 });
  }
  if (locallyUnsafe(text) || await aiUnsafe(text)) return NextResponse.json({ error: 'unsafe' }, { status: 422 });

  const { data: comment, error } = await supabase.from('comments').insert({
    [col]: val, user_id: user.id, parent_id: parentId, body: text, status: 'published',
  }).select('id, user_id, parent_id, body, created_at').single();
  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });
  return NextResponse.json({ comment });
}
