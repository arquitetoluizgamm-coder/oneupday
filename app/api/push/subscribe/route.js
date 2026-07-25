import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Guarda a inscrição de push do aparelho
export async function POST(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { endpoint, keys } = body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  await supabase.from('push_subs').delete().eq('endpoint', endpoint);
  const { error } = await supabase.from('push_subs')
    .insert({ user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth });
  if (error) return NextResponse.json({ error: 'db' }, { status: 500 });

  try { await supabase.from('profiles').update({ push_on: true }).eq('id', user.id); } catch {}
  return NextResponse.json({ ok: true });
}

// Remove a inscrição (a pessoa desligou)
export async function DELETE(req) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (body?.endpoint) await supabase.from('push_subs').delete().eq('endpoint', body.endpoint).eq('user_id', user.id);
  try { await supabase.from('profiles').update({ push_on: false }).eq('id', user.id); } catch {}
  return NextResponse.json({ ok: true });
}
