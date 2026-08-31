const PASSAGES = [
  {
    id: 'psalm-46',
    reference: { pt: 'Salmos 46:1–3', en: 'Psalm 46:1–3', es: 'Salmos 46:1–3' },
    theme: {
      pt: 'Deus é presença e amparo quando tudo ao redor parece instável.',
      en: 'God is present and offers shelter when everything around us feels unstable.',
      es: 'Dios está presente y ofrece amparo cuando todo alrededor parece inestable.',
    },
  },
  {
    id: 'isaiah-40',
    reference: { pt: 'Isaías 40:28–31', en: 'Isaiah 40:28–31', es: 'Isaías 40:28–31' },
    theme: {
      pt: 'Esperar em Deus não é ficar parado; é receber forças para continuar sem negar o cansaço.',
      en: 'Waiting on God is not passivity; it is receiving strength to continue without denying tiredness.',
      es: 'Esperar en Dios no es quedarse inmóvil; es recibir fuerzas para continuar sin negar el cansancio.',
    },
  },
  {
    id: 'matthew-11',
    reference: { pt: 'Mateus 11:28–30', en: 'Matthew 11:28–30', es: 'Mateo 11:28–30' },
    theme: {
      pt: 'Jesus acolhe quem está sobrecarregado e propõe um caminho vivido com descanso e mansidão.',
      en: 'Jesus welcomes those carrying heavy burdens and offers a way marked by rest and gentleness.',
      es: 'Jesús recibe a quienes llevan cargas pesadas y propone un camino de descanso y mansedumbre.',
    },
  },
  {
    id: 'lamentations-3',
    reference: { pt: 'Lamentações 3:22–23', en: 'Lamentations 3:22–23', es: 'Lamentaciones 3:22–23' },
    theme: {
      pt: 'A misericórdia se renova: um dia difícil não encerra a história nem impede um novo começo.',
      en: 'Mercy is renewed: a difficult day does not end the story or prevent a new beginning.',
      es: 'La misericordia se renueva: un día difícil no termina la historia ni impide un nuevo comienzo.',
    },
  },
  {
    id: 'proverbs-3',
    reference: { pt: 'Provérbios 3:5–6', en: 'Proverbs 3:5–6', es: 'Proverbios 3:5–6' },
    theme: {
      pt: 'Confiar também significa reconhecer que nossa visão é limitada e buscar direção antes de controlar tudo.',
      en: 'Trust also means admitting that our view is limited and seeking direction instead of controlling everything.',
      es: 'Confiar también significa reconocer que nuestra visión es limitada y buscar dirección antes de controlarlo todo.',
    },
  },
  {
    id: 'philippians-4',
    reference: { pt: 'Filipenses 4:6–7', en: 'Philippians 4:6–7', es: 'Filipenses 4:6–7' },
    theme: {
      pt: 'A passagem convida a levar as preocupações a Deus com sinceridade, abrindo espaço para uma paz que guarda o coração.',
      en: 'The passage invites us to bring worries honestly to God, making room for a peace that guards the heart.',
      es: 'El pasaje invita a llevar las preocupaciones a Dios con sinceridad, abriendo espacio para una paz que guarda el corazón.',
    },
  },
  {
    id: 'romans-12',
    reference: { pt: 'Romanos 12:2', en: 'Romans 12:2', es: 'Romanos 12:2' },
    theme: {
      pt: 'A transformação começa quando a maneira de pensar é renovada e escolhas mais conscientes se tornam possíveis.',
      en: 'Transformation begins as the mind is renewed and more conscious choices become possible.',
      es: 'La transformación comienza cuando la mente se renueva y se vuelven posibles decisiones más conscientes.',
    },
  },
  {
    id: 'galatians-6',
    reference: { pt: 'Gálatas 6:9', en: 'Galatians 6:9', es: 'Gálatas 6:9' },
    theme: {
      pt: 'Fazer o bem exige constância, mas a passagem não transforma cansaço em culpa: ela encoraja a não abandonar o caminho.',
      en: 'Doing good requires persistence, but the passage does not turn tiredness into guilt; it encourages us not to abandon the way.',
      es: 'Hacer el bien exige constancia, pero el pasaje no convierte el cansancio en culpa; anima a no abandonar el camino.',
    },
  },
  {
    id: 'james-1',
    reference: { pt: 'Tiago 1:5', en: 'James 1:5', es: 'Santiago 1:5' },
    theme: {
      pt: 'Pedir sabedoria é reconhecer que nem toda resposta precisa nascer apenas do próprio esforço.',
      en: 'Asking for wisdom means recognizing that not every answer has to come from our own effort alone.',
      es: 'Pedir sabiduría es reconocer que no toda respuesta debe nacer únicamente del propio esfuerzo.',
    },
  },
  {
    id: 'ecclesiastes-3',
    reference: { pt: 'Eclesiastes 3:1', en: 'Ecclesiastes 3:1', es: 'Eclesiastés 3:1' },
    theme: {
      pt: 'A vida tem estações; discernir o tempo presente ajuda a não exigir de hoje aquilo que pertence a outra fase.',
      en: 'Life has seasons; discerning the present time helps us not demand from today what belongs to another season.',
      es: 'La vida tiene estaciones; discernir el tiempo presente ayuda a no exigirle a hoy lo que pertenece a otra etapa.',
    },
  },
  {
    id: 'second-corinthians-12',
    reference: { pt: '2 Coríntios 12:9', en: '2 Corinthians 12:9', es: '2 Corintios 12:9' },
    theme: {
      pt: 'A graça não depende de desempenho perfeito; ela pode sustentar a pessoa justamente onde existe limitação.',
      en: 'Grace does not depend on perfect performance; it can sustain a person precisely where limitations exist.',
      es: 'La gracia no depende de un desempeño perfecto; puede sostener a la persona justamente donde hay limitación.',
    },
  },
  {
    id: 'joshua-1',
    reference: { pt: 'Josué 1:9', en: 'Joshua 1:9', es: 'Josué 1:9' },
    theme: {
      pt: 'Coragem bíblica não é ausência de medo, mas disposição para seguir sabendo que Deus permanece presente.',
      en: 'Biblical courage is not the absence of fear, but the willingness to move forward knowing God remains present.',
      es: 'La valentía bíblica no es ausencia de miedo, sino disposición para avanzar sabiendo que Dios permanece presente.',
    },
  },
  {
    id: 'micah-6',
    reference: { pt: 'Miquéias 6:8', en: 'Micah 6:8', es: 'Miqueas 6:8' },
    theme: {
      pt: 'A fé se torna concreta em justiça, misericórdia e humildade nas escolhas comuns do dia.',
      en: 'Faith becomes concrete through justice, mercy, and humility in the ordinary choices of the day.',
      es: 'La fe se vuelve concreta en la justicia, la misericordia y la humildad de las decisiones cotidianas.',
    },
  },
  {
    id: 'colossians-3',
    reference: { pt: 'Colossenses 3:12–14', en: 'Colossians 3:12–14', es: 'Colosenses 3:12–14' },
    theme: {
      pt: 'Compaixão, bondade, paciência e amor são práticas diárias, não apenas sentimentos espontâneos.',
      en: 'Compassion, kindness, patience, and love are daily practices, not merely spontaneous feelings.',
      es: 'La compasión, la bondad, la paciencia y el amor son prácticas diarias, no solo sentimientos espontáneos.',
    },
  },
];

const FALLBACK = {
  pt: {
    title: 'Um sentido para carregar hoje',
    ending: 'O sentido não é ignorar o que está difícil, mas atravessar este dia com fé, honestidade e um passo possível de cada vez.',
    application: 'Hoje, escolha uma atitude pequena que torne esse ensinamento concreto na sua rotina.',
  },
  en: {
    title: 'A meaning to carry today',
    ending: 'The point is not to ignore what is difficult, but to move through this day with faith, honesty, and one possible step at a time.',
    application: 'Today, choose one small action that makes this teaching concrete in your routine.',
  },
  es: {
    title: 'Un sentido para llevar hoy',
    ending: 'El sentido no es ignorar lo difícil, sino atravesar este día con fe, honestidad y un paso posible a la vez.',
    application: 'Hoy, elige una acción pequeña que vuelva concreta esta enseñanza en tu rutina.',
  },
};

function hash(value) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function saoPauloDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function biblicalMessageForDay(userId, locale = 'pt', date = new Date()) {
  const language = ['pt', 'en', 'es'].includes(locale) ? locale : 'en';
  const dateKey = saoPauloDateKey(date);
  const passage = PASSAGES[hash(`${userId}:${dateKey}`) % PASSAGES.length];
  const fallback = FALLBACK[language];
  return {
    id: passage.id,
    dateKey,
    reference: passage.reference[language],
    theme: passage.theme[language],
    fallback: {
      title: fallback.title,
      explanation: `${passage.theme[language]} ${fallback.ending}`,
      application: fallback.application,
    },
  };
}
