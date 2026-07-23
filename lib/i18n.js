// Dicionário PT/EN + helpers. Sem imports de servidor — usável no cliente também.
export const locales = ['en', 'pt'];

export const dictionaries = {
  en: {
    start: 'Start',
    hero1: 'Start small.',
    hero2: 'Keep going.',
    heroSub: 'Follow real journeys, post one honest step a day, and help people continue when it gets hard.',
    heroCta: 'Start a journey',
    seeReal: 'See a real journey',
    tagline: 'One day. One step up.',

    loginTitle: 'Start your journey',
    loginSub: 'One day. One step up.',
    continueGoogle: 'Continue with Google',
    openingGoogle: 'Opening Google…',
    loginTerms: 'By continuing you agree to keep going, one day at a time.',
    loginError: 'Could not sign in. Please try again.',

    signOut: 'Sign out',
    yourJourneys: 'Your journeys',
    homeTitle: 'What moved forward today?',
    newJourney: '+ New journey',
    noJourneyTitle: 'No journey yet.',
    noJourneySub: 'Start one in under a minute. Pick something real and post the first step.',
    createFirst: 'Create your first journey',
    dayOf: 'Day {d} of {t} · {s} day streak',
    viewPublic: 'View public ↗',

    kindStep: 'Step',
    kindWin: 'Small win',
    kindSetback: 'Setback',
    kindLearned: 'Learned',
    composerPh: 'Post day {n}: one honest step from today',
    post: 'Post',
    posting: 'Posting…',
    postError: 'Could not post. Try again.',
    setbackNote: 'A setback still counts as showing up. Your streak stays safe.',

    back: 'Back',
    createEyebrow: 'Create',
    createTitle: 'Start a journey in under a minute.',
    createSub: 'Pick something real, post the first step, come back tomorrow.',
    fName: 'Journey name',
    fNamePh: 'Ex.: 30 days drawing again',
    fCategory: 'Category',
    fDuration: 'Duration',
    fWhy: 'Why are you starting?',
    fWhyPh: 'What do you want to build, change or overcome?',
    fFirst: 'First update',
    fFirstPh: 'What is the first small step you can post today?',
    createBtn: 'Create journey',
    creating: 'Creating…',
    createError: 'Could not create the journey. Try again.',
    catArt: 'Art', catLife: 'Life', catBody: 'Body', catHome: 'Home', catWork: 'Work',
    dur7: '7 days', dur30: '30 days', dur60: '60 days', dur100: '100 days',

    publicJourney: 'Public journey',
    startYourJourney: 'Start your journey',
    daysPosted: 'days posted',
    dayStreakLabel: 'day streak',
    progress: 'progress',
    tagSetback: 'Setback · still counts',
    tagWin: 'Small win',
    followingQ: "Following {name}'s progress?",
    encourageSub: 'Encourage this journey and start your own.',
    encourageJoin: 'Encourage & join',
    dayXofY: 'Day {d} of {t}',
    dayShort: 'Day {d}',

    nfTitle: 'Journey not found',
    nfSub: 'This journey may be private or the link may be wrong.',
    nfCta: 'Go to One Up Day',
  },
  pt: {
    start: 'Começar',
    hero1: 'Comece pequeno.',
    hero2: 'Siga em frente.',
    heroSub: 'Acompanhe jornadas reais, poste um passo honesto por dia, e ajude pessoas a continuar quando aperta.',
    heroCta: 'Começar uma jornada',
    seeReal: 'Veja uma jornada real',
    tagline: 'Um dia. Um passo a mais.',

    loginTitle: 'Comece sua jornada',
    loginSub: 'Um dia. Um passo a mais.',
    continueGoogle: 'Continuar com o Google',
    openingGoogle: 'Abrindo o Google…',
    loginTerms: 'Ao continuar, você promete seguir em frente, um dia de cada vez.',
    loginError: 'Não foi possível entrar. Tente de novo.',

    signOut: 'Sair',
    yourJourneys: 'Suas jornadas',
    homeTitle: 'O que avançou hoje?',
    newJourney: '+ Nova jornada',
    noJourneyTitle: 'Nenhuma jornada ainda.',
    noJourneySub: 'Comece em menos de um minuto. Escolha algo real e poste o primeiro passo.',
    createFirst: 'Criar sua primeira jornada',
    dayOf: 'Dia {d} de {t} · sequência de {s} dias',
    viewPublic: 'Ver público ↗',

    kindStep: 'Passo',
    kindWin: 'Vitória',
    kindSetback: 'Recaída',
    kindLearned: 'Aprendi',
    composerPh: 'Poste o dia {n}: um passo honesto de hoje',
    post: 'Postar',
    posting: 'Postando…',
    postError: 'Não foi possível postar. Tente de novo.',
    setbackNote: 'Uma recaída ainda conta como presença. Sua sequência continua salva.',

    back: 'Voltar',
    createEyebrow: 'Criar',
    createTitle: 'Comece uma jornada em menos de um minuto.',
    createSub: 'Escolha algo real, poste o primeiro passo, volte amanhã.',
    fName: 'Nome da jornada',
    fNamePh: 'Ex.: 30 dias desenhando de novo',
    fCategory: 'Categoria',
    fDuration: 'Duração',
    fWhy: 'Por que você está começando?',
    fWhyPh: 'O que você quer construir, mudar ou superar?',
    fFirst: 'Primeiro update',
    fFirstPh: 'Qual o primeiro passo pequeno que você pode postar hoje?',
    createBtn: 'Criar jornada',
    creating: 'Criando…',
    createError: 'Não foi possível criar a jornada. Tente de novo.',
    catArt: 'Arte', catLife: 'Vida', catBody: 'Corpo', catHome: 'Casa', catWork: 'Trabalho',
    dur7: '7 dias', dur30: '30 dias', dur60: '60 dias', dur100: '100 dias',

    publicJourney: 'Jornada pública',
    startYourJourney: 'Começar sua jornada',
    daysPosted: 'dias postados',
    dayStreakLabel: 'dias de sequência',
    progress: 'progresso',
    tagSetback: 'Recaída · ainda conta',
    tagWin: 'Vitória',
    followingQ: 'Acompanhando o progresso de {name}?',
    encourageSub: 'Incentive esta jornada e comece a sua.',
    encourageJoin: 'Incentivar e entrar',
    dayXofY: 'Dia {d} de {t}',
    dayShort: 'Dia {d}',

    nfTitle: 'Jornada não encontrada',
    nfSub: 'Esta jornada pode ser privada ou o link pode estar errado.',
    nfCta: 'Ir para o One Up Day',
  },
};

export function getDict(locale) {
  return dictionaries[locale] || dictionaries.en;
}

export function pickLocale(cookieLocale, acceptLanguage) {
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
  if (acceptLanguage && acceptLanguage.toLowerCase().trim().startsWith('pt')) return 'pt';
  return 'en';
}

// substitui {chave} pelos valores passados
export function fill(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}
