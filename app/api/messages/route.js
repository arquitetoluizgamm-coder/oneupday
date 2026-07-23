import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { rateLimit } from '../../../lib/ratelimit';

const BLOCKED = ['vai se matar', 'se mata', 'idiota', 'imbecil', 'retardado', 'lixo', 'fracassado', 'kill yourself', 'go die'];
function unsafe(text) {
  const value = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED.some(word => value.includes(word));
}

async function currentUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function connected(supabase, a, b) {
  const { data } = await supabase.from('profile_follows').select('follower_id, following_id')
    .or(`and(follower_id.eq.${a},following_id.eq.${b}),and(follower_id.eq.${b},following_id.eq.${a})`);
  return !!data?.length;
}

export async function GET(req) {
  const supabase = createClient();
  const user = await currentUser(supabase);
  if (!user) return NextResponse.json({ conversations: [], messages: [] }, { status: 401 });
  const withId = new URL(req.url).searchParams.get('with');
  if (withId) {
    if (!(await connected(supabase, user.id, withId))) return NextResponse.json({ messages: [] }, { status: 403 });
    const { data: messages } = await supabase.from('messages').select('id, sender_id, recipient_id, body, read_at, created_at')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${withId}),and(sender_id.eq.${withId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true }).limit(100);
    await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('recipient_id', user.id).eq('sender_id', withId).is('read_at', null);
    return NextResponse.json({ messages: messages || [] });
  }
  const { data: rows } = await supabase.from('messages').select('id, sender_id, recipient_id, body, read_at, created_at')
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(100);
  const ids = [...new Set((rows || []).map(m => m.sender_id === user.id ? m.recipient_id : m.sender_id))];
  const { data: profiles } = ids.length ? await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color').in('id', ids) : { data: [] };
  const map = {}; (profiles || []).forEach(p => { map[p.id] = p; });
  const seen = new Set();
  const conversations = (rows || []).filter(m => { const id = m.sender_id === user.id ? m.recipient_id : m.sender_id; if (seen.has(id)) return false; seen.add(id); return true; }).map(m => ({ ...m, person: map[m.sender_id === user.id ? m.recipient_id : m.sender_id] || {} }));
  return NextResponse.json({ conversations });
}

export async function POST(req) {
  const supabase = createClient();
  const user = await currentUser(supabase);
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 });
  if (!rateLimit(`message:${user.id}`, 40, 3600000)) return NextResponse.json({ error: 'rate' }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const recipientId = String(body.recipientId || '');
  const text = String(body.text || '').trim();
  if (!recipientId || recipientId === user.id || !text || text.length > 1000) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (!(await connected(supabase, user.id, recipientId))) return NextResponse.json({ error: 'connection' }, { status: 403 });
  if (unsafe(text)) return NextResponse.json({ error: 'unsafe' }, { status: 422 });
  const { data: message, error } = await supabase.from('messages').insert({ sender_id: user.id, recipient_id: recipientId, body: text }).select('id, sender_id, recipient_id, body, read_at, created_at').single();
  if (error) return NextResponse.json({ error: 'save' }, { status: 500 });
  return NextResponse.json({ message });
}
