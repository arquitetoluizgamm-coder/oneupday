// ============================================================
// CAPACIDADES EM CONSTRUÇÃO
//
// Nem toda jornada tem número. Mas toda jornada constrói
// capacidade. Aqui a evolução deixa de ser "fez ou não fez"
// e passa a ser "o que você está aprendendo a fazer".
//
// Mesmo princípio do Espelho: o app mostra EVIDÊNCIA com data,
// nunca veredito sobre a pessoa. Ela tira a conclusão.
// Sem IA — só comparação de comportamento ao longo do tempo.
// ============================================================

const DIA = 86400000;
const chave = (ms) => new Date(ms - 3 * 3600 * 1000).toISOString().slice(0, 10); // dia local BRT

// pausas reais: intervalos de 2+ dias entre um registro e o seguinte
function pausas(datas) {
  const out = [];
  for (let i = 1; i < datas.length; i++) {
    const dias = Math.round((datas[i] - datas[i - 1]) / DIA);
    if (dias >= 2) out.push({ em: datas[i - 1], voltouEm: datas[i], fora: dias });
  }
  return out;
}

// ------------------------------------------------------------
// 1. CAPACIDADE DE VOLTAR
// A capacidade que dá nome ao produto. Compara quanto tempo a
// pessoa levava para voltar antes e quanto leva agora.
// ------------------------------------------------------------
function voltar(datas) {
  const ps = pausas(datas);
  if (ps.length < 3) return null;

  const meio = Math.floor(ps.length / 2);
  const antes = ps.slice(0, meio);
  const recentes = ps.slice(meio);
  const media = (arr) => arr.reduce((s, p) => s + p.fora, 0) / arr.length;

  const mAntes = media(antes);
  const mDepois = media(recentes);
  // precisa ser melhora clara, não ruído
  if (!(mAntes >= 3 && mDepois <= mAntes * 0.65)) return null;

  return {
    id: 'voltar',
    antesDias: Math.round(mAntes),
    agoraDias: Math.max(1, Math.round(mDepois)),
    quantas: recentes.length,
    maiorPausa: Math.max(...antes.map((p) => p.fora)),
  };
}

// ------------------------------------------------------------
// 2. CAPACIDADE DE COMEÇAR MESMO SEM VONTADE
// Dias marcados como recaída/dia difícil que MESMO ASSIM foram
// registrados, e o dia seguinte veio logo. Continuar apesar de.
// ------------------------------------------------------------
function continuarNoDificil(updates) {
  const ord = [...updates].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let seguidos = 0, total = 0;
  for (let i = 0; i < ord.length - 1; i++) {
    if (ord[i].kind !== 'setback') continue;
    total++;
    const dias = Math.round((new Date(ord[i + 1].created_at) - new Date(ord[i].created_at)) / DIA);
    if (dias <= 1) seguidos++;
  }
  if (total < 3 || seguidos < 2) return null;
  if (seguidos / total < 0.6) return null;
  return { id: 'dificil', seguidos, total };
}

// ------------------------------------------------------------
// 3. CAPACIDADE DE MANTER A PRESENÇA
// Para quem nunca parou: constância crescente também é capacidade.
// ------------------------------------------------------------
function presenca(datas) {
  if (datas.length < 14) return null;
  if (pausas(datas).length > 0) return null;      // essa é só para quem não parou
  const dias = Math.round((datas[datas.length - 1] - datas[0]) / DIA) + 1;
  if (dias < 14) return null;
  return { id: 'presenca', dias: datas.length, corridos: dias };
}

// ------------------------------------------------------------
// analisarCapacidades(updates) -> [{ id, ... }]
// updates: [{ day_number, kind, created_at }]
// ------------------------------------------------------------
export function analisarCapacidades(updates) {
  const ups = (updates || []).filter((u) => u.created_at);
  if (ups.length < 8) return [];

  // um registro por dia, em ordem
  const vistos = new Set();
  const datas = [];
  for (const u of [...ups].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))) {
    const k = chave(new Date(u.created_at).getTime());
    if (vistos.has(k)) continue;
    vistos.add(k);
    datas.push(new Date(u.created_at).getTime());
  }
  if (datas.length < 8) return [];

  const achados = [voltar(datas), continuarNoDificil(ups), presenca(datas)]
    .filter(Boolean);

  // no máximo duas por vez: capacidade demais vira painel
  return achados.slice(0, 2);
}
