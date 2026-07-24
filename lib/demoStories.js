const DEMO_OWNERS = [
  { name: 'Marina Alves', handle: '@marina.recomeca', avatarUrl: '/demo/avatars/avatar-01.png', avatarColor: '#d87932' },
  { name: 'Paulo Neri', handle: '@paulo.reconstroi', avatarUrl: '/demo/avatars/avatar-05.png', avatarColor: '#5d6c57' },
  { name: 'Helena Duarte', handle: '@helena.calma', avatarUrl: '/demo/avatars/avatar-08.png', avatarColor: '#9a7b5d' },
  { name: 'Bruno Araujo', handle: '@bruno.codepath', avatarUrl: '/demo/avatars/avatar-18.png', avatarColor: '#b56644' },
  { name: 'Joana Silva', handle: '@joana.volta', avatarUrl: '/demo/avatars/avatar-20.png', avatarColor: '#b45b52' },
  { name: 'Mei Lin', handle: '@mei.mornings', avatarUrl: '/demo/avatars/avatar-09.png', avatarColor: '#7b8f87' },
  { name: 'Diego Costa', handle: '@diego.umdia', avatarUrl: '/demo/avatars/avatar-10.png', avatarColor: '#c57a43' },
  { name: 'Zuri Coleman', handle: '@zuri.draws.again', avatarUrl: '/demo/avatars/avatar-06.png', avatarColor: '#4a7d91' },
  { name: 'Amira Said', handle: '@amira.returns', avatarUrl: '/demo/avatars/avatar-15.png', avatarColor: '#c88054' },
  { name: 'Lina Torres', handle: '@lina.passoapasso', avatarUrl: '/demo/avatars/avatar-04.png', avatarColor: '#687d5f' },
];

const DEMO_STORIES = [
  {
    slug: 'marina-run-again', owner: 0, coverColor: '#d87932', category: 'body', moment: 'starting',
    totalDays: 45, currentDay: 12, streak: 4, progressPct: 27,
    title: { pt: 'Voltar a correr sem me punir', en: 'Run again without punishing myself' },
    goal: { pt: 'Corri por anos e parei quando virou cobrança. Quero descobrir se consigo gostar de novo.', en: 'I ran for years and quit when it became pressure. I want to find out if I can love it again.' },
    updates: [
      { day: 1, kind: 'step', pt: 'Calcei o tênis que estava há oito meses no armário. Caminhei 15 minutos ouvindo o bairro acordar. Só isso. E foi bom.', en: 'I put on the shoes that sat in the closet for eight months. Walked 15 minutes listening to the neighborhood wake up. That was it. And it was good.' },
      { day: 8, kind: 'setback', pt: 'Três dias sem ir. A antiga Marina teria desistido aqui — era sempre nesse ponto. Hoje só dei uma volta no quarteirão pra não perder o fio.', en: "Three days off. The old me would've quit right here — it was always at this point. Today I just walked the block so I wouldn't lose the thread." },
      { day: 12, kind: 'win', pt: 'Corri 12 minutos seguidos sem olhar o relógio nenhuma vez. Terminei sorrindo feito boba no meio da rua.', en: 'Ran 12 straight minutes without checking my watch once. Finished grinning like an idiot in the middle of the street.' },
    ],
  },
  {
    slug: 'paulo-cem-dias', owner: 1, coverColor: '#5d6c57', category: 'habit', moment: 'notgiveup',
    totalDays: 100, currentDay: 34, streak: 11, progressPct: 34,
    title: { pt: '100 dias sem álcool', en: '100 days without alcohol' },
    goal: { pt: 'Minha filha nasceu em março. Quero ser o pai que ela merece, um dia de cada vez.', en: 'My daughter was born in March. I want to be the father she deserves, one day at a time.' },
    updates: [
      { day: 1, kind: 'step', pt: 'Primeiro churrasco em família segurando um guaraná. Meu primo riu, eu ri junto. Por dentro eu tremia, mas segurei.', en: 'First family barbecue holding a soda. My cousin laughed, I laughed along. Inside I was shaking, but I held on.' },
      { day: 19, kind: 'setback', pt: 'Sexta difícil. Cheguei a pegar o carro pra ir na conveniência. Voltei da esquina, liguei pro meu irmão e a gente conversou até passar.', en: 'Rough Friday. I actually got in the car to drive to the store. Turned around at the corner, called my brother and we talked until it passed.' },
      { day: 34, kind: 'win', pt: 'Um mês e três dias. Hoje minha esposa disse que meu olhar mudou. Guardei essa frase pra ler nos dias ruins.', en: "One month and three days. Today my wife said my eyes look different. I saved that sentence to reread on the bad days." },
    ],
  },
  {
    slug: 'helena-dormir-cedo', owner: 2, coverColor: '#9a7b5d', category: 'health', moment: 'health',
    totalDays: 30, currentDay: 9, streak: 3, progressPct: 30,
    title: { pt: 'Dormir antes da meia-noite', en: 'Asleep before midnight' },
    goal: { pt: 'Cansei de me arrastar pelos dias. Quero descobrir quem eu sou dormindo direito.', en: "I'm tired of dragging through my days. I want to find out who I am when I actually sleep." },
    updates: [
      { day: 2, kind: 'step', pt: 'Deixei o celular carregando na cozinha às 22h30. Li quatro páginas de um livro e apaguei. Quatro páginas!', en: 'Left my phone charging in the kitchen at 10:30pm. Read four pages of a book and passed out. Four pages!' },
      { day: 6, kind: 'setback', pt: 'Série nova, três episódios, 1h40 da manhã. Acordei péssima e quase não postei isso aqui de vergonha. Mas combinei comigo que recaída também se registra.', en: "New show, three episodes, 1:40am. Woke up awful and almost didn't post this out of shame. But I promised myself setbacks get logged too." },
      { day: 9, kind: 'win', pt: 'Três noites seguidas dormindo antes da meia-noite. Hoje acordei antes do despertador e fiquei só olhando o teto, sem pressa. Não lembrava dessa sensação.', en: "Three nights in a row asleep before midnight. Today I woke up before the alarm and just stared at the ceiling, unhurried. I'd forgotten that feeling." },
    ],
  },
  {
    slug: 'bruno-uma-hora-codigo', owner: 3, coverColor: '#b56644', category: 'work', moment: 'building',
    totalDays: 90, currentDay: 21, streak: 6, progressPct: 23,
    title: { pt: '1h de código antes do trabalho', en: '1 hour of code before work' },
    goal: { pt: 'Tenho 31 anos e atendo telefone há nove. Quero mudar de vida antes dos 33.', en: "I'm 31 and I've answered phones for nine years. I want a different life before 33." },
    updates: [
      { day: 3, kind: 'step', pt: 'Acordei 5h50. Café, editor aberto, 20 linhas que não funcionaram. Mas às 7h eu tinha tentado — e isso já é mais do que ontem.', en: "Woke at 5:50. Coffee, editor open, 20 lines that didn't work. But by 7am I had tried — and that's already more than yesterday." },
      { day: 14, kind: 'learned', pt: 'Descobri que travar num erro por uma hora também é estudar. Antes eu achava que era burrice. É o processo.', en: "Learned that being stuck on one error for an hour is also studying. I used to think it meant I was dumb. It's the process." },
      { day: 21, kind: 'win', pt: 'Minha primeira página funcionando de verdade. Chamei minha mãe pra ver. Ela não entendeu nada e disse que ficou lindo.', en: "My first page actually working. I called my mom over to see it. She understood nothing and said it was beautiful." },
    ],
  },
  {
    slug: 'joana-volta-estudar', owner: 4, coverColor: '#b45b52', category: 'study', moment: 'courage',
    totalDays: 60, currentDay: 15, streak: 5, progressPct: 25,
    title: { pt: 'Voltar a estudar aos 42', en: 'Back to studying at 42' },
    goal: { pt: 'Parei na 8ª série pra trabalhar. Meus filhos cresceram. Agora é a minha vez.', en: 'I left school in 8th grade to work. My kids are grown. Now it’s my turn.' },
    updates: [
      { day: 1, kind: 'step', pt: 'Comprei dois cadernos e uma caneta boa. Minha filha me ensinou a usar o aplicativo do curso. Ela tava mais orgulhosa que eu.', en: 'Bought two notebooks and a good pen. My daughter taught me how to use the course app. She was prouder than I was.' },
      { day: 9, kind: 'setback', pt: 'A prova de matemática me derrubou. Chorei no banheiro e pensei "não é pra mim". Aí lembrei que eu digo pros meus filhos nunca falarem isso.', en: 'The math test knocked me down. I cried in the bathroom thinking "this isn’t for me." Then I remembered I tell my kids to never say that.' },
      { day: 15, kind: 'win', pt: 'Refiz a prova: 7,5. Colei a nota na geladeira, do lado dos desenhos que guardo desde que eles eram pequenos.', en: 'Retook the test: got a B. Stuck the grade on the fridge, next to the drawings I’ve kept since they were little.' },
    ],
  },
  {
    slug: 'mei-manhas-sem-celular', owner: 5, coverColor: '#7b8f87', category: 'mind', moment: 'starting',
    totalDays: 21, currentDay: 7, streak: 4, progressPct: 33,
    title: { pt: 'Manhãs sem celular', en: 'Mornings without my phone' },
    goal: { pt: 'Percebi que fazia scroll antes de abrir os olhos direito. Quero que a primeira hora do dia seja minha.', en: 'I realized I was scrolling before my eyes were fully open. I want the first hour of the day to be mine.' },
    updates: [
      { day: 1, kind: 'step', pt: 'Comprei um despertador de verdade, desses antigos. O celular dorme na sala agora. A casa ficou estranhamente silenciosa.', en: 'Bought an actual alarm clock, an old-school one. The phone sleeps in the living room now. The house got strangely quiet.' },
      { day: 4, kind: 'setback', pt: 'Peguei o celular "só pra ver a previsão do tempo". Quarenta minutos depois eu tava vendo briga de gente que nem conheço. Recomeçando amanhã.', en: 'Grabbed the phone "just to check the weather." Forty minutes later I was watching strangers argue. Starting again tomorrow.' },
      { day: 7, kind: 'win', pt: 'Uma semana. Hoje tomei café olhando pela janela e vi que o ipê da rua floresceu. Ele deve ter florescido outras vezes. Eu é que nunca vi.', en: "One week. Had my coffee looking out the window and noticed the tree on my street is blooming. It must have bloomed before. I just never saw it." },
    ],
  },
  {
    slug: 'diego-reabrir-oficina', owner: 6, coverColor: '#c57a43', category: 'work', moment: 'rebuilding',
    totalDays: 120, currentDay: 28, streak: 8, progressPct: 23,
    title: { pt: 'Reabrir a marcenaria', en: 'Reopening my woodshop' },
    goal: { pt: 'Fechei em 2024 devendo. Todo mundo disse pra desistir. Vou reabrir menor, sem dívida e sem pressa.', en: 'I closed in 2024 in debt. Everyone said to give up. I’m reopening smaller, debt-free and unhurried.' },
    updates: [
      { day: 5, kind: 'step', pt: 'Limpei as máquinas que sobraram. A plaina ainda funciona. Fiquei uma hora só passando a mão na madeira, lembrando por que comecei.', en: 'Cleaned the machines I still have. The planer still works. Spent an hour just running my hand over the wood, remembering why I started.' },
      { day: 17, kind: 'setback', pt: 'O primeiro orçamento que mandei foi recusado. Doeu mais do que devia. Meu filho falou: "pai, é um não. Faltam os sim". Guardei.', en: 'My first quote got rejected. It hurt more than it should. My son said: "Dad, that’s one no. The yeses are still coming." I kept that.' },
      { day: 28, kind: 'win', pt: 'Entreguei uma mesa de cabeceira pra vizinha. Pequena, simples, paga. A primeira peça da segunda chance.', en: 'Delivered a nightstand to my neighbor. Small, simple, paid. The first piece of the second chance.' },
    ],
  },
  {
    slug: 'zuri-desenhar-de-novo', owner: 7, coverColor: '#4a7d91', category: 'art', moment: 'starting',
    totalDays: 30, currentDay: 10, streak: 7, progressPct: 33,
    title: { pt: 'Desenhar de novo, sem plateia', en: 'Drawing again, no audience' },
    goal: { pt: 'Parei de desenhar quando virou trabalho. Quero reaprender a desenhar só porque gosto.', en: 'I stopped drawing when it became work. I want to relearn drawing just because I love it.' },
    updates: [
      { day: 2, kind: 'step', pt: 'Dez minutos desenhando a caneca do café. Ficou torta. Não apaguei, não postei em lugar nenhum. Só deixei existir.', en: "Ten minutes drawing my coffee mug. It came out crooked. Didn't erase it, didn't post it anywhere. Just let it exist." },
      { day: 6, kind: 'learned', pt: 'Percebi que eu não perdi o traço — perdi a paciência com o traço ruim. São coisas diferentes.', en: "Realized I never lost my line — I lost patience with the bad lines. Those are different things." },
      { day: 10, kind: 'win', pt: 'Uma semana desenhando todo dia. Hoje meu filho sentou do lado e pediu pra desenhar junto. Melhor parte do mês.', en: 'A week of drawing every day. Today my kid sat next to me and asked to draw too. Best part of my month.' },
    ],
  },
  {
    slug: 'amira-sair-de-casa', owner: 8, coverColor: '#c88054', category: 'mind', moment: 'hardphase',
    totalDays: 30, currentDay: 16, streak: 5, progressPct: 53,
    title: { pt: 'Sair de casa todos os dias', en: 'Leaving the house every day' },
    goal: { pt: 'Depois de meses difíceis, meu combinado com a terapeuta é simples: pisar na rua uma vez por dia. Só isso.', en: 'After some hard months, my deal with my therapist is simple: step outside once a day. That’s all.' },
    updates: [
      { day: 3, kind: 'step', pt: 'Fui até a padaria da esquina. Pão, troco, "bom dia". Duzentos metros que valeram por uma maratona.', en: 'Walked to the corner bakery. Bread, change, "good morning." Two hundred meters that felt like a marathon.' },
      { day: 11, kind: 'setback', pt: 'Dois dias sem conseguir. Tudo bem. Aprendi que o meu "recomeçar" pode ser só abrir a janela e respirar fundo. Hoje foi isso.', en: 'Two days I couldn’t. That’s okay. I’ve learned my "starting again" can be just opening the window and breathing. Today, that was it.' },
      { day: 16, kind: 'win', pt: 'Fui a pé até a feira e voltei com flores. A moça perguntou se era aniversário. Falei que era véspera de recomeço.', en: 'Walked to the market and came back with flowers. The vendor asked if it was my birthday. I said it was the eve of a fresh start.' },
    ],
  },
  {
    slug: 'lina-sair-do-aluguel', owner: 9, coverColor: '#687d5f', category: 'money', moment: 'building',
    totalDays: 365, currentDay: 19, streak: 12, progressPct: 5,
    title: { pt: 'Um ano guardando pra entrada', en: 'One year saving for a down payment' },
    goal: { pt: 'Todo mês o aluguel me lembra que a casa não é minha. Vou guardar pouco, mas vou guardar sempre.', en: 'Every month the rent reminds me the house isn’t mine. I’ll save little, but I’ll save always.' },
    updates: [
      { day: 4, kind: 'step', pt: 'Abri uma poupança separada e transferi R$ 50. Parece nada perto do objetivo. Mas o cofre existe, e antes não existia.', en: 'Opened a separate savings account and moved the first bit in. Looks tiny next to the goal. But the vault exists now, and before it didn’t.' },
      { day: 12, kind: 'setback', pt: 'O carro quebrou e comi metade do que eu tinha guardado. Fiquei brava dois dias. Depois entendi: era exatamente pra isso que o dinheiro tava lá.', en: 'The car broke and ate half of what I’d saved. I was angry for two days. Then it clicked: that’s exactly what the money was there for.' },
      { day: 19, kind: 'win', pt: 'Recusei um jantar caro e ninguém morreu. Fiz macarrão em casa e transferi a diferença. Dia 19 e ainda estou aqui.', en: 'Skipped an expensive dinner and nobody died. Made pasta at home and transferred the difference. Day 19 and I’m still here.' },
    ],
  },
];

function pickText(value, locale) {
  if (!value || typeof value !== 'object') return value;
  return locale === 'pt' ? value.pt : value.en;
}

export function buildDemoStories(locale = 'pt') {
  return DEMO_STORIES.map((story) => {
    const owner = DEMO_OWNERS[story.owner];
    const updates = story.updates.map((update, index) => ({
      id: `${story.slug}-day-${update.day}`,
      day_number: update.day,
      kind: update.kind,
      text: pickText(update, locale),
      photo_url: null,
      video_url: null,
      order: index,
    }));

    return {
      id: `demo-${story.slug}`,
      slug: story.slug,
      isDemo: true,
      title: pickText(story.title, locale),
      goal: pickText(story.goal, locale),
      preview: updates.length ? updates[updates.length - 1].text : '',
      cover_color: story.coverColor,
      category: story.category,
      moment: story.moment,
      total_days: story.totalDays,
      owner,
      stats: {
        current_day: story.currentDay,
        streak: story.streak,
        progress_pct: story.progressPct,
        days_posted: updates.length,
      },
      updates,
    };
  });
}

export function getDemoStory(slug, locale = 'pt') {
  return buildDemoStories(locale).find((story) => story.slug === slug) || null;
}

export function buildDemoFeedItems(locale = 'pt') {
  return buildDemoStories(locale).map((story) => {
    const latest = story.updates[story.updates.length - 1];
    return {
      id: `feed-${story.slug}`,
      day_number: latest.day_number,
      kind: latest.kind,
      text: latest.text,
      photo_url: null,
      video_url: null,
      demo: true,
      encouraged: false,
      journey: {
        slug: story.slug,
        title: story.title,
        category: story.category,
        cover_color: story.cover_color,
      },
      owner: {
        ...story.owner,
        id: null,
        avatar_color: story.owner.avatarColor,
        avatar_url: story.owner.avatarUrl,
      },
    };
  });
}
