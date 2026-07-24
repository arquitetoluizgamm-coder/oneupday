import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'nao logado' }, { status: 401 });

  const out = { user_id: user.id };

  // a tabela media existe? o usuario enxerga alguma linha publica?
  const pub = await supabase.from('media').select('id, user_id, visibility, kind, created_at').eq('visibility', 'public').order('created_at', { ascending: false }).limit(20);
  out.public_visible_count = (pub.data || []).length;
  out.public_visible = pub.data || [];
  out.public_error = pub.error ? pub.error.message : null;

  // minhas proprias linhas de media (qualquer visibilidade)
  const mine = await supabase.from('media').select('id, visibility, kind, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
  out.my_media_count = (mine.data || []).length;
  out.my_media = mine.data || [];
  out.my_media_error = mine.error ? mine.error.message : null;

  return NextResponse.json(out);
}
