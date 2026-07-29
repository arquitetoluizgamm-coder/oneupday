// ============================================================
// MENÇÕES (@)
//
// O texto guarda o "@handle" para a pessoa poder ler e editar o que
// escreveu. Mas quem manda é a tabela `mentions`, que guarda o `id`.
//
// A diferença aparece quando alguém troca o handle — e trocar é
// permitido, em Editar perfil. Se o vínculo fosse o texto:
//
//   · a menção antiga apontaria para um handle que não existe mais;
//   · e se outra pessoa registrasse o handle abandonado, ela herdaria
//     todas as menções antigas.
//
// Por isso a leitura tem duas etapas: pega os ids ligados àquele
// registro e mostra o handle ATUAL de cada um. O que está escrito no
// texto é só o rascunho de onde a marcação fica.
// ============================================================

// Handles do app: letras, números, ponto, hífen e sublinhado.
// Não aceita ponto no fim, senão "falei com @ana." engoliria o ponto
// final da frase como parte do nome.
const RE_MENCAO = /(^|[^\w@/])@([a-z0-9][a-z0-9._-]{0,19}?)(?=[^\w.-]|\.(?!\w)|$)/gi;

// Limite por registro. Sem teto, um texto com cem @ vira cem
// notificações e cem consultas — e a única razão para escrever cem
// menções é abusar.
export const MAX_MENCOES = 10;

/**
 * Lê os handles escritos num texto, sem repetir e em minúsculas.
 * Devolve [] para qualquer entrada que não seja texto.
 */
export function handlesNoTexto(texto) {
  const s = String(texto == null ? '' : texto);
  const achados = [];
  let m;
  RE_MENCAO.lastIndex = 0;
  while ((m = RE_MENCAO.exec(s)) !== null) {
    const h = m[2].toLowerCase().replace(/[.\-_]+$/, '');
    if (h && !achados.includes(h)) achados.push(h);
    if (achados.length >= MAX_MENCOES) break;
  }
  return achados;
}

/**
 * Tira o @ do começo. Existe porque a coluna `profiles.handle` guarda
 * o handle COM arroba — `EditProfileInfo` salva `'@' + cleanHandle` —
 * mas nem toda linha antiga seguiu essa regra: a rota /[slug] já
 * procura nas duas formas para dar conta disso.
 *
 * Aqui a chave interna é sempre SEM arroba, e a busca no banco tenta
 * as duas. Consultar só uma forma acharia metade das pessoas.
 */
export function semArroba(h) {
  return String(h == null ? '' : h).trim().toLowerCase().replace(/^@+/, '');
}

/**
 * Handles -> perfis reais. Só devolve quem existe.
 * `sb` é um cliente Supabase já criado por quem chama.
 */
export async function perfisDosHandles(sb, handles) {
  const lista = [...new Set((handles || []).map(semArroba).filter(Boolean))]
    .slice(0, MAX_MENCOES);
  if (!lista.length) return [];
  // as duas formas, porque a coluna tem as duas
  const variantes = lista.flatMap((h) => [h, '@' + h]);
  try {
    const { data, error } = await sb.from('profiles')
      .select('id, name, handle, avatar_url, avatar_color')
      .in('handle', variantes);
    // O Supabase não lança quando a consulta falha: devolve
    // { data: null, error }. Sem esta linha, o `|| []` transformaria
    // um erro em "ninguém foi mencionado", silenciosamente.
    if (error) return [];
    return data || [];
  } catch { return []; }
}

/**
 * Grava as menções de um registro. Idempotente: apaga as que o autor
 * tinha posto ali e regrava, para que editar o texto tirando um @
 * também tire a marcação.
 *
 * `alvo` é { update_id } ou { comment_id } ou { journey_id }.
 */
export async function salvarMencoes(sb, { texto, autorId, alvo }) {
  const chave = Object.keys(alvo || {})[0];
  const valor = alvo ? alvo[chave] : null;
  if (!chave || !valor || !autorId) return [];

  const handles = handlesNoTexto(texto);
  const perfis = await perfisDosHandles(sb, handles);
  // marcar a si mesmo não é menção; é só o seu nome no seu texto
  const destinos = perfis.filter((p) => p.id !== autorId);

  try {
    await sb.from('mentions').delete().eq(chave, valor).eq('author_id', autorId);
    if (destinos.length) {
      await sb.from('mentions').insert(
        destinos.map((p) => ({ profile_id: p.id, author_id: autorId, [chave]: valor })),
      );
    }
  } catch { /* a menção é um extra: se falhar, o registro continua salvo */ }
  return destinos;
}

/**
 * Quebra o texto em pedaços para renderizar em JSX.
 *
 * Devolve uma lista de { tipo: 'texto' | 'mencao', valor, perfil }.
 * NUNCA devolve HTML: quem chama monta os elementos. É o que impede
 * que um texto escrito por qualquer pessoa injete marcação na página.
 *
 * `porHandle` é um mapa { handle: perfil } com os handles ATUAIS,
 * montado a partir dos ids da tabela. Um @ que não estiver no mapa
 * fica como texto comum — não vira link para lugar nenhum.
 */
export function pedacosDoTexto(texto, porHandle = {}) {
  const s = String(texto == null ? '' : texto);
  const out = [];
  let i = 0, m;
  RE_MENCAO.lastIndex = 0;
  while ((m = RE_MENCAO.exec(s)) !== null) {
    const bruto = m[2];
    const limpo = bruto.toLowerCase().replace(/[.\-_]+$/, '');
    const perfil = porHandle[limpo];
    const inicioArroba = m.index + m[1].length;
    if (!perfil) continue;                       // @ sem dono = texto comum
    if (inicioArroba > i) out.push({ tipo: 'texto', valor: s.slice(i, inicioArroba) });
    // sempre com UMA arroba, venha o handle do banco com ela ou sem
    out.push({ tipo: 'mencao', valor: '@' + semArroba(perfil.handle || limpo), perfil });
    i = inicioArroba + 1 + bruto.length;
    // se o handle vinha com pontuação colada, ela volta a ser texto
    const sobra = bruto.length - limpo.length;
    if (sobra > 0) i -= sobra;
  }
  if (i < s.length) out.push({ tipo: 'texto', valor: s.slice(i) });
  return out;
}

/**
 * Mapa { handle: perfil } a partir das linhas da tabela `mentions`
 * já com o perfil embutido pelo select.
 */
export function mapaPorHandle(linhas) {
  const mapa = {};
  for (const l of linhas || []) {
    const p = l.profile || l;
    if (p && p.handle) mapa[semArroba(p.handle)] = p;   // chave sempre sem arroba
  }
  return mapa;
}
