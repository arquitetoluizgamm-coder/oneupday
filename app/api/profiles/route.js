import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export async function GET(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ profiles: [] }, { status: 401 });
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  if (q.length < 2) return NextResponse.json({ profiles: [] });
  const { data: profiles } = await supabase.from('profiles').select('id, name, handle, avatar_url, avatar_color')
    .neq('id', user.id).or(`name.ilike.%${q}%,handle.ilike.%${q}%`).limit(8);
  return NextResponse.json({ profiles: profiles || [] });
}
