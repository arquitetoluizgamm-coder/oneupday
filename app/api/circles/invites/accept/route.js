import { NextResponse } from 'next/server';
import { circleAuth, hashInviteToken } from '../../../../../lib/circles/server';
import { rateLimit } from '../../../../../lib/ratelimit';

export const runtime = 'nodejs';

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
  if (!rateLimit(`circle:accept:${user.id}`, 20, 3600000)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  if (!body.token || body.accept_rules !== true || body.accept_privacy !== true) {
    return NextResponse.json({ error: 'explicit_acceptance_required' }, { status: 400 });
  }
  const { data, error } = await supabase.rpc('accept_circle_invite', {
    p_token_hash: hashInviteToken(body.token),
    p_accept_rules: true,
    p_accept_privacy: true,
    p_display_name: String(body.display_name || '').trim() || null,
  });
  if (error) return NextResponse.json({ error: 'invite_accept_failed', detail: error.message }, { status: 400 });
  try { await supabase.from('events').insert({ user_id: user.id, name: 'invite_accepted', meta: { circle_id: data } }); } catch {}
  return NextResponse.json({ circle_id: data });
}
