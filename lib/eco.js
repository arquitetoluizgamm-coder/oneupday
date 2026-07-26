// ============================================================
// PRIMEIRO ECO — a parte que NÃO usa IA
//
// Aqui o sistema decide O QUE ACONTECEU, a partir de fatos
// estruturados da jornada. A IA depois só redige a frase.
// Ela nunca escolhe o acontecimento — isso elimina invenção,
// interpretação psicológica e frase com cara de horóscopo.
//
// Se a IA falhar ou não estiver configurada, a frase determinística
// abaixo entra no lugar. O recurso nunca depende do modelo.
// ============================================================

const DIA = 86400000;

// Temas em que silêncio automatizado é mais respeitoso que
// uma frase possivelmente inadequada. Bloqueiam o Eco por completo.
const SENSIVEL = [
  // substâncias
  'recai', 'recaida', 'bebi', 'bebendo', 'alcool', 'alcoolismo', 'cachaca', 'cerveja',
  'droga', 'cocaina', 'crack', 'maconha', 'usei de novo', 'relapse', 'drunk', 'relapsed',
  // vida
  'me matar', 'suicid', 'me cortar', 'cortei', 'autolesao', 'me machucar', 'nao quero viver',
  'kill myself', 'suicide', 'self harm', 'cut myself',
  // violência
  'me bateu', 'agrediu', 'abuso', 'abusou', 'estupro', 'violencia', 'apanhei',
  'abuse', 'assault', 'raped',
  // alimentação
  'vomitei', 'purguei', 'anorexia', 'bulimia', 'compulsao alimentar', 'purge', 'binge',
  // luto e crise
  'morreu', 'faleceu', 'enterro', 'velorio', 'luto', 'internado', 'internacao',
  'crise de panico', 'surto', 'passed away', 'funeral', 'hospitalized',
];

const semAcento = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function temaSensivel(...textos) {
  const t = ' ' + semAcento(textos.filter(Boolean).join(' ')) + ' ';
  return SENSIVEL.some((p) => t.includes(semAcento(p)));
}

// ------------------------------------------------------------
// detectarFato(atual, anteriores, jornada) -> { tipo, dados } | null
//
// atual:      o dia recém publicado
// anteriores: dias anteriores da mesma jornada (ordem crescente)
// jornada:    { title, total_days }
//
// Só devolve fato VERIFICÁVEL. Nada de inferência sobre causa.
// ------------------------------------------------------------
export function detectarFato(atual, anteriores, jornada) {
  if (!atual) return null;
  const total = jornada?.total_days || 0;
  const dia = atual.day_number || 0;
  const antes = (anteriores || [])
    .filter((u) => u.id !== atual.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const ultimo = antes[antes.length - 1] || null;

  // 1. PROMESSA CUMPRIDA — o dia anterior tinha um passo em aberto e este fechou
  const abertoAntes = [...antes].reverse().find((u) => u.next_step && u.closed_by === atual.id);
  if (abertoAntes) {
    return { tipo: 'promessa', dados: { passo: abertoAntes.next_step, dia } };
  }

  // 2. RETORNO — voltou depois de dias parada
  if (ultimo) {
    const fora = Math.round((new Date(atual.created_at) - new Date(ultimo.created_at)) / DIA);
    if (fora >= 2) return { tipo: 'retorno', dados: { dias: fora, dia } };
  }

  // 3. META ALCANÇADA
  if (total > 0 && dia >= total) return { tipo: 'meta', dados: { total } };

  // 4. MARCO
  if ([7, 30, 60, 100].includes(dia)) return { tipo: 'marco', dados: { dia } };

  // 5. PRIMEIRO CAPÍTULO
  if (dia === 1 || antes.length === 0) return { tipo: 'primeiro', dados: { titulo: jornada?.title || '' } };

  // 6. CONTINUOU NO DIA SEGUINTE A UM DIA DIFÍCIL
  if (ultimo && ultimo.kind === 'setback') {
    const fora = Math.round((new Date(atual.created_at) - new Date(ultimo.created_at)) / DIA);
    if (fora <= 1) return { tipo: 'seguiu', dados: { dia } };
  }

  // 7. CAPÍTULO REGISTRADO — o fato mais simples e sempre verdadeiro
  if (antes.length >= 2) return { tipo: 'capitulo', dados: { n: antes.length + 1 } };

  return null;
}

// ------------------------------------------------------------
// Frases determinísticas: a rede de segurança.
// Observam o fato. Não elogiam, não diagnosticam, não aconselham.
// ------------------------------------------------------------
export function fraseBase(fato, locale = 'pt') {
  const d = fato?.dados || {};
  const pt = {
    promessa: `Ontem você deixou este passo combinado. Hoje voltou com o resultado.`,
    retorno: `Você ficou ${d.dias} dias sem registrar esta jornada e voltou hoje. O capítulo continua daqui.`,
    meta: `Este é o dia ${d.total} desta jornada. Os dias não foram iguais, mas a história chegou até aqui.`,
    marco: `Este é o dia ${d.dia} desta jornada. Um bom lugar para olhar para trás.`,
    primeiro: `Este é o início registrado desta jornada. Um dia você volta aqui e compara com quem estava começando hoje.`,
    seguiu: `Ontem foi um dia difícil e você registrou de novo hoje.`,
    capitulo: `Este é o capítulo ${d.n} desta jornada.`,
  };
  const en = {
    promessa: `Yesterday you set this step. Today you came back with the result.`,
    retorno: `You went ${d.dias} days without logging this journey, and came back today. The chapter continues from here.`,
    meta: `This is day ${d.total} of this journey. The days were not the same, but the story got here.`,
    marco: `This is day ${d.dia} of this journey. A good place to look back.`,
    primeiro: `This is the recorded beginning of this journey. One day you will come back here and compare.`,
    seguiu: `Yesterday was a hard day, and you logged again today.`,
    capitulo: `This is chapter ${d.n} of this journey.`,
  };
  const tab = locale === 'en' ? en : pt;
  return tab[fato?.tipo] || '';
}

// ------------------------------------------------------------
// Instrução para a IA. Ela recebe o FATO já decidido e só redige.
// ------------------------------------------------------------
export function instrucao(locale = 'pt') {
  const lang = locale === 'en' ? 'English' : 'português do Brasil';
  return `Você é o Upi, a IA do app One Up Day. Escreva UMA observação curta (1 ou 2 frases, no máximo 200 caracteres) sobre um fato já verificado da jornada de alguém.

REGRAS ABSOLUTAS:
- Observe o que aconteceu. Nunca diga quem a pessoa é nem o que ela sente.
- Proibido: parabéns, felicitações, emoji, exclamação, "guerreiro", "orgulho", "você consegue", "continue assim", qualquer motivação genérica.
- Proibido: diagnóstico, conselho não pedido, comparação com outras pessoas, afirmar que uma mudança é permanente.
- Não invente nenhum fato além do que foi informado. Não interprete o texto da pessoa.
- Se citar uma possível causa, use "talvez" — nunca afirme causa.
- Tom: observador, simples, calmo. Segunda pessoa ("você").
- Sem pergunta no fim, a menos que eu peça.
- Escreva em ${lang}. Responda só com a frase, sem aspas.`;
}
