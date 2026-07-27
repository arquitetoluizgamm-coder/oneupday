import { textoDaPessoa } from './registro';
// ============================================================
// O ESPELHO
// Mostra à pessoa a mudança que ela não consegue ver em si mesma.
//
// Princípio inegociável: o app NUNCA diagnostica a pessoa.
// Ele só mostra fatos sobre as palavras dela — a conclusão é dela.
// "Você está mais confiante"  -> errado, é opinião de máquina
// "A palavra tentar sumiu há 11 dias" -> certo, é fato verificável
//
// Sem IA: contagem e comparação. Determinístico, gratuito e
// incapaz de inventar um padrão que não existe.
// ============================================================

const HESITACAO = {
  pt: ['tentar', 'tentei', 'tentando', 'tentativa', 'queria', 'talvez', 'preguiça',
    'difícil', 'dificil', 'custou', 'consegui não', 'não consigo', 'nao consigo',
    'vontade', 'desanimado', 'desanimada', 'medo', 'cansado', 'cansada', 'pesado'],
  en: ['try', 'tried', 'trying', 'wanted', 'maybe', 'lazy', 'hard', 'difficult',
    "can't", 'cannot', 'afraid', 'tired', 'heavy', 'struggle', 'struggled'],
};

const FEITO = {
  pt: ['fiz', 'consegui', 'acordei', 'fui', 'terminei', 'normal', 'rotina',
    'de novo', 'mais um', 'tranquilo', 'automático', 'automatico', 'natural'],
  en: ['did', 'made', 'woke', 'went', 'finished', 'normal', 'routine',
    'again', 'easy', 'automatic', 'natural'],
};

// condicional -> presente: a assinatura mais confiável de mudança de identidade
const CONDICIONAL = /\b\w+(ria|riam|ríamos|rias)\b|\bqueria\b|\bseria\b|\bpoderia\b|\bwould\b|\bcould\b/gi;

const norm = (s) => (s || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function contaTermos(texto, lista) {
  const t = ' ' + norm(texto) + ' ';
  let n = 0;
  for (const termo of lista) {
    const alvo = norm(termo);
    if (!alvo) continue;
    let i = t.indexOf(' ' + alvo);
    while (i !== -1) { n++; i = t.indexOf(' ' + alvo, i + 1); }
  }
  return n;
}

// O espelho existe para devolver à pessoa o que ELA escreveu. Se
// aceitar a frase pronta do app, ele reflete o app — e devolve para
// ela uma leitura feita em cima de palavras que não são dela.
function limpo(u) {
  return textoDaPessoa(u.text);
}

// ------------------------------------------------------------
// analisar(updates, locale) -> { tipo, ... } | null
// updates: [{ id, day_number, text, created_at }] em ordem crescente
// ------------------------------------------------------------
// Se o tom recente piorou, o espelho se cala — inclusive sobre ritmo.
// Elogiar a frequência de quem está sofrendo mais é surdez, não carinho.
function piorou(dias, lang) {
  const t = dias.filter((u) => limpo(u).length >= 4);
  if (t.length < 6) return false;
  const meio = Math.floor(t.length / 2);
  const ini = t.slice(0, meio), fim = t.slice(meio);
  const hA = contaTermos(ini.map(limpo).join(' '), HESITACAO[lang]) / Math.max(1, ini.length);
  const hD = contaTermos(fim.map(limpo).join(' '), HESITACAO[lang]) / Math.max(1, fim.length);
  return hD > hA * 1.3;
}

export function analisar(updates, locale = 'pt') {
  const lang = locale === 'en' ? 'en' : 'pt';
  const dias = (updates || []).filter((u) => u.day_number).sort((a, b) => (a.day_number || 0) - (b.day_number || 0));

  // porta de entrada: qualquer sinal de piora encerra a conversa
  if (piorou(dias, lang)) return null;

  const comTexto = dias.filter((u) => limpo(u).length >= 12);

  // material mínimo: sem isso o padrão é ruído, e um falso padrão
  // destrói a confiança em tudo que o espelho disser depois
  if (comTexto.length < 8) return ritmo(dias);

  const metade = Math.floor(comTexto.length / 2);
  const inicio = comTexto.slice(0, Math.max(3, metade));
  const fim = comTexto.slice(-Math.max(3, comTexto.length - metade));

  const txtInicio = inicio.map(limpo).join(' ');
  const txtFim = fim.map(limpo).join(' ');

  // ---------- 1. palavra de hesitação que desapareceu ----------
  let melhor = null;
  for (const termo of HESITACAO[lang]) {
    const antes = inicio.filter((u) => contaTermos(limpo(u), [termo]) > 0);
    const depois = fim.filter((u) => contaTermos(limpo(u), [termo]) > 0);
    // estava presente em boa parte do começo e sumiu de vez
    if (antes.length >= 3 && depois.length === 0) {
      const ultimo = [...comTexto].reverse().find((u) => contaTermos(limpo(u), [termo]) > 0);
      const ultimoDia = ultimo ? ultimo.day_number : 0;
      const diasSem = (comTexto[comTexto.length - 1].day_number || 0) - ultimoDia;
      if (diasSem >= 5 && (!melhor || antes.length > melhor.vezes)) {
        melhor = { termo, vezes: antes.length, total: inicio.length, diasSem };
      }
    }
  }

  const par = {
    antes: { dia: comTexto[0].day_number, texto: limpo(comTexto[0]).slice(0, 160) },
    depois: { dia: comTexto[comTexto.length - 1].day_number, texto: limpo(comTexto[comTexto.length - 1]).slice(0, 160) },
  };

  if (melhor) {
    return { tipo: 'palavra', par, termo: melhor.termo, vezes: melhor.vezes, total: melhor.total, diasSem: melhor.diasSem };
  }

  // ---------- 2. condicional -> presente ----------
  const condAntes = (txtInicio.match(CONDICIONAL) || []).length / Math.max(1, inicio.length);
  const condDepois = (txtFim.match(CONDICIONAL) || []).length / Math.max(1, fim.length);
  if (condAntes >= 0.5 && condDepois <= condAntes / 3) {
    return { tipo: 'tempo', par };
  }

  // ---------- 3. hesitação cedeu lugar a feito ----------
  const hA = contaTermos(txtInicio, HESITACAO[lang]) / Math.max(1, inicio.length);
  const hD = contaTermos(txtFim, HESITACAO[lang]) / Math.max(1, fim.length);
  const fA = contaTermos(txtInicio, FEITO[lang]) / Math.max(1, inicio.length);
  const fD = contaTermos(txtFim, FEITO[lang]) / Math.max(1, fim.length);
  if (hA >= 0.6 && hD < hA / 2 && fD > fA) {
    return { tipo: 'tom', par };
  }

  // Nenhuma mudança positiva detectada: o espelho CALA A BOCA.
  // Assimetria proposital — isto não é análise de dados, é um
  // espelho apontado para o crescimento. Nunca mostra regressão.
  return null;
}

// ------------------------------------------------------------
// Para quem escreve pouco (posta só foto): o ritmo também é
// mudança real, e também é fato.
// ------------------------------------------------------------
function ritmo(dias) {
  if (!dias || dias.length < 10) return null;
  const datas = dias.map((u) => new Date(u.created_at).getTime()).sort((a, b) => a - b);
  const metade = Math.floor(datas.length / 2);
  const gap = (arr) => {
    if (arr.length < 2) return null;
    let soma = 0;
    for (let i = 1; i < arr.length; i++) soma += (arr[i] - arr[i - 1]) / 86400000;
    return soma / (arr.length - 1);
  };
  const antes = gap(datas.slice(0, metade + 1));
  const depois = gap(datas.slice(metade));
  if (antes == null || depois == null) return null;
  if (antes >= 2 && depois <= antes / 1.8) {
    return { tipo: 'ritmo', antes: Math.round(antes * 10) / 10, depois: Math.round(depois * 10) / 10 };
  }
  return null;
}

// ------------------------------------------------------------
// Quando mostrar. Raro é o que dá peso.
// ------------------------------------------------------------
export function podeMostrar({ diasCorridos, diasEscritos, ultimoDiaFoiRuim, ultimaVez }) {
  if (diasEscritos < 8 || diasCorridos < 12) return false;
  // nunca logo depois de um dia ruim: soaria como se o app não tivesse escutado
  if (ultimoDiaFoiRuim) return false;
  if (ultimaVez) {
    const dias = (Date.now() - new Date(ultimaVez).getTime()) / 86400000;
    if (dias < 10) return false;
  }
  return true;
}
