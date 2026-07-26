import { NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { sendPush, pushReady } from '../../../../lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Despachante: roda no cron da Vercel.
// 1) manda push das notificações novas (curtida, comentário, seguir, abraço, desafio)
// 2) manda o lembrete diário do Upi na hora escolhida por cada pessoa
async function handler(req) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    // aceita a chave de três formas: cabeçalho (cron da Vercel),
    // corpo JSON (gatilho do banco) ou query (teste manual)
    const auth = req.headers.get('authorization') || '';
    const url = new URL(req.url);
    let bodyKey = '';
    if (req.method === 'POST') {
      try { bodyKey = (await req.json().catch(() => ({})))?.key || ''; } catch {}
    }
    const ok = auth === `Bearer ${secret}`
      || url.searchParams.get('key') === secret
      || bodyKey === secret;
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!pushReady()) return NextResponse.json({ error: 'no-vapid' }, { status: 500 });

  const sb = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const TXT = {
    encourage: (n) => ({ title: 'Alguém apoiou seu dia', body: `${n} apoiou o que você registrou.` }),
    comment: (n) => ({ title: 'Novo comentário', body: `${n} comentou na sua jornada.` }),
    follow: (n) => ({ title: 'Novo apoiador', body: `${n} começou a acompanhar você.` }),
    hug: (n) => ({ title: 'Você recebeu um abraço', body: `${n} mandou um abraço 🤗` }),
    metoo: () => ({ title: '"Eu também"', body: 'Alguém passou pelo mesmo que você.' }),
    challenge: (n) => ({ title: 'Desafio', body: `${n} te lançou um desafio.` }),
    challenge_accept: (n) => ({ title: 'Desafio aceito', body: `${n} aceitou seu desafio.` }),
    comeback: (n) => ({ title: 'Alguém voltou', body: `${n} voltou para a jornada.` }),
    mood_low: (n) => ({ title: 'Alguém pode precisar', body: `Que tal mandar um abraço pra ${n}?` }),
    welcome: () => ({ title: 'Bem-vindo ao One Up Day', body: 'Aqui, voltar é sempre bem-vindo.' }),
  };

  const subsByUser = {};
  const loadSubs = async (ids) => {
    const miss = ids.filter((id) => !subsByUser[id]);
    if (!miss.length) return;
    const { data } = await sb.from('push_subs').select('*').in('user_id', miss);
    miss.forEach((id) => { subsByUser[id] = []; });
    (data || []).forEach((s) => { (subsByUser[s.user_id] ||= []).push(s); });
  };

  const deliver = async (userId, payload) => {
    const subs = subsByUser[userId] || [];
    for (const s of subs) {
      const r = await sendPush(s, payload);
      if (r.status === 404 || r.status === 410) {
        await sb.from('push_subs').delete().eq('id', s.id);
      }
    }
    return subs.length;
  };

  let sentNotif = 0, sentReminder = 0;

  // ---- 1. notificações novas ----
  try {
    const { data: notifs } = await sb.from('notifications')
      .select('id, recipient_id, actor_id, type, journey_id')
      .eq('pushed', false)
      .order('created_at', { ascending: false })
      .limit(200);
    const list = notifs || [];
    if (list.length) {
      const recipients = [...new Set(list.map((n) => n.recipient_id))];
      const actors = [...new Set(list.map((n) => n.actor_id).filter(Boolean))];
      const [{ data: prefs }, { data: actorProfiles }] = await Promise.all([
        sb.from('profiles').select('id, push_on, notif_paused').in('id', recipients),
        actors.length ? sb.from('profiles').select('id, name').in('id', actors) : Promise.resolve({ data: [] }),
      ]);
      const prefBy = {}; (prefs || []).forEach((p) => { prefBy[p.id] = p; });
      const nameBy = {}; (actorProfiles || []).forEach((p) => { nameBy[p.id] = (p.name || '').split(' ')[0]; });
      await loadSubs(recipients);

      // uma notificação por pessoa por rodada: nunca metralhar
      const seen = new Set();
      for (const n of list) {
        const pref = prefBy[n.recipient_id] || {};
        const allowed = pref.push_on !== false && !pref.notif_paused;
        if (allowed && !seen.has(n.recipient_id)) {
          const make = TXT[n.type] || TXT.encourage;
          const t = make(nameBy[n.actor_id] || 'Alguém');
          const n2 = await deliver(n.recipient_id, { ...t, url: '/notifications', tag: 'oud-' + n.type });
          if (n2) { sentNotif++; seen.add(n.recipient_id); }
        }
        await sb.from('notifications').update({ pushed: true }).eq('id', n.id);
      }
    }
  } catch (e) {}

  // ---- 2. lembrete diário do Upi ----
  try {
    const nowBrt = new Date(Date.now() - 3 * 3600 * 1000);
    const hour = nowBrt.getUTCHours();
    const dayKey = nowBrt.toISOString().slice(0, 10);

    const { data: due } = await sb.from('profiles')
      .select('id, name, reminder_hour, last_reminder_key, push_on, notif_paused')
      .eq('reminder_hour', hour)
      .neq('push_on', false)
      .limit(500);
    const people = (due || []).filter((p) => p.last_reminder_key !== dayKey && !p.notif_paused);
    if (people.length) {
      const ids = people.map((p) => p.id);
      await loadSubs(ids);

      // quem já registrou hoje não recebe lembrete
      const { data: mine } = await sb.from('journeys').select('id, owner_id').in('owner_id', ids);
      const jIds = (mine || []).map((j) => j.id);
      const postedToday = new Set();
      if (jIds.length) {
        const since = new Date(Date.now() - 20 * 3600 * 1000).toISOString();
        const { data: ups } = await sb.from('updates').select('journey_id, created_at').in('journey_id', jIds).gte('created_at', since);
        const ownerOf = {}; (mine || []).forEach((j) => { ownerOf[j.id] = j.owner_id; });
        (ups || []).forEach((u) => postedToday.add(ownerOf[u.journey_id]));
      }

      const LINES = [
        { title: 'Upi', body: 'Seu próximo capítulo está esperando.' },
        { title: 'Upi', body: 'E aí, como foi o dia de hoje?' },
        { title: 'Upi', body: 'Passei pra ver se você quer registrar hoje.' },
        { title: 'Upi', body: 'Um dia de cada vez. Hoje é um deles.' },
      ];
      for (const p of people) {
        if (postedToday.has(p.id)) { continue; }
        let h = 0; const seed = dayKey + p.id;
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        const line = LINES[h % LINES.length];
        const n = await deliver(p.id, { ...line, url: '/home', tag: 'oud-upi' });
        if (n) sentReminder++;
        await sb.from('profiles').update({ last_reminder_key: dayKey }).eq('id', p.id);
      }
    }
  } catch (e) {}

  // ---------- Espelho semanal: "algo em você está mudando" ----------
  // Chega uma vez por semana, no mesmo horário do lembrete.
  let sentEspelho = 0;
  try {
    const { analisar } = await import('../../../../lib/espelho');
    const horaBRT = new Date(Date.now() - 3 * 3600 * 1000).getUTCHours();
    const TXT_ESPELHO = 'Reparei numa coisa em você. Quer ver?';
    const { data: pessoas } = await sb.from('profiles')
      .select('id, reminder_hour, push_on, notif_paused, espelho_push_em')
      .eq('reminder_hour', horaBRT).neq('push_on', false).limit(200);

    await loadSubs((pessoas || []).map((p) => p.id));
    for (const p of (pessoas || [])) {
      if (p.notif_paused) continue;
      if (p.espelho_push_em && (Date.now() - new Date(p.espelho_push_em).getTime()) < 7 * 86400000) continue;

      const { data: js } = await sb.from('journeys').select('id').eq('owner_id', p.id)
        .order('created_at', { ascending: false }).limit(1);
      const j = (js || [])[0];
      if (!j) continue;

      const { data: ups } = await sb.from('updates')
        .select('id, day_number, kind, text, created_at').eq('journey_id', j.id)
        .order('day_number', { ascending: true }).limit(200);
      const dias = ups || [];
      if (dias.length < 8) continue;
      if (dias[dias.length - 1]?.kind === 'setback') continue;   // nunca depois de um dia ruim

      const esp = analisar(dias, 'pt');
      if (!esp) continue;

      const subs = subsByUser[p.id] || [];
      let ok = false;
      for (const sub of subs) {
        const r = await sendPush(sub, {
          title: 'Upi', body: TXT_ESPELHO, url: '/perfil', tag: 'oud-espelho',
        });
        if (r.ok) ok = true;
        if (r.status === 404 || r.status === 410) await sb.from('push_subs').delete().eq('id', sub.id);
      }
      if (ok) {
        sentEspelho++;
        await sb.from('profiles').update({ espelho_push_em: new Date().toISOString() }).eq('id', p.id);
      }
    }
  } catch {}

  return NextResponse.json({ ok: true, sentNotif, sentReminder, sentEspelho });
}

// GET  -> usado pelo cron da Vercel
// POST -> usado pelo gatilho do banco (pg_net) e por serviços de cron externos
export const GET = handler;
export const POST = handler;
