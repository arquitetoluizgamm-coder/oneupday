// Dicionário PT/EN + helpers. Sem imports de servidor — usável no cliente também.
export const locales = ['en', 'pt', 'es'];

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
    loginTerms: 'Here, coming back is always welcome.',
    loginError: 'Could not sign in. Please try again.',

    signOut: 'Sign out',
    yourJourneys: 'Your journeys',
    homeTitle: 'What moved forward today?',
    feedQuestion: 'Who’s moving forward with you', manageJourneys: 'My journeys', todayCta: 'Log today’s step',
    newJourney: '+ New journey',
    noJourneyTitle: 'No journey yet.',
    noJourneySub: 'Start one in under a minute. Pick something real and post the first step.',
    createFirst: 'Create your first journey',
    dayOf: 'Day {d} of {t}',
    viewPublic: 'View public ↗',
    tabAll: 'All', tabFollowing: 'Following', followingEmptyTitle: "You're not following anyone yet", followingEmptySub: 'Follow a journey and it shows up here. Explore people in motion.',
    followBack: 'Follow back',
    musicAdd: '\u{1F3B5} Music', musicTitle: 'Pick a track', musicUse: 'Use', musicRemove: 'Remove', musicEmpty: 'No results.', musicSearchPh: 'Search music…', musicKeyNeeded: 'Music not set up yet.',
    wizBack: 'Back', wizNext: 'Continue', wizStep: '{n} of {t}', publishJourney: 'Publish journey',
    wzUpOpen: 'See examples', wzUpClose: 'Hide examples', wzUpQ1: 'Want a few ideas for a goal that feels like yours?', wzUpQ2: 'Want to turn that goal into one simple action?', wzUpQ5: 'What made today the day you decided to begin?',
    wzUpEx1: ['Get back to training', 'Sleep better', 'Start studying again', 'Organize my life', 'Start a project', 'Take better care of my health', 'Stop a habit', 'Make more time for myself'],
    wzUpEx2: ['Walk for 20 minutes', 'Study one lesson', 'Drink more water', 'Write the first paragraph', 'Put away one drawer', 'Call someone I miss'],
    wzUpEx5: ['I took the first step', 'I got tired of postponing it', 'Someone encouraged me', 'I had a little time today', 'I want to try again'],
    wizT1: 'What is your goal?', wizS1: 'Tell us what you want to change or start.', wizT2: 'What will you do?', wizS2: 'Describe one simple action.', wizT3: 'How many times a week?', wizT4: 'Your first day',
    wizTcat: 'Category', wizScat: 'Helps the right people find your journey.', wizTmom: 'Life moment', wizSmom: 'Optional — connects you to people going through the same.', wizTpriv: 'Privacy', wizSpriv: 'You decide who sees it. You can change it later.',
    wizS1: 'Tell us what you want to change or start.', wizS2: 'Describe one simple action.', wizS3: 'A simple number is enough.', wizS4: 'Your first step starts today.',
    managePost: 'Manage', mediaReplace: 'Replace media', mediaRemove: 'Remove media', postDelete: 'Delete post', postDeleteConfirm: "Delete this post? This can't be undone.",
    followersTitle: 'Followers', followersNone: "No one follows your journeys yet — when someone does, they'll show up here.", followersWho: 'People walking with you', supportersMineTitle: 'People supporting you', supportersMineWho: 'They hugged you or supported your posts:',

    trTag: 'Before & after', trDayFmt: 'Day {d}', trGap: '{n} days between the two', trSee: 'see the journey', amTitle: 'Tomorrow around here', amComecou: '{name} started today', amTermina: '{name} finishes tomorrow', amChegou: '{name} reached day {t}', amMarco: '{name} reaches day {d} tomorrow', rtTitle: 'Came back this week', rtCame: '{name} came back after {d} days', rtCta: 'welcome them back', rtSent: 'sent 💛', 
    stepQ: 'What is your next step?', stepPh: 'e.g., walk 25 minutes', stepWhenQ: 'When?', stepWhens: ['tomorrow morning','tomorrow evening','tomorrow','this week'], stepSave: 'Open the chapter', stepNote: 'Optional. It appears on your post so people can follow how it goes.', stepBack: 'comes back with the result', stepFollow: 'I want to see how it goes', stepFollowing: 'following this step', stepDecided: 'Yesterday {name} decided:', stepResult: 'Result', stepOpen: 'This chapter is still open', stepResume: 'Pick up where I left off', notifStepResult: '{name} came back with the result 👀', 
    espTeaser: 'I noticed something.', espEyebrow: 'Upi', espClose: 'close', espPalavra: 'The word “{t}” showed up in {n} of your first days. It hasn’t appeared in {d} days.', espTempo: 'You used to write “I wanted to”. Now you write “I did”.', espTom: 'The weight left your sentences.', espRitmo: 'At first you showed up every {a} days. Now it is almost every day.', pqEyebrow: 'On day 1 you wrote why this mattered:', 
    capTitle: 'Skills you are building', capNote: 'This comes from your own records. Nothing here is compared to anyone else.', capVoltar: 'Your ability to come back is growing.', capVoltarAntes: 'Before, a pause lasted {d} days on average.', capVoltarAgora: 'In the last {n} times, you came back within {d} days.', capVoltarMaior: 'The longest pause you crossed was {d} days — and you came back.', capDificil: 'You are learning to keep going on the hard day.', capDificilProva: 'After {t} hard days you recorded, you came back the next day in {n} of them.', capPresenca: 'Your consistency is becoming routine.', capPresencaProva: '{d} days in a row without a single pause.', 
    wizWhyNote: 'You can change it later, when the reason gets clearer.',
    momInviteTitle: 'Want to walk with people in the same moment?', momInviteSub: 'Optional. It only helps you find people going through something similar.', momInviteDone: 'Done.', momInviteSee: 'See who is in the same moment', 
    wizPreview: 'Your journey',
    pcTitle: 'What did you notice in this person?', pcSub: 'Not a like — a recognition. They will see it.', pcDone: 'Recognized 💛', pcBlockTitle: 'What people notice in you', pcByN: 'by {n} people', pcTipos: { coragem: 'Courage to start', voltar: 'Coming back after stopping', honestidade: 'Telling the truth about the day', sem_perfeicao: 'Continuing without being perfect', adaptar: 'Changing course when needed', limite: 'Respecting a limit', mudanca: 'A change that showed up now', presenca: 'Showing up on a hard day', acompanho: 'I am following along', inspirou: 'This inspired me' }, notifPercepcao: '{name} noticed something in you 👀', 
    hjOi: 'Hello, {name}.', hjPergunta: 'What deserves a step from you today?', hjDisse: 'You said today you would:', hjFeito: 'You already logged today. The day is saved.', hjCta: 'Log the day', anTitle: 'In progress', anVoltou: '{name} came back with the result', anQuase: '{name} is on day {d} of {t}', anEsperando: '{name} has not come back yet', anVer: 'see result', anAcompanhar: 'follow along', 
    ecoTag: 'AI of One Up Day', ecoWhy: 'why am I seeing this?', ecoDel: 'delete', ecoWhyText: 'The Upi leaves the first observation when a post has no comments yet, based only on what happened in your journey — never on guesses about you. You can turn this off in your profile.', ecoDelConfirm: 'Delete this observation from Upi?', ecoTitle: 'First Echo', ecoSub: 'When a post of yours has no comments, the Upi leaves an observation about what happened. Always identified as AI.', ecoOn: 'On', ecoOff: 'Off', notifEco: 'Upi left an observation on your day', 
    kindStep: 'Step',
    kindWin: 'Small win',
    kindSetback: 'Setback',
    kindLearned: 'Learned',
    composerPh: 'Day {n}: what was your step today?',
    // usado quando a pergunta do dia ja esta acima do campo:
    // repetir a pergunta dentro dele desperdicava o unico lugar
    // da tela onde cabia dizer que uma linha ja basta.
    phLivre: 'Write here. One line is already a record.',
    post: 'Post',
    posting: 'Posting…',
    postError: 'Could not post. Try again.',
    setbackNote: 'A hard day still counts as showing up. Nothing is lost.',

    back: 'Back',
    createEyebrow: 'Create',
    createTitle: 'Start a journey in under a minute.',
    createSub: 'Pick something real, post the first step, come back tomorrow.',
    fName: 'What challenge do you want to start?',
    fNamePh: 'Start drawing again',
    fCategory: 'Category',
    fDuration: 'For how long',
    fWhy: 'Why does this matter to you?',
    fWhyPh: 'Write it for yourself two weeks from now, on a hard day.',
    fFirst: 'What was your first step today?',
    fFirstPh: 'What did you do today? One line is enough.',
    createBtn: 'Begin',
    creating: 'Beginning…',
    createError: 'Could not create the journey. Try again.',
    catArt: 'Art', catLife: 'Life', catBody: 'Body', catHome: 'Home', catWork: 'Work',
    catStudy: 'Study', catHealth: 'Health', catMind: 'Mind', catMoney: 'Money',
    catRelationship: 'Relationships', catHabit: 'Habits', catCreative: 'Creativity', catOther: 'Other',
    customCatPh: 'Name your topic', editPhoto: 'Change photo',
    ritualQ: 'What was your step today?',
    rDid: 'I did it', rTried: 'I tried', rPaused: 'Had to pause, but I\u2019ll be back',
    // O selo de um dia marcado sem relato. Uma palavra, nunca uma frase:
    // frase soaria como a pessoa falando, e n\u00e3o foi ela quem escreveu.
    seloFiz: 'Did it', seloTentei: 'Tried', seloParei: 'Paused', seloComecei: 'Started',
    // Photo description. `altReserva` is the fallback shown when nobody
    // wrote one — two true facts beat silence.
    // The question above the composer. Never inserted into the text —
    // it is a question, not the beginning of someone's sentence.
    pergPasso: 'Did you manage to {p}?',
    pergDia1: 'How will you know you moved forward?',
    pergDepoisDeDificil: 'What do you want today to have that yesterday did not?',
    pergMarco: 'What is different now, compared to day one?',
    pergGerais: ['What did you do today, however small?', 'What got in the way?', 'What is the next concrete step?'],
    pergOutra: 'another question',
    // Help with the title. The AI asks one question; the title is built
    // from HER answer. Never a menu of ready-made titles.
    ajBtn: 'Help me make it clearer', ajPensando: 'One moment\u2026', ajRetry: 'Try again',
    ajPh: 'Answer in your own words', ajUsar: 'Use this', ajPular: 'Skip',
    ajErro: 'Could not do it now. Write it your way \u2014 that works too.',
    // One question per screen. Each head is a question, not a form label.
    wzTTempo: 'For how long?', wzSTempo: 'You can change this later. Nothing here is a contract.', wzActionPh: 'Walk 20 minutes',
    wzTHoje: 'What made today the day?', wzSHoje: 'This becomes your day 1. It is the part nobody else can write.',
    wzTMidia: 'A photo or a video?', wzSMidia: 'Optional. A journey is not worth less in text.',
    wzTRev: 'Is this it?', wzSRev: 'Everything here can still be changed.',
    wzHojePh: 'What happened today that made you start',
    ajPorque: 'Help me say it better', ajPrimeiro: 'Turn this into my day 1',
    wzRevTitulo: 'Title', wzRevPorque: 'Why it matters', wzRevTempo: 'Duration',
    wzRevDia1: 'Day 1', wzRevCat: 'Category', wzRevEditar: 'edit',
    wzTPratica: 'How many times a week?', wzSPratica: 'A simple number is enough.',
    wzPraticaPh: '3 times', wzTRitmo: 'For how many days?', wzSRitmo: 'You can change this later.',
    ritmoDiario: 'Every day', ritmo3x: 'Three times a week', ritmoFds: 'Weekends', ritmoOutro: 'Custom',
    ritmoOutroPh: 'Describe your pace', wzRevPratica: 'Practice', wzRevRitmo: 'Pace',
    ajOpcoes: 'Give me starting points', ajObservavel: 'Make it observable',
    wzPular: 'Skip this',
    // Os três botões de card. O rótulo vem partido: o verbo se repete
    // nos três e o olho vai direto ao que muda.
    caVerbo: 'Share', caJornada: 'journey card', caDia: 'day 1 card',
    caChamarVerbo: 'Invite', caChamarObj: 'a friend',
    altLabel: 'Photo description', altPh: 'What is in the image?',
    altPensando: 'Drafting a description\u2026',
    altOk: 'This is what screen reader users will hear.',
    altVazio: 'Without a description they only hear \u201cimage\u201d.',
    altReserva: 'Photo from day {d} of the journey {j}.',
    // rDidText / rTriedText / rPausedText: aposentados no patch 78.
    // Ficam aqui porque lib/registro.js precisa reconhec\u00ea-los no que
    // j\u00e1 foi publicado antes da corre\u00e7\u00e3o.
    rDidText: 'I did what I set out to do today.',
    rTriedText: 'I tried today. It counts.',
    rPausedText: 'Hard day. I had to pause, but I\u2019m coming back.',
    momentQ: 'What moment are you in?', momentAll: 'All moments',
    mStarting: 'Starting over', mNotgiveup: 'Trying not to give up', mRebuilding: 'Rebuilding my routine',
    mHealth: 'Caring for my health', mCourage: 'Finding courage', mHardphase: 'Going through a hard time', mBuilding: 'Building something quietly',
    companionTitle: 'See how far you’ve come back.', companionBtn: 'See my progress', companionLoading: 'Looking at your journey\u2026',
    retroLink: 'Recap', retroTitle: 'Your journey so far', retroDays: 'days you showed up', retroBack: 'times you came back', retroProgress: 'of the way there',
    retroStarted: 'You started on {d}. Since then, you kept showing up.',
    retroHighlights: 'Moments that mattered', retroNothing: 'Post your first steps to build your recap.',
    groupPeople: '{n} people in this moment', groupIntro: 'One step at a time, together.', groupEmpty: 'Be the first one here \u2014 and others will follow.', groups: 'Communities', optional: 'optional', aiWrite: '\u2728 Help me write', aiThinking: 'Thinking\u2026', aiNextStep: 'Suggest my next step',
    dur7: '7 days', dur30: '30 days', dur60: '60 days', dur100: '100 days', durCustom: 'Custom…', durCustomLabel: 'How many days?', durCustomPh: 'e.g., 21', durHint: 'If you stop along the way, nothing is lost. You continue from where you left off.', durDaysWord: 'days',
    mediaAdd: '+ Photo or video', mediaEyebrow: 'ADD', mediaTitle: 'Photo or video', mediaPick: 'Choose a photo or video', mediaReplace2: 'Change', mediaDest: 'Where does it go?', mediaDestJourney: 'Into a journey', mediaDestJourneySub: 'Adds it to a specific day', mediaDestAlbum: 'To my album', mediaDestAlbumSub: 'A personal gallery on your profile', mediaWhichJourney: 'Which journey', mediaWhichDay: 'Which day', mediaWhoSees: 'Who can see it', mediaSave: 'Add', albumTitle: 'Album', epBtn: 'Edit profile', epTitle: 'Edit profile', epName: 'Name', epHandle: 'Username', epHint: 'Changing your username also changes your public link.', epSave: 'Save', epSaving: 'Saving…', epCancel: 'Cancel', epErrName: 'Name cannot be empty.', epErrHandle: 'Username must be 3–20 characters — letters, numbers, dots or _.', epErrTaken: 'This username is already taken.', epErrSave: 'Could not save. Try again.', jDeleteBtn: 'Delete', jDeleteConfirm: 'Delete the journey \u201c{title}\u201d? All its posts and support will be gone. This cannot be undone.', jDeleteErr: 'Could not delete. Try again.', ejBtn: 'Edit', ejTitle: 'Edit journey', ejName: 'Journey name', ejGoal: 'Why it matters', ejCover: 'Journey photo', ejCoverAdd: 'Add photo', ejCoverChange: 'Change photo', ejCoverRemove: 'Remove photo', mediaRemoveConfirm: 'Remove this photo from the post? The text stays.', euBtn: 'Edit', euTitle: 'Edit day {d}', euText: 'What you wrote', euPhoto: 'Photo of the day', euErrEmpty: 'The day needs text or a photo.', euDeletePost: 'Delete this post', jdShow: 'Edit timeline days', jdHide: 'Hide days', jdEmpty: 'No days yet.', jdLoading: 'Loading…', jfOpen: 'Open journey', jfClose: 'Close', mediaAddShort: '+ Photo', newJourneyShort: '+ Journey', dpPrev: 'Previous day', dpNext: 'Next day', dayOfShort: 'Day {d} / {t}',
    chTitle: 'Challenges', chBtn: 'Challenge', chModalTitle: 'Send a challenge', chWhat: 'The challenge', chPh: 'e.g., Drink 2L of water a day', chDays: '{d} days', chSend: 'Send challenge', chSending: 'Sending…', chSent: 'Challenge sent. Now it is up to {name}.', chErrExists: 'You two already have an open challenge.', chErrConn: 'Challenges are between people who follow each other.', chErr: 'Could not send. Try again.', chInviteFrom: '{name} challenged you', chAccept: 'Accept', chDecline: 'Decline', chWaiting: 'Waiting for {name}…', chTogether: 'Walking together · no winner', chCheck: 'Done today', chChecked: 'You showed up today', chPresence: '{n} of {d} days', chDone: 'Challenge complete. Both stories grew.', chOpen: 'Open', chPageEyebrow: 'Challenge', chEmpty: 'Challenge someone to walk together — open the profile of a person you follow and tap Challenge.', chStripTag: 'Challenge in progress', chStripSee: 'follow along', chStamp: 'Stamp with a photo', firstDayDefault: 'It begins.', pushTitle: 'Notifications on this device', pushTest: 'Send test', pushTestSent: 'Sent. It should arrive in a moment.', pushTestFail: 'Could not send. Try turning it off and on again.', pushOnSub: 'You will hear about support, comments and your daily invitation.', pushOffSub: 'Turn on to know when someone supports you — and to get Upi’s daily invitation.', pushDenied: 'Notifications are blocked in your phone settings for this app.', pushTurnOn: 'Turn on', pushTurnOff: 'Turn off', pushWait: 'Just a second…', chRemovePhoto: 'Remove photo', chRemovePhotoConfirm: 'Remove this day photo? Your presence stays.', notifComment: '{name} commented on your journey 💬', notifChallenge: '{name} sent you a challenge 🤝', notifChallengeAccept: '{name} accepted your challenge', ejErrTitle: 'The name cannot be empty.', profTabJourneys: 'Journeys', profTabQuotes: 'Quotes', quotesEmpty: 'No quotes here yet.', quotesEmptyCta: 'Create a quote', profTabAlbum: 'Album', profTabPeople: 'People', albumEmpty: 'Your photos and videos live here.', albumEmptyCta: 'Add photo or video', mediaDelete: 'Delete', mediaDeleteConfirm: 'Delete this photo? This can’t be undone.', cropOriginal: 'Original', cropCover: 'Cover', cropSquare: 'Square', cropPortrait: 'Portrait', cropLandscape: 'Landscape', cropUse: 'Use photo', cropEdit: 'Edit framing', cropCancel: 'Cancel', cropHint: 'Drag to reposition · pinch/slider to zoom', cropHintOriginal: 'Full photo, nothing cropped', cropZoom: 'Zoom',

    publicJourney: 'Public journey',
    startYourJourney: 'Start your journey',
    daysPosted: 'days posted', daysPostedOne: 'day posted', moreOptions: 'More options', startCta: 'Start my journey', recordsFmt: '{n} records this day',
    dayStreakLabel: 'days of presence', dayStreakLabelOne: 'day of presence',
    progress: 'progress',
    tagSetback: 'Hard day · still counts',
    tagWin: 'Small win',
    followingQ: "Following {name}'s progress?",
    encourageSub: 'Encourage this journey and start your own.',
    encourageJoin: 'Encourage & join',
    dayXofY: 'Day {d} of {t}',
    dayShort: 'Day {d}',

    nfTitle: 'Journey not found',
    nfSub: 'This journey may be private or the link may be wrong.',
    nfCta: 'Go to One Up Day',
    shareTitle: 'Let someone follow your path.',
    shareSub: 'A clean card that travels to Stories, WhatsApp and more.',
    shareCard: 'Download share card',
    fjEyebrow: 'YOUR TURN', fjTitle: 'Start your journey, {name}', fjSub: 'One small step, shared. Come back tomorrow and keep going.', fjCta: 'Start my first journey', fjHint: 'It takes a minute. You choose who can see it.',
    homeWelcomeNewEyebrow: 'ONE STEP AT A TIME', homeWelcomeNewTitle: 'What is your first step?', homeWelcomeNewSub: 'Create a simple journey and record what really happens, without pressure.', homeWelcomeNewCta: 'Start my journey', homeWelcomeSkip: 'Skip and explore the feed', homeWelcomeBackEyebrow: 'Good to see you, {name}.', homeWelcomeBackTitle: 'How do you want to continue today?', homeWelcomeBackSub: 'Choose a journey to record today or find someone to support.', homeWelcomeRegister: 'Log today', homeWelcomeDay: 'Day {d} of {t}', homeWelcomeJourneySub: 'A presence can change someone’s day.',
    successContinue: 'Continue to my journey',
    demoLabelDemo: 'See how a journey works', demoExample: 'Example',
    dia1PageTitle: 'What\u2019s your Day 1?', dia1PageSub: 'Every restart has a Day 1. See today\u2019s — and start yours.', dia1PageCta: 'Start my Day 1', dia1Wall: 'Day 1 happening now', dia1CampaignsTitle: 'A reason to start now',
    privacyQ: 'Who can see this?',
    pubPublicSub: 'Shows in the feed. Anyone can follow and support.', pubFollowersSub: 'Only people who already follow you. Never shown to strangers.', pubPrivateSub: 'Only you. No one else sees it, not even on your profile.',
    aiCareQ: 'Rough day? You don\u2019t have to do this alone.', aiCareLight: 'Write this more gently', aiCareStep: 'Smallest step for tomorrow',
    aiConsent: 'The AI uses only your own entries to help.', aiOff: 'Turn off', aiOffState: 'AI companion is off.', aiReactivate: 'Turn on', aiErr: 'Couldn\u2019t do that now. Try again in a moment.', aiRateErr: 'You\u2019ve used the AI a lot for now. Try again later.',

    dia1CardBtn: 'Download my Day 1 card', dia1Eyebrow: 'MY DAY 1', dia1Big: 'Day 1', dia1Invite: 'What\u2019s your Day 1?', dia1By: 'by',
    challengeBtn: 'Invite a friend to start together', challengeMsg: 'Today is my Day 1 of {theme}. Want to start yours with me?',
    movementTitle: 'Be part of the movement', movementSub: 'Every Day 1 invites someone else to begin.',
    shareDownloading: 'Preparing…',
    encourage: 'Encourage',
    encouraged: 'Encouraged',
    addPhoto: 'Add photo',
    photoAdded: 'Photo ready',
    uploading: 'Uploading…',
    before: 'Before',
    now: 'Now',
    obTitle: 'Welcome, {name}. Start your first journey.',
    obSub: 'Pick something real, post one step today, and come back tomorrow. That is the whole game.',
    obStep1: 'Start a journey',
    obStep2: 'Post one honest step',
    obStep3: 'Keep going tomorrow',
    follow: 'Follow',
    following: 'Following',
    feedTitle: 'Journeys in motion',
    trendingTitle: 'Happening now',
    goalWord: 'Goal',
    withYouIdle: 'I\u2019m with you', withYouActive: 'With you', supporters: 'See who is with you', supportersLoading: 'Loading\u2026', supportersEmpty: 'You are the first to show up here.', supportStrip: 'With {name} on this journey', supportingFmt: 'Supporting {name}', heartTitle: 'While you were away', heartLikes: 'supported you', heartFollows: 'started following you', heartEmpty: 'Nothing new here yet.', heartSeeAll: 'See notifications', progressFmt: '{d} days recorded', suggestTitle: 'People to support', suggestNewcomer: 'just starting', suggestSub: 'Start following others who are trying too', moodQ: 'How are you?', prompts: ['What was hard today', 'A small step I took', 'Something I learned', 'Why I keep going'], moodDown: 'feeling low', moodAnxious: 'anxious', moodAngry: 'angry', moodTired: 'tired', moodMotivated: 'motivated', moodHappy: 'happy', moodGrateful: 'grateful', dailyMoodTitle: 'How are you feeling today?', dailyMoodSub: 'Just to continue your journey. It shows softly on your avatar today.', dailyMoodSkip: 'Not now', demoC1: 'Rooting for you 💛', demoC2: 'One day at a time. You’ve got this.', demoC3: 'So inspiring to see this here.', hugLabel: 'Send a hug', hugToast: 'You hugged {name} 🤗', meToo: 'Me too', meTooQ: 'I have been through this too', meTooBack: 'I also came back after stopping', meTooTrying: 'I am still trying', meTooHard: 'Today was hard for me too', meTooJust: 'Just “me too”', meTooDone: 'Received 💛', meTooAuthor: 'You are not alone in this.', meTooCountFmt: '{n} people have been here too', notifMeToo: 'Someone has been through what you shared. You are not alone 💛', notifHug: '{name} sent you a hug 🤗', notifMoodLow: 'How about sending {name} a hug today?', notifComeback: '{name} came back after a break 💪 Send some support.', notifWelcome: 'Your Day 1 has begun. We’re with you 💛', milestoneFmt: 'Milestone · Day {d} 🎉', needsTitle: 'Someone needs you today', needsCta: 'send support', needsSent: 'support sent 💛', comebackFmt: 'came back after {d} days 💪',
    comment: 'Comment', commentClose: 'Close', commentEmpty: 'No comments yet. Keep it kind.', commentPlaceholder: 'Write something supportive\u2026', commentSend: 'Send', commentSending: 'Sending\u2026',     commentPendente: 'Got it. This comment goes through a quick review before it shows up.',
    commentUnsafe: 'That message does not fit this space.', commentError: 'Could not send. Try again.', commentSomeone: 'Someone',
    commentReply: 'Reply', commentMore: 'View more comments', commentLess: 'Show fewer comments', commentReplying: 'Replying to {name}', commentCancel: 'Cancel',
    messages: 'Messages', messageSearch: 'Search a person by name or @handle', messageEmpty: 'No conversations yet.', messageChoose: 'Choose a conversation to start.', messageStart: 'Say something supportive to begin.', messagePlaceholder: 'Write a private message…', messageSend: 'Send', messageSending: 'Sending…', messageError: 'Could not send this message.', messageConnection: 'You can message people after one of you follows the other.', messageSent: 'Sent', messageSeen: 'Seen', filterLabel: 'Filter', filterAll: 'All', moreText: 'more', lessText: 'less',
    shareShort: 'Share', linkCopied: 'Link copied!',
    videoFill: 'Fill', videoFit: 'Fit',
    ejCategory: 'Category', ejDuration: 'Length', ejPrivacy: 'Who can see it',
    ejDurMin: 'You are on day {d} — the goal cannot be shorter than that.',
    ejDurNote: 'Changing the goal does not erase a single day you have logged.',
    wizWhyOptional: 'optional', wizPrivShort: 'Who will see it: {v}', wizPrivChange: 'change',
    mailOr: 'or',
    mailLabel: 'Email address', mailPh: 'your@email.com',
    mailSend: 'Continue with email', mailSending: 'Sending…',
    mailSent: 'We sent a 6-digit code to {email}. It expires in a few minutes.',
    mailCode: '6-digit code', mailEnter: 'Enter', mailChecking: 'Checking…',
    mailResend: 'Send another code', mailWait: 'Send another in {s}s',
    mailChange: 'Use another email',
    mailErr: 'Could not send the code. Try again.',
    mailRate: 'Too many attempts. Wait a minute and try again.',
    mailBadCode: 'This code is not right, or it expired. Ask for another one.',
    aboutTitle: 'What is One Up Day',
    aboutText: 'One Up Day is a social network for personal progress. You create a journey — getting back to training, studying, quitting smoking, finally starting a project — and record it one day at a time, with text, a photo or a video. Friends follow along and support you. There is no ranking and no public like counter. If you stop, nothing is lost: coming back is always welcome.',
                heroDesc: 'A social network for following real change, one day at a time — no competition, and your story stays when you pause.',
    heroOnde: 'Works in the browser and on your phone.',
    passo1T: 'Start',  passo1D: 'Pick what you want to change.',
    passo2T: 'Log it', passo2D: 'Say how the day went.',
    passo3T: 'Get support', passo3D: 'People follow along with you.',
    passo4T: 'Come back', passo4D: 'Pick up where you left off.',
        tesePausa: 'If you need to stop, your story picks up right here.',
    difTitle: 'What does not exist here',
    dif: [
      'No ranking.',
      'No public like counter.',
      'No streak that resets.',
      'Pauses do not erase progress.',
      'Support and comments along the way.',
    ],
    segTitle: 'Your journey, on your terms',
    seg: [
      'You control who can follow along.',
      'We do not sell your vulnerability.',
      'No public competition.',
      'You can delete your content.',
    ],
    sobreTitle: 'About One Up Day',
    sobreTexto: 'One Up Day is a personal progress social network where people create journeys to track changes, habits, studies, projects and other personal goals. Each user can publish chapters of their progress, receive support from the community and continue their story even after a pause.',
            ascTitulo: 'Follow this journey',
    ascSub: 'We will let you know when the next page is written. No account needed.',
    ascCta: 'Keep me posted',
    ascIndo: 'One moment…',
    ascSeguindoT: 'You are following along',
    ascSeguindoP: 'We will let you know when the next chapter arrives.',
    ascParar: 'Stop',
    ascErro: 'That did not work. Try again.',
    exemploSelo: 'Example · demo journey',
    exemploDias: 'days posted',
    exemploPresenca: 'days present',
    exemploProgresso: 'progress',
    acaoT: 'See a journey in progress',
    acao1: 'Current day of the journey',
    acao2: 'Chapter published',
    acao3: 'Next step defined',
    comoTitle: 'How it works',
    como1T: 'Pick something you want to change',
    como1D: 'Study, health, career, a relationship or a stalled project.',
    como2T: 'Log one day at a time',
    como2D: 'Every post becomes a chapter of your journey.',
    como3T: 'Stop and come back without losing the story',
    como3D: 'Here, a pause does not erase your progress.',
    confiTitle: 'Your progress, on your terms',
    confi: [
      'You choose who can see each journey.',
      'No public ranking and no like counter.',
      'No streak that resets when you slip.',
      'Your vulnerability never becomes a product.',
      'You can delete your content whenever you want.',
    ],
    estadoT: 'Working product',
    estadoD: 'Runs in the browser and on your phone. Built and tested on real journeys.',
    verComo: 'See how it works',
    emAcaoT: 'A journey in progress',
    emAcaoD: 'This is how a day becomes part of your story.',
    aboutLead: 'One Up Day is a social network for personal progress.',
    aboutBody: 'You start a journey, log one day at a time — with text, photo or video — and your friends follow along and cheer you on.',
    aboutExamples: ['get back to training', 'study', 'quit smoking', 'finally start that project'],
    aboutRule: 'There is no ranking and no public like counter. If you stop, nothing is lost: coming back is always welcome.',
    aboutData: 'To create your account, One Up Day uses Google sign-in and receives only your name, email address and profile picture. Nothing else is requested, and nothing is shared with third parties.',
    ejSaved: 'Saved',
    navQuote: 'Quote',
    citTitle: 'Turn a sentence into an image',
    citSub: 'Write something you want to keep. Pick a background. Save or share.',
    citPh: 'Coming back does not require willpower.',
    citPreview: 'Preview of the card',
    citBg: 'Backgrounds that fit',
    citHint: 'The dimmed ones do not fit this text. Shorten it and they come back.',
    citTooLong: 'Text too long for this background',
    citAuthor: 'Signature (optional)',
    citAuthorPh: '@yourhandle',
    citPost: 'Post',
    citPosting: 'Posting…',
    citPostError: 'Could not post. Try again.',
    citWhoSees: 'Who can see it',
    citSave: 'Save image',
    citSaving: 'Preparing…',
    citHold: 'Press and hold the image to save it, or use the button below.',
    citShare: 'Share or download',
    citError: 'Could not generate the image. Try again.',
    settings: 'Settings',
    histSelo: 'story',
    histTitle: 'This is a story, not a real account.',
    histSub: 'It was written to show what fits in here. The next one can be yours — and that one is real.',
    histCta: 'Start my journey',
    consistencyLine: 'You came back for {n} days',
    crisisTitle: 'You matter, and you\u2019re not alone.',
    crisisText: 'If you\u2019re going through something really hard, talking to someone helps. Reach out to a local crisis line — in the US, call or text 988 (24/7). Anywhere else, find a local line at findahelpline.com. Posting here is welcome too, but please reach out for real support.',
    notTherapy: 'One Up Day supports your journey but is not a substitute for professional care. If you need help, please reach out to a professional or local support service.',
    pointsWord: 'points',
    pointsExplain: 'For showing up, sharing setbacks, and encouraging others — never for beating anyone.',
    feedEmpty: 'Follow a journey to see it grow here.',
    discover: 'Discover',
    justNow: 'just now',
    addVideo: 'Add video',
    videoAdded: 'Video ready',
    videoTooBig: 'Video is too large. Keep it under 60MB (about 1 minute).',
    editBanner: 'Edit banner',
    profileJourneys: 'Public journeys',
    noPublicJourneys: 'No public journeys yet.',
    exploreTitle: 'Explore journeys',
    exploreSub: 'Find someone building, learning, recovering or starting again.',
    searchPh: 'Search journeys or goals',
    allCats: 'All',
    explore: 'Explore',
    navHome: 'Home', navExplore: 'Explore', navCreate: 'New chapter', navToday: 'Log today’s day', navProfile: 'You', navSearch: 'Search', navMedia: 'Photo or video', navJourney: 'New journey',
    mediaCaption: 'Caption (optional)', mediaCaptionPh: 'Write something about this…', searchTitle: 'Find people', searchPeoplePh: 'Name or @handle', searchHint: 'Type to search.', searchNone: 'No one found.',
    pubPublic: 'Public', pubFollowers: 'Followers', pubPrivate: 'Private',
    blockUser: 'Block', blocked: 'Blocked', muteTopic: 'Hide this topic',
    pauseNotif: 'Pause notifications', notifPaused: 'Notifications paused',
    report: 'Report', reported: 'Reported',
    notifications: 'Notifications',
    notifEncourage: '{name} is with you',
    notifFollow: '{name} started following your journey',
    notifEmpty: 'Nothing here yet. Everything in its own time.',
    examplesTitle: 'Start something like',
    ex1: '30 days back to training', ex2: '7 days no sugar', ex3: '100 days building my business',
    ex4: '30 days drawing again', ex5: 'My recovery, one day at a time',
    sugTitle: 'Popular starts',
    cardDay: 'Day', cardOf: 'of', cardStreak: '{n} days of presence', cardStreakOne: '{n} day of presence',
    // O card de convite: o assunto é o que a OUTRA pessoa pode começar,
    // não o progresso de quem manda.
    convEyebrow: 'COME WITH ME', convLinha: 'I am on day {d} of {t}.',
    convCta: 'Start yours today.', convCopiado: 'Link copied', cardSetback: 'SETBACK · STILL IN THE JOURNEY',
    successTitle: 'Day 1 published. Your journey now exists.',
    successSub: 'You showed up. That is how it starts — one day at a time.',
    successShare: 'Share your card', successView: 'View public page',
    successMore: 'Back to my journey', successExplore: 'Explore journeys',
    feedInviteTitle: 'You’re not starting alone.',
    feedInviteSub: 'See real journeys and follow someone on the way up.',
    feedInviteCta: 'Explore journeys',
    joinTitle: 'What would your Day 1 be?',
    joinSub: 'Start your own journey — the first step already counts.',
    landHeadline: 'You don\u2019t have to win everything today.',
    landSub: 'You just need to take the next step.',
    landExplain: 'A space to record what you are trying to change — and keep going without comparing yourself.',
    landCta: 'Start my journey',
    landSafety: 'Free to start. No competition. No perfection.',
    demoLabel: 'A real journey, right now',
    ideaStart: 'Start', ideaStartL: 'log what you are trying to change',
    ideaShare: 'Share', ideaShareL: 'one real step, without needing to look perfect',
    ideaContinue: 'Keep going', ideaContinueL: 'one step at a time — and come back whenever you need',
    demoFbTitle: 'Back to running',
    thesis1: 'A social network that doesn\u2019t make you compare.',
    thesis2: 'It helps you keep going.',
    thesisSub: 'Progress, not perfection. Small steps count. Setbacks are allowed. No competition.', landIdentity1: 'Social networks show who you are today.', landIdentity2: 'Here you show who you are becoming.', landSeeTitle1: 'Everyone sees the result.', landSeeTitle2: 'Few people follow the journey.', ideaSupport: 'Support', ideaSupportL: 'be there for people who are trying too', landClose1: 'Five years from now, you will remember the day you started.', landClose2: 'That day can be today.', landCloseCta: 'Start your journey', inviteEyebrow: 'Invitation', inviteTitle: 'You have been invited to join One Up Day.', inviteP1: 'We are building a new social network. One made to follow the journey — not just the result.', inviteP2: 'Here you don\u2019t have to look perfect. You just have to keep going.', inviteP3: 'The first people in will help shape the future of the app.', inviteCreed: 'Coming back is always welcome.', inviteCta: 'Join the beta', rulesTitle: 'Community guidelines', rulesIntro: 'One Up Day is a space to keep going — not to compete. Five simple agreements keep it standing.', rule1T: 'Support, don\u2019t compare', rule1D: 'There are no rankings here. The only person to measure against is who you were yesterday.', rule2T: 'Every Day 1 is respected', rule2D: 'Nobody belittles a beginning. Day 1 deserves as much respect as Day 100.', rule3T: 'A setback is not a failure', rule3D: 'Don\u2019t judge or lecture someone who stopped. Falling is part of the journey.', rule4T: 'Whoever comes back is welcomed, never charged', rule4D: 'No "where have you been?". Say "good to see you" instead.', rule5T: 'Care is active', rule5D: 'Report cruelty when you see it. If someone is in crisis, point them to real help.', rulesNoT: 'What doesn\u2019t belong here', rulesNoD: 'Cruelty, humiliation, mockery of someone\u2019s journey, pressure disguised as motivation, spam, and anything that makes someone ashamed of starting again.', rulesModT: 'How moderation works', rulesModD: 'Comments pass through a safety filter. Reports are reviewed and repeated cruelty leads to removal. You can block anyone at any time.', rulesCreed: 'Coming back is always welcome.', ncTitle: 'Your next chapter', ncSealed: 'A small step has been prepared for you. It opens tomorrow.', ncBlur: 'Tomorrow, a small step will be waiting for you here.', ncOpen: 'Open', ncClose: 'Close', ncReady: 'Your next chapter is waiting.', ncReturnTitle: 'Your next chapter is still here.', ncLead: 'Yesterday you showed up. Today the goal is not to do more — it is to show up again.', ncLeadSetback: 'Yesterday was hard — and you still wrote it down. Today, showing up is already the step.', ncReturnLead: 'You are not late. Your story did not end where you stopped.', ncStepLabel: 'Suggested next step', ncStep: 'Repeat yesterday\u2019s step — same size, or smaller.', ncId1: 'You are becoming someone who comes back, even after hard days.', ncId2: 'You are becoming someone who shows up, even when it is small.', ncId3: 'You are becoming someone who keeps going.', ncLineLabel: 'Your line of presence', ncCta: 'This can be my step today', meaningStep: 'Today you did not start over. You continued from where you left off.', meaningSetback: 'You wrote down even the hard day. That is how a real story gets written.', meaningFirst: 'Now your story exists. Day 1 is written.', envQ: 'What would you like to remember tomorrow?', envPh: 'A short note for tomorrow-you…', envSave: 'Keep it in the envelope', envSkip: 'Not now', ncSealedEnv: 'Saved 💌 Your envelope opens tomorrow, with your next chapter.', envLead: 'Yesterday, you left this for yourself', envLeadReturn: 'This was waiting for you. It did not expire.', landDemoCaption: 'Start a real journey in under a minute.', landDemoName: 'Marina', landDemoTitle: 'Getting back to running', landDemoUpdate: 'I stopped training for a few days. Today I came back with a 20-minute walk.', landDemoBadge: 'Starting again', landEx1: '30 days getting back to training', landEx2: '7 days without sugar', landEx3: '100 days building my business', landEx4: '30 days drawing again', landEx5: 'My recovery, one day at a time', landExNote1: 'No matter how many times you have stopped.', landExNote2: 'Coming back is always welcome.',
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
    loginTerms: 'Aqui, voltar é sempre bem-vindo.',
    loginError: 'Não foi possível entrar. Tente de novo.',

    signOut: 'Sair',
    yourJourneys: 'Suas jornadas',
    homeTitle: 'O que avançou hoje?',
    feedQuestion: 'Quem está seguindo em frente com você', manageJourneys: 'Minhas jornadas', todayCta: 'Registrar meu passo',
    newJourney: '+ Nova jornada',
    noJourneyTitle: 'Nenhuma jornada ainda.',
    noJourneySub: 'Comece em menos de um minuto. Escolha algo real e poste o primeiro passo.',
    createFirst: 'Criar sua primeira jornada',
    dayOf: 'Dia {d} de {t}',
    viewPublic: 'Ver público ↗',
    tabAll: 'Todos', tabFollowing: 'Seguindo', followingEmptyTitle: 'Você ainda não segue ninguém', followingEmptySub: 'Siga uma jornada e ela aparece aqui. Explore pessoas em movimento.',
    followBack: 'Seguir de volta',
    musicAdd: '\u{1F3B5} M\u00fasica', musicTitle: 'Escolha uma m\u00fasica', musicUse: 'Usar', musicRemove: 'Remover', musicEmpty: 'Nada encontrado.', musicSearchPh: 'Buscar música…', musicKeyNeeded: 'Música ainda não configurada.',
    wizBack: 'Voltar', wizNext: 'Continuar', wizStep: '{n} de {t}', publishJourney: 'Publicar jornada',
    wzUpOpen: 'Ver exemplos', wzUpClose: 'Esconder exemplos', wzUpQ1: 'Quer algumas ideias para encontrar um objetivo que tenha a ver com você?', wzUpQ2: 'Quer transformar esse objetivo em uma ação simples?', wzUpQ5: 'O que fez hoje ser o dia em que você decidiu começar?',
    wzUpEx1: ['Voltar a treinar', 'Dormir melhor', 'Voltar a estudar', 'Organizar minha vida', 'Começar um projeto', 'Cuidar melhor da minha saúde', 'Parar um hábito', 'Ter mais tempo para mim'],
    wzUpEx2: ['Caminhar 20 minutos', 'Estudar uma aula', 'Beber mais água', 'Escrever o primeiro parágrafo', 'Arrumar uma gaveta', 'Ligar para alguém de quem sinto falta'],
    wzUpEx5: ['Dei o primeiro passo', 'Cansei de adiar', 'Alguém me encorajou', 'Hoje eu tive um pouco de tempo', 'Quero tentar de novo'],
    wizT1: 'Qual é o seu objetivo?', wizS1: 'Conte o que você quer mudar ou começar.', wizT2: 'O que você vai fazer?', wizS2: 'Descreva uma ação simples.', wizT3: 'Quantas vezes por semana?', wizT4: 'Seu primeiro dia',
    wizTcat: 'Categoria', wizScat: 'Ajuda as pessoas certas a encontrarem sua jornada.', wizTmom: 'Momento de vida', wizSmom: 'Opcional — conecta você a quem vive algo parecido.', wizTpriv: 'Privacidade', wizSpriv: 'Você decide quem vê. Pode mudar depois.',
    wizS1: 'Conte o que você quer mudar ou começar.', wizS2: 'Descreva uma ação simples.', wizS3: 'Um número simples já basta.', wizS4: 'Seu primeiro passo começa hoje.',
    managePost: 'Gerenciar', mediaReplace: 'Trocar mídia', mediaRemove: 'Remover mídia', postDelete: 'Excluir publicação', postDeleteConfirm: 'Excluir esta publicação? Não dá pra desfazer.',
    followersTitle: 'Seguidores', followersNone: 'Ainda ninguém segue suas jornadas — quando alguém seguir, aparece aqui.', followersWho: 'Pessoas que caminham com você', supportersMineTitle: 'Quem te apoia', supportersMineWho: 'Mandaram apoio ou apoiaram seus posts:',

    trTag: 'Antes & depois', trDayFmt: 'Dia {d}', trGap: '{n} dias entre as duas', trSee: 'ver a jornada', amTitle: 'Amanhã por aqui', amComecou: '{name} começou hoje', amTermina: '{name} termina amanhã', amChegou: '{name} chegou ao dia {t}', amMarco: '{name} chega ao dia {d} amanhã', rtTitle: 'Voltaram esta semana', rtCame: '{name} voltou depois de {d} dias', rtCta: 'dar as boas-vindas', rtSent: 'enviado 💛', 
    stepQ: 'Qual é o seu próximo passo?', stepPh: 'ex.: caminhar 25 minutos', stepWhenQ: 'Quando?', stepWhens: ['amanhã de manhã','amanhã à noite','amanhã','esta semana'], stepSave: 'Abrir o capítulo', stepNote: 'Opcional. Aparece no seu post para as pessoas acompanharem como foi.', stepBack: 'volta com o resultado', stepFollow: 'quero ver como foi', stepFollowing: 'acompanhando este passo', stepDecided: 'Ontem {name} decidiu:', stepResult: 'Resultado', stepOpen: 'Este capítulo continua em aberto', stepResume: 'Retomar de onde parei', notifStepResult: '{name} voltou com o resultado 👀', 
    espTeaser: 'Reparei numa coisa.', espEyebrow: 'Upi', espClose: 'fechar', espPalavra: 'A palavra “{t}” aparecia em {n} dos seus primeiros dias. Não aparece há {d} dias.', espTempo: 'Você escrevia no “queria”. Agora escreve no “fiz”.', espTom: 'O peso saiu das suas frases.', espRitmo: 'No começo você aparecia a cada {a} dias. Agora é quase todo dia.', pqEyebrow: 'No dia 1 você escreveu por que isso importava:', 
    capTitle: 'Capacidades em construção', capNote: 'Isto vem dos seus próprios registros. Nada aqui é comparado com outra pessoa.', capVoltar: 'Sua capacidade de voltar está crescendo.', capVoltarAntes: 'Antes, uma pausa durava em média {d} dias.', capVoltarAgora: 'Nas últimas {n} vezes, você voltou em até {d} dias.', capVoltarMaior: 'A maior pausa que você atravessou foi de {d} dias — e você voltou.', capDificil: 'Você está aprendendo a continuar no dia ruim.', capDificilProva: 'Depois de {t} dias difíceis registrados, você voltou no dia seguinte em {n} deles.', capPresenca: 'Sua constância está virando rotina.', capPresencaProva: '{d} dias seguidos sem uma única pausa.', 
    wizWhyNote: 'Dá pra mudar depois, quando o motivo ficar mais claro.',
    momInviteTitle: 'Quer caminhar com quem está no mesmo momento?', momInviteSub: 'Opcional. Serve só pra você encontrar gente passando por algo parecido.', momInviteDone: 'Pronto.', momInviteSee: 'Ver quem está no mesmo momento', 
    wizPreview: 'Sua jornada',
    pcTitle: 'O que você percebeu nesta pessoa?', pcSub: 'Não é uma curtida — é um reconhecimento. Ela vai ver.', pcDone: 'Reconhecido 💛', pcBlockTitle: 'O que as pessoas percebem em você', pcByN: 'por {n} pessoas', pcTipos: { coragem: 'Coragem de começar', voltar: 'Voltar depois de parar', honestidade: 'Falar a verdade sobre o dia', sem_perfeicao: 'Continuar sem ser perfeito', adaptar: 'Mudar o caminho quando precisou', limite: 'Respeitar um limite', mudanca: 'Uma mudança que apareceu agora', presenca: 'Aparecer mesmo no dia difícil', acompanho: 'Estou acompanhando', inspirou: 'Isso me inspirou' }, notifPercepcao: '{name} percebeu algo em você 👀', 
    hjOi: 'Oi, {name}.', hjPergunta: 'O que merece um passo seu hoje?', hjDisse: 'Você disse que hoje ia:', hjFeito: 'Você já registrou hoje. O dia está guardado.', hjCta: 'Registrar o dia', anTitle: 'Em andamento', anVoltou: '{name} voltou com o resultado', anQuase: '{name} está no dia {d} de {t}', anEsperando: '{name} ainda não voltou', anVer: 'ver resultado', anAcompanhar: 'acompanhar', 
    ecoTag: 'IA do One Up Day', ecoWhy: 'por que estou vendo isto?', ecoDel: 'apagar', ecoWhyText: 'O Upi deixa a primeira observação quando um post ainda não tem comentários, usando só o que aconteceu na sua jornada — nunca suposições sobre você. Dá pra desligar no seu perfil.', ecoDelConfirm: 'Apagar esta observação do Upi?', ecoTitle: 'Primeiro Eco', ecoSub: 'Quando um post seu fica sem comentário, o Upi deixa uma observação sobre o que aconteceu. Sempre identificado como IA.', ecoOn: 'Ligado', ecoOff: 'Desligado', notifEco: 'O Upi deixou uma observação no seu dia', 
    kindStep: 'Passo',
    kindWin: 'Vitória',
    kindSetback: 'Recaída',
    kindLearned: 'Aprendi',
    composerPh: 'Dia {n}: qual foi seu passo de hoje?',
    phLivre: 'Escreva aqui. Uma linha j\u00e1 \u00e9 um registro.',
    post: 'Postar',
    posting: 'Postando…',
    postError: 'Não foi possível postar. Tente de novo.',
    setbackNote: 'Um dia difícil ainda conta como presença. Nada se perde.',

    back: 'Voltar',
    createEyebrow: 'Criar',
    createTitle: 'Comece uma jornada em menos de um minuto.',
    createSub: 'Escolha algo real, poste o primeiro passo, volte amanhã.',
    fName: 'Qual desafio você quer começar?',
    fNamePh: 'Voltar a desenhar',
    fCategory: 'Categoria',
    fDuration: 'Por quanto tempo',
    fWhy: 'Por que isso importa para você?',
    fWhyPh: 'Escreva como se fosse pra você daqui a duas semanas, num dia difícil.',
    fFirst: 'Qual foi o primeiro passo de hoje?',
    fFirstPh: 'O que você fez hoje? Uma frase basta.',
    createBtn: 'Começar',
    creating: 'Começando…',
    createError: 'Não foi possível criar a jornada. Tente de novo.',
    catArt: 'Arte', catLife: 'Vida', catBody: 'Corpo', catHome: 'Casa', catWork: 'Trabalho',
    catStudy: 'Estudos', catHealth: 'Saúde', catMind: 'Mente', catMoney: 'Dinheiro',
    catRelationship: 'Relações', catHabit: 'Hábitos', catCreative: 'Criatividade', catOther: 'Outra',
    customCatPh: 'Dê um nome ao seu tema', editPhoto: 'Trocar foto',
    ritualQ: 'Qual foi o seu passo de hoje?',
    rDid: 'Fiz', rTried: 'Tentei', rPaused: 'Precisei parar, mas vou voltar',
    // O selo de um dia marcado sem relato. Uma palavra, nunca uma frase:
    // frase soaria como a pessoa falando, e não foi ela quem escreveu.
    seloFiz: 'Fiz', seloTentei: 'Tentei', seloParei: 'Precisei parar', seloComecei: 'Comecei',
    // Descrição da foto. `altReserva` é a reserva usada quando ninguém
    // escreveu uma — dois fatos verdadeiros valem mais que o silêncio.
    // A pergunta acima do compositor. Nunca entra no texto — ela é
    // pergunta, não começo de frase de ninguém.
    pergPasso: 'Você conseguiu {p}?',
    pergDia1: 'Como você vai perceber que avançou?',
    pergDepoisDeDificil: 'O que você quer que hoje tenha e ontem não teve?',
    pergMarco: 'O que é diferente agora, comparado ao primeiro dia?',
    pergGerais: ['O que você fez hoje, mesmo que pequeno?', 'O que atrapalhou?', 'Qual é o próximo passo concreto?'],
    pergOutra: 'outra pergunta',
    // Ajuda com o título. A IA faz uma pergunta; o título é montado com a
    // resposta DELA. Nunca um cardápio de títulos prontos.
    ajBtn: 'Me ajude a deixar mais claro', ajPensando: 'Um instante\u2026', ajRetry: 'Tentar novamente',
    ajPh: 'Responda com suas palavras', ajUsar: 'Usar', ajPular: 'Deixar como está',
    ajErro: 'Não deu certo agora. Escreva do seu jeito \u2014 também funciona.',
    // Uma pergunta por tela. Cada título é uma pergunta, não rótulo de formulário.
    wzTTempo: 'Por quanto tempo?', wzSTempo: 'Dá pra mudar depois. Nada aqui é contrato.', wzActionPh: 'Caminhar 20 minutos',
    wzTHoje: 'O que fez hoje ser o dia?', wzSHoje: 'Isso vira o seu dia 1. É a parte que ninguém além de você pode escrever.',
    wzTMidia: 'Uma foto ou um vídeo?', wzSMidia: 'Opcional. Jornada em texto não vale menos.',
    wzTRev: 'É isso?', wzSRev: 'Tudo aqui ainda pode mudar.',
    wzHojePh: 'O que aconteceu hoje que te fez começar',
    ajPorque: 'Me ajude a dizer melhor', ajPrimeiro: 'Transformar isso no meu dia 1',
    wzRevTitulo: 'Título', wzRevPorque: 'Por que importa', wzRevTempo: 'Duração',
    wzRevDia1: 'Dia 1', wzRevCat: 'Categoria', wzRevEditar: 'editar',
    wzTPratica: 'Quantas vezes por semana?', wzSPratica: 'Um número simples já basta.',
    wzPraticaPh: '3 vezes', wzTRitmo: 'Por quantos dias?', wzSRitmo: 'Dá pra mudar depois.',
    ritmoDiario: 'Todos os dias', ritmo3x: 'Três vezes por semana', ritmoFds: 'Fins de semana', ritmoOutro: 'Personalizado',
    ritmoOutroPh: 'Descreva o seu ritmo', wzRevPratica: 'Prática', wzRevRitmo: 'Ritmo',
    ajOpcoes: 'Me dê pontos de partida', ajObservavel: 'Deixar observável',
    wzPular: 'Pular esta',
    // Os três botões de card. O rótulo vem partido: o verbo se repete
    // nos três e o olho vai direto ao que muda.
    caVerbo: 'Compartilhar', caJornada: 'card da jornada', caDia: 'card do dia',
    caChamarVerbo: 'Chamar', caChamarObj: 'um amigo',
    altLabel: 'Descrição da foto', altPh: 'O que aparece na imagem?',
    altPensando: 'Escrevendo um rascunho\u2026',
    altOk: 'É isto que quem usa leitor de tela vai ouvir.',
    altVazio: 'Sem descrição, quem não enxerga só ouve \u201cimagem\u201d.',
    altReserva: 'Foto do dia {d} da jornada {j}.',
    // rDidText / rTriedText / rPausedText: aposentados no patch 78.
    // Ficam aqui porque lib/registro.js precisa reconhecê-los no que
    // já foi publicado antes da correção.
    rDidText: 'Fiz o que eu tinha pra fazer hoje.',
    rTriedText: 'Tentei hoje. E isso conta.',
    rPausedText: 'Dia dif\u00edcil. Precisei parar, mas vou voltar.',
    momentQ: 'Em que momento voc\u00ea est\u00e1?', momentAll: 'Todos os momentos',
    mStarting: 'Come\u00e7ando de novo', mNotgiveup: 'Tentando n\u00e3o desistir', mRebuilding: 'Reconstruindo a rotina',
    mHealth: 'Cuidando da sa\u00fade', mCourage: 'Criando coragem', mHardphase: 'Passando por uma fase dif\u00edcil', mBuilding: 'Construindo algo em sil\u00eancio',
    companionTitle: 'Olha o quanto você já voltou.', companionBtn: 'Ver meu progresso', companionLoading: 'Olhando sua jornada\u2026',
    retroLink: 'Retrospectiva', retroTitle: 'Sua jornada at\u00e9 aqui', retroDays: 'dias que voc\u00ea apareceu', retroBack: 'vezes que voc\u00ea voltou', retroProgress: 'do caminho',
    retroStarted: 'Voc\u00ea come\u00e7ou em {d}. Desde ent\u00e3o, voc\u00ea continuou aparecendo.',
    retroHighlights: 'Momentos que importaram', retroNothing: 'Poste seus primeiros passos pra montar sua retrospectiva.',
    groupPeople: '{n} pessoas nesta fase', groupIntro: 'Um passo de cada vez, juntos.', groupEmpty: 'Seja a primeira pessoa aqui \u2014 e outras v\u00e3o chegar.', groups: 'Comunidades', optional: 'opcional', aiWrite: '\u2728 Me ajude a escrever', aiThinking: 'Pensando\u2026', aiNextStep: 'Sugira meu próximo passo',
    dur7: '7 dias', dur30: '30 dias', dur60: '60 dias', dur100: '100 dias', durCustom: 'Personalizado…', durCustomLabel: 'Quantos dias?', durCustomPh: 'ex.: 21', durHint: 'Se parar no caminho, nada se perde. Você continua de onde parou.', durDaysWord: 'dias',
    mediaAdd: '+ Foto ou vídeo', mediaEyebrow: 'ADICIONAR', mediaTitle: 'Foto ou vídeo', mediaPick: 'Escolher foto ou vídeo', mediaReplace2: 'Trocar', mediaDest: 'Onde vai?', mediaDestJourney: 'Numa jornada', mediaDestJourneySub: 'Adiciona num dia específico', mediaDestAlbum: 'No meu álbum', mediaDestAlbumSub: 'Uma galeria pessoal no seu perfil', mediaWhichJourney: 'Qual jornada', mediaWhichDay: 'Qual dia', mediaWhoSees: 'Quem pode ver', mediaSave: 'Adicionar', albumTitle: 'Álbum', epBtn: 'Editar perfil', epTitle: 'Editar perfil', epName: 'Nome', epHandle: 'Usuário', epHint: 'Mudar o usuário também muda o seu link público.', epSave: 'Salvar', epSaving: 'Salvando…', epCancel: 'Cancelar', epErrName: 'O nome não pode ficar vazio.', epErrHandle: 'O usuário deve ter de 3 a 20 caracteres — letras, números, ponto ou _.', epErrTaken: 'Esse usuário já está em uso.', epErrSave: 'Não foi possível salvar. Tente de novo.', jDeleteBtn: 'Excluir', jDeleteConfirm: 'Excluir a jornada \u201c{title}\u201d? Todos os posts e apoios dela serão apagados. Não dá pra desfazer.', jDeleteErr: 'Não foi possível excluir. Tente de novo.', ejBtn: 'Editar', ejTitle: 'Editar jornada', ejName: 'Nome da jornada', ejGoal: 'Por que importa', ejCover: 'Foto da jornada', ejCoverAdd: 'Adicionar foto', ejCoverChange: 'Trocar foto', ejCoverRemove: 'Remover foto', mediaRemoveConfirm: 'Remover esta foto do post? O texto continua.', euBtn: 'Editar', euTitle: 'Editar o dia {d}', euText: 'O que você escreveu', euPhoto: 'Foto do dia', euErrEmpty: 'O dia precisa de um texto ou uma foto.', euDeletePost: 'Excluir este post', jdShow: 'Editar dias da linha do tempo', jdHide: 'Ocultar dias', jdEmpty: 'Nenhum dia registrado ainda.', jdLoading: 'Carregando…', jfOpen: 'Abrir jornada', jfClose: 'Fechar', mediaAddShort: '+ Foto', newJourneyShort: '+ Jornada', dpPrev: 'Dia anterior', dpNext: 'Próximo dia', dayOfShort: 'Dia {d} / {t}',
    chTitle: 'Desafios', chBtn: 'Desafiar', chModalTitle: 'Lançar um desafio', chWhat: 'O desafio', chPh: 'ex.: Tomar 2L de água por dia', chDays: '{d} dias', chSend: 'Enviar desafio', chSending: 'Enviando…', chSent: 'Desafio enviado. Agora é com {name}.', chErrExists: 'Vocês já têm um desafio aberto.', chErrConn: 'Desafios são entre pessoas que se seguem.', chErr: 'Não foi possível enviar. Tente de novo.', chInviteFrom: '{name} te desafiou', chAccept: 'Aceitar', chDecline: 'Recusar', chWaiting: 'Aguardando {name}…', chTogether: 'Caminhada junta · sem vencedor', chCheck: 'Fiz hoje', chChecked: 'Você marcou presença hoje', chPresence: '{n} de {d} dias', chDone: 'Desafio concluído. As duas histórias cresceram.', chOpen: 'Abrir', chPageEyebrow: 'Desafio', chEmpty: 'Desafie alguém a caminhar junto — abra o perfil de quem você segue e toque em Desafiar.', chStripTag: 'Desafio em andamento', chStripSee: 'acompanhar', chStamp: 'Carimbar com foto', firstDayDefault: 'Comecei.', pushTitle: 'Notificações neste aparelho', pushTest: 'Enviar teste', pushTestSent: 'Enviado. Deve chegar em instantes.', pushTestFail: 'Não deu certo. Tente desativar e ativar de novo.', pushOnSub: 'Você vai saber dos apoios, comentários e do convite diário.', pushOffSub: 'Ative para saber quando alguém apoiar você — e receber o convite diário do Upi.', pushDenied: 'As notificações estão bloqueadas nas configurações do seu celular.', pushTurnOn: 'Ativar', pushTurnOff: 'Desativar', pushWait: 'Um segundo…', chRemovePhoto: 'Remover foto', chRemovePhotoConfirm: 'Remover a foto deste dia? A presença continua.', notifComment: '{name} comentou na sua jornada 💬', notifChallenge: '{name} te lançou um desafio 🤝', notifChallengeAccept: '{name} aceitou seu desafio', ejErrTitle: 'O nome não pode ficar vazio.', profTabJourneys: 'Jornadas', profTabQuotes: 'Citações', quotesEmpty: 'Nenhuma citação por aqui ainda.', quotesEmptyCta: 'Criar uma citação', profTabAlbum: 'Álbum', profTabPeople: 'Pessoas', albumEmpty: 'Suas fotos e vídeos moram aqui.', albumEmptyCta: 'Adicionar foto ou vídeo', mediaDelete: 'Excluir', mediaDeleteConfirm: 'Excluir esta foto? Não dá pra desfazer.', cropOriginal: 'Original', cropCover: 'Capa', cropSquare: 'Quadrado', cropPortrait: 'Retrato', cropLandscape: 'Paisagem', cropUse: 'Usar foto', cropEdit: 'Editar enquadramento', cropCancel: 'Cancelar', cropHint: 'Arraste para reposicionar · use o controle para dar zoom', cropHintOriginal: 'Foto inteira, sem cortar nada', cropZoom: 'Zoom',

    publicJourney: 'Jornada pública',
    startYourJourney: 'Começar sua jornada',
    daysPosted: 'dias postados', daysPostedOne: 'dia postado', moreOptions: 'Mais opções', startCta: 'Começar minha jornada', recordsFmt: '{n} registros neste dia',
    dayStreakLabel: 'dias de presença', dayStreakLabelOne: 'dia de presença',
    progress: 'progresso',
    tagSetback: 'Dia difícil · ainda conta',
    tagWin: 'Vitória',
    followingQ: 'Acompanhando o progresso de {name}?',
    encourageSub: 'Incentive esta jornada e comece a sua.',
    encourageJoin: 'Incentivar e entrar',
    dayXofY: 'Dia {d} de {t}',
    dayShort: 'Dia {d}',

    nfTitle: 'Jornada não encontrada',
    nfSub: 'Esta jornada pode ser privada ou o link pode estar errado.',
    nfCta: 'Ir para o One Up Day',
    shareTitle: 'Deixe alguém acompanhar seu caminho.',
    shareSub: 'Um card limpo que viaja pros Stories, WhatsApp e mais.',
    shareCard: 'Baixar card',
    fjEyebrow: 'SUA VEZ', fjTitle: 'Comece sua jornada, {name}', fjSub: 'Um passo pequeno, compartilhado. Volte amanhã e continue.', fjCta: 'Começar minha primeira jornada', fjHint: 'Leva um minuto. Você escolhe quem pode ver.',
    homeWelcomeNewEyebrow: 'UM PASSO DE CADA VEZ', homeWelcomeNewTitle: 'Qual é o seu primeiro passo?', homeWelcomeNewSub: 'Crie uma jornada simples e registre o que acontece de verdade, sem pressão.', homeWelcomeNewCta: 'Começar minha jornada', homeWelcomeSkip: 'Pular e explorar o feed', homeWelcomeBackEyebrow: 'Bom ver você, {name}.', homeWelcomeBackTitle: 'Como você quer continuar hoje?', homeWelcomeBackSub: 'Escolha uma jornada para registrar o dia ou encontre alguém para acompanhar.', homeWelcomeRegister: 'Registrar o dia', homeWelcomeDay: 'Dia {d} de {t}', homeWelcomeJourneySub: 'Uma presença pode mudar o dia de alguém.',
    successContinue: 'Continuar para minha jornada',
    demoLabelDemo: 'Veja como uma jornada funciona', demoExample: 'Exemplo',
    dia1PageTitle: 'Qual é o seu Dia 1?', dia1PageSub: 'Todo recomeço tem um Dia 1. Veja os de hoje — e comece o seu.', dia1PageCta: 'Começar meu Dia 1', dia1Wall: 'Dia 1 acontecendo agora', dia1CampaignsTitle: 'Um motivo pra começar agora',
    privacyQ: 'Quem pode ver?',
    pubPublicSub: 'Aparece no feed. Qualquer pessoa pode acompanhar e apoiar.', pubFollowersSub: 'Só quem já te segue vê. Não aparece para desconhecidos.', pubPrivateSub: 'Só você. Ninguém mais vê, nem no feed nem no seu perfil.',
    aiCareQ: 'Dia difícil? Você não precisa fazer isso sozinho.', aiCareLight: 'Registrar de um jeito mais leve', aiCareStep: 'Menor passo pra amanhã',
    aiConsent: 'A IA usa só os seus registros pra te ajudar.', aiOff: 'Desligar', aiOffState: 'Companhia de IA desligada.', aiReactivate: 'Reativar', aiErr: 'Não consegui agora. Tente de novo em instantes.', aiRateErr: 'Você usou bastante a IA por agora. Tente mais tarde.',

    dia1CardBtn: 'Baixar meu card do Dia 1', dia1Eyebrow: 'MEU DIA 1', dia1Big: 'Dia 1', dia1Invite: 'Qual \u00e9 o seu Dia 1?', dia1By: 'por',
    challengeBtn: 'Chamar um amigo pra começar junto', challengeMsg: 'Hoje \u00e9 meu Dia 1 de {theme}. Topa come\u00e7ar o seu comigo?',
    movementTitle: 'Fa\u00e7a parte do movimento', movementSub: 'Cada Dia 1 convida outra pessoa a come\u00e7ar.',
    shareDownloading: 'Preparando…',
    encourage: 'Incentivar',
    encouraged: 'Incentivado',
    addPhoto: 'Adicionar foto',
    photoAdded: 'Foto pronta',
    uploading: 'Enviando…',
    before: 'Antes',
    now: 'Agora',
    obTitle: 'Que bom ter você aqui, {name}. Comece sua primeira jornada.',
    obSub: 'Escolha algo real, poste um passo hoje, e volte amanhã. É esse o jogo inteiro.',
    obStep1: 'Comece uma jornada',
    obStep2: 'Poste um passo honesto',
    obStep3: 'Continue amanhã',
    follow: 'Seguir',
    following: 'Seguindo',
    feedTitle: 'Jornadas em movimento',
    trendingTitle: 'Acontecendo agora',
    goalWord: 'Meta',
    withYouIdle: 'Estou com você', withYouActive: 'Com você', supporters: 'Ver quem está com você', supportersLoading: 'Carregando\u2026', supportersEmpty: 'Você foi a primeira pessoa a aparecer aqui.', supportStrip: 'Com {name} nesta jornada', supportingFmt: 'Apoiando {name}', heartTitle: 'Enquanto você esteve fora', heartLikes: 'apoiaram você', heartFollows: 'começaram a te seguir', heartEmpty: 'Nada novo por aqui ainda.', heartSeeAll: 'Ver notificações', progressFmt: '{d} dias registrados', suggestTitle: 'Pessoas para apoiar', suggestNewcomer: 'começando agora', suggestSub: 'Comece a acompanhar quem também está tentando', moodQ: 'Como você está?', prompts: ['O que foi difícil hoje', 'Um passo pequeno que dei', 'Algo que aprendi', 'Por que eu continuo'], moodDown: 'pra baixo', moodAnxious: 'ansioso', moodAngry: 'com raiva', moodTired: 'cansado', moodMotivated: 'motivado', moodHappy: 'feliz', moodGrateful: 'grato', dailyMoodTitle: 'Como você está se sentindo hoje?', dailyMoodSub: 'Só pra continuar sua jornada. Fica discreto no seu avatar hoje.', dailyMoodSkip: 'Agora não', demoC1: 'Tô torcendo por você 💛', demoC2: 'Um dia de cada vez. Você consegue.', demoC3: 'Que inspiração ver isso aqui.', hugLabel: 'Enviar um abraço', hugToast: 'Você abraçou {name} 🤗', meToo: 'Eu também', meTooQ: 'Eu também passei por isso', meTooBack: 'Também voltei depois de parar', meTooTrying: 'Ainda estou tentando', meTooHard: 'Hoje foi difícil pra mim também', meTooJust: 'Só “eu também”', meTooDone: 'Recebido 💛', meTooAuthor: 'Você não está só nisso.', meTooCountFmt: '{n} pessoas já passaram por aqui', notifMeToo: 'Alguém já passou pelo que você contou. Você não está só 💛', notifHug: 'Você recebeu um abraço de {name} 🤗', notifMoodLow: 'Que tal mandar um abraço pra {name} hoje?', notifComeback: '{name} voltou depois de uma pausa 💪 Mande um apoio.', notifWelcome: 'Seu Dia 1 começou. A gente tá com você 💛', milestoneFmt: 'Marco · Dia {d} 🎉', needsTitle: 'Alguém precisa de você hoje', needsCta: 'mandar apoio', needsSent: 'apoio enviado 💛', comebackFmt: 'voltou depois de {d} dias 💪',
    comment: 'Comentar', commentClose: 'Fechar', commentEmpty: 'Ainda não há comentários. Vamos manter o cuidado.', commentPlaceholder: 'Escreva algo de apoio\u2026', commentSend: 'Enviar', commentSending: 'Enviando\u2026',     commentPendente: 'Recebemos. Este comentário passa por uma revisão rápida antes de aparecer.',
    commentUnsafe: 'Essa mensagem não combina com este espaço.', commentError: 'Não foi possível enviar. Tente de novo.', commentSomeone: 'Alguém',
    commentReply: 'Responder', commentMore: 'Ver mais comentários', commentLess: 'Mostrar menos comentários', commentReplying: 'Respondendo a {name}', commentCancel: 'Cancelar',
    messages: 'Mensagens', messageSearch: 'Busque por nome ou @usuário', messageEmpty: 'Nenhuma conversa ainda.', messageChoose: 'Escolha uma conversa para começar.', messageStart: 'Envie uma mensagem de apoio para começar.', messagePlaceholder: 'Escreva uma mensagem privada…', messageSend: 'Enviar', messageSending: 'Enviando…', messageError: 'Não foi possível enviar a mensagem.', messageConnection: 'Você pode enviar mensagem quando uma das pessoas seguir a outra.', messageSent: 'Enviada', messageSeen: 'Vista', filterLabel: 'Filtrar', filterAll: 'Todos', moreText: 'mais', lessText: 'menos',
    shareShort: 'Compartilhar', linkCopied: 'Link copiado!',
    videoFill: 'Preencher', videoFit: 'Ajustar',
    ejCategory: 'Categoria', ejDuration: 'Duração', ejPrivacy: 'Quem pode ver',
    ejDurMin: 'Você já está no dia {d} — a meta não pode ser menor que isso.',
    ejDurNote: 'Mudar a meta não apaga nenhum dia que você já registrou.',
    wizWhyOptional: 'opcional', wizPrivShort: 'Quem vai ver: {v}', wizPrivChange: 'alterar',
    mailOr: 'ou',
    mailLabel: 'Endereço de e-mail', mailPh: 'seu@email.com',
    mailSend: 'Continuar com e-mail', mailSending: 'Enviando…',
    mailSent: 'Enviamos um código de 6 dígitos para {email}. Ele vale por alguns minutos.',
    mailCode: 'Código de 6 dígitos', mailEnter: 'Entrar', mailChecking: 'Conferindo…',
    mailResend: 'Enviar outro código', mailWait: 'Enviar outro em {s}s',
    mailChange: 'Usar outro e-mail',
    mailErr: 'Não foi possível enviar o código. Tente de novo.',
    mailRate: 'Muitas tentativas. Espere um minuto e tente de novo.',
    mailBadCode: 'Esse código não confere, ou expirou. Peça outro.',
    aboutTitle: 'O que é o One Up Day',
    aboutText: 'O One Up Day é uma rede social de progresso pessoal. Você cria uma jornada — voltar a treinar, estudar, parar de fumar, tirar um projeto do papel — e registra um dia de cada vez, com texto, foto ou vídeo. Seus amigos acompanham e apoiam. Não existe ranking nem contador público de curtidas. Se você parar, nada se perde: voltar é sempre bem-vindo.',
                heroDesc: 'Uma rede social para acompanhar mudanças reais, um dia de cada vez — sem competição e sem perder a história quando você pausa.',
    heroOnde: 'Funciona no navegador e no celular.',
    passo1T: 'Comece',  passo1D: 'Escolha o que quer mudar.',
    passo2T: 'Registre', passo2D: 'Conte como foi o dia.',
    passo3T: 'Receba apoio', passo3D: 'Pessoas acompanham você.',
    passo4T: 'Volte',   passo4D: 'Continue de onde parou.',
        tesePausa: 'Se precisar parar, sua história continua daqui.',
    difTitle: 'O que não existe aqui',
    dif: [
      'Sem ranking.',
      'Sem contador público de curtidas.',
      'Sem sequência que zera.',
      'Pausas não apagam o progresso.',
      'Apoio e comentários durante o caminho.',
    ],
    segTitle: 'Sua jornada, nas suas condições',
    seg: [
      'Você controla quem pode acompanhar.',
      'Não vendemos a sua vulnerabilidade.',
      'Sem competição pública.',
      'Você pode apagar seus conteúdos.',
    ],
    sobreTitle: 'Sobre o One Up Day',
    sobreTexto: 'O One Up Day é uma rede social de progresso pessoal onde as pessoas criam jornadas para acompanhar mudanças, hábitos, estudos, projetos e outras metas pessoais. Cada usuário pode publicar capítulos da sua evolução, receber apoio da comunidade e continuar a sua história mesmo depois de uma pausa.',
            ascTitulo: 'Acompanhar esta jornada',
    ascSub: 'Avisamos quando a próxima página for escrita. Sem criar conta.',
    ascCta: 'Quero acompanhar',
    ascIndo: 'Um instante…',
    ascSeguindoT: 'Você está acompanhando',
    ascSeguindoP: 'Vamos avisar quando o próximo capítulo chegar.',
    ascParar: 'Parar',
    ascErro: 'Não deu certo agora. Tente de novo.',
    exemploSelo: 'Exemplo · jornada de demonstração',
    exemploDias: 'dias postados',
    exemploPresenca: 'dias de presença',
    exemploProgresso: 'progresso',
    acaoT: 'Veja uma jornada acontecendo',
    acao1: 'Dia atual da jornada',
    acao2: 'Capítulo publicado',
    acao3: 'Próximo passo definido',
    comoTitle: 'Como funciona',
    como1T: 'Escolha algo que quer mudar',
    como1D: 'Estudo, saúde, carreira, uma relação ou um projeto parado.',
    como2T: 'Registre um dia de cada vez',
    como2D: 'Cada publicação vira um capítulo da sua jornada.',
    como3T: 'Pare e volte sem perder a história',
    como3D: 'Aqui, uma pausa não apaga o seu progresso.',
    confiTitle: 'O seu progresso, nas suas condições',
    confi: [
      'Você escolhe quem pode ver cada jornada.',
      'Sem ranking público e sem contador de curtidas.',
      'Sem sequência que zera quando você falha.',
      'Sua vulnerabilidade nunca vira produto.',
      'Você pode apagar seus conteúdos quando quiser.',
    ],
    estadoT: 'Produto funcional',
    estadoD: 'Funciona no navegador e no celular. Construído e testado a partir de jornadas reais.',
    verComo: 'Ver como funciona',
    emAcaoT: 'Uma jornada acontecendo',
    emAcaoD: 'É assim que um dia entra na sua história.',
    aboutLead: 'O One Up Day é uma rede social de progresso pessoal.',
    aboutBody: 'Você cria uma jornada, registra um dia de cada vez — com texto, foto ou vídeo — e seus amigos acompanham e apoiam.',
    aboutExamples: ['voltar a treinar', 'estudar', 'parar de fumar', 'tirar um projeto do papel'],
    aboutRule: 'Não existe ranking nem contador público de curtidas. Se você parar, nada se perde: voltar é sempre bem-vindo.',
    aboutData: 'Para criar sua conta, o One Up Day usa o login do Google e recebe apenas seu nome, e-mail e foto de perfil. Nada além disso é solicitado, e nada é compartilhado com terceiros.',
    ejSaved: 'Salvo',
    navQuote: 'Citação',
    citTitle: 'Transforme uma frase em imagem',
    citSub: 'Escreva algo que você quer guardar. Escolha um fundo. Salve ou compartilhe.',
    citPh: 'Voltar não precisa de vontade.',
    citPreview: 'Prévia do card',
    citBg: 'Fundos que cabem',
    citHint: 'Os apagados não comportam esse texto. Encurte e eles voltam.',
    citTooLong: 'Texto longo demais para este fundo',
    citAuthor: 'Assinatura (opcional)',
    citAuthorPh: '@seuusuario',
    citPost: 'Publicar',
    citPosting: 'Publicando…',
    citPostError: 'Não foi possível publicar. Tente de novo.',
    citWhoSees: 'Quem pode ver',
    citSave: 'Salvar imagem',
    citSaving: 'Preparando…',
    citHold: 'Toque e segure a imagem para salvar, ou use o botão abaixo.',
    citShare: 'Compartilhar ou baixar',
    citError: 'Não foi possível gerar a imagem. Tente de novo.',
    settings: 'Ajustes',
    histSelo: 'história',
    histTitle: 'Esta é uma história, não um relato real.',
    histSub: 'Foi escrita para mostrar o que cabe aqui. A próxima pode ser a sua — e essa é de verdade.',
    histCta: 'Começar a minha jornada',
    consistencyLine: 'Você voltou por {n} dias',
    crisisTitle: 'Você importa, e não está sozinho.',
    crisisText: 'Se você está passando por um momento muito difícil, falar com alguém ajuda. No Brasil, o CVV atende 24h, de graça, pelo 188 e em cvv.org.br. Em outro país, encontre uma linha local em findahelpline.com. Postar aqui é bem-vindo, mas procure um apoio de verdade.',
    notTherapy: 'O One Up Day apoia sua jornada, mas não substitui acompanhamento profissional. Se precisar de ajuda, procure um profissional ou um serviço de apoio.',
    pointsWord: 'pontos',
    pointsExplain: 'Por aparecer, mostrar recaídas e incentivar os outros — nunca por vencer alguém.',
    feedEmpty: 'Siga uma jornada pra vê-la crescer aqui.',
    discover: 'Descobrir',
    justNow: 'agora',
    addVideo: 'Adicionar vídeo',
    videoAdded: 'Vídeo pronto',
    videoTooBig: 'Vídeo muito grande. Mantenha abaixo de 60MB (cerca de 1 minuto).',
    editBanner: 'Editar capa',
    profileJourneys: 'Jornadas públicas',
    noPublicJourneys: 'Nenhuma jornada pública ainda.',
    exploreTitle: 'Explorar jornadas',
    exploreSub: 'Ache alguém construindo, aprendendo, se recuperando ou recomeçando.',
    searchPh: 'Buscar jornadas ou objetivos',
    allCats: 'Todas',
    explore: 'Explorar',
    navHome: 'Início', navExplore: 'Explorar', navCreate: 'Criar capítulo', navToday: 'Registrar o dia de hoje', navProfile: 'Você', navSearch: 'Buscar', navMedia: 'Foto ou vídeo', navJourney: 'Nova jornada',
    mediaCaption: 'Descrição (opcional)', mediaCaptionPh: 'Escreva algo sobre isso…', searchTitle: 'Buscar pessoas', searchPeoplePh: 'Nome ou @usuário', searchHint: 'Digite para buscar.', searchNone: 'Ninguém encontrado.',
    pubPublic: 'Pública', pubFollowers: 'Seguidores', pubPrivate: 'Privada',
    blockUser: 'Bloquear', blocked: 'Bloqueado', muteTopic: 'Ocultar este tema',
    pauseNotif: 'Pausar notificações', notifPaused: 'Notificações pausadas',
    report: 'Denunciar', reported: 'Denunciado',
    notifications: 'Notificações',
    notifEncourage: '{name} está com você',
    notifFollow: '{name} começou a seguir sua jornada',
    notifEmpty: 'Nada por aqui ainda. Tudo tem seu tempo.',
    examplesTitle: 'Comece algo como',
    ex1: '30 dias voltando a treinar', ex2: '7 dias sem açúcar', ex3: '100 dias construindo meu negócio',
    ex4: '30 dias desenhando de novo', ex5: 'Meu recomeço, um dia por vez',
    sugTitle: 'Começos populares',
    cardDay: 'Dia', cardOf: 'de', cardStreak: '{n} dias de presença', cardStreakOne: '{n} dia de presença',
    // O card de convite: o assunto é o que a OUTRA pessoa pode começar,
    // não o progresso de quem manda.
    convEyebrow: 'VEM COMIGO', convLinha: 'Estou no dia {d} de {t}.',
    convCta: 'Comece a sua hoje.', convCopiado: 'Link copiado', cardSetback: 'RECAÍDA · AINDA NA JORNADA',
    successTitle: 'Dia 1 publicado. Agora sua jornada existe.',
    successSub: 'Você apareceu. É assim que começa — um dia de cada vez.',
    successShare: 'Compartilhar seu card', successView: 'Ver página pública',
    successMore: 'Voltar pra minha jornada', successExplore: 'Explorar jornadas',
    feedInviteTitle: 'Você não está começando sozinho.',
    feedInviteSub: 'Veja jornadas reais e siga alguém que está tentando.',
    feedInviteCta: 'Explorar jornadas',
    joinTitle: 'Qual seria o seu Dia 1?',
    joinSub: 'Comece a sua jornada — o primeiro passo já conta.',
    landHeadline: 'Você não precisa vencer tudo hoje.',
    landSub: 'Só precisa dar o próximo passo.',
    landExplain: 'Um espaço para registrar o que você está tentando — e continuar, sem se comparar.',
    landCta: 'Começar minha jornada',
    landSafety: 'Grátis para começar. Sem competição. Sem perfeição.',
    demoLabel: 'Uma jornada real, agora mesmo',
    ideaStart: 'Comece', ideaStartL: 'registre o que você está tentando transformar',
    ideaShare: 'Compartilhe', ideaShareL: 'um passo real, sem precisar parecer perfeito',
    ideaContinue: 'Continue', ideaContinueL: 'avance um passo de cada vez — e volte sempre que precisar',
    demoFbTitle: 'Voltar a correr',
    thesis1: 'Uma rede social que não faz você se comparar.',
    thesis2: 'Faz você continuar.',
    thesisSub: 'Progresso, não perfeição. Pequenos passos contam. Recaídas são permitidas. Sem competição.', landIdentity1: 'As redes sociais mostram quem você é hoje.', landIdentity2: 'Aqui você mostra quem está se tornando.', landSeeTitle1: 'Todo mundo vê o resultado.', landSeeTitle2: 'Pouca gente acompanha a jornada.', ideaSupport: 'Apoie', ideaSupportL: 'esteja presente para quem também está tentando', landClose1: 'Daqui a cinco anos, você vai lembrar do dia em que começou.', landClose2: 'Esse dia pode ser hoje.', landCloseCta: 'Comece sua jornada', inviteEyebrow: 'Convite', inviteTitle: 'Você foi convidado para entrar no One Up Day.', inviteP1: 'Estamos construindo uma nova rede social. Feita para acompanhar a jornada — não só o resultado.', inviteP2: 'Aqui você não precisa parecer perfeito. Só precisa continuar.', inviteP3: 'As primeiras pessoas vão ajudar a definir o futuro do aplicativo.', inviteCreed: 'Voltar é sempre bem-vindo.', inviteCta: 'Entrar no beta', rulesTitle: 'Regras da comunidade', rulesIntro: 'O One Up Day é um espaço pra continuar — não pra competir. Cinco acordos simples mantêm isso de pé.', rule1T: 'Apoie, não compare', rule1D: 'Aqui não existe ranking. A única comparação é com quem você era ontem.', rule2T: 'Todo Dia 1 é respeitado', rule2D: 'Ninguém diminui um começo. O Dia 1 merece tanto respeito quanto o Dia 100.', rule3T: 'Recaída não é fracasso', rule3D: 'Não julgue nem dê lição em quem parou. Cair faz parte da jornada.', rule4T: 'Quem volta é recebido, nunca cobrado', rule4D: 'Nada de "cadê você?". Diga "que bom te ver".', rule5T: 'Cuidado é ativo', rule5D: 'Denuncie crueldade quando vir. Se alguém estiver em crise, aponte ajuda de verdade.', rulesNoT: 'O que não entra aqui', rulesNoD: 'Crueldade, humilhação, deboche da jornada de alguém, cobrança disfarçada de motivação, spam e qualquer coisa que faça alguém sentir vergonha de recomeçar.', rulesModT: 'Como funciona a moderação', rulesModD: 'Comentários passam por um filtro de segurança. Denúncias são revisadas e crueldade repetida leva à remoção. Você pode bloquear qualquer pessoa a qualquer momento.', rulesCreed: 'Voltar é sempre bem-vindo.', ncTitle: 'Seu próximo capítulo', ncSealed: 'Um pequeno passo foi preparado para você. Abre amanhã.', ncBlur: 'Amanhã, um passo pequeno vai estar esperando por você aqui.', ncOpen: 'Abrir', ncClose: 'Fechar', ncReady: 'Seu próximo capítulo está esperando.', ncReturnTitle: 'Seu próximo capítulo ainda está aqui.', ncLead: 'Ontem você apareceu. Hoje, o objetivo não é fazer mais — é aparecer de novo.', ncLeadSetback: 'Ontem foi difícil — e você registrou mesmo assim. Hoje, só aparecer já é o passo.', ncReturnLead: 'Você não chegou tarde. Sua história não terminou onde você parou.', ncStepLabel: 'Próximo passo sugerido', ncStep: 'Repita o passo de ontem — do mesmo tamanho, ou menor.', ncId1: 'Você está se tornando alguém que volta, mesmo depois de dias difíceis.', ncId2: 'Você está se tornando alguém que aparece, mesmo quando é pouco.', ncId3: 'Você está se tornando alguém que continua.', ncLineLabel: 'Sua linha de presença', ncCta: 'Este pode ser meu passo de hoje', meaningStep: 'Hoje você não começou de novo. Você continuou de onde tinha parado.', meaningSetback: 'Você registrou até o dia difícil. É assim que uma história de verdade se escreve.', meaningFirst: 'Agora sua história existe. O Dia 1 está escrito.', envQ: 'O que você gostaria de lembrar amanhã?', envPh: 'Uma frase curta pra você de amanhã…', envSave: 'Guardar no envelope', envSkip: 'Agora não', ncSealedEnv: 'Guardado 💌 Seu envelope abre amanhã, junto com o próximo capítulo.', envLead: 'Ontem, você deixou isto para você:', envLeadReturn: 'Isto estava esperando por você. Não expirou.', landDemoCaption: 'Comece uma jornada real em menos de um minuto.', landDemoName: 'Marina', landDemoTitle: 'Voltando a correr', landDemoUpdate: 'Fiquei alguns dias sem treinar. Hoje voltei com uma caminhada de 20 minutos.', landDemoBadge: 'Recomeço', landEx1: '30 dias voltando a treinar', landEx2: '7 dias sem açúcar', landEx3: '100 dias construindo meu negócio', landEx4: '30 dias desenhando de novo', landEx5: 'Minha recuperação, um dia por vez', landExNote1: 'Não importa quantas vezes você tenha parado.', landExNote2: 'Voltar é sempre bem-vindo.',
  },
};

// Espanhol entra por camadas. Este núcleo cobre o primeiro percurso completo
// e mantém o restante em inglês até a revisão humana de cada tela.
const SPANISH_CORE = {
  appName: 'One Up Day',
  heroSub: 'Sigue historias reales, comparte un paso honesto al día y ayuda a las personas a continuar cuando se pone difícil.',
  openingGoogle: 'Abriendo Google…',
  feedQuestion: 'Quién avanza contigo', manageJourneys: 'Mis jornadas', todayCta: 'Registrar el paso de hoy',
  tabAll: 'Todos', tabFollowing: 'Siguiendo',
  homeWelcomeNewEyebrow: 'UN PASO A LA VEZ', homeWelcomeNewTitle: '¿Cuál es tu primer paso?', homeWelcomeNewSub: 'Crea una jornada sencilla y registra lo que realmente ocurre, sin presión.', homeWelcomeNewCta: 'Comenzar mi jornada', homeWelcomeSkip: 'Saltar y explorar el feed', homeWelcomeBackEyebrow: 'Qué bueno verte, {name}.', homeWelcomeBackTitle: '¿Cómo quieres continuar hoy?', homeWelcomeBackSub: 'Elige una jornada para registrar el día o encuentra a alguien a quien acompañar.', homeWelcomeRegister: 'Registrar el día', homeWelcomeDay: 'Día {d} de {t}', homeWelcomeJourneySub: 'Tu presencia puede cambiar el día de alguien.',
  navHome: 'Inicio', navExplore: 'Explorar', navCreate: 'Crear jornada', navToday: 'Registrar hoy', navProfile: 'Tú', navSearch: 'Buscar', navMedia: 'Foto o vídeo', navJourney: 'Nueva jornada',
  startCta: 'Comenzar mi jornada', shareShort: 'Compartir', linkCopied: 'Enlace copiado', follow: 'Seguir', following: 'Siguiendo', followBack: 'Seguir también',
  withYouIdle: 'Estoy contigo', withYouActive: 'Contigo', supporters: 'Ver quién está contigo', supportersLoading: 'Cargando…', supportersEmpty: 'Eres la primera persona en estar aquí.',
  supportStrip: 'Contigo en esta jornada', supportingFmt: 'Apoyando a {name}', progressFmt: '{d} días registrados',
  suggestTitle: 'Personas a quienes apoyar', suggestSub: 'Acompaña a otras personas que también lo están intentando', suggestNewcomer: 'está comenzando',
  needsTitle: 'Alguien necesita de ti hoy', needsCta: 'enviar apoyo', needsSent: 'apoyo enviado 💛',
  comment: 'Comentar', commentClose: 'Cerrar', commentEmpty: 'Aún no hay comentarios. Mantengamos la amabilidad.', commentPlaceholder: 'Escribe algo que apoye…', commentSend: 'Enviar', commentSending: 'Enviando…', commentPendente: 'Tu comentario pasará por una revisión rápida antes de aparecer.', commentUnsafe: 'Ese mensaje no encaja en este espacio.', commentError: 'No se pudo enviar. Inténtalo de nuevo.', commentSomeone: 'Alguien', commentReply: 'Responder', commentMore: 'Ver más comentarios', commentLess: 'Ver menos comentarios', commentReplying: 'Respondiendo a {name}', commentCancel: 'Cancelar',
  wizT1: '¿Cuál es tu objetivo?', wizS1: 'Cuéntanos qué quieres cambiar o comenzar.', wizT2: '¿Qué vas a hacer?', wizS2: 'Describe una acción sencilla.', wizT3: '¿Cuántas veces por semana?', wizT4: 'Tu primer día', wizTpriv: 'Privacidad', wizSpriv: 'Tú decides quién puede verlo.',
  wzTPratica: '¿Cuántas veces por semana?', wzSPratica: 'Un número sencillo es suficiente.', wzTRitmo: '¿Durante cuántos días?', wzSRitmo: 'Puedes cambiarlo más adelante.', wzTHoje: '¿Qué hizo que hoy fuera el día?', wzSHoje: 'Esto será tu Día 1.', wzTMidia: '¿Una foto o un vídeo?', wzSMidia: 'Es opcional. Una jornada no vale menos si está escrita.',
  wzUpOpen: 'Ver ejemplos', wzUpClose: 'Ocultar ejemplos', wzUpQ1: '¿Quieres algunas ideas para encontrar un objetivo que se parezca a ti?', wzUpQ2: '¿Quieres convertir ese objetivo en una acción sencilla?', wzUpQ5: '¿Qué hizo que hoy fuera el día en que decidiste comenzar?',
  ritmoDiario: 'Todos los días', ritmo3x: 'Tres veces por semana', ritmoFds: 'Fines de semana', ritmoOutro: 'Personalizado',
  addPhoto: 'Añadir foto', addVideo: 'Añadir vídeo', post: 'Publicar', posting: 'Publicando…', uploading: 'Subiendo…',
  aiWrite: 'Ayúdame a escribir', aiThinking: 'Pensando…', aiNextStep: 'Sugerir mi próximo paso', aiErr: 'No pude hacerlo ahora. Inténtalo en un momento.', aiRateErr: 'Has usado mucho la IA por ahora. Inténtalo más tarde.',
  rDid: 'Lo hice', rTried: 'Lo intenté', rPaused: 'Tuve que parar, pero volveré', ritualQ: '¿Cómo fue hoy?',
  save: 'Guardar', cancel: 'Cancelar', close: 'Cerrar', back: 'Volver', next: 'Continuar',
  pubPublic: 'Pública', pubFollowers: 'Seguidores', pubPrivate: 'Privada', pubPublicSub: 'Cualquiera puede acompañarte.', pubFollowersSub: 'Solo quienes ya te siguen.', pubPrivateSub: 'Solo tú puedes verla.',
  epBtn: 'Editar perfil', epTitle: 'Editar perfil', epName: 'Nombre', epHandle: 'Usuario', epSave: 'Guardar', epSaving: 'Guardando…', epCancel: 'Cancelar',
  editPhoto: 'Cambiar foto', editBanner: 'Cambiar portada', signOut: 'Cerrar sesión', settings: 'Configuración',
  dayShort: 'Día {d}', dayOfShort: 'Día {d} / {t}', moreOptions: 'Más opciones', moreText: 'más', lessText: 'menos',
  milestoneFmt: 'Hito · Día {d}', tagSetback: 'DÍA DIFÍCIL', tagWin: 'VICTORIA',
  hjOi: 'Hola, {name}.', hjPergunta: '¿Qué merece hoy un paso tuyo?', hjDisse: 'Ayer dijiste que harías:', hjFeito: 'Hoy ya registraste tu día.', hjCta: 'Registrar el día',
  anTitle: 'En proceso', anVoltou: '{name} volvió con el resultado', anQuase: '{name} está en el día {d} de {t}', anEsperando: '{name} aún no ha vuelto', anVer: 'ver resultado', anAcompanhar: 'acompañar',
  amTitle: 'Mañana por aquí', amComecou: '{name} comenzó hoy', amTermina: '{name} termina mañana', amChegou: '{name} llegó al día {t}', amMarco: '{name} llega al día {d} mañana',
  fjEyebrow: 'TU TURNO', fjTitle: 'Comienza tu jornada, {name}', fjSub: 'Un paso pequeño, compartido. Vuelve mañana y continúa.', fjCta: 'Comenzar mi primera jornada', fjHint: 'Toma un minuto. Tú eliges quién puede verla.',
  successTitle: 'Día 1 publicado. Tu jornada ya existe.', successSub: 'Apareciste. Así comienza: un día a la vez.', successShare: 'Compartir tu tarjeta', successView: 'Ver página pública', successExplore: 'Explorar jornadas',
  feedInviteTitle: 'No estás comenzando a solas.', feedInviteSub: 'Mira jornadas reales y acompaña a alguien que lo está intentando.', feedInviteCta: 'Explorar jornadas',
  rulesTitle: 'Reglas de la comunidad', rulesCreed: 'Volver siempre es bienvenido.',
  videoFill: 'Rellenar', videoFit: 'Ver completo',
  start: 'Comenzar', hero1: 'No tienes que ganar todos los días.', hero2: 'Solo necesitas dar el siguiente paso.', heroCta: 'Comenzar mi jornada', seeReal: 'Ver historias reales', tagline: 'Progreso real, sin competencia.',
  loginTitle: 'Entra a tu jornada', loginSub: 'Un lugar para continuar, incluso cuando te detienes.', continueGoogle: 'Continuar con Google', loginTerms: 'Al continuar aceptas nuestras reglas de comunidad.', loginError: 'No pudimos iniciar sesión. Inténtalo de nuevo.',
  yourJourneys: 'Tus jornadas', homeTitle: 'Tu día', newJourney: 'Nueva jornada', noJourneyTitle: 'Todavía no tienes una jornada', noJourneySub: 'Elige algo que quieras comenzar o cambiar.', createFirst: 'Crear mi primera jornada', dayOf: 'Día {d} de {t}', viewPublic: 'Ver perfil público', followingEmptyTitle: 'Todavía no sigues a nadie', followingEmptySub: 'Sigue una jornada y aparecerá aquí.',
  musicAdd: '🎵 Música', musicTitle: 'Elegir una canción', musicUse: 'Usar', musicRemove: 'Quitar', musicEmpty: 'No hay resultados.', musicSearchPh: 'Buscar música…', musicKeyNeeded: 'La música todavía no está configurada.',
  wizBack: 'Atrás', wizNext: 'Continuar', wizStep: 'Paso {n} de {t}', publishJourney: 'Publicar jornada', wzUpEx1: ['Volver a entrenar', 'Dormir mejor', 'Estudiar inglés', 'Organizar mi rutina', 'Comenzar un proyecto'], wzUpEx2: ['Caminar 20 minutos', 'Estudiar una lección', 'Beber más agua', 'Escribir un párrafo', 'Ordenar un cajón'], wzUpEx5: ['Di el primer paso', 'Me cansé de posponerlo', 'Alguien me animó', 'Hoy tuve un poco de tiempo', 'Quiero intentarlo otra vez'],
  wizTcat: 'Categoría', wizScat: 'Ayuda a que las personas correctas encuentren tu jornada.', wizTmom: 'Momento de vida', wizSmom: 'Opcional: conecta con personas que atraviesan algo parecido.', wizS3: 'Un número sencillo es suficiente.', wizS4: 'Tu primer paso comienza hoy.',
  managePost: 'Administrar publicación', mediaReplace: 'Cambiar', mediaRemove: 'Quitar', postDelete: 'Eliminar publicación', postDeleteConfirm: '¿Eliminar esta publicación? No se puede deshacer.',
  trTag: 'Antes y después', trDayFmt: 'Día {d}', trGap: '{n} días entre ambos', trSee: 'ver la jornada', rtTitle: 'Volvieron esta semana', rtCame: '{name} volvió después de {d} días', rtCta: 'dar la bienvenida', rtSent: 'enviado 💛',
  stepQ: '¿Cuál es tu próximo paso?', stepPh: 'por ejemplo, caminar 25 minutos', stepWhenQ: '¿Cuándo?', stepWhens: ['mañana por la mañana', 'mañana por la tarde', 'mañana', 'esta semana'], stepSave: 'Abrir el capítulo', stepNote: 'Opcional. Aparecerá en tu publicación para que puedan acompañarte.', stepBack: 'volverá con el resultado', stepFollow: 'Quiero ver cómo sigue', stepFollowing: 'siguiendo este paso', stepDecided: 'Ayer {name} decidió:', stepResult: 'Resultado', stepOpen: 'Este capítulo sigue abierto', stepResume: 'Continuar donde lo dejé', notifStepResult: '{name} volvió con el resultado 👀',
  wizWhyNote: 'Puedes cambiarlo más adelante, cuando el motivo sea más claro.', momInviteTitle: '¿Quieres caminar con personas que están en un momento parecido?', momInviteSub: 'Opcional. Ayuda a encontrar personas que atraviesan algo similar.', momInviteDone: 'Listo.', momInviteSee: 'Ver quién está en el mismo momento', wizPreview: 'Vista previa',
  pcTitle: '¿Qué notaste en esta persona?', pcSub: 'No es un “me gusta”: es reconocer algo. La persona lo verá.', pcDone: 'Reconocido 💛', pcBlockTitle: 'Lo que las personas notan en ti', pcByN: 'por {n} personas', notifPercepcao: '{name} notó algo en ti 👀',
  ecoTag: 'IA de One Up Day', ecoWhy: '¿por qué veo esto?', ecoDel: 'eliminar', ecoWhyText: 'Upi observa lo que ocurrió en tu jornada. No adivina cosas sobre ti.', ecoDelConfirm: '¿Eliminar esta observación de Upi?', ecoTitle: 'Primer eco', ecoSub: 'Cuando una publicación no tiene comentarios, Upi deja una observación sobre lo que ocurrió.', ecoOn: 'Activado', ecoOff: 'Desactivado', notifEco: 'Upi dejó una observación en tu día',
  kindStep: 'Paso', kindWin: 'Victoria', kindSetback: 'Día difícil', kindLearned: 'Aprendí', composerPh: '¿Qué ocurrió hoy? Una línea es suficiente.', phLivre: 'Escribe aquí. Una línea ya es un registro.', postError: 'No se pudo publicar. Inténtalo de nuevo.', setbackNote: 'Un día difícil también forma parte de la jornada.',
  createEyebrow: 'NUEVA JORNADA', createTitle: '¿Qué quieres comenzar?', createSub: 'Un paso claro hace que sea más fácil volver mañana.', fName: 'Nombre de la jornada', fNamePh: 'por ejemplo, volver a correr', fCategory: 'Categoría', fDuration: 'Duración', fWhy: '¿Por qué importa?', fWhyPh: 'Cuéntalo con tus palabras.', fFirst: '¿Qué hiciste hoy?', fFirstPh: 'Una línea es suficiente.', createBtn: 'Crear jornada', creating: 'Creando…', createError: 'No se pudo crear. Inténtalo de nuevo.',
  catArt: 'Creatividad', catLife: 'Vida', catBody: 'Cuerpo', catHome: 'Casa', catWork: 'Trabajo', catStudy: 'Estudios', catHealth: 'Salud', catMind: 'Bienestar', catMoney: 'Dinero', catRelationship: 'Relaciones', catHabit: 'Hábitos', catCreative: 'Creación', catOther: 'Otra', customCatPh: 'Escribe una categoría',
  seloFiz: 'Lo hice', seloTentei: 'Lo intenté', seloParei: 'Paré, pero volveré', seloComecei: 'Comencé', pergPasso: '¿Cuál fue tu paso?', pergDia1: '¿Qué hizo especial a tu primer día?', pergDepoisDeDificil: '¿Qué quieres que tenga hoy que ayer no tuvo?', pergMarco: '¿Qué es diferente respecto al primer día?', pergGerais: ['¿Qué fue difícil hoy?', 'Un paso que di', 'Algo que aprendí', 'Por qué continúo'], pergOutra: 'otra pregunta',
  ajBtn: 'Ayúdame a aclararlo', ajPensando: 'Un momento…', ajRetry: 'Intentar de nuevo', ajPh: 'Cuéntame un poco más', ajUsar: 'Usar sugerencia', ajPular: 'Ahora no', ajErro: 'La sugerencia no está disponible ahora.',
  wzTTempo: '¿Durante cuánto tiempo?', wzSTempo: 'Puedes cambiarlo después. No es un contrato.', wzActionPh: 'Caminar 20 minutos', wzTRev: 'Revisa tu jornada', wzSRev: 'Puedes editar todo antes de publicar.', wzHojePh: '¿Qué ocurrió hoy para que comenzaras?', ajPorque: 'Dame ideas para explicar por qué importa', ajPrimeiro: 'Sugiere un primer paso', wzRevTitulo: 'Título', wzRevPorque: 'Descripción', wzRevTempo: 'Duración', wzRevDia1: 'Día 1', wzRevCat: 'Categoría', wzRevEditar: 'Volver a editar', wzPraticaPh: '3 veces', ritmoOutroPh: 'Describe tu ritmo', wzRevPratica: 'Práctica', wzRevRitmo: 'Ritmo', ajOpcoes: 'Dame puntos de partida', ajObservavel: 'Hazlo observable', wzPular: 'Saltar esta pregunta',
  dur7: '7 días', dur30: '30 días', dur60: '60 días', dur100: '100 días', durCustom: 'Personalizado', durCustomLabel: 'Días', durCustomPh: 'Número de días', durHint: 'Puedes cambiarlo más adelante.', durDaysWord: 'días',
  mediaAdd: '+ Foto o vídeo', mediaEyebrow: 'AÑADIR', mediaTitle: 'Foto o vídeo', mediaPick: 'Elegir una foto o un vídeo', mediaReplace2: 'Cambiar', mediaDest: '¿Dónde va?', mediaDestJourney: 'En una jornada', mediaDestJourneySub: 'Añadirlo a un día concreto', mediaDestAlbum: 'En mi álbum', mediaDestAlbumSub: 'Una galería personal en tu perfil', mediaWhichJourney: 'Qué jornada', mediaWhichDay: 'Qué día', mediaWhoSees: 'Quién puede verlo', mediaSave: 'Añadir', albumTitle: 'Álbum',
  epHint: 'Cambiar tu usuario también cambia tu enlace público.', epErrName: 'El nombre no puede estar vacío.', epErrHandle: 'El usuario debe tener entre 3 y 20 caracteres.', epErrTaken: 'Este usuario ya está ocupado.', epErrSave: 'No se pudo guardar. Inténtalo de nuevo.', ejBtn: 'Editar', ejTitle: 'Editar jornada', ejName: 'Nombre de la jornada', ejGoal: 'Por qué importa', ejCover: 'Foto de la jornada', ejCoverAdd: 'Añadir foto', ejCoverChange: 'Cambiar foto', ejCoverRemove: 'Quitar foto', mediaRemoveConfirm: '¿Quitar esta foto de la publicación? El texto se mantiene.', euBtn: 'Editar', euTitle: 'Editar día {d}', euText: 'Lo que escribiste', euPhoto: 'Foto del día', euErrEmpty: 'El día necesita texto o una foto.', euDeletePost: 'Eliminar este día',
  cropOriginal: 'Original', cropCover: 'Portada', cropSquare: 'Cuadrada', cropPortrait: 'Vertical', cropLandscape: 'Horizontal', cropUse: 'Usar foto', cropEdit: 'Editar encuadre', cropCancel: 'Cancelar', cropHint: 'Arrastra para ajustar · usa el zoom', cropHintOriginal: 'Foto completa, sin recorte', cropZoom: 'Zoom',
  publicJourney: 'JORNADA PÚBLICA', daysPosted: 'días publicados', daysPostedOne: 'día publicado', recordsFmt: '{n} registros este día', dayStreakLabel: 'días de presencia', dayStreakLabelOne: 'día de presencia', progress: 'progreso',
  followingQ: '¿Sigues el progreso de {name}?', encourageSub: 'Apoya esta jornada y comienza la tuya.', encourageJoin: 'Apoyar y comenzar', dayXofY: 'Día {d} de {t}',
  nfTitle: 'Tu feed todavía está comenzando', nfSub: 'Sigue una jornada para encontrar nuevas historias aquí.', nfCta: 'Explorar personas', shareTitle: 'Comparte esta jornada', shareSub: 'Una tarjeta sencilla que puede viajar a tus historias y mensajes.', shareCard: 'Crear tarjeta', successContinue: 'Continuar con mi jornada', demoLabelDemo: 'Ejemplo', demoExample: 'Así se ve una jornada real.',
  privacyQ: '¿Quién puede ver esto?', aiCareQ: '¿Fue un día difícil? No tienes que hacerlo a solas.', aiCareLight: 'Escribirlo con más calma', aiCareStep: 'Sugerir el paso más pequeño para mañana', aiConsent: 'La IA solo usa tus propios registros para ayudarte.', aiOff: 'Desactivar', aiOffState: 'El acompañante de IA está desactivado.', aiReactivate: 'Activar',
  heartTitle: 'Mientras no estabas', heartLikes: 'te apoyaron', heartFollows: 'comenzaron a seguirte', heartEmpty: 'Todavía no hay novedades.', heartSeeAll: 'Ver notificaciones', notifEncourage: '{name} está contigo', notifFollow: '{name} comenzó a seguir tu jornada', notifEmpty: 'Todavía no hay nada aquí. Todo tiene su momento.', notifComment: '{name} comentó en tu jornada 💬', notifChallenge: '{name} te envió un desafío 🤝', notifChallengeAccept: '{name} aceptó tu desafío', notifMeToo: 'Alguien también pasó por lo que compartiste. No estás a solas 💛', notifHug: '{name} te envió un abrazo 🤗', notifMoodLow: '¿Qué tal si envías un abrazo a {name}?', notifComeback: '{name} volvió después de una pausa 💪', notifWelcome: 'Tu Día 1 comenzó. Estamos contigo 💛',
  moodQ: '¿Cómo te sientes?', moodDown: 'bajo de ánimo', moodAnxious: 'ansioso', moodAngry: 'enojado', moodTired: 'cansado', moodMotivated: 'motivado', moodHappy: 'feliz', moodGrateful: 'agradecido', dailyMoodTitle: '¿Cómo te sientes hoy?', dailyMoodSub: 'Solo para acompañar tu jornada. Aparece suavemente en tu avatar.', dailyMoodSkip: 'Ahora no', prompts: ['¿Qué fue difícil hoy?', 'Un pequeño paso que di', 'Algo que aprendí', 'Por qué continúo'],
  demoC1: 'Estoy contigo 💛', demoC2: 'Un día a la vez. Puedes hacerlo.', demoC3: 'Qué bueno ver esta historia aquí.', hugLabel: 'Enviar un abrazo', hugToast: 'Enviaste un abrazo a {name} 🤗', meToo: 'A mí también', meTooQ: 'Yo también pasé por esto', meTooBack: 'También volví después de parar', meTooTrying: 'Yo también sigo intentándolo', meTooHard: 'Hoy también fue difícil para mí', meTooJust: 'Solo “a mí también”', meTooDone: 'Recibido 💛', meTooAuthor: 'No estás a solas.', meTooCountFmt: '{n} personas también estuvieron aquí', notifHug: '{name} te envió un abrazo 🤗', comebackFmt: 'volvió después de {d} días 💪',
  messages: 'Mensajes', messageSearch: 'Busca una persona por nombre o @usuario', messageEmpty: 'Todavía no hay conversaciones.', messageChoose: 'Elige una conversación para comenzar.', messageStart: 'Escribe algo de apoyo para comenzar.', messagePlaceholder: 'Escribe un mensaje de apoyo…', messageSend: 'Enviar', messageSending: 'Enviando…', messageError: 'No se pudo enviar el mensaje.', messageConnection: 'Puedes enviar mensajes después de que uno de los dos siga al otro.', messageSent: 'Enviado', messageSeen: 'Visto', filterLabel: 'Filtrar', filterAll: 'Todos',
  blockUser: 'Bloquear', blocked: 'Bloqueado', muteTopic: 'Ocultar este tema', pauseNotif: 'Pausar notificaciones', notifPaused: 'Notificaciones pausadas', report: 'Denunciar', reported: 'Denunciado', notifications: 'Notificaciones',
  examplesTitle: 'Comienza con algo como', ex1: '30 días volviendo a entrenar', ex2: '7 días sin azúcar', ex3: '100 días construyendo mi negocio', ex4: '30 días dibujando de nuevo', ex5: 'Mi recuperación, un día a la vez', sugTitle: 'Comienzos populares', cardDay: 'Día', cardOf: 'de', cardStreak: '{n} días de presencia', cardStreakOne: '{n} día de presencia',
  crisisTitle: 'Si esto se siente demasiado pesado', crisisText: 'Hablar con alguien de confianza o con un profesional puede ayudarte. Si estás en peligro inmediato, contacta los servicios de emergencia de tu país.', notTherapy: 'One Up Day acompaña tu jornada, pero no reemplaza ayuda profesional.',
  exploreTitle: 'Explorar jornadas', exploreSub: 'Encuentra personas que están dando su próximo paso.', searchPh: 'Buscar una persona o jornada', allCats: 'Todas', explore: 'Explorar', mediaCaption: 'Descripción (opcional)', mediaCaptionPh: 'Escribe algo sobre esto…', searchTitle: 'Buscar personas', searchPeoplePh: 'Nombre o @usuario', searchHint: 'Escribe para buscar.', searchNone: 'No encontramos a nadie.',
  followersTitle: 'Personas que te siguen', followersNone: 'Todavía nadie te sigue.', followersWho: 'Personas que siguen tu jornada', supportersMineTitle: 'Personas que están contigo', supportersMineWho: '{n} personas están contigo',
  altLabel: 'Descripción de la imagen', altPh: 'Describe brevemente lo que aparece en la foto', altPensando: 'Creando descripción…', altOk: 'Usar descripción', altVazio: 'Sin descripción', altReserva: 'Imagen compartida en la jornada de {name}',
  rDidText: 'Registró que lo hizo', rTriedText: 'Registró que lo intentó', rPausedText: 'Registró una pausa y que volverá', momentQ: '¿En qué momento de tu jornada estás?', momentAll: 'Todos los momentos', mStarting: 'Comenzando', mNotgiveup: 'Sin rendirse', mRebuilding: 'Volviendo a construir', mHealth: 'Cuidando la salud', mCourage: 'Reuniendo valor', mHardphase: 'Atravesando una etapa difícil', mBuilding: 'Construyendo algo nuevo',
  companionTitle: 'Tu acompañante', companionBtn: 'Pedir una sugerencia', companionLoading: 'Pensando en tu jornada…', retroLink: 'Ver retrospectiva', retroTitle: 'Tu camino hasta aquí', retroDays: '{n} días registrados', retroBack: 'Volver a la jornada', retroProgress: 'Progreso de la jornada', retroStarted: 'Comenzaste el', retroHighlights: 'Momentos destacados', retroNothing: 'Aún no hay suficientes registros.',
  groupPeople: 'Personas', groupIntro: 'Camina junto a otras personas con un objetivo parecido.', groupEmpty: 'Todavía no hay grupos para este tema.', groups: 'Grupos', optional: 'Opcional', jDeleteBtn: 'Eliminar jornada', jDeleteConfirm: '¿Eliminar esta jornada? Esta acción no se puede deshacer.', jDeleteErr: 'No se pudo eliminar la jornada.', jdShow: 'Mostrar detalles', jdHide: 'Ocultar detalles', jdEmpty: 'Todavía no hay registros.', jdLoading: 'Cargando jornada…', jfOpen: 'Abrir jornada', jfClose: 'Cerrar jornada', mediaAddShort: 'Añadir', newJourneyShort: 'Nueva', dpPrev: 'Día anterior', dpNext: 'Día siguiente',
  chTitle: 'Invita a alguien a caminar contigo', chBtn: 'Desafiar a un amigo', chModalTitle: 'Crear un desafío', chWhat: '¿Qué van a hacer juntos?', chPh: 'por ejemplo, caminar 20 minutos', chDays: '¿Cuántos días?', chSend: 'Enviar desafío', chSending: 'Enviando…', chSent: 'Desafío enviado', chErrExists: 'Ya existe un desafío para esta jornada.', chErrConn: 'No se pudo conectar.', chErr: 'No se pudo enviar el desafío.', chInviteFrom: '{name} te invitó a caminar juntos', chAccept: 'Aceptar', chDecline: 'Ahora no', chWaiting: 'Esperando respuesta', chTogether: 'Caminando juntos', chCheck: 'Marcar el día', chChecked: 'Día marcado', chPresence: 'presencia compartida', chDone: 'Desafío completado', chOpen: 'Ver desafío', chPageEyebrow: 'DESAFÍO COMPARTIDO', chEmpty: 'Todavía no tienes desafíos.', chStripTag: 'JUNTOS', chStripSee: 'Ver desafío', chStamp: 'Día {d} juntos', firstDayDefault: 'Hoy di el primer paso.',
  pushTitle: 'Notificaciones', pushTest: 'Probar notificación', pushTestSent: 'Notificación enviada', pushTestFail: 'No se pudo enviar la notificación.', pushOnSub: 'Recibe recordatorios amables para volver.', pushOffSub: 'Las notificaciones están desactivadas.', pushDenied: 'El navegador bloqueó las notificaciones.', pushTurnOn: 'Activar notificaciones', pushTurnOff: 'Desactivar notificaciones', pushWait: 'Guardando…', chRemovePhoto: 'Quitar foto del desafío', chRemovePhotoConfirm: '¿Quitar esta foto?',
  profTabJourneys: 'Jornadas', profTabQuotes: 'Frases', quotesEmpty: 'Todavía no hay frases.', quotesEmptyCta: 'Compartir una frase', profTabAlbum: 'Álbum', profTabPeople: 'Personas', albumEmpty: 'Todavía no hay fotos en el álbum.', albumEmptyCta: 'Añadir una foto', mediaDelete: 'Eliminar foto', mediaDeleteConfirm: '¿Eliminar esta foto?', startYourJourney: 'Comienza tu jornada', dia1PageTitle: 'Tu Día 1', dia1PageSub: 'Todo cambio empieza con un primer paso.', dia1PageCta: 'Publicar mi Día 1', dia1Wall: 'Muro del Día 1', dia1CampaignsTitle: 'Jornadas que comenzaron hoy', dia1CardBtn: 'Ver jornada', dia1Eyebrow: 'EL PRIMER PASO', dia1Big: 'Día 1', dia1Invite: 'Comparte tu comienzo', dia1By: 'por {name}', challengeBtn: 'Desafiar', challengeMsg: 'Te propongo caminar conmigo.', movementTitle: 'Movimiento de hoy', movementSub: 'Personas que dieron un paso hoy', shareDownloading: 'Preparando tarjeta…', encourage: 'Estoy contigo', encouraged: 'Estás contigo', photoAdded: 'Foto añadida', before: 'Antes', now: 'Ahora',
  obTitle: 'Bienvenido a One Up Day', obSub: 'Un lugar para avanzar sin compararte.', obStep1: 'Elige algo que quieras cambiar.', obStep2: 'Registra un paso cada día.', obStep3: 'Acompaña a otras personas.', feedTitle: 'Tu feed', trendingTitle: 'Jornadas populares', goalWord: 'Objetivo', ejCategory: 'Categoría', ejDuration: 'Duración', ejPrivacy: 'Privacidad', ejDurMin: 'Mínimo {n} días', ejDurNote: 'Puedes cambiarlo más adelante.', wizWhyOptional: 'Opcional', wizPrivShort: 'Quién puede ver tu jornada', wizPrivChange: 'Puedes cambiarlo cuando quieras.',
  aboutTitle: 'Sobre One Up Day', aboutText: 'Una red social para registrar avances reales, un día a la vez.', heroDesc: 'Comparte tu próximo paso y encuentra personas que también están intentando.', heroOnde: '¿Dónde estás hoy?', landHeadline: 'No tienes que hacerlo todo hoy.', landSub: 'Solo necesitas dar el próximo paso.', landCta: 'Comenzar', landSafety: 'Sin ranking. Sin competencia. Sin venta de datos.',
  espTeaser: 'Un espejo de tu propio camino', espEyebrow: 'LO QUE TU JORNADA MUESTRA', espClose: 'Cerrar', espPalavra: 'Palabras que cambiaron', espTempo: 'Tiempo de presencia', espTom: 'Tono de tus registros', espRitmo: 'Ritmo de la jornada', pqEyebrow: 'PARA QUE NO LO OLVIDES', capTitle: 'Tu próximo capítulo', capNote: 'Una pausa no borra lo que ya construiste.', capVoltar: 'Volver', capVoltarAntes: 'Antes de volver', capVoltarAgora: 'Ahora', capVoltarMaior: 'Esta vez llegaste más lejos', capDificil: 'Día difícil', capDificilProva: 'Lo registraste, y eso también cuenta.', capPresenca: 'Presencia', capPresencaProva: 'Seguiste apareciendo.', pcTiposTitulo: 'Lo que las personas pueden reconocer', caVerbo: 'Usa un verbo', caJornada: 'Nombra tu jornada', caDia: 'Un día a la vez', caChamarVerbo: 'Invita a caminar', caChamarObj: 'a alguien con un objetivo parecido',
  ejErrTitle: 'Revisa tu jornada', mailOr: 'o', mailLabel: 'Tu correo electrónico', mailPh: 'nombre@ejemplo.com', mailSend: 'Enviar código', mailSending: 'Enviando…', mailSent: 'Código enviado', mailCode: 'Código de acceso', mailEnter: 'Escribe el código que recibiste', mailChecking: 'Verificando…', mailResend: 'Enviar otro código', mailWait: 'Espera un momento', mailChange: 'Cambiar correo', mailErr: 'No pudimos verificar este correo.', mailRate: 'Demasiados intentos. Espera un poco.', mailBadCode: 'Ese código no es válido.',
  passo1T: 'Elige una cosa', passo1D: 'No necesitas cambiarlo todo al mismo tiempo.', passo2T: 'Registra lo que ocurrió', passo2D: 'Una línea basta para mantener el hilo.', passo3T: 'Vuelve cuando puedas', passo3D: 'La pausa también forma parte de la historia.', passo4T: 'Acompaña y déjate acompañar', passo4D: 'Aquí no hay ranking ni comparación.', tesePausa: 'La pausa no borra el camino.', difTitle: 'Lo que hacemos diferente', dif: 'Tu progreso no desaparece cuando un día sale mal.', segTitle: 'Tu espacio', seg: 'Tú eliges quién puede acompañarte.', sobreTitle: 'Un lugar para continuar', sobreTexto: 'One Up Day fue creado para registrar avances reales sin convertirlos en una competencia.',
  ascTitulo: 'Alguien volvió hoy', ascSub: 'Acompaña este regreso con una palabra sencilla.', ascCta: 'Estoy contigo', ascIndo: 'En camino', ascSeguindoT: 'Siguiendo', ascSeguindoP: 'Tú y {name} están siguiendo esta jornada.', ascParar: 'Dejar de seguir', ascErro: 'No se pudo actualizar.', exemploSelo: 'EJEMPLO REAL', exemploDias: 'días', exemploPresenca: 'presencias', exemploProgresso: 'progreso', acaoT: 'Pequeñas acciones', acao1: 'Escribe una línea', acao2: 'Marca tu presencia', acao3: 'Acompaña a alguien', comoTitle: 'Cómo funciona', como1T: 'Elige tu objetivo', como1D: 'Puede ser grande o muy sencillo.', como2T: 'Registra cada día', como2D: 'Texto, foto o vídeo, como prefieras.', como3T: 'Sigue avanzando', como3D: 'Si paras, puedes volver.',
  confiTitle: 'Confianza por diseño', confi: 'Sin venta de datos, sin ranking público y con controles claros.', estadoT: 'Tu estado', estadoD: 'Comparte solo lo que quieras compartir.', verComo: 'Ver cómo funciona', emAcaoT: 'En acción', emAcaoD: 'Una jornada se construye con pequeños registros.', aboutLead: 'Tu historia no necesita ser perfecta para ser compartida.', aboutBody: 'One Up Day es un espacio para acompañar cambios reales con honestidad y cuidado.', aboutExamples: 'Entrenar, estudiar, recuperarte, crear o simplemente volver a empezar.', aboutRule: 'Si te detienes, nada se pierde.', aboutData: 'Tus datos son tuyos.', ejSaved: 'Jornada guardada', navQuote: 'Frases',
  citTitle: 'Compartir una frase', citSub: 'Una idea que te acompañó hoy.', citPh: 'Escribe una frase…', citPreview: 'Vista previa', citBg: 'Fondo', citHint: 'Mantén la frase breve para que se lea bien.', citTooLong: 'La frase es demasiado larga.', citAuthor: 'Autor', citAuthorPh: 'Nombre del autor (opcional)', citPost: 'Publicar frase', citPosting: 'Publicando…', citPostError: 'No se pudo publicar la frase.', citWhoSees: 'Quién puede verla', citSave: 'Guardar frase', citSaving: 'Guardando…', citHold: 'Mantén pulsado para guardar', citShare: 'Compartir', citError: 'No se pudo guardar.', histSelo: 'HISTORIA REAL', histTitle: 'Cada día cuenta', histSub: 'Lee cómo otras personas están avanzando.', histCta: 'Ver historias', consistencyLine: 'La constancia se construye volviendo.', pointsWord: 'puntos', pointsExplain: 'Cada registro suma presencia, no perfección.', feedEmpty: 'Todavía no hay publicaciones aquí.', discover: 'Descubrir', justNow: 'ahora mismo', videoAdded: 'Vídeo añadido', videoTooBig: 'El vídeo es demasiado grande.', profileJourneys: 'Jornadas públicas', noPublicJourneys: 'Todavía no hay jornadas públicas.', convEyebrow: 'COMPARTE TU CAMINO', convLinha: 'Una historia puede ayudar a alguien a continuar.', convCta: 'Compartir jornada', convCopiado: 'Copiado', cardSetback: 'Día difícil · aún cuenta', successMore: 'Seguir registrando',
  joinTitle: 'Camina con nosotros', joinSub: 'Crea tu primera jornada en menos de un minuto.', landExplain: 'Elige un objetivo, registra un paso y encuentra apoyo real.', demoLabel: 'EJEMPLO', ideaStart: 'Empieza con algo concreto', ideaStartL: 'Un objetivo claro hace más fácil volver.', ideaShare: 'Comparte lo que ocurre', ideaShareL: 'Texto, foto o vídeo, sin buscar la perfección.', ideaContinue: 'Vuelve cuando puedas', ideaContinueL: 'Una pausa no borra tu historia.', demoFbTitle: 'Así se ve una jornada', thesis1: 'Progreso real', thesis2: 'Apoyo real', thesisSub: 'Sin competencia por atención.', landIdentity1: 'Un paso', landIdentity2: 'cada día', landSeeTitle1: 'Mira el camino', landSeeTitle2: 'no solo el resultado.', ideaSupport: 'Apoyo, no comparación', ideaSupportL: 'Las personas pueden estar contigo sin competir.', landClose1: 'Tu próximo paso', landClose2: 'puede empezar hoy.', landCloseCta: 'Crear mi jornada',
  inviteEyebrow: 'INVITACIÓN', inviteTitle: 'Alguien quiere caminar contigo', inviteP1: 'Te invitó a compartir un objetivo.', inviteP2: 'Cada uno registra su propio camino.', inviteP3: 'No hay ganador. Solo presencia.', inviteCreed: 'Volver siempre es bienvenido.', inviteCta: 'Aceptar invitación', rulesIntro: 'Estas reglas protegen el tipo de espacio que queremos construir.', rule1T: 'Sé humano', rule1D: 'Habla con respeto, incluso cuando no estés de acuerdo.', rule2T: 'Acompaña sin comparar', rule2D: 'La jornada de otra persona no es una medida para la tuya.', rule3T: 'Cuida la privacidad', rule3D: 'Comparte solo lo que te haga sentir seguro.', rule4T: 'No vendas ni engañes', rule4D: 'Nada de spam, estafas o promociones no solicitadas.', rule5T: 'Pide ayuda cuando la necesites', rule5D: 'La comunidad acompaña, pero no reemplaza atención profesional.', rulesNoT: 'Sin ranking', rulesNoD: 'No mostramos una tabla de quién está mejor.', rulesModT: 'Moderación cuidadosa', rulesModD: 'Retiramos ataques y contenido que pone a otros en riesgo.',
  ncTitle: 'Un mensaje para tu futuro', ncSealed: 'Sellado para mañana', ncBlur: 'Se abrirá en la fecha que elegiste.', ncOpen: 'Abrir mensaje', ncClose: 'Cerrar mensaje', ncReady: 'Tu mensaje está listo.', ncReturnTitle: 'Volviste', ncLead: 'Mira lo que te dijiste antes de empezar.', ncLeadSetback: 'Incluso en los días difíciles, dejaste una señal.', ncReturnLead: 'Tu historia continuó desde aquí.', ncStepLabel: 'Paso', ncStep: 'Tu próximo paso', ncId1: 'Lo que decidiste', ncId2: 'Lo que ocurrió', ncId3: 'Lo que aprendiste', ncLineLabel: 'Una línea para recordar', ncCta: 'Escribir mensaje', meaningStep: 'Un paso', meaningSetback: 'Un día difícil', meaningFirst: 'El comienzo', envQ: '¿Qué quieres decirle a tu yo de mañana?', envPh: 'Escribe un mensaje breve…', envSave: 'Guardar para mañana', envSkip: 'Ahora no', ncSealedEnv: 'Mensaje sellado', envLead: 'Déjate una nota para volver a leer.', envLeadReturn: 'Tu yo de antes estaba intentando.', landDemoCaption: 'Un registro real', landDemoName: 'Una jornada', landDemoTitle: 'Volver a estudiar', landDemoUpdate: 'Hoy estudié durante 20 minutos.', landDemoBadge: 'Día 7', landEx1: 'Volver a correr', landEx2: 'Estudiar un idioma', landEx3: 'Cuidar mi salud', landEx4: 'Crear un proyecto', landEx5: 'Dejar un hábito', landExNote1: 'Elige algo que importe para ti.', landExNote2: 'Empieza con un paso pequeño.',
};
dictionaries.en.quoteLabel = 'Quote of the day by {name}';
dictionaries.pt.quoteLabel = 'Citação do dia de {name}';
SPANISH_CORE.quoteLabel = 'Cita del día de {name}';
dictionaries.en.navDiary = 'Private diary'; dictionaries.en.diaryEyebrow = 'JUST FOR YOU'; dictionaries.en.diaryTitle = 'Your private diary'; dictionaries.en.diarySub = 'Write without performing. Nothing here goes to the feed.'; dictionaries.en.diaryDate = 'Day'; dictionaries.en.diaryPh = 'What is on your mind today?'; dictionaries.en.diarySave = 'Save entry'; dictionaries.en.diarySaved = 'Saved'; dictionaries.en.diaryUpTitle = 'Let Up accompany you'; dictionaries.en.diaryUpSub = 'Only when you turn it on. Your diary stays private.'; dictionaries.en.diaryUpOn = 'On'; dictionaries.en.diaryUpOff = 'Off'; dictionaries.en.diaryAsk = 'Ask Up to reflect'; dictionaries.en.diaryUpThinking = 'Up is reading…'; dictionaries.en.diaryUpUnavailable = 'Up is unavailable right now.'; dictionaries.en.diaryHistory = 'Your entries'; dictionaries.en.diaryPrivate = 'Private by design · never published automatically.';
dictionaries.pt.navDiary = 'Diário privado'; dictionaries.pt.diaryEyebrow = 'SÓ PARA VOCÊ'; dictionaries.pt.diaryTitle = 'Seu diário privado'; dictionaries.pt.diarySub = 'Escreva sem precisar mostrar. Nada daqui vai para o feed.'; dictionaries.pt.diaryDate = 'Dia'; dictionaries.pt.diaryPh = 'O que está passando pela sua cabeça hoje?'; dictionaries.pt.diarySave = 'Salvar registro'; dictionaries.pt.diarySaved = 'Salvo'; dictionaries.pt.diaryUpTitle = 'Deixar o Up acompanhar'; dictionaries.pt.diaryUpSub = 'Somente quando você ativar. Seu diário continua privado.'; dictionaries.pt.diaryUpOn = 'Ativado'; dictionaries.pt.diaryUpOff = 'Desativado'; dictionaries.pt.diaryAsk = 'Pedir uma reflexão ao Up'; dictionaries.pt.diaryUpThinking = 'O Up está lendo…'; dictionaries.pt.diaryUpUnavailable = 'O Up não está disponível agora.'; dictionaries.pt.diaryHistory = 'Seus registros'; dictionaries.pt.diaryPrivate = 'Privado por padrão · nada é publicado automaticamente.';
SPANISH_CORE.navDiary = 'Diario privado'; SPANISH_CORE.diaryEyebrow = 'SOLO PARA TI'; SPANISH_CORE.diaryTitle = 'Tu diario privado'; SPANISH_CORE.diarySub = 'Escribe sin actuar. Nada de aquí va al feed.'; SPANISH_CORE.diaryDate = 'Día'; SPANISH_CORE.diaryPh = '¿Qué tienes en la cabeza hoy?'; SPANISH_CORE.diarySave = 'Guardar registro'; SPANISH_CORE.diarySaved = 'Guardado'; SPANISH_CORE.diaryUpTitle = 'Dejar que Up te acompañe'; SPANISH_CORE.diaryUpSub = 'Solo cuando lo actives. Tu diario sigue siendo privado.'; SPANISH_CORE.diaryUpOn = 'Activado'; SPANISH_CORE.diaryUpOff = 'Desactivado'; SPANISH_CORE.diaryAsk = 'Pedir una reflexión a Up'; SPANISH_CORE.diaryUpThinking = 'Up está leyendo…'; SPANISH_CORE.diaryUpUnavailable = 'Up no está disponible ahora.'; SPANISH_CORE.diaryHistory = 'Tus registros'; SPANISH_CORE.diaryPrivate = 'Privado por diseño · nada se publica automáticamente.';
dictionaries.en.diaryPh = 'Leave a note for yourself today…'; dictionaries.en.diaryUpSub = 'Up is ready when you need a thoughtful response.'; dictionaries.en.diaryAsk = 'Let Up comment on this note';
dictionaries.pt.diaryPh = 'Deixe uma mensagem para você hoje…'; dictionaries.pt.diaryUpSub = 'O Up está pronto quando você quiser uma resposta cuidadosa.'; dictionaries.pt.diaryAsk = 'Deixar o Up comentar esta mensagem';
SPANISH_CORE.diaryPh = 'Déjate un mensaje para hoy…'; SPANISH_CORE.diaryUpSub = 'Up está listo cuando quieras una respuesta cuidadosa.'; SPANISH_CORE.diaryAsk = 'Dejar que Up comente esta nota';
dictionaries.en.diaryDelete = 'Delete'; dictionaries.en.diaryDeleteConfirm = 'Delete this private note?';
dictionaries.pt.diaryDelete = 'Excluir'; dictionaries.pt.diaryDeleteConfirm = 'Excluir esta mensagem privada?';
SPANISH_CORE.diaryDelete = 'Eliminar'; SPANISH_CORE.diaryDeleteConfirm = '¿Eliminar esta nota privada?';
dictionaries.en.futureTitle = 'Me of the future'; dictionaries.en.futureEyebrow = 'A MESSAGE FOR LATER'; dictionaries.en.futureGreeting = 'Write to the person you are becoming.'; dictionaries.en.futureSub = 'Seal a letter today and open it when the date arrives.'; dictionaries.en.futureLetter = 'Letter'; dictionaries.en.futureGuided = 'Guided capsule'; dictionaries.en.futureWhen = 'Open on'; dictionaries.en.futureTitlePh = 'Give this message a title'; dictionaries.en.futureLetterPh = 'Dear future me…'; dictionaries.en.futureQuestions = ['Who am I today?', 'What do I want to build?', 'What do I hope to remember?']; dictionaries.en.futureDefaultTitle = 'A message from today'; dictionaries.en.futureSeal = 'Seal for the future'; dictionaries.en.futureSealed = 'Sealed'; dictionaries.en.futureHistory = 'Your capsules'; dictionaries.en.futureReady = 'Ready to open'; dictionaries.en.futureOpens = 'Opens on'; dictionaries.en.futureLocked = 'This message is waiting for the right day.'; dictionaries.en.futureReply = 'What I learned'; dictionaries.en.futureReplyPh = 'What changed since you wrote this?'; dictionaries.en.futureReplySave = 'Save reflection'; dictionaries.en.futurePrivate = 'Private by design · never published automatically.'; dictionaries.en.futureCardEyebrow = 'SHARE THE BEGINNING'; dictionaries.en.futureCardTitle = 'Turn this moment into a card'; dictionaries.en.futureCardSub = 'The message stays private. Only the invitation to write to the future is shared.'; dictionaries.en.futureCardLine = 'I wrote to the person I am becoming.'; dictionaries.en.futureCardCaption = 'I created a capsule for my future self.'; dictionaries.en.futureCardPublish = 'Publish to feed'; dictionaries.en.futureCardPrivate = 'Keep it private'; dictionaries.en.futureCardSharing = 'Publishing…'; dictionaries.en.futureCardShared = 'Published to your feed.'; dictionaries.en.futureCardAlt = 'Preview of the future capsule card';
dictionaries.pt.futureTitle = 'Eu do futuro'; dictionaries.pt.futureEyebrow = 'UMA MENSAGEM PARA DEPOIS'; dictionaries.pt.futureGreeting = 'Escreva para a pessoa que você está se tornando.'; dictionaries.pt.futureSub = 'Feche uma carta hoje e abra quando a data chegar.'; dictionaries.pt.futureLetter = 'Carta'; dictionaries.pt.futureGuided = 'Cápsula guiada'; dictionaries.pt.futureWhen = 'Abrir em'; dictionaries.pt.futureTitlePh = 'Dê um título para esta mensagem'; dictionaries.pt.futureLetterPh = 'Olá, meu eu do futuro…'; dictionaries.pt.futureQuestions = ['Quem eu sou hoje?', 'O que quero construir?', 'O que espero lembrar?']; dictionaries.pt.futureDefaultTitle = 'Uma mensagem de hoje'; dictionaries.pt.futureSeal = 'Selar para o futuro'; dictionaries.pt.futureSealed = 'Selada'; dictionaries.pt.futureHistory = 'Suas cápsulas'; dictionaries.pt.futureReady = 'Pronta para abrir'; dictionaries.pt.futureOpens = 'Abre em'; dictionaries.pt.futureLocked = 'Esta mensagem está esperando o dia certo.'; dictionaries.pt.futureReply = 'O que aprendi'; dictionaries.pt.futureReplyPh = 'O que mudou desde que você escreveu?'; dictionaries.pt.futureReplySave = 'Salvar reflexão'; dictionaries.pt.futurePrivate = 'Privado por padrão · nada é publicado automaticamente.'; dictionaries.pt.futureCardEyebrow = 'COMPARTILHE O COMEÇO'; dictionaries.pt.futureCardTitle = 'Transforme este momento em um card'; dictionaries.pt.futureCardSub = 'A mensagem continua privada. Só o convite para escrever ao futuro vai para o feed.'; dictionaries.pt.futureCardLine = 'Escrevi para a pessoa que estou me tornando.'; dictionaries.pt.futureCardCaption = 'Criei uma cápsula para o meu futuro.'; dictionaries.pt.futureCardPublish = 'Publicar no feed'; dictionaries.pt.futureCardPrivate = 'Manter privado'; dictionaries.pt.futureCardSharing = 'Publicando…'; dictionaries.pt.futureCardShared = 'Publicado no seu feed.'; dictionaries.pt.futureCardAlt = 'Prévia do card da cápsula do futuro';
SPANISH_CORE.futureTitle = 'Yo del futuro'; SPANISH_CORE.futureEyebrow = 'UN MENSAJE PARA DESPUÉS'; SPANISH_CORE.futureGreeting = 'Escribe para la persona en la que te estás convirtiendo.'; SPANISH_CORE.futureSub = 'Sella una carta hoy y ábrela cuando llegue la fecha.'; SPANISH_CORE.futureLetter = 'Carta'; SPANISH_CORE.futureGuided = 'Cápsula guiada'; SPANISH_CORE.futureWhen = 'Abrir el'; SPANISH_CORE.futureTitlePh = 'Ponle un título a este mensaje'; SPANISH_CORE.futureLetterPh = 'Hola, mi yo del futuro…'; SPANISH_CORE.futureQuestions = ['¿Quién soy hoy?', '¿Qué quiero construir?', '¿Qué espero recordar?']; SPANISH_CORE.futureDefaultTitle = 'Un mensaje de hoy'; SPANISH_CORE.futureSeal = 'Sellar para el futuro'; SPANISH_CORE.futureSealed = 'Sellada'; SPANISH_CORE.futureHistory = 'Tus cápsulas'; SPANISH_CORE.futureReady = 'Lista para abrir'; SPANISH_CORE.futureOpens = 'Se abre el'; SPANISH_CORE.futureLocked = 'Este mensaje espera el día correcto.'; SPANISH_CORE.futureReply = 'Lo que aprendí'; SPANISH_CORE.futureReplyPh = '¿Qué cambió desde que escribiste esto?'; SPANISH_CORE.futureReplySave = 'Guardar reflexión'; SPANISH_CORE.futurePrivate = 'Privado por diseño · nada se publica automáticamente.'; SPANISH_CORE.futureCardEyebrow = 'COMPARTE EL COMIENZO'; SPANISH_CORE.futureCardTitle = 'Convierte este momento en una tarjeta'; SPANISH_CORE.futureCardSub = 'El mensaje sigue siendo privado. Solo se comparte la invitación a escribirle al futuro.'; SPANISH_CORE.futureCardLine = 'Escribí para la persona en la que me estoy convirtiendo.'; SPANISH_CORE.futureCardCaption = 'Creé una cápsula para mi futuro.'; SPANISH_CORE.futureCardPublish = 'Publicar en el feed'; SPANISH_CORE.futureCardPrivate = 'Mantener privado'; SPANISH_CORE.futureCardSharing = 'Publicando…'; SPANISH_CORE.futureCardShared = 'Publicado en tu feed.'; SPANISH_CORE.futureCardAlt = 'Vista previa de la tarjeta de la cápsula del futuro';
dictionaries.en.diaryUpGreeting = 'I’m here with you. This space is just yours.';
dictionaries.pt.diaryUpGreeting = 'Estou aqui com você. Este espaço é só seu.';
SPANISH_CORE.diaryUpGreeting = 'Estoy aquí contigo. Este espacio es solo tuyo.';
dictionaries.en.wzDraftSave = 'Save and continue later';
dictionaries.en.wzDraftSaved = 'Draft saved';
dictionaries.en.wzDraftRestored = 'Draft recovered';
dictionaries.en.languageLabel = 'Language';
dictionaries.pt.wzDraftSave = 'Salvar e continuar depois';
dictionaries.pt.wzDraftSaved = 'Rascunho salvo';
dictionaries.pt.wzDraftRestored = 'Rascunho recuperado';
dictionaries.pt.languageLabel = 'Idioma';
SPANISH_CORE.wzDraftSave = 'Guardar y continuar después';
SPANISH_CORE.wzDraftSaved = 'Borrador guardado';
SPANISH_CORE.wzDraftRestored = 'Borrador recuperado';
SPANISH_CORE.languageLabel = 'Idioma';
dictionaries.en.oneLevels = { 1: 'Start', 2: 'Step', 3: 'Rhythm', 4: 'Presence', 5: 'Inspire', 6: 'Legacy' };
dictionaries.pt.oneLevels = { 1: 'Começo', 2: 'Passo', 3: 'Ritmo', 4: 'Presença', 5: 'Inspira', 6: 'Legado' };
SPANISH_CORE.oneLevels = { 1: 'Comienzo', 2: 'Paso', 3: 'Ritmo', 4: 'Presencia', 5: 'Inspira', 6: 'Legado' };
dictionaries.en.treeTab = 'My tree';
dictionaries.en.treeEyebrow = 'YOUR STORY, ALIVE';
dictionaries.en.treeTitle = 'Tree of Life';
dictionaries.en.treeSub = 'Everything you live here leaves a beautiful mark. Your tree grows with your story and never goes backwards.';
dictionaries.en.treeUp = 'Look how much of your story has already taken root.';
dictionaries.en.treeStageLabel = 'Your tree today';
dictionaries.en.treeShortcut = 'My tree of life';
dictionaries.en.treeDays = '{n} days recorded';
dictionaries.en.treeStages = ['A seed waiting for Day 1', 'Taking root', 'A young tree', 'Growing strong', 'A living tree'];
dictionaries.en.treeStageMessages = ['Your first record will make the first leaves appear.', 'Small steps are already becoming roots.', 'Your presence is giving the tree its own shape.', 'Branches, leaves and life are filling your story.', 'What you have lived here has become a landscape.'];
dictionaries.en.treeVisualAlt = 'A personal tree that grows from the user’s journeys and reflections';
dictionaries.en.treeGrowthEyebrow = 'WHAT MADE IT GROW';
dictionaries.en.treeGrowthTitle = 'Every detail has a story';
dictionaries.en.treeLeaves = 'leaves';
dictionaries.en.treeBranches = 'branches';
dictionaries.en.treeFruits = 'fruits';
dictionaries.en.treeFlowers = 'flowers';
dictionaries.en.treeVisitors = 'reflections';
dictionaries.en.treeButterflies = 'capsules';
dictionaries.en.treePresenceDetail = 'Each day you showed up became a leaf. Hard days count too.';
dictionaries.en.treeBranchesDetail = 'Completed journeys open new branches. They stay as part of your story.';
dictionaries.en.treeWinsDetail = 'Victories become fruits. They are memories, not a score.';
dictionaries.en.treeChallengesDetail = 'Challenges completed together make flowers bloom.';
dictionaries.en.treeReflectionsDetail = 'What you learned and wrote in your diary attracts life to the tree.';
dictionaries.en.treeCapsulesDetail = 'Messages to your future bring butterflies to this landscape.';
dictionaries.en.treePromise = 'Nothing withers here. Pauses are part of the seasons, and your tree continues from where it stopped.';
dictionaries.en.futureCardEdit = 'Create or edit feed card';
dictionaries.en.futureCardEditTitle = 'Card title';
dictionaries.en.futureCardEditLine = 'Card message';
dictionaries.en.futureCardFooter = 'A message for later.';

dictionaries.pt.treeTab = 'Minha árvore';
dictionaries.pt.treeEyebrow = 'SUA HISTÓRIA, VIVA';
dictionaries.pt.treeTitle = 'Árvore da Vida';
dictionaries.pt.treeSub = 'Tudo o que você vive aqui deixa uma marca bonita. Sua árvore cresce com a sua história e nunca volta para trás.';
dictionaries.pt.treeUp = 'Olha o quanto da sua história já criou raízes.';
dictionaries.pt.treeStageLabel = 'Sua árvore hoje';
dictionaries.pt.treeShortcut = 'Minha \u00e1rvore da vida';
dictionaries.pt.treeDays = '{n} dias registrados';
dictionaries.pt.treeStages = ['Uma semente esperando o Dia 1', 'Criando raízes', 'Uma árvore jovem', 'Crescendo forte', 'Uma árvore cheia de vida'];
dictionaries.pt.treeStageMessages = ['Seu primeiro registro fará as primeiras folhas aparecerem.', 'Pequenos passos já estão virando raízes.', 'Sua presença está dando uma forma única à árvore.', 'Galhos, folhas e vida estão preenchendo sua história.', 'O que você viveu aqui já se tornou uma paisagem.'];
dictionaries.pt.treeVisualAlt = 'Uma árvore pessoal que cresce com as jornadas e reflexões da pessoa';
dictionaries.pt.treeGrowthEyebrow = 'O QUE FEZ CRESCER';
dictionaries.pt.treeGrowthTitle = 'Cada detalhe guarda uma história';
dictionaries.pt.treeLeaves = 'folhas';
dictionaries.pt.treeBranches = 'galhos';
dictionaries.pt.treeFruits = 'frutos';
dictionaries.pt.treeFlowers = 'flores';
dictionaries.pt.treeVisitors = 'reflexões';
dictionaries.pt.treeButterflies = 'cápsulas';
dictionaries.pt.treePresenceDetail = 'Cada dia em que você apareceu virou uma folha. Os dias difíceis também contam.';
dictionaries.pt.treeBranchesDetail = 'Jornadas concluídas abrem novos galhos. Eles permanecem como parte da sua história.';
dictionaries.pt.treeWinsDetail = 'Vitórias viram frutos. São lembranças, não pontos.';
dictionaries.pt.treeChallengesDetail = 'Desafios concluídos em companhia fazem nascer flores.';
dictionaries.pt.treeReflectionsDetail = 'O que você aprendeu e escreveu no diário atrai vida para a árvore.';
dictionaries.pt.treeCapsulesDetail = 'Mensagens para o seu futuro trazem borboletas para essa paisagem.';
dictionaries.pt.treePromise = 'Nada murcha aqui. As pausas fazem parte das estações, e sua árvore continua de onde parou.';
dictionaries.pt.futureCardEdit = 'Criar ou editar card do feed';
dictionaries.pt.futureCardEditTitle = 'Título do card';
dictionaries.pt.futureCardEditLine = 'Frase do card';
dictionaries.pt.futureCardFooter = 'Uma mensagem para depois.';

SPANISH_CORE.treeTab = 'Mi árbol';
SPANISH_CORE.treeEyebrow = 'TU HISTORIA, VIVA';
SPANISH_CORE.treeTitle = 'Árbol de la Vida';
SPANISH_CORE.treeSub = 'Todo lo que vives aquí deja una huella bonita. Tu árbol crece con tu historia y nunca retrocede.';
SPANISH_CORE.treeUp = 'Mira cuánto de tu historia ya ha echado raíces.';
SPANISH_CORE.treeStageLabel = 'Tu árbol hoy';
SPANISH_CORE.treeShortcut = 'Mi \u00e1rbol de la vida';
SPANISH_CORE.treeDays = '{n} d\u00edas registrados';
SPANISH_CORE.treeStages = ['Una semilla esperando el Día 1', 'Echando raíces', 'Un árbol joven', 'Creciendo fuerte', 'Un árbol lleno de vida'];
SPANISH_CORE.treeStageMessages = ['Tu primer registro hará aparecer las primeras hojas.', 'Los pequeños pasos ya se están convirtiendo en raíces.', 'Tu presencia le está dando una forma única al árbol.', 'Ramas, hojas y vida están llenando tu historia.', 'Lo que viviste aquí ya se convirtió en un paisaje.'];
SPANISH_CORE.treeVisualAlt = 'Un árbol personal que crece con las jornadas y reflexiones de la persona';
SPANISH_CORE.treeGrowthEyebrow = 'LO QUE LO HIZO CRECER';
SPANISH_CORE.treeGrowthTitle = 'Cada detalle guarda una historia';
SPANISH_CORE.treeLeaves = 'hojas';
SPANISH_CORE.treeBranches = 'ramas';
SPANISH_CORE.treeFruits = 'frutos';
SPANISH_CORE.treeFlowers = 'flores';
SPANISH_CORE.treeVisitors = 'reflexiones';
SPANISH_CORE.treeButterflies = 'cápsulas';
SPANISH_CORE.treePresenceDetail = 'Cada día que estuviste presente se convirtió en una hoja. Los días difíciles también cuentan.';
SPANISH_CORE.treeBranchesDetail = 'Las jornadas completadas abren nuevas ramas que permanecen en tu historia.';
SPANISH_CORE.treeWinsDetail = 'Las victorias se convierten en frutos. Son recuerdos, no puntos.';
SPANISH_CORE.treeChallengesDetail = 'Los desafíos completados en compañía hacen florecer el árbol.';
SPANISH_CORE.treeReflectionsDetail = 'Lo que aprendiste y escribiste en el diario atrae vida al árbol.';
SPANISH_CORE.treeCapsulesDetail = 'Los mensajes para tu futuro traen mariposas a este paisaje.';
SPANISH_CORE.treePromise = 'Aquí nada se marchita. Las pausas son parte de las estaciones y tu árbol continúa donde se detuvo.';
SPANISH_CORE.futureCardEdit = 'Crear o editar tarjeta del feed';
SPANISH_CORE.futureCardEditTitle = 'Título de la tarjeta';
SPANISH_CORE.futureCardEditLine = 'Frase de la tarjeta';
SPANISH_CORE.futureCardFooter = 'Un mensaje para después.';

// Wizard de criação. Estes textos pertencem ao dicionário porque aparecem
// antes de a jornada existir; conteúdo escrito pela pessoa nunca é traduzido.
dictionaries.en.wzGoalGroups = [
  ['Body & health', ['Get back to training', 'Walk more', 'Sleep better', 'Eat better', 'Drink more water']],
  ['Mind & well-being', ['Meditate', 'Feel calmer', 'Take care of my anxiety', 'Start therapy', 'Make more time for myself']],
  ['Study & learning', ['Start studying again', 'Learn English', 'Read more', 'Take a course', 'Study for an exam']],
  ['Everyday life', ['Organize my life', 'Tidy my home', 'Save money', 'Plan my routine', 'Spend less time on my phone']],
  ['Projects & creativity', ['Start a project', 'Bring an idea to life', 'Start drawing again', 'Write a book', 'Start a business']],
  ['Relationships', ['Be more present', 'Call my family', 'Make new friends', 'Take care of my relationship', 'Communicate better']],
];
dictionaries.pt.wzGoalGroups = [
  ['Corpo e saúde', ['Voltar a treinar', 'Caminhar mais', 'Dormir melhor', 'Cuidar da alimentação', 'Beber mais água']],
  ['Mente e bem-estar', ['Meditar', 'Ter mais calma', 'Cuidar da ansiedade', 'Fazer terapia', 'Ter mais tempo para mim']],
  ['Estudos e aprendizado', ['Voltar a estudar', 'Aprender inglês', 'Ler mais', 'Fazer um curso', 'Estudar para uma prova']],
  ['Vida prática', ['Organizar minha vida', 'Arrumar minha casa', 'Economizar dinheiro', 'Planejar minha rotina', 'Usar menos o celular']],
  ['Projetos e criação', ['Começar um projeto', 'Tirar uma ideia do papel', 'Voltar a desenhar', 'Escrever um livro', 'Começar um negócio']],
  ['Relacionamentos', ['Estar mais presente', 'Ligar para minha família', 'Fazer novos amigos', 'Cuidar do meu relacionamento', 'Aprender a conversar melhor']],
];
SPANISH_CORE.wzGoalGroups = [
  ['Cuerpo y salud', ['Volver a entrenar', 'Caminar más', 'Dormir mejor', 'Cuidar mi alimentación', 'Beber más agua']],
  ['Mente y bienestar', ['Meditar', 'Sentirme más tranquilo', 'Cuidar mi ansiedad', 'Empezar terapia', 'Tener más tiempo para mí']],
  ['Estudio y aprendizaje', ['Volver a estudiar', 'Aprender inglés', 'Leer más', 'Hacer un curso', 'Estudiar para un examen']],
  ['Vida cotidiana', ['Organizar mi vida', 'Ordenar mi casa', 'Ahorrar dinero', 'Planear mi rutina', 'Usar menos el teléfono']],
  ['Proyectos y creatividad', ['Empezar un proyecto', 'Hacer realidad una idea', 'Volver a dibujar', 'Escribir un libro', 'Empezar un negocio']],
  ['Relaciones', ['Estar más presente', 'Llamar a mi familia', 'Hacer nuevos amigos', 'Cuidar mi relación', 'Comunicarme mejor']],
];

Object.assign(dictionaries.en, {
  wzExamplesDialog: 'Goal examples',
  wzExamplesTitle: 'Find a starting point',
  wzExamplesSub: 'Choose something that feels close to you.',
  wzExamplesClose: 'Close',
  wzWriteOther: 'Write something else',
  wzUpThinking: 'Up is thinking…',
  wzActionSuggestions: 'Ideas for your goal',
  wzStartSuggestions: 'Choose a way to begin',
  wzFrequencyCustomPh: 'e.g., twice a week',
  wzDurationPh: 'e.g., 30',
  wzDurationHint: 'AI organizes the pace and duration in the final review.',
  wzMediaUp: 'How about saving this moment with a photo or video?',
  wzMediaNote: 'Your video keeps its original format. In the feed it appears in a 4:5 frame, with an option to expand.',
  wzCropPhoto: 'Crop photo',
  wzMediaSkip: 'Continue without a photo or video',
  wzPostPreview: 'Post preview',
  wzYou: 'You',
  wzMyJourney: 'My journey',
  wzDayOne: 'Day 1',
  wzPreviewPhotoAlt: 'Preview of the Day 1 photo',
  wzBackEdit: 'Go back and edit',
  wzOrganizing: 'Organizing your journey…',
  anSub: 'Stories people are still following.',
  amSub: 'Some journeys continue tomorrow.',
  needsSub: 'Showing up can change someone’s day.',
  profileMediaHint: 'Personalize your photo and cover',
  avatarUpdateError: 'Could not update the photo. Try again.',
  bannerUpdateError: 'Could not update the cover. Try again.',
  avatarCropLabel: 'Adjust profile photo',
  ejIdentity: 'Identity',
  ejIdentitySub: 'What people understand when they find your journey.',
  ejPlan: 'Plan',
  ejPlanSub: 'The category and time you chose for this journey.',
  ejAudience: 'Who can follow',
  ejAudienceSub: 'You can change this whenever you want.',
});
Object.assign(dictionaries.pt, {
  wzExamplesDialog: 'Exemplos de objetivo',
  wzExamplesTitle: 'Encontre um ponto de partida',
  wzExamplesSub: 'Escolha algo que tenha a ver com você.',
  wzExamplesClose: 'Fechar',
  wzWriteOther: 'Escrever outra coisa',
  wzUpThinking: 'O Up está pensando…',
  wzActionSuggestions: 'Sugestões para o seu objetivo',
  wzStartSuggestions: 'Escolha uma forma de começar',
  wzFrequencyCustomPh: 'Ex.: 2 vezes por semana',
  wzDurationPh: 'Ex.: 30',
  wzDurationHint: 'A IA organiza o ritmo e a duração na revisão final.',
  wzMediaUp: 'Que tal registrar este momento com uma foto ou vídeo?',
  wzMediaNote: 'O vídeo será preservado no formato original. No feed, ele aparece em um quadro 4:5 com opção de expandir.',
  wzCropPhoto: 'Enquadrar foto',
  wzMediaSkip: 'Continuar sem foto ou vídeo',
  wzPostPreview: 'Prévia do post',
  wzYou: 'Você',
  wzMyJourney: 'Minha jornada',
  wzDayOne: 'Dia 1',
  wzPreviewPhotoAlt: 'Prévia da foto do Dia 1',
  wzBackEdit: 'Voltar e editar',
  wzOrganizing: 'Organizando sua jornada…',
  anSub: 'Histórias que continuam sendo acompanhadas.',
  amSub: 'Algumas jornadas continuam amanhã.',
  needsSub: 'Uma presença pode mudar o dia de alguém.',
  profileMediaHint: 'Personalize sua foto e sua capa',
  avatarUpdateError: 'Não foi possível atualizar a foto. Tente novamente.',
  bannerUpdateError: 'Não foi possível atualizar a capa. Tente novamente.',
  avatarCropLabel: 'Ajustar foto do perfil',
  ejIdentity: 'Identidade',
  ejIdentitySub: 'O que as pessoas entendem quando encontram sua jornada.',
  ejPlan: 'Plano',
  ejPlanSub: 'A categoria e o tempo que você escolheu para caminhar.',
  ejAudience: 'Quem acompanha',
  ejAudienceSub: 'Você pode mudar isso quando quiser.',
});
Object.assign(SPANISH_CORE, {
  wzExamplesDialog: 'Ejemplos de objetivos',
  wzExamplesTitle: 'Encuentra un punto de partida',
  wzExamplesSub: 'Elige algo que tenga que ver contigo.',
  wzExamplesClose: 'Cerrar',
  wzWriteOther: 'Escribir otra cosa',
  wzUpThinking: 'Up está pensando…',
  wzActionSuggestions: 'Ideas para tu objetivo',
  wzStartSuggestions: 'Elige una forma de empezar',
  wzFrequencyCustomPh: 'p. ej., dos veces por semana',
  wzDurationPh: 'p. ej., 30',
  wzDurationHint: 'La IA organiza el ritmo y la duración en la revisión final.',
  wzMediaUp: '¿Qué tal guardar este momento con una foto o un vídeo?',
  wzMediaNote: 'El vídeo conserva su formato original. En el feed aparece en un marco 4:5, con opción de ampliarlo.',
  wzCropPhoto: 'Encuadrar foto',
  wzMediaSkip: 'Continuar sin foto ni vídeo',
  wzPostPreview: 'Vista previa de la publicación',
  wzYou: 'Tú',
  wzMyJourney: 'Mi jornada',
  wzDayOne: 'Día 1',
  wzPreviewPhotoAlt: 'Vista previa de la foto del Día 1',
  wzBackEdit: 'Volver y editar',
  wzOrganizing: 'Organizando tu jornada…',
  anSub: 'Historias que las personas siguen acompañando.',
  amSub: 'Algunas jornadas continúan mañana.',
  needsSub: 'Estar presente puede cambiar el día de alguien.',
  profileMediaHint: 'Personaliza tu foto y tu portada',
  avatarUpdateError: 'No se pudo actualizar la foto. Inténtalo de nuevo.',
  bannerUpdateError: 'No se pudo actualizar la portada. Inténtalo de nuevo.',
  avatarCropLabel: 'Ajustar foto de perfil',
  ejIdentity: 'Identidad',
  ejIdentitySub: 'Lo que las personas entienden al encontrar tu jornada.',
  ejPlan: 'Plan',
  ejPlanSub: 'La categoría y el tiempo que elegiste para esta jornada.',
  ejAudience: 'Quién puede seguirla',
  ejAudienceSub: 'Puedes cambiarlo cuando quieras.',
});
// ---- Menções (@) e o atalho para a jornada inteira ----
dictionaries.en.seeFullJourney = 'Full journey';
dictionaries.pt.seeFullJourney = 'Ver jornada completa';
dictionaries.en.mentionHint = 'Type @ to tag someone';
dictionaries.pt.mentionHint = 'Digite @ para marcar alguém';
dictionaries.en.notifMention = '{name} tagged you';
dictionaries.pt.notifMention = '{name} marcou você';
// ---- Página "Onde você foi marcado" ----
dictionaries.en.navMentions = 'Mentions';
dictionaries.pt.navMentions = 'Menções';
dictionaries.en.mentionsEyebrow = 'WHEN SOMEONE CALLS YOU';
dictionaries.pt.mentionsEyebrow = 'QUANDO ALGUÉM TE CHAMA';
dictionaries.en.mentionsTitle = 'Where you were tagged';
dictionaries.pt.mentionsTitle = 'Onde você foi marcado';
dictionaries.en.mentionsSub = 'Someone wrote your name in their day. Here they all are.';
dictionaries.pt.mentionsSub = 'Alguém escreveu seu nome no dia dela. Aqui estão todas.';
dictionaries.en.mentionsEmpty = 'Nobody has tagged you yet.';
dictionaries.pt.mentionsEmpty = 'Ninguém marcou você ainda.';
dictionaries.en.mentionsBy = '{name} tagged you';
dictionaries.pt.mentionsBy = '{name} marcou você';

// ---- Tela de entrada: quando o dia já foi registrado ----
dictionaries.en.homeWelcomeDoneTitle = 'Today is already written.';
dictionaries.pt.homeWelcomeDoneTitle = 'Hoje já está escrito.';
dictionaries.en.homeWelcomeDoneSub = 'You showed up. Now it is up to you: rest, or go see how others are doing.';
dictionaries.pt.homeWelcomeDoneSub = 'Você apareceu. Agora é com você: descansar, ou ver como os outros estão.';
dictionaries.en.homeWelcomeDoneToday = ' · done today';
dictionaries.pt.homeWelcomeDoneToday = ' · registrado hoje';
dictionaries.en.homeWelcomeChoose = 'Choose a journey';
dictionaries.pt.homeWelcomeChoose = 'Escolher a jornada';
dictionaries.en.homeWelcomeSeeFeed = 'See what happened';
dictionaries.pt.homeWelcomeSeeFeed = 'Ver o que aconteceu';
dictionaries.en.homeWelcomeFeedNews = '{n} people showed up for you';
dictionaries.pt.homeWelcomeFeedNews = '{n} pessoas apareceram por você';

// ---- Primeira vez: a pergunta mais fácil, com exemplos ----
dictionaries.en.homeWelcomeNewTitle = 'What do you want to change?';
dictionaries.pt.homeWelcomeNewTitle = 'O que você quer mudar?';
dictionaries.en.homeWelcomeNewSub = 'Pick something small. You log one day at a time — and if you stop, nothing is lost.';
dictionaries.pt.homeWelcomeNewSub = 'Escolha algo pequeno. Você registra um dia de cada vez, e se parar, nada se perde.';
dictionaries.en.homeWelcomeExemplos = ['Get back to training', 'Study every day', 'Quit smoking', 'A project of mine'];
dictionaries.pt.homeWelcomeExemplos = ['Voltar a treinar', 'Estudar todo dia', 'Parar de fumar', 'Um projeto meu'];
dictionaries.en.homeWelcomeSeeOthers = 'See how other people are doing it';
dictionaries.pt.homeWelcomeSeeOthers = 'Ver como outras pessoas estão fazendo';
dictionaries.en.homeWelcomeDiaryLater = 'If you would rather write just for yourself, for now.';
dictionaries.pt.homeWelcomeDiaryLater = 'Se preferir escrever só para você, por enquanto.';

dictionaries.es = { ...dictionaries.en, ...SPANISH_CORE };
dictionaries.es.seeFullJourney = 'Ver jornada completa';
dictionaries.es.mentionHint = 'Escribe @ para etiquetar a alguien';
dictionaries.es.notifMention = '{name} te etiquetó';
dictionaries.es.homeWelcomeNewTitle = '¿Qué quieres cambiar?';
dictionaries.es.homeWelcomeNewSub = 'Elige algo pequeño. Registras un día a la vez, y si paras, no se pierde nada.';
dictionaries.es.homeWelcomeExemplos = ['Volver a entrenar', 'Estudiar todos los días', 'Dejar de fumar', 'Un proyecto mío'];
dictionaries.es.homeWelcomeSeeOthers = 'Ver cómo lo están haciendo otras personas';
dictionaries.es.homeWelcomeDiaryLater = 'Si prefieres escribir solo para ti, por ahora.';
dictionaries.es.homeWelcomeDoneTitle = 'Hoy ya está escrito.';
dictionaries.es.homeWelcomeDoneSub = 'Apareciste. Ahora decides tú: descansar, o ver cómo están los demás.';
dictionaries.es.homeWelcomeDoneToday = ' · registrado hoy';
dictionaries.es.homeWelcomeChoose = 'Elegir la jornada';
dictionaries.es.homeWelcomeSeeFeed = 'Ver lo que pasó';
dictionaries.es.homeWelcomeFeedNews = '{n} personas aparecieron por ti';
// O `pcTipos` do SPANISH_CORE era uma STRING e substituía o objeto
// inteiro que vem do inglês. Resultado: `(L.tipos||{})[tp]` devolvia
// undefined e a tela mostrava a CHAVE crua — quem usava o app em
// espanhol lia "coragem", "sem_perfeicao". Agora é objeto, como nos
// outros dois idiomas.
dictionaries.es.pcTipos = {
  coragem: 'Valor para empezar',
  voltar: 'Volver después de parar',
  honestidade: 'Decir la verdad sobre el día',
  sem_perfeicao: 'Seguir sin ser perfecto',
  adaptar: 'Cambiar el camino cuando hizo falta',
  limite: 'Respetar un límite',
  mudanca: 'Un cambio que apareció ahora',
  presenca: 'Aparecer en un día difícil',
  acompanho: 'Te estoy acompañando',
  inspirou: 'Esto me inspiró',
};
dictionaries.es.navMentions = 'Menciones';
dictionaries.es.mentionsEyebrow = 'CUANDO ALGUIEN TE LLAMA';
dictionaries.es.mentionsTitle = 'Dónde te etiquetaron';
dictionaries.es.mentionsSub = 'Alguien escribió tu nombre en su día. Aquí están todas.';
dictionaries.es.mentionsEmpty = 'Nadie te ha etiquetado todavía.';
dictionaries.es.mentionsBy = '{name} te etiquetó';

export function getDict(locale) {
  return dictionaries[locale] || dictionaries.en;
}

export function pickLocale(cookieLocale, acceptLanguage) {
  if (cookieLocale && locales.includes(cookieLocale)) return cookieLocale;
  if (acceptLanguage && acceptLanguage.toLowerCase().trim().startsWith('pt')) return 'pt';
  if (acceptLanguage && acceptLanguage.toLowerCase().trim().startsWith('es')) return 'es';
  return 'en';
}

// substitui {chave} pelos valores passados
export function fill(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}
