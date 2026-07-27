import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { getLocale } from '../../../lib/locale';
import { detectarFato, fraseBase, perguntaBase, instrucao, temaSensivel } from '../../../lib/eco';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ESPERA_MIN = 45;      // dá tempo pra comunidade reagir primeiro
const MAX_POR_RODADA = 3;

// Varredura: procura posts que ficaram sem comentário e deixa o Eco.
// Chamada de leve quando alguém abre o feed, e pelo cron como reforço.
// Não precisa de agendador próprio.
export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !svc) return NextResponse.json({ ok: true, criados: 0, motivo: 'sem-chave' });
    const db = createAdmin(url, svc, { auth: { persistSession: false } });

    const limite = new Date(Date.now() - ESPERA_MIN * 60000).toISOString();
    const janela = new Date(Date.now() - 3 * 86400000).toISOString();

    // candidatos: posts públicos, já maduros, dos últimos 3 dias
    const { data: cands } = await db.from('updates')
      .select('id, journey_id, day_number, kind, text, next_step, closed_by, created_at')
      .lte('created_at', limite).gte('created_at', janela)
      .order('created_at', { ascending: false }).limit(60);
    const lista = cands || [];
    if (!lista.length) return NextResponse.json({ ok: true, criados: 0 });

    const jIds = [...new Set(lista.map((u) => u.journey_id))];
    const { data: js } = await db.from('journeys')
      .select('id, title, owner_id, total_days, visibility, category').in('id', jIds);
    const jBy = {}; (js || []).forEach((j) => { jBy[j.id] = j; });

    // quem já tem comentário (de gente ou do Upi) está fora
    const { data: cms } = await db.from('comments')
      .select('update_id').in('update_id', lista.map((u) => u.id));
    const comComentario = new Set((cms || []).map((c) => c.update_id));

    // preferências dos donos
    const donos = [...new Set((js || []).map((j) => j.owner_id))];
    const { data: profs } = donos.length
      ? await db.from('profiles').select('id, eco_on').in('id', donos)
      : { data: [] };
    const ecoOn = {}; (profs || []).forEach((p) => { ecoOn[p.id] = p.eco_on !== false; });

    // no máximo 2 Ecos por pessoa por dia
    const hoje = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
    const { data: ecosHoje } = await db.from('comments')
      .select('update_id, created_at').eq('eco', true).gte('created_at', hoje + 'T00:00:00Z');
    const ecoUpd = new Set((ecosHoje || []).map((c) => c.update_id));
    const porDono = {};
    for (const u of lista) {
      if (ecoUpd.has(u.id)) {
        const j = jBy[u.journey_id];
        if (j) porDono[j.owner_id] = (porDono[j.owner_id] || 0) + 1;
      }
    }

    const key = process.env.OPENAI_API_KEY;
    const locale = getLocale();
    let criados = 0;

    for (const u of lista) {
      if (criados >= MAX_POR_RODADA) break;
      if (comComentario.has(u.id)) continue;               // já tem conversa

      const j = jBy[u.journey_id];
      if (!j) continue;
      if (j.visibility !== 'public') continue;             // só em post público
      if (!ecoOn[j.owner_id]) continue;                    // pessoa desligou
      if ((porDono[j.owner_id] || 0) >= 2) continue;       // limite diário

      // tema sensível: silêncio é mais respeitoso que uma frase errada
      if (temaSensivel(u.text, j.title, j.category)) continue;

      const { data: irmaos } = await db.from('updates')
        .select('id, day_number, kind, text, next_step, closed_by, created_at')
        .eq('journey_id', j.id).order('created_at', { ascending: true }).limit(80);

      const fato = detectarFato(u, irmaos || [], j);
      if (!fato) continue;

      // a frase determinística é a base; a IA só reescreve melhor
      let frase = fraseBase(fato, locale);
      if (!frase) continue;

      if (key) {
        try {
          const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: instrucao(locale) },
                { role: 'user', content: `Fato verificado: ${fato.tipo}\nDados: ${JSON.stringify(fato.dados)}\nFrase de referência (pode reescrever, mantendo o mesmo fato): "${frase}"` },
              ],
              max_tokens: 90, temperature: 0.5,
            }),
          });
          if (r.ok) {
            const jr = await r.json();
            const t = (jr.choices?.[0]?.message?.content || '').trim().replace(/^["“]|["”]$/g, '');
            // valida: tamanho, sem elogio, sem emoji, sem exclamação
            // e sem pergunta — a pergunta é nossa, não do modelo
            const ruim = /parab|congrat|orgulh|guerreir|voc[êe] consegue|continue assim|\?|[!🎉💪🔥👏✨]/i.test(t);
            if (t.length >= 20 && t.length <= 240 && !ruim) frase = t;
          }
        } catch {}
      }

      // ============================================================
      // A PERGUNTA VEM DEPOIS DA OBSERVAÇÃO
      //
      // Ela é escolhida em lib/eco.js, nunca pelo modelo, e some
      // em dois casos: nos fatos 'retorno' e 'seguiu' (a própria
      // perguntaBase devolve vazio) e sempre que o post é um dia
      // difícil — aí a pessoa não está contando o que funcionou,
      // está dizendo que hoje não deu.
      //
      // Sem pergunta, o Eco volta a ser exatamente o que era.
      // ============================================================
      const pergunta = u.kind === 'setback' ? '' : perguntaBase(fato, locale);
      const corpo = (pergunta ? `${frase} ${pergunta}` : frase).slice(0, 400);

      const { error } = await db.from('comments').insert({
        update_id: u.id, user_id: null, eco: true, eco_tipo: fato.tipo,
        body: corpo, status: 'published',
      });
      if (!error) {
        criados++;
        porDono[j.owner_id] = (porDono[j.owner_id] || 0) + 1;
        // avisa o autor — notificação de verdade, identificada como Upi
        try {
          await db.from('notifications').insert({
            recipient_id: j.owner_id, actor_id: null, type: 'eco', journey_id: j.id,
          });
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, criados });
  } catch {
    return NextResponse.json({ ok: false, criados: 0 });
  }
}

// Desligar / religar o Primeiro Eco
export async function PATCH(req) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    const { on } = await req.json().catch(() => ({}));
    await supabase.from('profiles').update({ eco_on: !!on }).eq('id', user.id);
    return NextResponse.json({ ok: true, on: !!on });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
