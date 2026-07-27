// ============================================================
// A JORNADA DE EXEMPLO DA LANDING
//
// Não é captura de tela: é a jornada desenhada em HTML, com o
// mesmo visual da página real. Assim fica nítida em qualquer
// tela, muda junto com a marca, e o texto continua sendo texto —
// legível por buscador e por leitor de tela.
//
// A foto é de banco, gerada. Não há pessoa real exposta.
//
// ---- POR QUE A JORNADA ESTÁ NO DIA 7 DE 30, E NÃO EM 100% ----
// "Dia 7 de 7 · 100% de progresso" fazia a história parecer um
// desafio de hábito concluído com perfeição — exatamente a lógica
// que este produto existe para superar. E uma jornada terminada
// não dá motivo para acompanhar.
// Em andamento, ela continua. Que é a tese.
//
// ---- POR QUE OS NÚMEROS SÃO QUALITATIVOS ----
// 7 capítulos · 1 pausa · 1 retorno.
// "1 pausa" e "1 retorno" contados como conquista, não como
// falha, dizem mais sobre o produto do que qualquer porcentagem.
//
// ---- COMO A HISTÓRIA FOI ESCRITA ----
//   · a vitória do dia 7 não é ter aprendido: é ter descoberto
//     que cabia. Recompensa é capacidade, não troféu.
//   · a pausa do dia 4 é sem drama e sem desculpa — é o dia que
//     prova, na tela, que o app não pune.
//   · detalhe concreto em vez de sentimento declarado: "a mesma
//     página do dia 2", "sei quais sete". Sentimento declarado
//     soa a propaganda; detalhe concreto soa a pessoa.
//   · o dia 3 traz outra pessoa para dentro sem pedir nada.
//
// ---- SOBRE A PALAVRA "RECAÍDA" ----
// Dentro do app o selo é "Recaída · ainda conta", e ali faz
// sentido: nasceu para jornadas de dependência e de saúde. Numa
// jornada de estudos, a palavra carrega peso clínico e empurra o
// produto para o lugar de grupo de apoio.
// Aqui o selo é "Dia difícil · ainda conta". Se um dia isso
// mudar no app inteiro, é decisão de produto — não de landing.
// ============================================================

const PT = {
  titulo: 'Voltei a estudar aos 38',
  motivo: 'Parei no segundo ano. Hoje tenho dois filhos, dois empregos e uma prova em dezembro.',
  autor: 'Ana Ribeiro',
  handle: '@ana.dezembro',
  categoria: 'Estudos',
  dia: 7,
  total: 30,
  nums: [
    { n: '7', r: 'capítulos' },
    { n: '1', r: 'pausa' },
    { n: '1', r: 'retorno' },
  ],
  tagDificil: 'Dia difícil · ainda conta',
  proximoT: 'Próximo capítulo',
  proximo: 'Amanhã vou refazer as sete questões que errei.',
  verTudo: 'Ver os sete capítulos',
  dias: [
    { d: 1, k: 'step', destaque: true, rotulo: 'começo pequeno',
      t: 'Comprei um caderno. Só isso. Foi o que deu para fazer hoje — e faz oito anos que eu não compro um caderno para mim.' },
    { d: 2, k: 'step',
      t: 'Estudei vinte minutos depois que todo mundo dormiu. Li a mesma página três vezes. Na terceira eu entendi.' },
    { d: 3, k: 'step',
      t: 'Meu filho perguntou o que eu estava fazendo. Falei que estava estudando. Ele sentou do lado e fez a lição dele. Ficamos os dois ali, calados.' },
    { d: 4, k: 'setback', destaque: true, rotulo: 'dificuldade',
      t: 'Não abri o caderno. Trabalhei até tarde, cheguei, olhei para a mesa e fui dormir. Estou escrevendo para não fingir que o dia não existiu.' },
    { d: 5, k: 'step', foto: '/ex-ana-mesa.jpg',
      t: 'Voltei. Meia hora, a mesma página do dia 2. Tirei uma foto da mesa porque daqui a um ano eu quero lembrar de onde isso começou.' },
    { d: 6, k: 'step',
      t: 'Errei sete das dez questões. Mas eu sei quais sete.' },
    { d: 7, k: 'win', destaque: true, rotulo: 'significado',
      t: 'Uma semana. Não aprendi matemática em uma semana. Aprendi que cabem trinta minutos num dia que eu jurava que não cabia.' },
  ],
};

const EN = {
  titulo: 'Back to studying at 38',
  motivo: 'I dropped out in tenth grade. Today I have two kids, two jobs and an exam in December.',
  autor: 'Ana Ribeiro',
  handle: '@ana.december',
  categoria: 'Study',
  dia: 7,
  total: 30,
  nums: [
    { n: '7', r: 'chapters' },
    { n: '1', r: 'pause' },
    { n: '1', r: 'return' },
  ],
  tagDificil: 'Hard day · still counts',
  proximoT: 'Next chapter',
  proximo: 'Tomorrow I will redo the seven questions I got wrong.',
  verTudo: 'See all seven chapters',
  dias: [
    { d: 1, k: 'step', destaque: true, rotulo: 'a small start',
      t: 'I bought a notebook. That was it. It was all I could do today — and it has been eight years since I bought a notebook for myself.' },
    { d: 2, k: 'step',
      t: 'Studied twenty minutes after everyone was asleep. Read the same page three times. On the third one I got it.' },
    { d: 3, k: 'step',
      t: 'My son asked what I was doing. I said I was studying. He sat down next to me and did his homework. We stayed there, both quiet.' },
    { d: 4, k: 'setback', destaque: true, rotulo: 'the hard part',
      t: 'Did not open the notebook. Worked late, got home, looked at the table and went to bed. Writing this so I do not pretend the day did not happen.' },
    { d: 5, k: 'step', foto: '/ex-ana-mesa.jpg',
      t: 'I came back. Half an hour, the same page from day 2. Took a photo of the table because a year from now I want to remember where this started.' },
    { d: 6, k: 'step',
      t: 'Got seven out of ten wrong. But I know which seven.' },
    { d: 7, k: 'win', destaque: true, rotulo: 'what it meant',
      t: 'One week. I did not learn math in a week. I learned that thirty minutes fit into a day I swore they would not.' },
  ],
};

export function exemploJornada(locale) {
  return (locale || '').startsWith('pt') ? PT : EN;
}
