import crypto from 'node:crypto';
import { createClient } from '../supabase/server';
import { clienteServico } from '../dono';

if (typeof window !== 'undefined') {
  throw new Error('lib/circles/server.js é exclusivo do servidor.');
}

export async function circleAuth() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

export function newInviteToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashInviteToken(token) {
  return crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');
}

export async function circleMembership(supabase, circleId, userId) {
  if (!circleId || !userId) return null;
  const { data } = await supabase.from('circle_members')
    .select('id, circle_id, user_id, role, status, display_name, rules_version_accepted, terms_version_accepted')
    .eq('circle_id', circleId).eq('user_id', userId).maybeSingle();
  return data || null;
}

export async function signedCircleMedia(supabase, path, expiresIn = 60) {
  if (!path) return null;
  const ttl = Math.max(30, Math.min(300, Number(expiresIn) || 60));
  const { data, error } = await supabase.storage.from('circle-media').createSignedUrl(path, ttl);
  return error ? null : data?.signedUrl || null;
}

export async function invitePreviewForUser(token, userId) {
  const admin = clienteServico();
  if (!admin || !userId) return { error: 'unavailable' };
  const tokenHash = hashInviteToken(token);
  const { data: invite } = await admin.from('circle_invites')
    .select('id, circle_id, invitee_id, status, expires_at, max_uses, uses, created_by')
    .eq('token_hash', tokenHash).maybeSingle();
  if (!invite) return { error: 'not_found' };
  if (invite.invitee_id && invite.invitee_id !== userId) return { error: 'not_found' };
  if (invite.status !== 'pending' || invite.uses >= invite.max_uses) return { error: 'unavailable' };
  if (new Date(invite.expires_at).getTime() <= Date.now()) return { error: 'expired' };

  const [{ data: circle }, { data: rules }] = await Promise.all([
    admin.from('circles').select('id, slug, name, description, owner_id, visibility, status, current_rules_version, terms_version').eq('id', invite.circle_id).maybeSingle(),
    admin.from('circle_rules').select('version, rules').eq('circle_id', invite.circle_id).order('version', { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!circle || circle.status !== 'active' || circle.visibility !== 'private') return { error: 'unavailable' };
  const { data: owner } = await admin.from('profiles').select('id, name, avatar_url, avatar_color').eq('id', circle.owner_id).maybeSingle();
  return { invite, circle, rules: rules || { version: circle.current_rules_version, rules: [] }, owner: owner || null, tokenHash };
}
