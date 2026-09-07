import { NextResponse } from 'next/server';
import { circleAuth, hashInviteToken, newInviteToken } from '../../../../lib/circles/server';
import { canManageCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';
import { rateLimit } from '../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bad = (error, status = 400) => NextResponse.json({ error }, { status });

async function managedCircle(supabase, userId, circleId) {
  const { data: member } = await supabase.from('circle_members')
    .select('role,status')
    .eq('circle_id', circleId)
    .eq('user_id', userId)
    .maybeSingle();
  if (!canManageCircle(member)) return null;
  const { data: circle } = await supabase.from('circles')
    .select('id,slug,name,description,status')
    .eq('id', circleId)
    .maybeSingle();
  return circle?.status === 'active' ? circle : null;
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:feed-publish:${user.id}`, 12, 3600000)) return bad('rate_limited', 429);

  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  if (!circleId) return bad('circle_required');
  const circle = await managedCircle(supabase, user.id, circleId);
  if (!circle) return bad('manager_required', 403);

  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const now = new Date();
  const { data: existing } = await admin.from('circle_feed_publications')
    .select('id,invite_id,invite_token,invite_expires_at,status')
    .eq('circle_id', circleId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing && new Date(existing.invite_expires_at).getTime() > now.getTime()) {
    return NextResponse.json({
      publication: { id: existing.id, invite_path: `/circulos/convite/${existing.invite_token}` },
      already_published: true,
    });
  }

  if (existing) {
    await admin.from('circle_feed_publications').update({ status: 'expired', withdrawn_at: now.toISOString() }).eq('id', existing.id);
    await admin.from('circle_invites').update({ status: 'expired' }).eq('id', existing.invite_id).eq('status', 'pending');
  }

  const token = newInviteToken();
  const expiresAt = new Date(now.getTime() + 365 * 86400000).toISOString();
  const invite = await supabase.rpc('create_circle_invite', {
    p_circle_id: circleId,
    p_token_hash: hashInviteToken(token),
    p_invitee_id: null,
    p_expires_at: expiresAt,
    p_max_uses: 1000,
  });
  if (invite.error || !invite.data) return bad('invite_create_failed', 500);

  const { data: publication, error } = await admin.from('circle_feed_publications').insert({
    circle_id: circleId,
    author_id: user.id,
    invite_id: invite.data,
    invite_token: token,
    circle_name: circle.name,
    circle_description: String(circle.description || '').slice(0, 5000),
    invite_expires_at: expiresAt,
  }).select('id').single();

  if (error) {
    await admin.from('circle_invites').update({ status: 'revoked', revoked_at: new Date().toISOString() }).eq('id', invite.data);
    return bad(error.code === '23505' ? 'already_published' : 'publication_failed', error.code === '23505' ? 409 : 500);
  }

  await admin.from('circle_audit_logs').insert({
    circle_id: circleId,
    actor_id: user.id,
    action: 'circle_published_to_feed',
    target_type: 'feed_publication',
    target_id: publication.id,
  });

  return NextResponse.json({ publication: { id: publication.id, invite_path: `/circulos/convite/${token}` } }, { status: 201 });
}

export async function DELETE(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:feed-unpublish:${user.id}`, 30, 3600000)) return bad('rate_limited', 429);

  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  if (!circleId) return bad('circle_required');
  const circle = await managedCircle(supabase, user.id, circleId);
  if (!circle) return bad('manager_required', 403);

  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const { data: publication } = await admin.from('circle_feed_publications')
    .select('id,invite_id')
    .eq('circle_id', circleId)
    .eq('status', 'active')
    .maybeSingle();
  if (!publication) return NextResponse.json({ ok: true, already_withdrawn: true });

  const withdrawnAt = new Date().toISOString();
  const { error } = await admin.from('circle_feed_publications')
    .update({ status: 'withdrawn', withdrawn_at: withdrawnAt })
    .eq('id', publication.id);
  if (error) return bad('publication_withdraw_failed', 500);
  await admin.from('circle_invites')
    .update({ status: 'revoked', revoked_at: withdrawnAt })
    .eq('id', publication.invite_id)
    .eq('status', 'pending');
  await admin.from('circle_audit_logs').insert({
    circle_id: circleId,
    actor_id: user.id,
    action: 'circle_withdrawn_from_feed',
    target_type: 'feed_publication',
    target_id: publication.id,
  });
  return NextResponse.json({ ok: true });
}
