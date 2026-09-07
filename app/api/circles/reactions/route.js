import { NextResponse } from 'next/server';
import { circleAuth } from '../../../../lib/circles/server';

const REACTIONS = new Set(['support', 'with_you', 'inspiring']);
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request) {
  const { supabase, user } = await circleAuth();
  if (!user) return bad('authentication_required', 401);
  const body = await request.json().catch(() => ({}));
  const circleId = String(body.circle_id || '');
  const postId = String(body.post_id || '');
  const reaction = REACTIONS.has(body.reaction) ? body.reaction : 'support';
  if (!circleId || !postId) return bad('invalid_reaction');
  const { data: existing } = await supabase.from('circle_reactions').select('id')
    .eq('post_id', postId).eq('user_id', user.id).eq('reaction', reaction).maybeSingle();
  if (existing) {
    const { error } = await supabase.from('circle_reactions').delete().eq('id', existing.id).eq('user_id', user.id);
    return error ? bad('reaction_not_allowed', 403) : NextResponse.json({ active: false });
  }
  const { error } = await supabase.from('circle_reactions').insert({ circle_id: circleId, post_id: postId, user_id: user.id, reaction });
  return error ? bad('reaction_not_allowed', 403) : NextResponse.json({ active: true });
}
