import { NextResponse } from 'next/server';
import { circleAuth, signedCircleMedia } from '../../../../lib/circles/server';
import { canModerateCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';
import { rateLimit } from '../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KINDS = new Set(['text','image','video','link','journey','routine','checkin','reflection','admin_content']);
const bad = (error, status = 400, detail) => NextResponse.json({ error, ...(detail ? { detail } : {}) }, { status });
function safeHttpUrl(value) {
  if (!value) return null;
  try {
    const parsed = new URL(String(value));
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch { return null; }
}

export async function GET(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const circleId = new URL(request.url).searchParams.get('circleId');
  if (!circleId) return bad('circle_required');
  const { data, error } = await supabase.from('circle_posts')
    .select('id, circle_id, author_id, kind, body, media_path, media_type, link_url, metadata, comments_enabled, status, pinned_at, created_at, profiles:profiles!circle_posts_author_id_fkey(id,name,avatar_url,avatar_color)')
    .eq('circle_id', circleId).order('pinned_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(60);
  if (error) return bad('circle_not_found', 404);
  const posts = await Promise.all((data || []).map(async (post) => ({
    ...post,
    media_url: await signedCircleMedia(supabase, post.media_path, 60),
  })));
  return NextResponse.json({ posts });
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:post:${user.id}`, 40, 3600000)) return bad('rate_limited', 429);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const kind = KINDS.has(body.kind) ? body.kind : 'text';
  const text = String(body.body || '').trim();
  const mediaPath = body.media_path ? String(body.media_path) : null;
  const linkUrl = safeHttpUrl(body.link_url);
  if (body.link_url && !linkUrl) return bad('invalid_link');
  if (!circleId || (!text && !mediaPath && !linkUrl)) return bad('invalid_post');
  if (text.length > 20000) return bad('post_too_large', 413);
  if (mediaPath && !mediaPath.startsWith(`${circleId}/${user.id}/`)) return bad('invalid_media_path');

  const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};
  if (JSON.stringify(metadata).length > 20000) return bad('metadata_too_large', 413);
  const { data, error } = await supabase.from('circle_posts').insert({
    circle_id: circleId,
    author_id: user.id,
    kind,
    body: text,
    media_path: mediaPath,
    media_type: body.media_type || null,
    link_url: linkUrl,
    metadata,
    comments_enabled: body.comments_enabled !== false,
  }).select('id, circle_id, author_id, kind, body, media_path, media_type, link_url, metadata, comments_enabled, status, pinned_at, created_at').single();
  if (error) return bad('post_not_allowed', 403, error.message);
  try { await supabase.from('events').insert({ user_id: user.id, name: 'circle_post_created', meta: { circle_id: circleId, post_id: data.id, kind } }); } catch {}
  return NextResponse.json({ post: { ...data, media_url: await signedCircleMedia(supabase, data.media_path, 60) } }, { status: 201 });
}

export async function PATCH(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const postId = String(body.post_id || '');
  const { data: post } = await supabase.from('circle_posts').select('id, circle_id, author_id').eq('id', postId).maybeSingle();
  if (!post) return bad('post_not_found', 404);
  const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', post.circle_id).eq('user_id', user.id).maybeSingle();
  if (!canModerateCircle(member)) return bad('moderator_required', 403);
  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const action = String(body.action || '');
  const patch = action === 'pin' ? { pinned_at: new Date().toISOString(), pinned_by: user.id }
    : action === 'unpin' ? { pinned_at: null, pinned_by: null }
    : action === 'close_comments' ? { comments_enabled: false }
    : action === 'hide' ? { status: 'hidden' }
    : action === 'remove' ? { status: 'removed' }
    : null;
  if (!patch) return bad('invalid_action');
  const { error } = await admin.from('circle_posts').update(patch).eq('id', post.id).eq('circle_id', post.circle_id);
  if (error) return bad('moderation_failed', 500);
  const moderationAction = action === 'close_comments' ? 'comments_closed'
    : action === 'remove' ? 'post_removed'
    : action === 'hide' ? 'post_hidden'
    : action === 'pin' ? 'post_pinned'
    : 'post_unpinned';
  await admin.from('circle_moderation_actions').insert({ circle_id: post.circle_id, actor_id: user.id, action: moderationAction, target_type: 'post', target_id: post.id, reason: String(body.reason || '') });
  await admin.from('circle_audit_logs').insert({ circle_id: post.circle_id, actor_id: user.id, action: `post_${action}`, target_type: 'post', target_id: post.id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const { error } = await supabase.from('circle_posts').delete().eq('id', String(body.post_id || '')).eq('author_id', user.id);
  return error ? bad('delete_not_allowed', 403) : NextResponse.json({ ok: true });
}
