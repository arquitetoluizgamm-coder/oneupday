import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const type = body?.type;
  if (!type) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    await sb.from('events').insert({
      user_id: user?.id || null,
      anon_id: body.anonId ? String(body.anonId).slice(0, 60) : null,
      name: String(type).slice(0, 40),
      meta: body.meta || null,
    });
  } catch { }
  return NextResponse.json({ ok: true });
}
