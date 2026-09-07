import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';
import { locallyUnsafe } from '../../../../lib/moderacao';
import { rateLimit } from '../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function GET(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const postId = new URL(request.url).searchParams.get('postId');
  if (!postId) return bad('post_required');
  const { data, error } = await supabase.from('circle_comments')
    .select('id,circle_id,post_id,author_id,parent_id,body,status,created_at,profiles:profiles!circle_comments_author_id_fkey(id,name,avatar_url,avatar_color)')
    .eq('post_id', postId).order('created_at', { ascending: true }).limit(100);
  if (error) return bad('post_not_found', 404);
  return NextResponse.json({ comments: data || [] });
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:comment:${user.id}`, 40, 3600000)) return bad('rate_limited', 429);
  const body = await request.json().catch(() => ({}));
  const text = String(body.body || '').trim();
  if (!body.circle_id || !body.post_id || !text) return bad('invalid_comment');
  if (text.length > 5000) return bad('comment_too_large', 413);
  if (locallyUnsafe(text)) return bad('unsafe', 422);
  const { data, error } = await supabase.from('circle_comments').insert({
    circle_id: body.circle_id,
    post_id: body.post_id,
    author_id: user.id,
    parent_id: body.parent_id || null,
    body: text,
  }).select('id,circle_id,post_id,author_id,parent_id,body,status,created_at').single();
  return error ? bad('comment_not_allowed', 403) : NextResponse.json({ comment: data }, { status: 201 });
}

export async function DELETE(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const { error } = await supabase.from('circle_comments').delete().eq('id', String(body.comment_id || '')).eq('author_id', user.id);
  return error ? bad('delete_not_allowed', 403) : NextResponse.json({ ok: true });
}
