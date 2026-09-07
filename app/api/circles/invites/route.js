import { NextResponse } from 'next/server';
import { circleAuth, newInviteToken, hashInviteToken } from '../../../../lib/circles/server';
import { canManageCircle } from '../../../../lib/circles/policy.mjs';
import { clienteServico } from '../../../../lib/dono';
import { rateLimit } from '../../../../lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bad = (error, status = 400, detail) => NextResponse.json({ error, ...(detail ? { detail } : {}) }, { status });

export async function GET(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const circleId = new URL(request.url).searchParams.get('circleId');
  if (!circleId) return bad('circle_required');
  const { data, error } = await supabase.from('circle_invites')
    .select('id, invitee_id, expires_at, max_uses, uses, status, created_at')
    .eq('circle_id', circleId).order('created_at', { ascending: false });
  return error ? bad('manager_required', 403) : NextResponse.json({ invites: data || [] });
}

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  if (!rateLimit(`circle:invite:${user.id}`, 30, 3600000)) return bad('rate_limited', 429);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const token = newInviteToken();
  const tokenHash = hashInviteToken(token);
  const days = Math.max(1, Math.min(30, Number(body.expires_in_days) || 7));
  const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
  const maxUses = body.invitee_id ? 1 : Math.max(1, Math.min(100, Number(body.max_uses) || 1));
  const { data, error } = await supabase.rpc('create_circle_invite', {
    p_circle_id: circleId,
    p_token_hash: tokenHash,
    p_invitee_id: body.invitee_id || null,
    p_expires_at: expiresAt,
    p_max_uses: maxUses,
  });
  if (error) return bad('invite_not_allowed', 403, error.message);
  const origin = new URL(request.url).origin;
  return NextResponse.json({ invite_id: data, expires_at: expiresAt, invite_url: `${origin}/circulos/convite/${token}` }, { status: 201 });
}

export async function DELETE(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const inviteId = String(body.invite_id || '');
  const { data: member } = await supabase.from('circle_members').select('role,status').eq('circle_id', circleId).eq('user_id', user.id).maybeSingle();
  if (!canManageCircle(member)) return bad('manager_required', 403);
  const admin = clienteServico();
  if (!admin) return bad('service_unavailable', 503);
  const { error } = await admin.from('circle_invites').update({ status: 'revoked', revoked_at: new Date().toISOString() }).eq('id', inviteId).eq('circle_id', circleId).eq('status', 'pending');
  if (error) return bad('invite_revoke_failed', 500);
  await admin.from('circle_audit_logs').insert({ circle_id: circleId, actor_id: user.id, action: 'invite_revoked', target_type: 'invite', target_id: inviteId });
  return NextResponse.json({ ok: true });
}
