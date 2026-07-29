import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { sendPush, pushReady } from '../../../../lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Impressão digital: 12 caracteres de md5. Serve para comparar dois
// valores sem mostrar nenhum dos dois. md5 porque do lado do Postgres
// md5() é nativa e o sha256 precisaria do pgcrypto.
const marca = (v) => (v ? crypto.createHash('md5').update(v).digest('hex').slice(0, 12) : '(vazio)');

function compactPushText(value, max = 86) {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

const UPI_PUSH_TEXT = {
  pt: {
    nextTitle: 'Upi lembrou do seu passo',
    nextBody: (s) => `Você deixou isto esperando: ${s}`,
    capsuleTitle: 'Upi guardou uma parte sua',
    capsuleBody: 'Sua cápsula continua aqui. Hoje pode ser um bom dia para dar mais um passo.',
    originTitle: 'Upi lembrou do seu começo',
    originBody: (s) => `Você começou por isso: ${s}`,
    dailyTitle: 'Upi lembrou de ontem',
    dailyBody: (s) => `Você apareceu aqui: ${s}`,
    genericTitle: 'Upi lembrou de você',
    envelopeBody: 'O passo que você deixou para hoje está esperando.',
    lines: [
      'Seu próximo capítulo está esperando.',
      'E aí, como foi o dia de hoje?',
      'Passei pra ver se você quer registrar hoje.',
      'Um dia de cada vez. Hoje é um deles.',
    ],
  },
  en: {
    nextTitle: 'Upi remembered your next step',
    nextBody: (s) => `You left this waiting: ${s}`,
    capsuleTitle: 'Upi saved a piece of you',
    capsuleBody: 'Your capsule is still here. Today may be a good day for one more step.',
    originTitle: 'Upi remembered your beginning',
    originBody: (s) => `You started because of this: ${s}`,
    dailyTitle: 'Upi remembered yesterday',
    dailyBody: (s) => `You showed up here: ${s}`,
    genericTitle: 'Upi remembered you',
    envelopeBody: 'The step you left for today is waiting.',
    lines: [
      'Your next chapter is waiting.',
      'How did today go?',
      'I came by to see if you want to register today.',
      'One day at a time. Today is one of them.',
    ],
  },
  es: {
    nextTitle: 'Upi recordó tu próximo paso',
    nextBody: (s) => `Dejaste esto esperando: ${s}`,
    capsuleTitle: 'Upi guardó una parte de ti',
    capsuleBody: 'Tu cápsula sigue aquí. Hoy puede ser un buen día para dar otro paso.',
    originTitle: 'Upi recordó tu comienzo',
    originBody: (s) => `Empezaste por esto: ${s}`,
    dailyTitle: 'Upi recordó ayer',
    dailyBody: (s) => `Apareciste aquí: ${s}`,
    genericTitle: 'Upi se acordó de ti',
    envelopeBody: 'El paso que dejaste para hoy está esperando.',
    lines: [
      'Tu próximo capítulo está esperando.',
      '¿Cómo fue tu día?',
      'Pasé para ver si quieres registrar hoy.',
      'Un día a la vez. Hoy es uno de ellos.',
    ],
  },
};

function pushLang(locale) {
  return UPI_PUSH_TEXT[locale] ? locale : 'pt';
}

function upiReminderFromMemory(mem, locale = 'pt') {
  const L = UPI_PUSH_TEXT[pushLang(locale)];
  const resumo = compactPushText(mem?.summary || mem?.body || '', 72);
  if (!resumo) return null;
  if (mem.kind === 'next_step') return { title: L.nextTitle, body: L.nextBody(resumo) };
  if (mem.source_type === 'future_capsule') return { title: L.capsuleTitle, body: L.capsuleBody };
  if (mem.source_type === 'journey_origin') return { title: L.originTitle, body: L.originBody(resumo) };
  if (mem.source_type === 'daily_update') return { title: L.dailyTitle, body: L.dailyBody(resumo) };
  return { title: L.genericTitle, body: resumo };
}

// ============================================================
// COMO ESTA ROTA SE PROTEGE
//
// Duas portas, e elas existem por motivos diferentes.
//
// 1) SENHA (CRON_SECRET) — usada pelo cron diário da Vercel.
//    Aqui não há risco de dessincronizar: a Vercel manda no
//    cabeçalho o valor da MESMA variável que este código lê.
//    Por construção, os dois são sempre iguais.
//
// 2) BILHETE (push_tickets) — usada pelo gatilho do banco.
//    Esta é a novidade, e ela existe porque o esquema anterior
//    era frágil por desenho: a chave ficava escrita à mão em
//    DOIS lugares (variável da Vercel e função SQL). Bastava um
//    redeploy esquecido para os dois valores divergirem — e o
//    push morria em silêncio, com 403, sem nada apontar qual dos
//    lados estava velho.
//
//    Agora o banco não guarda senha nenhuma. Ele cria um bilhete
//    de uso único na tabela push_tickets e manda o número. Esta
//    rota, que já fala com o banco com a chave de serviço,
//    pergunta se o bilhete existe, apaga e segue. Não há segredo
//    compartilhado: não há o que sair de sincronia, e nenhum
//    redeploy é necessário quando algo muda.
//
//    O bilhete vale 2 minutos e só serve uma vez.
// ============================================================
async function handler(req) {
  const sb = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const auth = req.headers.get('authorization') || '';
  let bodyKey = '';
  let bilhete = '';
  if (req.method === 'POST') {
    try {
      const b = (await req.json().catch(() => ({}))) || {};
      bodyKey = b.key || '';
      bilhete = b.ticket || b.bilhete || '';
    } catch { }
  }

  const secret = process.env.CRON_SECRET;
  let ok = !secret;   // sem senha configurada, a porta 1 não existe

  if (secret) {
    // A porta pela URL (?key=) saiu: segredo em query string vaza para
    // log de acesso e painel de monitoramento. Ninguém a usava — o cron
    // da Vercel manda cabeçalho, e o gatilho do banco manda bilhete.
    ok = auth === `Bearer ${secret}`
      || bodyKey === secret;
  }

  // porta 2: bilhete de uso único emitido pelo próprio banco
  let bilheteInfo = 'nao veio bilhete';
  if (!ok && bilhete) {
    const { data, error } = await sb
      .from('push_tickets')
      .select('token, criado')
      .eq('token', bilhete)
      .maybeSingle();

    if (error) {
      bilheteInfo = /does not exist|schema cache/i.test(error.message || '')
        ? 'a tabela push_tickets nao existe — rode supabase/push-bilhete.sql'
        : `erro ao ler o bilhete: ${error.message}`;
    } else if (!data) {
      bilheteInfo = 'bilhete nao encontrado (ja usado ou invalido)';
    } else if (Date.now() - new Date(data.criado).getTime() > 120000) {
      bilheteInfo = 'bilhete expirado (vale 2 minutos)';
      await sb.from('push_tickets').delete().eq('token', bilhete);
    } else {
      await sb.from('push_tickets').delete().eq('token', bilhete);
      ok = true;
      bilheteInfo = 'ok';
    }
  }

  if (!ok) {
    // Só a impressão digital sai daqui, nunca o valor. E a URL não
    // entra mais nem no diagnóstico: se ninguém autentica por ela,
    // ninguém precisa ecoá-la de volta.
    const recebida = bodyKey || auth.replace(/^Bearer /, '');
    return NextResponse.json({
      error: 'forbidden',
      bilhete: bilheteInfo,
      marca_esperada_pelo_servidor: marca(secret),
      marca_recebida: marca(recebida),
      deploy: process.env.VERCEL_GIT_COMMIT_SHA
        ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
        : 'desconhecido',
      dica: 'Se o campo bilhete disser que a tabela nao existe, rode supabase/push-bilhete.sql. Se disser "nao veio bilhete", o gatilho do banco ainda e o antigo — rode o mesmo arquivo.',
    }, { status: 403 });
  }

  if (!pushReady()) return NextResponse.json({ error: 'no-vapid' }, { status: 500 });

  // faxina: bilhetes velhos não servem para nada
  try {
    await sb.from('push_tickets').delete()
      .lt('criado', new Date(Date.now() - 3600000).toISOString());
  } catch { }

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

  const localeForUser = (userId) => {
    const sub = (subsByUser[userId] || []).find((s) => ['pt', 'en', 'es'].includes(s.locale));
    return pushLang(sub?.locale || 'pt');
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

      // Uma notificação por pessoa por rodada: nunca metralhar.
      //
      // O que mudou aqui: antes, TODAS as notificações da lista eram
      // marcadas como enviadas — inclusive as que esta rodada pulou por
      // causa do limite de uma por pessoa. Elas nunca mais eram tentadas.
      // Na prática: três pessoas apoiam ao mesmo tempo, chega uma, as
      // outras duas somem para sempre.
      //
      // Agora só é marcada a que realmente saiu. As puladas ficam para a
      // rodada seguinte — e o gatilho do banco dispara a cada notificação
      // nova, então a próxima rodada vem em segundos.
      //
      // As bloqueadas por preferência (push desligado, notificações em
      // pausa) são marcadas sim: para essas não há próxima tentativa,
      // e deixá-las pendentes encheria a fila para sempre.
      const seen = new Set();
      for (const n of list) {
        const pref = prefBy[n.recipient_id] || {};
        const allowed = pref.push_on !== false && !pref.notif_paused;

        if (!allowed) {
          await sb.from('notifications').update({ pushed: true }).eq('id', n.id);
          continue;
        }
        if (seen.has(n.recipient_id)) continue;   // fica para a próxima rodada

        const make = TXT[n.type] || TXT.encourage;
        const t = make(nameBy[n.actor_id] || 'Alguém');
        const entregues = await deliver(n.recipient_id, { ...t, url: '/notifications', tag: 'oud-' + n.type });

        if (entregues) {
          sentNotif++;
          seen.add(n.recipient_id);
          await sb.from('notifications').update({ pushed: true }).eq('id', n.id);
        } else {
          // sem aparelho inscrito: não há o que tentar de novo
          await sb.from('notifications').update({ pushed: true }).eq('id', n.id);
        }
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

      const envByUser = {};
      try {
        const { data: envs } = await sb.from('envelopes')
          .select('id, user_id, journey_id, created_at, opened_at')
          .in('user_id', ids)
          .is('opened_at', null)
          .order('created_at', { ascending: false })
          .limit(500);
        const jEnvIds = [...new Set((envs || []).map((e) => e.journey_id).filter(Boolean))];
        const slugByJourney = {};
        if (jEnvIds.length) {
          const { data: js } = await sb.from('journeys').select('id, slug').in('id', jEnvIds);
          (js || []).forEach((j) => { slugByJourney[j.id] = j.slug; });
        }
        for (const e of (envs || [])) {
          if (envByUser[e.user_id]) continue;
          if (new Date(e.created_at).toISOString().slice(0, 10) === dayKey) continue;
          envByUser[e.user_id] = { ...e, slug: slugByJourney[e.journey_id] || null };
        }
      } catch {}

      const memByUser = {};
      try {
        const { data: mems } = await sb.from('upi_memories')
          .select('user_id, source_type, kind, summary, body, happened_on, updated_at')
          .in('user_id', ids)
          .order('updated_at', { ascending: false })
          .limit(Math.max(50, ids.length * 5));

        const score = (m) => {
          if (m.kind === 'next_step') return 5;
          if (m.source_type === 'journey_origin') return 4;
          if (m.source_type === 'future_capsule') return 3;
          if (m.source_type === 'daily_update') return 2;
          return 1;
        };

        for (const m of (mems || [])) {
          if (!m?.user_id) continue;
          if (m.happened_on === dayKey) continue;
          const atual = memByUser[m.user_id];
          if (!atual || score(m) > score(atual)) memByUser[m.user_id] = m;
        }
      } catch {}

      for (const p of people) {
        if (postedToday.has(p.id)) { continue; }
        const locale = localeForUser(p.id);
        const copy = UPI_PUSH_TEXT[locale];
        const env = envByUser[p.id];
        if (env) {
          const n = await deliver(p.id, {
            title: 'Upi',
            body: copy.envelopeBody,
            url: env.slug ? `/perfil/jornada/${env.slug}` : '/home',
            tag: 'oud-upi-envelope',
          });
          if (n) sentReminder++;
          await sb.from('profiles').update({ last_reminder_key: dayKey }).eq('id', p.id);
          continue;
        }
        const memoryLine = upiReminderFromMemory(memByUser[p.id], locale);
        if (memoryLine) {
          const n = await deliver(p.id, { ...memoryLine, url: '/home', tag: 'oud-upi-memory' });
          if (n) sentReminder++;
          await sb.from('profiles').update({ last_reminder_key: dayKey }).eq('id', p.id);
          continue;
        }
        let h = 0; const seed = dayKey + p.id;
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        const n = await deliver(p.id, { title: 'Upi', body: copy.lines[h % copy.lines.length], url: '/home', tag: 'oud-upi' });
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

  // ---- 4. quem acompanha uma jornada SEM CONTA ----
  // Capítulo novo numa jornada pública com seguidores anônimos: avisa.
  // Esta é a ponta do ciclo de crescimento — a pessoa chegou por um
  // link, pediu para ser avisada, e volta sozinha quando a história
  // continua. Sem conta, sem e-mail, sem convite artificial.
  let sentJornada = 0;
  try {
    const { data: caps } = await sb.from('updates')
      .select('id, journey_id, day_number, text')
      .eq('avisado', false)
      .order('created_at', { ascending: true })
      .limit(40);

    for (const cap of (caps || [])) {
      const { data: segs } = await sb.from('jornada_seguidores')
        .select('id, endpoint, p256dh, auth')
        .eq('journey_id', cap.journey_id);

      if (segs && segs.length) {
        const { data: j } = await sb.from('journeys')
          .select('title, slug, visibility').eq('id', cap.journey_id).maybeSingle();

        // se a jornada deixou de ser pública, ninguém mais é avisado —
        // e os seguidores anônimos saem. Privacidade vence audiência.
        if (!j || j.visibility !== 'public') {
          await sb.from('jornada_seguidores').delete().eq('journey_id', cap.journey_id);
        } else {
          const corpo = (cap.text || '').replace(/\s+/g, ' ').trim().slice(0, 90);
          for (const s of segs) {
            const r = await sendPush(s, {
              title: `${j.title} · Dia ${cap.day_number}`,
              body: corpo || 'Um novo capítulo foi escrito.',
              url: `/${j.slug}`,
              tag: 'oud-jornada-' + j.slug,
            });
            if (r.ok) sentJornada++;
            // inscrição morta: limpa. Ninguém fica na lista para sempre.
            if (r.status === 404 || r.status === 410) {
              await sb.from('jornada_seguidores').delete().eq('id', s.id);
            }
          }
        }
      }
      await sb.from('updates').update({ avisado: true }).eq('id', cap.id);
    }
  } catch (e) { }

  return NextResponse.json({ ok: true, sentNotif, sentReminder, sentEspelho, sentJornada });
}

// GET  -> usado pelo cron da Vercel
// POST -> usado pelo gatilho do banco (pg_net) e por serviços de cron externos
export const GET = handler;
export const POST = handler;
