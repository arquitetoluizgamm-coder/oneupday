// ---- Upi: o pingo que acompanha ----
// Upi é o pingo terracota do logo. Testemunha da jornada, não coach.
// Regras de voz (A Base): presença, não pressão; humor leve de amigo
// observador; nunca terapeuta; nunca "parabéns guerreiro"; recomeço
// é sempre bem-vindo. Uma frase por dia (semente = dia + usuário).

const BANK = {
  pt: {
    welcome: [
      'A gente ainda não começou nada. Eu disse "ainda".',
      'Tô aqui desde já. Quando você quiser, a primeira jornada é sua.',
      'Sem pressa. Grandes histórias começam com um dia 1 qualquer.',
    ],
    first: [
      'Dia 1. É o meu capítulo favorito.',
      'Começou. Eu vi. Tá registrado.',
      'Primeiro passo dado — eu gosto de quem aparece.',
    ],
    comeback: [
      'Você voltou. Eu sabia.',
      'Sumiu por {d} dias e voltou. É disso que eu gosto.',
      'Nada se perdeu. Eu guardei tudo por aqui.',
      'Bom te ver de novo. A história continua.',
    ],
    setback: [
      'Dia difícil também é dia. Tá contado.',
      'Registrar um tropeço exige mais coragem que esconder. Eu notei.',
      'Amanhã a gente escreve outro parágrafo.',
    ],
    milestone: [
      'Dia {d}. Pra quem "só ia tentar", hein.',
      '{d} dias. Eu tava aqui em todos eles.',
      'Dia {d}. Discretamente, isso virou hábito.',
    ],
    streak: [
      '{n} dias seguidos aparecendo. Tô achando interessante suas decisões.',
      'Sua presença anda bonita de ver. {n} dias.',
      'Constância silenciosa. Eu percebo essas coisas.',
    ],
    general: [
      'Tô achando interessante suas decisões.',
      'Você apareceu. Isso já diz muito.',
      'Que bom que fez isso. Sério.',
      'Sigo observando. E gostando do rumo.',
      'Sua jornada tá com cara de quem vai longe.',
    ],
  },
  en: {
    welcome: [
      'We have not started anything yet. I said "yet".',
      'I am already here. Whenever you are ready, the first journey is yours.',
      'No rush. Great stories start on some ordinary day 1.',
    ],
    first: [
      'Day 1. My favorite chapter.',
      'It started. I saw it. It is on the record.',
      'First step taken — I like people who show up.',
    ],
    comeback: [
      'You came back. I knew it.',
      'Gone for {d} days and back again. That is my kind of person.',
      'Nothing was lost. I kept everything right here.',
      'Good to see you again. The story continues.',
    ],
    setback: [
      'A hard day still counts as a day. It is on the record.',
      'Logging a stumble takes more courage than hiding it. I noticed.',
      'Tomorrow we write another paragraph.',
    ],
    milestone: [
      'Day {d}. Not bad for someone who was "just going to try".',
      '{d} days. I was here for every one of them.',
      'Day {d}. Quietly, this became a habit.',
    ],
    streak: [
      '{n} days showing up in a row. I find your decisions interesting.',
      'Your presence has been lovely to watch. {n} days.',
      'Quiet consistency. I notice these things.',
    ],
    general: [
      'I find your decisions interesting.',
      'You showed up. That already says a lot.',
      'Glad you did that. Really.',
      'Still watching. Liking where this is going.',
      'This journey looks like one that goes far.',
    ],
  },
};

export function pickUpi({ locale = 'pt', userId = '', hasJourney = false, day = 0, streak = 0, lastKind = '', daysSince = 0, updatesCount = 0 }) {
  const L = BANK[String(locale || '').slice(0, 2)] || BANK.pt;
  let cat = 'general';
  const vars = {};
  if (!hasJourney) cat = 'welcome';
  else if (daysSince >= 3 && updatesCount > 0) { cat = 'comeback'; vars.d = daysSince; }
  else if (lastKind === 'setback' && daysSince <= 1) cat = 'setback';
  else if ([7, 30, 60, 100].includes(day)) { cat = 'milestone'; vars.d = day; }
  else if (updatesCount <= 1 && updatesCount > 0) cat = 'first';
  else if (streak >= 5) { cat = 'streak'; vars.n = streak; }
  const arr = L[cat] || L.general;
  // uma frase por dia (BRT), estável dentro do dia
  const dayKey = new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const seed = dayKey + userId + cat;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  let line = arr[h % arr.length];
  Object.keys(vars).forEach((k) => { line = line.replace('{' + k + '}', vars[k]); });
  return { line, cat };
}
