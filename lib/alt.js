// ============================================================
// TEXTO ALTERNATIVO — o que o leitor de tela diz no lugar da foto
//
// Conferido no ar antes de escrever isto: 6 de 6 fotos do feed
// estavam com alt="". Para quem usa leitor de tela, o feed era
// uma sequência de "imagem, imagem, imagem".
//
// ATENÇÃO a uma distinção que parece detalhe e não é: o alt=""
// dos AVATARES está CERTO e não deve ser mexido. Ali o nome da
// pessoa está escrito ao lado, em texto; descrever o avatar
// faria o leitor de tela dizer o nome duas vezes. Alt vazio em
// imagem decorativa é a forma correta de escondê-la.
//
// O problema é só nas fotos que são CONTEÚDO — a foto do dia,
// que é a publicação em si. Essa nunca pode ser silenciosa.
//
// A reserva abaixo não é um "alt genérico" de enfeite: ela diz
// dois fatos verdadeiros e úteis (que dia, de qual jornada), o
// que já orienta quem não vê a imagem. É pior que uma boa
// descrição e muito melhor que o silêncio.
// ============================================================
export function textoAlternativo(alt, ctx = {}, t = {}) {
  const escrito = String(alt == null ? '' : alt).trim();
  if (escrito) return escrito;
  const molde = t.altReserva || 'Foto do dia {d} da jornada {j}.';
  return molde
    .replace('{d}', ctx.dia == null ? '?' : ctx.dia)
    .replace('{j}', (ctx.titulo || '').trim());
}

/** Limite de caracteres do campo. Descrição longa demais cansa
 *  quem ouve — o leitor de tela lê tudo, sem pular. */
export const ALT_MAX = 180;
