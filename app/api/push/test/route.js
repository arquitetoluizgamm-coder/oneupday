import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { sendPush, pushReady } from '../../../../lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Envia uma notificação de teste APENAS para quem está logado.
// Serve para a pessoa confirmar que as notificações funcionam no aparelho dela.
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 });
  if (!pushReady()) return NextResponse.json({ error: 'no-vapid' }, { status: 500 });

  const { data: subs } = await supabase.from('push_subs').select('*').eq('user_id', user.id);
  const list = subs || [];
  if (!list.length) return NextResponse.json({ error: 'no-subscription' }, { status: 400 });

  let sent = 0;
  for (const s of list) {
    const r = await sendPush(s, {
      title: 'Upi',
      body: 'Funcionou. É assim que eu vou te chamar.',
      url: '/home',
      tag: 'oud-test',
    });
    if (r.ok) sent++;
    if (r.status === 404 || r.status === 410) {
      await supabase.from('push_subs').delete().eq('id', s.id);
    }
  }
  return NextResponse.json({ ok: sent > 0, sent });
}
