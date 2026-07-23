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
  const updateId = new URL(req.url).searchParams.get('updateId');
  if (!updateId) return NextResponse.json({ comments: [] });
  const supabase = createClient();
  const { data: comments } = await supabase.from('comments')
    .select('id, user_id, body, created_at').eq('update_id', updateId)
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
  const text = String(body.text || '').trim();
  if (!updateId || !text || text.length > 500) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { data: update } = await supabase.from('updates').select('journey_id').eq('id', updateId).maybeSingle();
  if (!update) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  const { data: journey } = await supabase.from('journeys').select('visibility, owner_id').eq('id', update.journey_id).maybeSingle();
  if (!journey || (journey.visibility !== 'public' && journey.owner_id !== user.id)) return NextResponse.json({ error: 'notfound' }, { status: 404 });
  if (locallyUnsafe(text) || await aiUnsafe(text)) return NextResponse.json({ error: 'unsafe' }, { status: 422 });

  const { data: comment, error } = await supabase.from('comments').insert({
    update_id: updateId, user_id: user.id, body: text, status: 'published',
  }).select('id, user_id, body, created_at').single();
  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });
  return NextResponse.json({ comment });
}
