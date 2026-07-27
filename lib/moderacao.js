// ============================================================
// MODERAÇÃO DE TEXTO — num lugar só
//
// Esta lógica saiu de dentro da rota de comentários porque agora
// ela é usada em três momentos: quando a pessoa escreve, quando o
// app reprocessa sozinho o que ficou pendente, e na fila de revisão.
// Três cópias da mesma regra viram três regras diferentes na
// primeira vez que alguém mexer numa só.
// ============================================================

// A lista local pega ATAQUE A OUTRA PESSOA — e só isso.
//
// Ela deliberadamente NÃO bloqueia "morrer", "desistir", "não
// aguento", "fracassei", "tive uma recaída". Essas são as palavras
// de quem está escrevendo sobre o próprio dia ruim, e este app
// existe para acolher exatamente essa pessoa. Endurecer esta lista
// censuraria quem ela deveria proteger.
const BLOCKED = [
  'vai se matar', 'se mata', 'idiota', 'imbecil', 'retardado', 'lixo', 'fracassado',
  'loser', 'idiot', 'stupid', 'kill yourself', 'go die', 'you are worthless',
];

export function locallyUnsafe(text) {
  const value = String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return BLOCKED.some(word => value.includes(word));
}

// ============================================================
// A camada de IA — e o que fazer quando ela não responde
//
// Devolve três coisas diferentes, e a diferença é o ponto:
//
//   'ok'           → foi analisado, e está limpo
//   'inseguro'     → foi analisado, e foi sinalizado
//   'indisponivel' → NÃO foi analisado (erro, rede, tempo esgotado)
//
// 'indisponivel' nunca pode ser tratado como 'ok'. Era exatamente
// isso que acontecia antes: com a OpenAI fora do ar, tudo passava.
//
// Sem chave configurada é 'ok' de propósito: aí a moderação por IA
// não faz parte da instalação, e não há falha nenhuma a tratar.
// ============================================================
export async function moderarTexto(text, { timeoutMs = 6000 } = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return 'ok';
  try {
    const corte = AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined;
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
      signal: corte,
    });
    if (!response.ok) return 'indisponivel';
    const data = await response.json();
    if (!data?.results?.[0]) return 'indisponivel';
    return data.results[0].flagged ? 'inseguro' : 'ok';
  } catch { return 'indisponivel'; }
}

// ============================================================
// REPROCESSAR O QUE FICOU PENDENTE
//
// Um comentário fica pendente porque a IA não respondeu naquele
// segundo — não porque alguém decidiu algo sobre ele. Quase sempre
// é uma indisponibilidade de minutos.
//
// Então a fila não deveria depender de alguém olhar. Esta função
// pega os mais antigos e roda a moderação de novo. O que a IA
// conseguir julgar sai da fila sozinho, para publicado ou para
// bloqueado. Só sobra para revisão humana o que ela continua sem
// conseguir julgar.
//
// Precisa da chave de serviço: não existe política de UPDATE em
// comments, e é bom que não exista — ninguém deve poder mudar o
// status do próprio comentário.
// ============================================================
export async function reprocessarPendentes(sb, limite = 20) {
  const conta = { publicados: 0, bloqueados: 0, pendentes: 0 };
  if (!sb) return conta;

  const { data: fila } = await sb.from('comments')
    .select('id, body')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limite);
  if (!fila || !fila.length) return conta;

  // em paralelo: são chamadas de rede curtas e independentes
  const vereditos = await Promise.all(fila.map(async (c) => {
    if (locallyUnsafe(c.body)) return 'inseguro';
    return moderarTexto(c.body);
  }));

  const publicar = [], bloquear = [];
  fila.forEach((c, i) => {
    if (vereditos[i] === 'ok') publicar.push(c.id);
    else if (vereditos[i] === 'inseguro') bloquear.push(c.id);
    else conta.pendentes++;
  });

  if (publicar.length) {
    await sb.from('comments').update({ status: 'published' }).in('id', publicar);
    conta.publicados = publicar.length;
  }
  if (bloquear.length) {
    await sb.from('comments').update({ status: 'blocked' }).in('id', bloquear);
    conta.bloqueados = bloquear.length;
  }
  return conta;
}
