// ============================================================
// HISTÓRIAS — jornadas de 7 dias já concluídas
//
// São ficção, escritas para mostrar a que serve este lugar antes
// de a rede ter volume próprio. Entram intercaladas no feed, uma a
// cada 4 posts reais, e nunca se passam por pessoa de verdade: o
// card leva um selo "história" e o último dia revela o que é,
// com o convite para começar a sua.
//
// Regras de escrita usadas aqui:
//   · sem foto — a força tem que estar na frase
//   · sem diagnóstico e sem conselho: quem fala é o personagem
//   · sem final triunfal; a jornada termina com a pessoa de pé,
//     não com o problema resolvido
//   · o dia 7 fecha o arco, não faz discurso
//
// Cada história tem 7 dias. Os `kind` seguem o mesmo vocabulário
// do app: step, setback, learned, win.
// ============================================================

export const HISTORIAS = [
  {
    slug: 'quase-desisti-de-mim',
    nome: 'Rafael Moura', handle: '@rafael.maisumpasso', cor: '#5d6c57', cat: 'mind',
    titulo: 'O dia em que quase desisti de mim',
    motivo: 'Não queria mudar o mundo. Queria só provar que ainda dava pra confiar em mim uma vez.',
    dias: [
      { d: 1, k: 'step', t: 'Escrevi num papel: "hoje eu só preciso não desistir de mim". Colei no espelho. É o único plano que eu tenho.' },
      { d: 2, k: 'step', t: 'Fiz o mínimo. Levantei, comi, saí do quarto. Ontem eu não teria feito nenhuma das três.' },
      { d: 3, k: 'setback', t: 'Dia ruim. Fiquei deitado até as duas da tarde olhando o teto. Só vim aqui pra não fingir que não aconteceu.' },
      { d: 4, k: 'step', t: 'Voltei. Sem energia, sem vontade, mas voltei. Descobri que voltar não precisa de vontade.' },
      { d: 5, k: 'learned', t: 'Percebi que eu esperava sentir vontade pra agir. Nesta semana foi o contrário: agi primeiro, a vontade veio depois. Às vezes nem veio, e tudo bem.' },
      { d: 6, k: 'step', t: 'Alguém aqui comentou "eu também". Duas palavras. Li umas seis vezes.' },
      { d: 7, k: 'win', t: 'Sete dias. Não resolvi nada. Mas eu ainda estou aqui, e uma semana atrás isso não era certo.' },
    ],
  },
  {
    slug: 'voltei-depois-de-sumir',
    nome: 'Cris Bataglia', handle: '@cris.voltou', cor: '#b45b52', cat: 'habit',
    titulo: 'Voltei depois de desaparecer',
    motivo: 'Sumi por onze dias. A vergonha de voltar era maior que a vontade de continuar.',
    dias: [
      { d: 1, k: 'step', t: 'Onze dias sumida. Abri o app hoje com o dedo tremendo, achando que ia encontrar cobrança. Não encontrei nada. Só o meu lugar, do jeito que eu deixei.' },
      { d: 2, k: 'step', t: 'Registrei um dia normal, sem nada de especial. Só pra provar pra mim que dá pra continuar sem pedir desculpa antes.' },
      { d: 3, k: 'learned', t: 'A vergonha não era de ter parado. Era de me ver parada. Coisa diferente.' },
      { d: 4, k: 'step', t: 'Hoje foi automático. Fiz e registrei sem pensar. Faz onze dias que eu não tinha um dia automático.' },
      { d: 5, k: 'setback', t: 'Quase sumi de novo. Fiquei com o app aberto uns dez minutos sem escrever. Escrevi isso e pronto, já valeu.' },
      { d: 6, k: 'step', t: 'Uma pessoa que eu nem sigo mandou "que bom te ver de volta". Chorei no ônibus feito boba.' },
      { d: 7, k: 'win', t: 'Sete dias desde a volta. Aprendi a coisa mais útil da minha vida: o lugar continua aqui, mesmo quando eu não estou.' },
    ],
  },
  {
    slug: 'promessa-versao-mais-nova',
    nome: 'Diego Prado', handle: '@diego.promessa', cor: '#c57a43', cat: 'mind',
    titulo: 'A promessa que fiz para a minha versão mais nova',
    motivo: 'Achei uma foto minha aos nove anos. Não consegui olhar nos olhos daquele menino.',
    dias: [
      { d: 1, k: 'step', t: 'Coloquei a foto dos meus nove anos na mesa. Falei em voz alta: "desculpa a demora". Me senti ridículo. Continuei falando.' },
      { d: 2, k: 'step', t: 'Aquele menino queria aula de música. Hoje procurei o preço de um violão usado. Só o preço. Já foi longe demais pra um dia.' },
      { d: 3, k: 'learned', t: 'Passei trinta anos cuidando de todo mundo pra não olhar pra ele. Descobri isso lavando louça, o que é um lugar estranho pra descobrir uma coisa dessas.' },
      { d: 4, k: 'setback', t: 'Hoje eu fui duro comigo do jeito antigo. No meio da bronca lembrei que estava falando com ele também. Parei na hora.' },
      { d: 5, k: 'step', t: 'Comprei o violão. Está encostado na parede, desafinado, e eu passo na frente e sorrio como um idiota.' },
      { d: 6, k: 'step', t: 'Toquei três notas erradas. Ele teria achado o máximo. Eu achei o máximo.' },
      { d: 7, k: 'win', t: 'Sete dias conversando com um menino de nove anos. Hoje consegui olhar a foto sem desviar. Era só isso que ele precisava.' },
    ],
  },
  {
    slug: 'minha-mae-nunca-viu',
    nome: 'Nara Bittencourt', handle: '@nara.continua', cor: '#9a7b5d', cat: 'life',
    titulo: 'Minha mãe nunca viu quem eu estou me tornando',
    motivo: 'Ela morreu em janeiro. Tudo que eu conquisto agora chega tarde demais pra ela ver.',
    dias: [
      { d: 1, k: 'step', t: 'Continuei. Não sei fazer mais nada além de continuar. Ela ia gostar de saber que eu continuei.' },
      { d: 2, k: 'step', t: 'Fiz o café do jeito que ela fazia, com a canela por cima. Chorei e tomei mesmo assim.' },
      { d: 3, k: 'setback', t: 'Peguei o telefone pra ligar pra ela. Levei três segundos pra lembrar. Esses três segundos são a pior parte do dia.' },
      { d: 4, k: 'learned', t: 'Uma amiga disse que a gente não supera, a gente aprende a carregar. Achei brega quando ouvi. Hoje entendi.' },
      { d: 5, k: 'step', t: 'Contei pra ela em voz alta o que eu tinha feito na semana. Falei sozinha na cozinha uns dez minutos. Recomendo.' },
      { d: 6, k: 'step', t: 'Percebi que estou virando uma pessoa que ela não chegou a conhecer. Doeu e me deu orgulho ao mesmo tempo.' },
      { d: 7, k: 'win', t: 'Sete dias. Ela não vai ver. Mas ela está em cada coisa que eu não desisti de fazer, e isso é uma forma de ver.' },
    ],
  },
  {
    slug: 'ultimo-dia-que-disse-amanha',
    nome: 'Tiago Sampaio', handle: '@tiago.hoje', cor: '#b56644', cat: 'habit',
    titulo: 'O último dia em que disse "amanhã"',
    motivo: 'Adiei a minha vida por seis anos usando uma palavra só. Hoje eu queria parar de usar ela.',
    dias: [
      { d: 1, k: 'step', t: 'Comecei sem estar pronto. Sem plano, sem material, sem certeza. Só comecei, que era a única parte que faltava mesmo.' },
      { d: 2, k: 'step', t: 'Vinte minutos. Ruins. Mas vinte minutos que existiram, o que é mais do que os seis anos de "amanhã" produziram.' },
      { d: 3, k: 'learned', t: 'Descobri que "amanhã" nunca foi preguiça. Era medo de descobrir que eu não era bom nisso. Hoje descobri que não sou. Segui mesmo assim.' },
      { d: 4, k: 'setback', t: 'Falei "amanhã" de novo. Ouvi minha própria voz dizendo e tive uma raiva enorme. Fiz metade do que ia fazer, com raiva.' },
      { d: 5, k: 'step', t: 'Hoje não precisei negociar comigo. Sentei e fiz. Primeira vez em anos que foi simples assim.' },
      { d: 6, k: 'step', t: 'Um amigo perguntou como eu tinha começado. Não soube explicar. Comecei, só isso.' },
      { d: 7, k: 'win', t: 'Sete dias sem dizer amanhã. Seis anos de espera contra uma semana de ação — e a semana já rendeu mais.' },
    ],
  },
  {
    slug: 'confiar-na-minha-palavra',
    nome: 'Simone Aguiar', handle: '@simone.palavra', cor: '#687d5f', cat: 'mind',
    titulo: 'Eu só queria voltar a confiar na minha palavra',
    motivo: 'Cumpro tudo que prometo pros outros. Comigo eu minto desde sempre.',
    dias: [
      { d: 1, k: 'step', t: 'Prometi uma coisa minúscula: beber água ao acordar. Cumpri. Fiquei parada na cozinha me sentindo estranha de orgulho por causa de um copo d’água.' },
      { d: 2, k: 'step', t: 'Cumpri de novo. Duas por duas. Faz tempo que eu não tenho um placar assim comigo.' },
      { d: 3, k: 'setback', t: 'Esqueci. Simplesmente esqueci. A antiga eu usaria isso pra desistir do resto todo. Hoje eu só bebi o copo às onze da noite, atrasada, e contou.' },
      { d: 4, k: 'learned', t: 'Percebi que eu prometia coisas grandes demais pra mim de propósito. Assim eu já sabia de antemão que ia falhar, e falhar sozinha dói menos que tentar.' },
      { d: 5, k: 'step', t: 'Aumentei um pouquinho a promessa. Continuei conseguindo. Que coisa mais boba e que coisa mais importante.' },
      { d: 6, k: 'step', t: 'Meu marido perguntou por que eu estava tão bem-humorada. Não soube explicar sem parecer maluca.' },
      { d: 7, k: 'win', t: 'Sete promessas pequenas, sete cumpridas — menos uma, atrasada. Voltei a acreditar em mim por causa de um copo d’água.' },
    ],
  },
  {
    slug: 'ninguem-percebeu-mas-hoje-venci',
    nome: 'Élcio Ramires', handle: '@elcio.hoje', cor: '#4a7d91', cat: 'mind',
    titulo: 'Ninguém percebeu, mas hoje foi uma vitória',
    motivo: 'As minhas maiores vitórias não cabem numa conversa. Queria um lugar onde elas coubessem.',
    dias: [
      { d: 1, k: 'step', t: 'Hoje eu atendi o telefone. Pra qualquer pessoa isso não é nada. Pra mim foi o dia inteiro.' },
      { d: 2, k: 'step', t: 'Respondi três mensagens que estavam paradas há duas semanas. Ninguém notou que demorou. Eu notei que respondi.' },
      { d: 3, k: 'setback', t: 'Hoje não consegui. O telefone tocou e eu deixei tocar. Registrei mesmo assim, porque combinei comigo que os dias assim também contam.' },
      { d: 4, k: 'step', t: 'Saí pra comprar pão. Falei "bom dia" pro moço. Voltei pra casa com o coração acelerado e com pão.' },
      { d: 5, k: 'learned', t: 'Descobri que o problema não é fazer. É achar que devia ser fácil. Quando parei de exigir facilidade, ficou possível.' },
      { d: 6, k: 'step', t: 'Marquei uma consulta. Levei quarenta minutos pra apertar o botão de ligar. Apertei.' },
      { d: 7, k: 'win', t: 'Sete dias de vitórias que ninguém viu. Aqui elas foram vistas, e isso mudou o tamanho delas.' },
    ],
  },
  {
    slug: 'o-dia-em-que-sai-da-cama',
    nome: 'Bia Fontoura', handle: '@bia.janela', cor: '#7b8f87', cat: 'health',
    titulo: 'O dia em que saí da cama',
    motivo: 'Tem semanas em que levantar já é o plano inteiro. Precisava de um lugar que entendesse isso.',
    dias: [
      { d: 1, k: 'step', t: 'Abri a janela. Ficou aberta o dia todo. Foi o que eu consegui e é o que está registrado.' },
      { d: 2, k: 'step', t: 'Tomei banho. Vinte minutos debaixo da água só sentindo que estava acontecendo alguma coisa comigo.' },
      { d: 3, k: 'setback', t: 'Não levantei. Nem pra janela. Escrevi isso aqui deitada e por hoje é o que tem.' },
      { d: 4, k: 'step', t: 'Troquei o lençol. Parece nada. Quem já passou por isso sabe que não é nada.' },
      { d: 5, k: 'learned', t: 'Aprendi a parar de comparar o meu dia com o dia dos outros. O meu dia compete com o meu ontem, e só.' },
      { d: 6, k: 'step', t: 'Sentei na varanda quinze minutos. O sol bateu na perna e eu deixei.' },
      { d: 7, k: 'win', t: 'Sete dias. Levantei em cinco deles. Um ano atrás eu não teria contado os cinco, só os dois.' },
    ],
  },
  {
    slug: 'parei-de-parecer-forte',
    nome: 'Gustavo Lira', handle: '@gustavo.pediuajuda', cor: '#5d6c57', cat: 'mind',
    titulo: 'Eu parei de tentar parecer forte',
    motivo: 'Sou o que resolve tudo pra todo mundo. Não sei pedir nada pra ninguém.',
    dias: [
      { d: 1, k: 'step', t: 'Falei pro meu irmão que eu não estava bem. Levei quarenta minutos de conversa fiada pra chegar na frase.' },
      { d: 2, k: 'step', t: 'Ele ligou hoje só pra saber. Não perguntou nada demais. Foi bom demais.' },
      { d: 3, k: 'learned', t: 'Descobri que "tô de boa" era a mentira que eu mais contei na vida. Umas mil vezes, no chute.' },
      { d: 4, k: 'setback', t: 'Alguém perguntou como eu estava e eu respondi "tudo certo" no automático. Ainda tô treinando.' },
      { d: 5, k: 'step', t: 'Pedi ajuda numa coisa prática do trabalho. O mundo não acabou e o serviço saiu melhor.' },
      { d: 6, k: 'step', t: 'Meu irmão disse que ficou aliviado de eu ter falado. Aliviado. Nunca me ocorreu que o silêncio pesava nele também.' },
      { d: 7, k: 'win', t: 'Sete dias sem bancar o forte. Descobri que pedir ajuda não tirou nada de mim — só dividiu.' },
    ],
  },
  {
    slug: 'a-conversa-que-esperei-anos',
    nome: 'Marlene Sabino', handle: '@marlene.conversa', cor: '#c88054', cat: 'relationship',
    titulo: 'A conversa que esperei anos para ter',
    motivo: 'Eu e meu pai não falamos de verdade desde 2011. Queria tentar antes que não desse mais.',
    dias: [
      { d: 1, k: 'step', t: 'Escrevi a mensagem. Não mandei. Ficou salva nos rascunhos, mas existe, e ontem não existia.' },
      { d: 2, k: 'step', t: 'Mandei. Três linhas. "Queria conversar contigo, quando você puder." Passei o dia com o celular na mão.' },
      { d: 3, k: 'setback', t: 'Ele não respondeu. Tudo bem. Eu já sabia que podia ser assim. Não estou tão bem quanto essa frase parece.' },
      { d: 4, k: 'step', t: 'Ele respondeu. "Pode ser sábado." Duas palavras e eu li umas vinte vezes procurando o tom.' },
      { d: 5, k: 'learned', t: 'Passei quatorze anos esperando ele começar. Descobri que a pessoa que espera o outro começar espera pra sempre.' },
      { d: 6, k: 'step', t: 'Ensaiei o que ia dizer. Depois joguei fora o ensaio. Vou falar o que sair.' },
      { d: 7, k: 'win', t: 'A gente conversou. Não resolveu quatorze anos. Mas em sábado que vem tem outro café, e isso é mais do que eu tinha na segunda.' },
    ],
  },
  {
    slug: 'voltei-onde-eu-tinha-falhado',
    nome: 'Wesley Antunes', handle: '@wesley.devolta', cor: '#2563eb', cat: 'study',
    titulo: 'Eu voltei para o lugar onde tinha falhado',
    motivo: 'Tranquei a faculdade em 2019 e nunca mais passei em frente ao prédio. Este mês eu voltei.',
    dias: [
      { d: 1, k: 'step', t: 'Fui até a secretaria. Só perguntei o que eu precisava fazer. A moça respondeu como se fosse a coisa mais normal do mundo, e talvez seja.' },
      { d: 2, k: 'step', t: 'Peguei o histórico. Vi as notas de 2019 e a matéria que eu abandonei no meio. Doeu menos do que eu imaginava por seis anos.' },
      { d: 3, k: 'setback', t: 'Hoje bateu o "você já é velho pra isso". Passei a tarde inteira nessa frase. Registrei pra ela não virar decisão.' },
      { d: 4, k: 'learned', t: 'Percebi que eu não tinha falhado na faculdade. Eu tinha adoecido durante a faculdade. Não é a mesma história e eu contei errado por seis anos.' },
      { d: 5, k: 'step', t: 'Fiz a rematrícula. Cliquei em confirmar com o coração na boca e depois fiquei olhando a tela de confirmação um tempão.' },
      { d: 6, k: 'step', t: 'Entrei na sala. Sentei no fundo, como em 2019. Mas dessa vez porque eu quis, não porque eu queria sumir.' },
      { d: 7, k: 'win', t: 'Sete dias e eu voltei pro lugar exato onde parei. Descobri que ele não estava me esperando pra cobrar. Estava só me esperando.' },
    ],
  },
  {
    slug: 'vivendo-a-vida-de-outra-pessoa',
    nome: 'Priscila Fanucchi', handle: '@pri.escolhe', cor: '#a855f7', cat: 'life',
    titulo: 'Quando percebi que estava vivendo a vida de outra pessoa',
    motivo: 'Escolhi curso, cidade e carreira pra agradar. Aos 38 anos, resolvi perguntar o que eu queria.',
    dias: [
      { d: 1, k: 'step', t: 'Escrevi uma lista do que eu gosto de verdade. Levei quarenta minutos pra escrever quatro coisas. Quatro.' },
      { d: 2, k: 'step', t: 'Percebi que duas das quatro eram coisas que a minha mãe gosta. Risquei. Sobraram duas.' },
      { d: 3, k: 'learned', t: 'Descobri que eu não sei o que eu quero porque nunca me deram espaço pra descobrir — e porque eu nunca tomei esse espaço.' },
      { d: 4, k: 'setback', t: 'Contei uma parte disso em casa e a conversa azedou. Fiquei o resto da noite achando que fui ingrata.' },
      { d: 5, k: 'step', t: 'Fiz uma das duas coisas da lista. Sozinha, num sábado à tarde. Foi esquisito e foi meu.' },
      { d: 6, k: 'step', t: 'Escrevi mais duas coisas na lista. Estão aparecendo agora que eu abri espaço.' },
      { d: 7, k: 'win', t: 'Sete dias. Não mudei de vida. Mas pela primeira vez em vinte anos a pergunta "o que EU quero" não me pareceu egoísmo.' },
    ],
  },
  {
    slug: 'meu-filho-aprendia-comigo',
    nome: 'Anderson Vidal', handle: '@anderson.exemplo', cor: '#111827', cat: 'relationship',
    titulo: 'O meu filho estava aprendendo comigo sem eu perceber',
    motivo: 'Ele tem 7 anos e repete tudo que eu faço. Inclusive as partes que eu não queria ensinar.',
    dias: [
      { d: 1, k: 'step', t: 'Ele errou o dever e disse "eu sou burro". Ouvi a minha voz na boca dele. Foi o pior som da minha vida.' },
      { d: 2, k: 'step', t: 'Errei uma coisa na frente dele hoje e falei em voz alta: "errei, vou tentar de novo". Ele olhou. Guardou.' },
      { d: 3, k: 'setback', t: 'Explodi por causa do trânsito com ele no banco de trás. Pedi desculpa. Ele disse "tudo bem, pai". Não estava tudo bem.' },
      { d: 4, k: 'learned', t: 'Descobri que ele não presta atenção no que eu falo pra ele. Ele presta atenção no que eu falo pra mim.' },
      { d: 5, k: 'step', t: 'Contei pra ele que eu também tenho dia difícil. Ele achou incrível. Pais também têm dia ruim, quem diria.' },
      { d: 6, k: 'step', t: 'Ele errou de novo hoje. Falou "vou tentar de novo". Precisei sair da sala pra ele não me ver.' },
      { d: 7, k: 'win', t: 'Sete dias tentando ser melhor comigo mesmo. Não era por mim. Mas acabou sendo, e ele está aprendendo os dois.' },
    ],
  },
  {
    slug: 'primeiro-nao-sem-desculpa',
    nome: 'Talita Barreiros', handle: '@talita.limite', cor: '#f02f87', cat: 'mind',
    titulo: 'O primeiro "não" que disse sem pedir desculpa',
    motivo: 'Eu digo sim pra tudo e depois passo a semana com raiva de mim.',
    dias: [
      { d: 1, k: 'step', t: 'Disse não pra um favor de fim de semana. Escrevi "desculpa" três vezes e apaguei as três. Mandei só o não.' },
      { d: 2, k: 'setback', t: 'Passei o dia inteiro esperando a pessoa ficar brava. Ela respondeu "tranquilo". Perdi um dia com uma briga que só aconteceu na minha cabeça.' },
      { d: 3, k: 'step', t: 'Segundo não da semana. Esse doeu menos e saiu mais rápido.' },
      { d: 4, k: 'learned', t: 'Descobri que "desculpa" era como eu pedia licença pra existir. Tirei a palavra e sobrou eu, o que é assustador e bom.' },
      { d: 5, k: 'setback', t: 'Disse sim pra uma coisa que eu não queria. Percebi na hora e não voltei atrás. Fica pro próximo.' },
      { d: 6, k: 'step', t: 'Uma amiga disse que eu ando diferente. Perguntou se eu tinha feito terapia. Falei que tinha aprendido a dizer não. Ela riu e depois ficou quieta.' },
      { d: 7, k: 'win', t: 'Sete dias e quatro nãos. Ninguém foi embora. Era isso que eu tinha medo, e não aconteceu.' },
    ],
  },
  {
    slug: 'salvei-este-dia',
    nome: 'Otávio Menezes', handle: '@otavio.hoje', cor: '#687d5f', cat: 'mind',
    titulo: 'Eu não consegui salvar tudo, mas consegui salvar este dia',
    motivo: 'Tenho problema demais aberto ao mesmo tempo. Quero aprender a cuidar só das próximas horas.',
    dias: [
      { d: 1, k: 'step', t: 'Parei de tentar resolver o ano. Resolvi só a tarde. A tarde eu dei conta.' },
      { d: 2, k: 'step', t: 'Fiz uma lista com tudo que me apavora e depois risquei tudo que não é de hoje. Sobraram duas coisas de dezessete.' },
      { d: 3, k: 'setback', t: 'A cabeça voltou pra lista inteira de madrugada. Não dormi direito. De manhã risquei de novo.' },
      { d: 4, k: 'learned', t: 'Aprendi que pensar no ano todo não é planejamento. Comigo é só sofrimento adiantado.' },
      { d: 5, k: 'step', t: 'Resolvi uma das duas coisas do dia. A outra ficou pra amanhã e o mundo continuou girando.' },
      { d: 6, k: 'step', t: 'Um problema que eu carregava há meses se resolveu sozinho. Eu tinha gasto semanas com ele.' },
      { d: 7, k: 'win', t: 'Sete dias salvos, um de cada vez. Ainda tem quinze problemas em aberto. Mas eu tenho sete dias de prova de que dou conta de um.' },
    ],
  },
  {
    slug: 'a-fotografia-que-quase-apaguei',
    nome: 'Ester Vilanova', handle: '@ester.prova', cor: '#c88054', cat: 'life',
    titulo: 'A fotografia que quase apaguei',
    motivo: 'Eu apago toda foto minha. Este mês eu decidi guardar uma, mesmo odiando.',
    dias: [
      { d: 1, k: 'step', t: 'Tirei uma foto de um dia comum. Cozinha bagunçada, cabelo preso, cara de cansada. O dedo foi pro lixo e eu segurei.' },
      { d: 2, k: 'step', t: 'Olhei a foto de novo. Continuo não gostando. Continua salva.' },
      { d: 3, k: 'setback', t: 'Apaguei três outras fotos hoje no automático. Percebi depois. Essa uma eu não apaguei.' },
      { d: 4, k: 'learned', t: 'Descobri que eu não apago as fotos por causa da aparência. Apago pra não ter prova de que aquele dia existiu.' },
      { d: 5, k: 'step', t: 'Tirei outra. Já são duas. Um álbum de duas fotos que eu odeio e guardo.' },
      { d: 6, k: 'step', t: 'Minha filha viu a primeira foto e disse "que legal, você tava fazendo bolo". Ela viu bolo. Eu tinha visto derrota.' },
      { d: 7, k: 'win', t: 'Sete dias e duas fotos guardadas. Daqui a um ano elas vão provar uma coisa que hoje eu não consigo enxergar sozinha.' },
    ],
  },
  {
    slug: 'o-audio-que-deixei-pra-mim',
    nome: 'Renan Copetti', handle: '@renan.audio', cor: '#4a7d91', cat: 'habit',
    titulo: 'O áudio que deixei para mim antes de desistir',
    motivo: 'No dia 1 eu gravei um áudio explicando por que eu estava começando. Guardei pro dia em que eu quisesse parar.',
    dias: [
      { d: 1, k: 'step', t: 'Gravei um áudio de dois minutos explicando pra mim mesmo por que eu comecei. Salvei numa pasta chamada "abra quando quiser parar".' },
      { d: 2, k: 'step', t: 'Dia bom, sem novidade. Nem lembrei do áudio.' },
      { d: 3, k: 'step', t: 'Outro dia normal. Já são três. É a primeira vez que eu chego no três.' },
      { d: 4, k: 'setback', t: 'Quis parar. Abri a pasta. Não tive coragem de ouvir e fechei.' },
      { d: 5, k: 'step', t: 'Ouvi. A minha voz de segunda-feira estava mais convencida do que eu hoje. Fiquei com vergonha de decepcionar aquele cara.' },
      { d: 6, k: 'learned', t: 'Descobri uma coisa: a versão que começa é sempre mais forte que a versão que quer parar. Por isso vale deixar recado.' },
      { d: 7, k: 'win', t: 'Sete dias. Gravei um áudio novo pro próximo dia difícil. A corrente continua.' },
    ],
  },
  {
    slug: 'achei-que-voltei-ao-zero',
    nome: 'Kelly Nascimento', handle: '@kelly.recomeco', cor: '#d87932', cat: 'health',
    titulo: 'Achei que tinha voltado ao zero',
    motivo: 'Recaí depois de quatro meses. Achei que tinha perdido tudo.',
    dias: [
      { d: 1, k: 'setback', t: 'Recaí. Quatro meses jogados fora, foi o que eu pensei o dia inteiro.' },
      { d: 2, k: 'step', t: 'Voltei no dia seguinte. Da primeira vez eu levei três semanas pra voltar. Dessa vez levei um dia.' },
      { d: 3, k: 'learned', t: 'Parei pra pensar: da outra vez eu não sabia nem por onde começar. Dessa vez eu já sabia. Isso não é zero.' },
      { d: 4, k: 'step', t: 'Fiz tudo que eu já sabia fazer, no automático. Quatro meses ensinam a mão, não só a cabeça.' },
      { d: 5, k: 'step', t: 'Contei aqui o que aconteceu. Umas seis pessoas disseram "eu também". Não me senti a única fracassada do mundo.' },
      { d: 6, k: 'step', t: 'Dia calmo. Sem drama. Faz tempo que "sem drama" era o que eu mais queria.' },
      { d: 7, k: 'win', t: 'Sete dias depois da recaída. Perdi a contagem, não perdi o caminho. Ninguém me tira o que eu aprendi nesses quatro meses.' },
    ],
  },
  {
    slug: 'parei-de-me-punir-pelo-tempo',
    nome: 'Iracema Dorneles', handle: '@ira.agora', cor: '#9a7b5d', cat: 'mind',
    titulo: 'O dia em que parei de me punir pelo tempo perdido',
    motivo: 'Passei anos tentando recuperar anos num dia só. Sempre acabava desistindo na quarta-feira.',
    dias: [
      { d: 1, k: 'step', t: 'Fiz a versão pequena. A versão que eu sempre achei pouca. Terminei o dia inteira, o que não acontecia.' },
      { d: 2, k: 'step', t: 'De novo a versão pequena. Sem compensar nada de ontem, de anteontem nem de 2021.' },
      { d: 3, k: 'setback', t: 'Bateu a pressa. Quis fazer o triplo pra "recuperar". Fiz o triplo e acabei exausta. Aprendi na pele de novo.' },
      { d: 4, k: 'step', t: 'Voltei pro pequeno. Cansada, mas voltei — e antigamente a quarta-feira era onde eu sumia.' },
      { d: 5, k: 'learned', t: 'Descobri que tentar recuperar o tempo perdido é a forma mais rápida de perder mais tempo.' },
      { d: 6, k: 'step', t: 'Passei da quarta. Passei da quinta. Estou em território novo.' },
      { d: 7, k: 'win', t: 'Sete dias pequenos. Somados, é mais do que qualquer semana heroica que eu tentei nos últimos cinco anos.' },
    ],
  },
  {
    slug: 'alguem-esperava-minha-volta',
    nome: 'Fábio Quintela', handle: '@fabio.volta', cor: '#5d6c57', cat: 'habit',
    titulo: 'Uma pessoa estava esperando a minha volta',
    motivo: 'Sumi achando que ninguém ia notar. É o que eu sempre achei da minha ausência.',
    dias: [
      { d: 1, k: 'step', t: 'Voltei depois de duas semanas caladas. Não avisei ninguém, porque não tinha ninguém pra avisar.' },
      { d: 2, k: 'step', t: 'Registrei um dia sem graça. Ninguém precisa ver, mas eu preciso escrever.' },
      { d: 3, k: 'step', t: 'Recebi uma mensagem: "vi que você voltou, tava torcendo". Uma pessoa que eu nunca conversei.' },
      { d: 4, k: 'setback', t: 'Fiquei o dia pensando naquilo. Metade emocionado, metade sem saber o que fazer com aquilo.' },
      { d: 5, k: 'learned', t: 'Descobri que eu confundia "ninguém me cobrou" com "ninguém percebeu". São coisas bem diferentes.' },
      { d: 6, k: 'step', t: 'Mandei a mesma mensagem pra outra pessoa que tinha voltado. Levei dois minutos. Pode ser que tenha valido a semana dela.' },
      { d: 7, k: 'win', t: 'Sete dias de volta. Alguém estava esperando. Eu passei a vida achando que a minha ausência não fazia falta.' },
    ],
  },
  {
    slug: 'comecei-por-alguem-continuei-por-mim',
    nome: 'Léo Vasques', handle: '@leo.pormim', cor: '#0ea5e9', cat: 'body',
    titulo: 'Eu comecei por alguém, mas continuei por mim',
    motivo: 'Comecei pra provar uma coisa pra uma pessoa que nem está mais aqui.',
    dias: [
      { d: 1, k: 'step', t: 'Comecei com raiva. Raiva é combustível ruim, mas foi o que eu tinha na segunda-feira.' },
      { d: 2, k: 'step', t: 'Segundo dia. Ainda pensando nela em cada minuto. Pelo menos estava fazendo.' },
      { d: 3, k: 'step', t: 'Hoje passei metade sem lembrar dela. Só percebi no fim.' },
      { d: 4, k: 'setback', t: 'Ela postou uma foto e eu perdi a tarde. Não fiz nada do que ia fazer. Registrei pra não fingir.' },
      { d: 5, k: 'learned', t: 'Descobri que começar por alguém é legítimo. O erro é continuar por alguém — aí a pessoa manda no seu dia sem nem saber.' },
      { d: 6, k: 'step', t: 'Hoje eu fiz e não pensei nela nenhuma vez. Percebi na hora de registrar.' },
      { d: 7, k: 'win', t: 'Sete dias. Comecei por ela e termino por mim. A parte boa é que a segunda razão é a que fica.' },
    ],
  },
  {
    slug: 'a-cadeira-vazia',
    nome: 'Dona Aparecida', handle: '@cida.cadeira', cor: '#c88054', cat: 'creative',
    titulo: 'A cadeira vazia',
    motivo: 'Todo dia eu deixava a cadeira arrumada esperando eu mesma sentar. Passei três anos passando reto.',
    dias: [
      { d: 1, k: 'step', t: 'Sentei. Cinco minutos, sem fazer nada, só sentada na cadeira que eu arrumo há três anos.' },
      { d: 2, k: 'step', t: 'Sentei de novo e abri a caixa de linha. Não costurei. Só abri e olhei.' },
      { d: 3, k: 'step', t: 'Dei os primeiros pontos. Estão tortos. Estão dados.' },
      { d: 4, k: 'setback', t: 'Hoje passei reto de novo. Vi a cadeira, senti o velho aperto, fui pra cozinha. Voltei à noite e sentei dez minutos.' },
      { d: 5, k: 'learned', t: 'Descobri que eu não deixava a cadeira arrumada pra mim. Deixava arrumada pra ter algo esperando por mim.' },
      { d: 6, k: 'step', t: 'Sentei uma hora sem ver o tempo passar. Faz muito tempo que eu não perco a hora fazendo alguma coisa.' },
      { d: 7, k: 'win', t: 'Sete dias e a cadeira deixou de estar vazia. Não foi o pano que ficou pronto. Fui eu que apareci.' },
    ],
  },
  {
    slug: 'a-carta-que-abri',
    nome: 'Vinicius Salgado', handle: '@vini.carta', cor: '#2563eb', cat: 'mind',
    titulo: 'A carta que abri no dia em que queria abandonar tudo',
    motivo: 'Escrevi uma carta pra mim no primeiro dia. Combinei de só abrir se eu quisesse desistir.',
    dias: [
      { d: 1, k: 'step', t: 'Escrevi a carta e lacrei. Uma folha, letra feia, escrita com a mão tremendo de decisão.' },
      { d: 2, k: 'step', t: 'Dia comum. A carta em cima da estante, me olhando.' },
      { d: 3, k: 'step', t: 'Três dias. Comecei a me acostumar com a ideia de que talvez dessa vez vá.' },
      { d: 4, k: 'setback', t: 'Quis parar. Peguei a carta e não abri. Guardei de volta com raiva de mim.' },
      { d: 5, k: 'step', t: 'Abri. Lá dentro tinha uma frase que eu esqueci que sabia: "você já sobreviveu a 2019, isso aqui é menor".' },
      { d: 6, k: 'learned', t: 'Descobri que eu me esqueço do que eu já aguentei. É a coisa que eu mais esqueço na vida.' },
      { d: 7, k: 'win', t: 'Sete dias. Escrevi outra carta pro próximo dia difícil. Dessa vez com uma frase melhor.' },
    ],
  },
  {
    slug: 'progresso-que-nao-aparecia',
    nome: 'Sandra Kopke', handle: '@sandra.dentro', cor: '#7b8f87', cat: 'health',
    titulo: 'O progresso que não aparecia no espelho',
    motivo: 'Sete semanas de esforço e o espelho continua igual. Queria saber se eu estava mudando em algum lugar.',
    dias: [
      { d: 1, k: 'step', t: 'Mais um dia feito. O espelho continua exatamente igual e eu continuo fazendo.' },
      { d: 2, k: 'setback', t: 'Me pesei. Foi um erro. Passei a tarde com raiva de um número.' },
      { d: 3, k: 'step', t: 'Não me pesei. Fiz o que tinha pra fazer e pronto.' },
      { d: 4, k: 'learned', t: 'Percebi uma coisa: eu subo a escada do prédio sem parar no terceiro andar. Faz umas duas semanas. Eu nem tinha reparado.' },
      { d: 5, k: 'step', t: 'Hoje uma pessoa me irritou e eu não explodi. Não sei se tem a ver, mas anotei.' },
      { d: 6, k: 'step', t: 'Dormi bem cinco noites seguidas. Isso não aparece no espelho e é a maior mudança da minha vida.' },
      { d: 7, k: 'win', t: 'Sete dias. O espelho continua igual. Eu não. Aprendi a olhar em outro lugar.' },
    ],
  },
  {
    slug: 'nao-me-tornei-quem-imaginei',
    nome: 'Heloísa Prata', handle: '@helo.tornei', cor: '#a855f7', cat: 'life',
    titulo: 'Eu não me tornei quem imaginei — tornei-me quem precisava',
    motivo: 'Comecei querendo uma coisa. No caminho virei outra pessoa e demorei pra aceitar que foi melhor.',
    dias: [
      { d: 1, k: 'step', t: 'O plano era um. Hoje eu percebi que estou indo pra outro lugar e fiquei brava comigo.' },
      { d: 2, k: 'step', t: 'Insisti no plano original. Foi horrível e não rendeu nada.' },
      { d: 3, k: 'setback', t: 'Chorei de frustração. Não pelo que não deu certo. Por ter que largar a ideia que eu tinha de mim.' },
      { d: 4, k: 'learned', t: 'Descobri que eu não estava perseguindo um objetivo. Estava perseguindo uma versão minha que eu inventei aos 22 anos.' },
      { d: 5, k: 'step', t: 'Mudei o plano. Escrevi o novo numa folha e não olhei mais pro antigo.' },
      { d: 6, k: 'step', t: 'Primeiro dia inteiro no caminho novo. Muito mais leve, e isso me deixou desconfiada — o que já é outro problema meu.' },
      { d: 7, k: 'win', t: 'Sete dias. Não cheguei onde eu queria. Cheguei onde eu precisava, o que é chato de admitir e é verdade.' },
    ],
  },
  {
    slug: 'alguem-percebeu-minha-mudanca',
    nome: 'Jorge Amancio', handle: '@jorge.silencio', cor: '#111827', cat: 'work',
    titulo: 'A primeira vez que alguém disse "eu percebi sua mudança"',
    motivo: 'Fiz tudo calado por meses. Achei que ninguém tinha visto.',
    dias: [
      { d: 1, k: 'step', t: 'Mais um dia trabalhado em silêncio. Não conto pra ninguém o que estou tentando.' },
      { d: 2, k: 'step', t: 'Dia difícil e ninguém soube. É assim que eu prefiro, ou era.' },
      { d: 3, k: 'step', t: 'Terceiro dia seguido. Ninguém em volta faz ideia.' },
      { d: 4, k: 'step', t: 'Um colega falou: "você tá diferente esses tempos". Respondi "que nada". Passei o dia pensando naquilo.' },
      { d: 5, k: 'learned', t: 'Descobri que eu escondia o esforço pra não ter que explicar se desse errado. Custo disso: ninguém pra comemorar junto.' },
      { d: 6, k: 'step', t: 'Contei pra ele o que eu estava fazendo. Ele disse "tava na cara". Tava na cara!' },
      { d: 7, k: 'win', t: 'Sete dias. Descobri que a mudança aparece antes da gente contar. As pessoas veem, só não sabem o nome.' },
    ],
  },
  {
    slug: 'dia-1-e-hoje-conversam',
    nome: 'Camila Berutti', handle: '@camila.dia1', cor: '#f02f87', cat: 'mind',
    titulo: 'O dia 1 e o dia de hoje conversam',
    motivo: 'Reli o que eu escrevi no primeiro dia. Não reconheci a pessoa que escreveu.',
    dias: [
      { d: 1, k: 'step', t: 'Escrevi: "não sei se eu consigo, mas vou tentar até quinta". Quinta era a minha ambição.' },
      { d: 2, k: 'step', t: 'Escrevi: "hoje foi difícil, mas menos que ontem". Já era outra frase.' },
      { d: 3, k: 'setback', t: 'Escrevi: "acho que não é pra mim". Deixei registrado mesmo achando feio.' },
      { d: 4, k: 'step', t: 'Escrevi: "voltei". Uma palavra só. Foi tudo que eu tinha.' },
      { d: 5, k: 'learned', t: 'Reli tudo de uma vez. A pessoa do dia 1 e a de hoje são a mesma, só que uma sabe uma coisa que a outra não sabia.' },
      { d: 6, k: 'step', t: 'Passei de quinta-feira. A ambição do dia 1 ficou pra trás na quinta às oito da manhã.' },
      { d: 7, k: 'win', t: 'Sete dias. Se eu pudesse mandar um recado pra segunda-feira, seria: "vai até quinta. Depois a gente conversa".' },
    ],
  },
  {
    slug: 'perfeito-para-ser-amado',
    nome: 'Igor Bandeira', handle: '@igor.incompleto', cor: '#4a7d91', cat: 'mind',
    titulo: 'Eu pensei que precisava ser perfeito para ser amado',
    motivo: 'Só apareço quando está tudo em ordem. Nos dias ruins eu sumo pra ninguém ver.',
    dias: [
      { d: 1, k: 'step', t: 'Postei num dia mais ou menos. Sem conquista, sem frase bonita. Só o dia como ele foi.' },
      { d: 2, k: 'setback', t: 'Apaguei o que escrevi ontem, depois arrependi e escrevi de novo. Estou ridículo e estou aqui.' },
      { d: 3, k: 'step', t: 'Dia ruim registrado. Duas pessoas responderam. Nenhuma delas fugiu.' },
      { d: 4, k: 'learned', t: 'Descobri que eu confundo ser aceito com ser aprovado. A primeira eu nunca testei porque só mostrava a versão aprovável.' },
      { d: 5, k: 'step', t: 'Contei uma coisa que me dá vergonha. Não morri.' },
      { d: 6, k: 'step', t: 'Alguém disse que se identificou justamente com a parte feia. Fiquei um tempo olhando isso.' },
      { d: 7, k: 'win', t: 'Sete dias sem editar o dia antes de mostrar. Continuo aqui e as pessoas também. Era só isso que eu precisava testar.' },
    ],
  },
  {
    slug: 'porque-nao-desisti-naquele-dia',
    nome: 'Rose Damasceno', handle: '@rose.naqueledia', cor: '#d87932', cat: 'work',
    titulo: 'Aquilo que só aconteceu porque eu não desisti naquele dia',
    motivo: 'Faz três anos eu quase parei numa terça qualquer. Tudo que eu tenho hoje começou por eu não ter parado.',
    dias: [
      { d: 1, k: 'step', t: 'Hoje faz três anos daquela terça. Ninguém sabe dessa data além de mim.' },
      { d: 2, k: 'step', t: 'Fiz as contas do que veio depois daquele dia. Um emprego, duas amizades, uma mudança de cidade.' },
      { d: 3, k: 'learned', t: 'Naquela terça eu não estava decidindo sobre a semana. Estava decidindo sobre três anos, e eu não fazia ideia.' },
      { d: 4, k: 'setback', t: 'Hoje foi de novo uma terça dessas. Reconheci o tipo de dia. Isso ajudou e não resolveu.' },
      { d: 5, k: 'step', t: 'Continuei. Sem mérito nenhum, só continuei.' },
      { d: 6, k: 'step', t: 'Contei essa história pra uma pessoa que estava quase parando. Ela ficou quieta um tempo.' },
      { d: 7, k: 'win', t: 'Sete dias. A gente nunca sabe qual é o dia importante. Por isso vale não largar num dia qualquer.' },
    ],
  },
  {
    slug: 'ainda-estou-aqui',
    nome: 'Antônio Peçanha', handle: '@antonio.aqui', cor: '#687d5f', cat: 'life',
    titulo: 'Ainda estou aqui',
    motivo: 'Não tenho conquista pra mostrar. Tenho presença, e faz um ano que isso não era certo.',
    dias: [
      { d: 1, k: 'step', t: 'Nada aconteceu hoje. Registrei assim mesmo.' },
      { d: 2, k: 'step', t: 'Também não aconteceu nada. Dois dias de nada, anotados.' },
      { d: 3, k: 'step', t: 'Terceiro dia sem novidade. Percebi que "sem novidade" é uma novidade enorme pra quem vem de onde eu venho.' },
      { d: 4, k: 'setback', t: 'Hoje foi pesado sem motivo. Escrevi duas linhas e fechei o app.' },
      { d: 5, k: 'step', t: 'Voltei no dia seguinte, que é a única parte que importa.' },
      { d: 6, k: 'learned', t: 'Aprendi que a minha jornada não tem meta. Tem continuidade. São coisas diferentes e ninguém me contou isso antes.' },
      { d: 7, k: 'win', t: 'Sete dias. Nenhuma conquista. Ainda estou aqui — e um ano atrás eu não teria apostado nisso.' },
    ],
  },
];

// ------------------------------------------------------------
// Monta as histórias no mesmo formato das jornadas demo, para que
// a página /[slug] as renderize sem nenhum código novo.
// Só existem em português: são texto autoral, não tradução.
// ------------------------------------------------------------
export function buildHistorias(locale = 'pt') {
  if (locale !== 'pt') return [];
  return HISTORIAS.map((h) => {
    const updates = h.dias.map((dia, i) => ({
      id: `${h.slug}-day-${dia.d}`,
      day_number: dia.d,
      kind: dia.k,
      text: dia.t,
      photo_url: null,
      video_url: null,
      order: i,
    }));
    return {
      id: `historia-${h.slug}`,
      slug: h.slug,
      isDemo: true,
      isHistoria: true,
      title: h.titulo,
      goal: h.motivo,
      preview: updates[updates.length - 1].text,
      cover_color: h.cor,
      category: h.cat,
      moment: null,
      total_days: 7,
      owner: { name: h.nome, handle: h.handle, avatarUrl: null, avatarColor: h.cor },
      stats: { current_day: 7, streak: 7, progress_pct: 100, days_posted: 7 },
      updates,
    };
  });
}

export function getHistoria(slug, locale = 'pt') {
  return buildHistorias(locale).find((h) => h.slug === slug) || null;
}

// ------------------------------------------------------------
// Itens de feed. Rodízio diário: as 30 histórias não aparecem
// todas de uma vez — a ordem gira conforme o dia do ano, para
// quem abre o app amanhã não reencontrar exatamente o mesmo feed.
// ------------------------------------------------------------
export function buildHistoriaFeedItems(locale = 'pt') {
  const lista = buildHistorias(locale);
  if (!lista.length) return [];

  const hoje = Math.floor(Date.now() / 86400000);
  const giro = hoje % lista.length;
  const ordenadas = [...lista.slice(giro), ...lista.slice(0, giro)];

  return ordenadas.map((h) => {
    const ultimo = h.updates[h.updates.length - 1];
    return {
      id: `feed-${h.slug}`,
      day_number: ultimo.day_number,
      kind: ultimo.kind,
      text: ultimo.text,
      photo_url: null,
      video_url: null,
      demo: true,        // usa as ações de demonstração, sem gravar nada
      historia: true,    // liga o selo e a revelação no fim do card
      encouraged: false,
      journey: {
        slug: h.slug,
        title: h.title,
        category: h.category,
        cover_color: h.cover_color,
        total_days: 7,
        current_day: 7,
        progress_pct: 100,
      },
      owner: {
        id: null,
        name: h.owner.name,
        handle: h.owner.handle,
        avatar_url: null,
        avatar_color: h.owner.avatarColor,
        mood: null,
      },
      supporters: [],
    };
  });
}
