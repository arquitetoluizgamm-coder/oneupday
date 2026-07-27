// ============================================================
// O QUE A PESSOA ESCREVEU — E O QUE O APP ESCREVEU POR ELA
//
// Havia três frases prontas no aplicativo. Os botões Fiz /
// Tentei / Parei gravavam uma delas como se fosse texto da
// pessoa, e o feed publicava assim:
//
//   "Fiz o que eu tinha pra fazer hoje."
//
// Cinco pessoas usando o botão produziam a mesma frase cinco
// vezes, em cinco jornadas diferentes, com cinco rostos
// diferentes. O feed ficava genérico — e a culpa não era de
// quem escreveu pouco: era do app, que escreveu no lugar dela.
//
// A partir do patch 78 o botão não grava mais texto nenhum. O
// dia continua contando: o que ele registra é o `kind`. No
// feed isso vira um SELO, que se lê como marca e não como voz.
//
// Esta lista continua existindo por causa do que já foi
// publicado antes da correção. Enquanto essas linhas estiverem
// no banco, elas precisam ser reconhecidas como texto do app.
// ============================================================

// Os dois emojis já eram tratados como marcador de "só mídia"
// em quatro arquivos, cada um com sua cópia da regra. Agora a
// regra mora aqui.
const DO_APP = new Set([
  '📷',
  '🎥',
  // pt-BR
  'Fiz o que eu tinha pra fazer hoje.',
  'Tentei hoje. E isso conta.',
  'Dia difícil. Precisei parar, mas vou voltar.',
  // en
  'I did what I set out to do today.',
  'I tried today. It counts.',
  'Hard day. I had to pause, but I’m coming back.',
  // O padrão do wizard: quando a pessoa pulava o primeiro registro,
  // o app escrevia isto por ela. Mesma doença, segundo lugar.
  'Comecei.',
  'It begins.',
]);

/** O texto que a pessoa realmente escreveu — '' se foi o app. */
export function textoDaPessoa(tx) {
  const s = String(tx == null ? '' : tx).trim();
  return DO_APP.has(s) ? '' : s;
}

/** true quando não há relato humano naquele registro. */
export function semRelato(tx) {
  return textoDaPessoa(tx) === '';
}

/** Qual selo mostrar. Devolve a chave, não o rótulo — quem
 *  traduz é o i18n de quem está exibindo.
 *
 *  O dia 1 tem selo próprio, e isso não é enfeite: "Tentei" é
 *  falso ali. A pessoa não tentou — ela começou, que é o único
 *  fato que o dia 1 carrega. */
export function seloDe(kind, dia) {
  // Só o dia 1 criado pelo wizard, que grava kind 'step'. Se a pessoa
  // apertou Fiz ou Parei no primeiro dia, ela disse algo mais preciso
  // que "comecei" — e o selo tem que respeitar isso.
  if (Number(dia) === 1 && (!kind || kind === 'step')) return 'comecei';
  if (kind === 'win') return 'fiz';
  if (kind === 'setback') return 'parei';
  return 'tentei';
}
