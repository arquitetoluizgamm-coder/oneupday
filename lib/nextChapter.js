// Próximo Capítulo — cálculo do estado (server).
// Usado na home (dispensável) e no perfil (casa fixa).
export async function computeNextChapter(supabase, userId, primary, t) {
  const out = { mode: null, line: null, lead: '', identity: '', env: null, sealedEnv: false };
  if (!primary) return out;
  try {
    const { data: ups } = await supabase.from('updates').select('day_number, kind, created_at').eq('journey_id', primary.id).order('created_at', { ascending: false }).limit(120);
    const rows = ups || [];
    if (!rows.length) return out;
    const last = rows[0];
    const now = Date.now();
    const lastAt = new Date(last.created_at).getTime();
    const dayKey = (ms) => new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10); // dia local (BRT)
    const postedToday = dayKey(now) === dayKey(lastAt);
    const gapDays = Math.floor((now - lastAt) / 86400000);
    out.mode = postedToday ? 'sealed' : (gapDays >= 2 ? 'return' : 'reveal');
    const days = [...new Set(rows.map((u) => u.day_number || 0).filter(Boolean))].sort((a, b) => a - b);
    const gold = [];
    for (let i = 1; i < days.length; i++) { if (days[i] - days[i - 1] >= 3) gold.push(days[i]); }
    out.line = { total: primary.total_days || (days[days.length - 1] || 1), days, gold };
    out.lead = last.kind === 'setback' ? t.ncLeadSetback : t.ncLead;
    out.identity = [t.ncId1, t.ncId2, t.ncId3][days.length % 3];
    try {
      const { data: env } = await supabase.from('envelopes').select('id, text, created_at, opened_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (env) {
        const isToday = dayKey(new Date(env.created_at).getTime()) === dayKey(now);
        if (out.mode === 'sealed' && isToday) out.sealedEnv = true;
        else if ((out.mode === 'reveal' || out.mode === 'return') && !env.opened_at && !isToday) out.env = { id: env.id, text: env.text };
      }
    } catch {}
  } catch {}
  return out;
}

export function ncLabels(t, nc) {
  return {
    title: t.ncTitle, sealed: nc.sealedEnv ? t.ncSealedEnv : t.ncSealed, blur: t.ncBlur, open: t.ncOpen,
    envLead: t.envLead, envLeadReturn: t.envLeadReturn,
    ready: t.ncReady, returnTitle: t.ncReturnTitle,
    lead: nc.lead, returnLead: t.ncReturnLead,
    stepLabel: t.ncStepLabel, step: t.ncStep, identity: nc.identity,
    lineLabel: t.ncLineLabel, cta: t.ncCta, close: t.ncClose,
  };
}
