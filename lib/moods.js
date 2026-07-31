export const MOODS = {
  down:      '#5b8def',
  anxious:   '#8b7bd8',
  angry:     '#c8734a',
  tired:     '#7d8794',
  motivated: '#3fae7a',
  happy:     '#e8b43a',
  grateful:  '#e0669a',
};
// ============================================================
// A MESMA COR, DUAS FUNÇÕES DIFERENTES
//
// `MOODS` acima pinta o HALO em volta do avatar. Halo é
// decoração: ninguém precisa LER um halo, e a WCAG não cobra
// contraste de enfeite. Ali a cor pode ser clara e viva.
//
// Só que a mesma cor estava pintando também a PALAVRA do humor,
// e aí ela precisa ser lida. Medido no app, sobre branco:
//
//   feliz ....... 1,91:1     ansioso .... 3,55:1
//   grateful .... 3,21:1     down ....... 3,23:1
//   angry ....... 3,50:1     tired ...... 3,64:1
//   motivated ... 2,78:1
//
// O mínimo para texto normal é 4,5:1. Os SETE reprovavam — o
// meu laudo só tinha visto dois porque só dois estavam no feed
// naquele momento.
//
// Estes tons abaixo são os mesmos matizes, com a luminosidade
// baixada em HLS até cruzar 4,6:1. Matiz e saturação intactos:
// o azul continua azul, o rosa continua rosa.
//
// A exceção honesta é `happy`. Amarelo claro sobre branco não
// tem como ser legível — para chegar a 4,6 ele vira um ocre
// (#966e12). É a única cor que muda de aparência, e muda porque
// não havia escolha entre "amarelo" e "legível".
//
// O halo continua usando MOODS. Só o texto usa MOODS_TEXTO.
// ============================================================
export const MOODS_TEXTO = {
  down:      '#2f6eeb',   // 4,61
  anxious:   '#7663d1',   // 4,69
  angry:     '#b15e36',   // 4,64
  tired:     '#6c7684',   // 4,60
  motivated: '#2f835c',   // 4,64
  happy:     '#966e12',   // 4,63
  grateful:  '#d53177',   // 4,63
};

export const MOOD_ORDER = ['down', 'anxious', 'angry', 'tired', 'motivated', 'happy', 'grateful'];
export function moodGlow(hex) {
  if (!hex) return undefined;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `0 0 0 2px #fff, 0 0 0 5px rgba(${r},${g},${b},.48), 0 0 18px 3px rgba(${r},${g},${b},.34)`;
}
