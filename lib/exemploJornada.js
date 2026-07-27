// ============================================================
// A JORNADA DE EXEMPLO DA LANDING
//
// Não é captura de tela: é a jornada desenhada em HTML, com o
// mesmo visual da página real. Assim ela fica nítida em qualquer
// tela, muda junto com a marca, e o texto continua sendo texto —
// legível por buscador e por leitor de tela.
//
// A foto é de banco, gerada — não há pessoa real exposta.
//
// COMO A HISTÓRIA FOI ESCRITA (vale manter se um dia trocar):
//   · nada de superação heroica. A vitória do dia 7 não é ter
//     aprendido: é ter descoberto que cabia.
//   · a recaída do dia 4 é sem drama e sem desculpa — é o dia
//     que prova que o app não pune.
//   · detalhe concreto em vez de sentimento declarado: "a mesma
//     página do dia 2", "sei quais sete". Sentimento declarado
//     soa a propaganda; detalhe concreto soa a pessoa.
//   · o dia 3 traz outra pessoa para dentro sem pedir nada.
// ============================================================

const PT = {
  titulo: 'Voltei a estudar aos 38',
  motivo: 'Parei no segundo ano. Tenho dois filhos, dois empregos e uma prova em dezembro.',
  autor: 'Ana Ribeiro',
  handle: '@ana.dezembro',
  categoria: 'Estudos',
  dias: [
    { d: 1, k: 'step',
      t: 'Comprei um caderno. Só isso. Foi o que deu para fazer hoje — e faz oito anos que eu não compro um caderno para mim.' },
    { d: 2, k: 'step',
      t: 'Estudei vinte minutos depois que todo mundo dormiu. Li a mesma página três vezes. Na terceira eu entendi.' },
    { d: 3, k: 'step',
      t: 'Meu filho perguntou o que eu estava fazendo. Falei que estava estudando. Ele sentou do lado e fez a lição dele. Ficamos os dois ali, calados.' },
    { d: 4, k: 'setback',
      t: 'Não abri o caderno. Trabalhei até tarde, cheguei, olhei para a mesa e fui dormir. Estou escrevendo para não fingir que o dia não existiu.' },
    { d: 5, k: 'step', foto: '/ex-ana-mesa.jpg',
      t: 'Voltei. Meia hora, a mesma página do dia 2. Tirei uma foto da mesa porque daqui a um ano eu quero lembrar de onde isso começou.' },
    { d: 6, k: 'step',
      t: 'Errei sete das dez questões. Mas eu sei quais sete.' },
    { d: 7, k: 'win',
      t: 'Uma semana. Não aprendi matemática em uma semana. Aprendi que cabem trinta minutos num dia que eu jurava que não cabia.' },
  ],
};

const EN = {
  titulo: 'Back to studying at 38',
  motivo: 'I dropped out in tenth grade. Two kids, two jobs, and an exam in December.',
  autor: 'Ana Ribeiro',
  handle: '@ana.december',
  categoria: 'Study',
  dias: [
    { d: 1, k: 'step',
      t: 'I bought a notebook. That was it. It was all I could do today — and it has been eight years since I bought a notebook for myself.' },
    { d: 2, k: 'step',
      t: 'Studied twenty minutes after everyone was asleep. Read the same page three times. On the third one I got it.' },
    { d: 3, k: 'step',
      t: 'My son asked what I was doing. I said I was studying. He sat down next to me and did his homework. We stayed there, both quiet.' },
    { d: 4, k: 'setback',
      t: 'Did not open the notebook. Worked late, got home, looked at the table and went to bed. Writing this so I do not pretend the day did not happen.' },
    { d: 5, k: 'step', foto: '/ex-ana-mesa.jpg',
      t: 'I came back. Half an hour, the same page from day 2. Took a photo of the table because a year from now I want to remember where this started.' },
    { d: 6, k: 'step',
      t: 'Got seven out of ten wrong. But I know which seven.' },
    { d: 7, k: 'win',
      t: 'One week. I did not learn math in a week. I learned that thirty minutes fit into a day I swore they would not.' },
  ],
};

export function exemploJornada(locale) {
  return (locale || '').startsWith('pt') ? PT : EN;
}
