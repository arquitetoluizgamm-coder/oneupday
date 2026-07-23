import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_req, { params }) {
  const supabase = createClient();
  const { data: update } = await supabase.from('updates').select('journey_id').eq('id', params.updateId).maybeSingle();
  if (!update) return NextResponse.json({ people: [] });
  const { data: journey } = await supabase.from('journeys').select('visibility, owner_id').eq('id', update.journey_id).maybeSingle();
  const { data: { user } } = await supabase.auth.getUser();
  if (!journey || (journey.visibility !== 'public' && journey.owner_id !== user?.id)) return NextResponse.json({ people: [] });
  const { data: encouragements, error } = await supabase
    .from('encouragements')
    .select('user_id')
    .eq('update_id', params.updateId);
  if (error) return NextResponse.json({ people: [] });
  const ids = [...new Set((encouragements || []).map(e => e.user_id))];
  if (!ids.length) return NextResponse.json({ people: [] });
  const { data: profiles } = await supabase
    .from('profiles').select('id, name, avatar_url, avatar_color').in('id', ids);
  return NextResponse.json({ people: profiles || [] });
}
