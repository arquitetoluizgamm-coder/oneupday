-- One Up Day — Udson: começando do zero sem ter mais 20 anos.
-- Perfil editorial separado, sem vínculo com usuários ou e-mails de teste.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;
alter table public.profiles add column if not exists avatar_url text;

insert into public.profiles (id, handle, name, bio, avatar_color, avatar_url)
values (
  '50000000-0000-0000-0000-000000000001'::uuid,
  '@udson.recomeca',
  'Udson',
  'Começando do zero, aos 43, sem fingir que é fácil.',
  '#647b78',
  '/demo-stories/udson-avatar.png'
)
on conflict (id) do update set
  handle = excluded.handle,
  name = excluded.name,
  bio = excluded.bio,
  avatar_color = excluded.avatar_color,
  avatar_url = excluded.avatar_url;

insert into public.journeys
  (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, cover_url, is_public, visibility, editorial_seed)
values (
  '51000000-0000-0000-0000-000000000001'::uuid,
  '50000000-0000-0000-0000-000000000001'::uuid,
  'comecando-do-zero-sem-ter-mais-20-anos',
  'Começando do zero sem ter mais 20 anos',
  'work',
  'rebuilding',
  'Recomeçar profissionalmente aos 43 anos, um passo possível de cada vez.',
  7,
  '#647b78',
  '/demo-stories/udson-zero-01.png',
  true,
  'public',
  true
)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  title = excluded.title,
  category = excluded.category,
  moment = excluded.moment,
  goal = excluded.goal,
  total_days = 7,
  cover_color = excluded.cover_color,
  cover_url = excluded.cover_url,
  is_public = true,
  visibility = 'public',
  editorial_seed = true;

insert into public.updates (id, journey_id, day_number, kind, text, photo_url)
values
  ('52000000-0000-0000-0000-000000000001'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 1, 'step', 'Hoje limpei um canto da mesa da cozinha. Afastei as contas, guardei os brinquedos das crianças e coloquei ali meu computador antigo, um caderno e uma caneta. Não parece um escritório. Parece apenas uma mesa apertada, em uma casa cheia de coisas para resolver. Passei quase uma hora olhando para a tela sem saber o que fazer primeiro. Aos 20 anos, eu começava sem pensar muito. Hoje minha cabeça me lembra de tudo o que pode dar errado. Mesmo assim, abri o primeiro arquivo. Talvez recomeçar seja sentir medo de todas as possibilidades e ainda assim escolher uma delas.', '/demo-stories/udson-zero-01.png'),
  ('52000000-0000-0000-0000-000000000002'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 2, 'setback', 'Hoje assisti a uma aula. O professor parecia ter metade da minha idade e, nos comentários, havia pessoas falando de experiências que eu nunca tive. Pausei o vídeo várias vezes. Em determinado momento, olhei para o reflexo escuro da tela e pensei: o que você está fazendo aqui? Eu me senti velho, não de idade, mas de oportunidade. Quase desliguei o computador. Então meu filho passou pela cozinha, olhou para mim e perguntou: “Pai, você também está estudando?”. Respondi que sim. Ele sorriu: “Então nós dois temos prova”. Talvez ele nunca saiba, mas foi essa frase que me fez continuar hoje.', '/demo-stories/udson-zero-02.png'),
  ('52000000-0000-0000-0000-000000000003'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 3, 'step', 'Hoje preparei meu primeiro trabalho. Ficou longe do que eu imaginava. Apaguei, refiz, mudei tudo e, no final, ainda parecia algo feito por alguém que estava apenas começando. Porque era exatamente isso. Eu estava começando. Aos 20 anos, ninguém estranha quando você ainda não sabe. Depois dos 40, parece que o mundo espera que você já tenha entendido tudo. Senti vergonha de mostrar e pensei em esperar até ficar perfeito. Mas passei anos esperando me sentir pronto. Então enviei. Não recebi elogio nem resposta. Mas, pela primeira vez em muito tempo, coloquei uma parte de mim no mundo novamente.', '/demo-stories/udson-zero-03.png'),
  ('52000000-0000-0000-0000-000000000004'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 4, 'setback', 'Hoje eu desisti. Havia uma cobrança no celular, um problema em casa e uma mensagem dizendo que escolheram outra pessoa para uma oportunidade que eu queria muito. Fechei o computador e guardei o caderno na gaveta. Passei o dia repetindo que aquela ideia era ridícula. Quem começa uma nova vida aos 43 anos? À noite, minha esposa perguntou por que eu não tinha estudado. Respondi irritado: “Porque isso não vai mudar nada”. Ela ficou em silêncio, pegou o caderno da gaveta, colocou novamente sobre a mesa e disse: “Talvez não mude. Mas eu nunca vi você tão vivo quanto nesses últimos dias”. Esperei todos dormirem e voltei para a mesa. Não produzi quase nada, mas abri o computador. Hoje eu desisti e, antes que o dia terminasse, comecei outra vez.', '/demo-stories/udson-zero-04.png'),
  ('52000000-0000-0000-0000-000000000005'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 5, 'learned', 'Hoje encontrei uma fotografia de quando eu tinha 21 anos. Eu estava sorrindo, usando uma roupa que hoje parece engraçada e segurando um papel com planos para o futuro. Naquela época, acreditava que teria tempo para tudo. Alguns planos aconteceram. Outros foram adiados tantas vezes que quase deixaram de parecer meus. Fiquei olhando para aquele rapaz e senti vontade de pedir desculpas por ter desistido de algumas coisas e passado tantos anos dizendo “um dia”. Depois pensei que talvez ele não estivesse decepcionado comigo. Talvez estivesse apenas esperando. Coloquei a fotografia ao lado do computador, não para lembrar de quem eu era, mas para lembrar que aquela pessoa ainda mora em algum lugar dentro de mim.', '/demo-stories/udson-zero-05.png'),
  ('52000000-0000-0000-0000-000000000006'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 6, 'win', 'Hoje recebi minha primeira resposta positiva. Não era um emprego nem uma grande oportunidade. Era apenas alguém dizendo que gostou do que fiz e perguntando quanto eu cobraria por um trabalho pequeno. Li a mensagem várias vezes. Eu queria responder imediatamente, mas minhas mãos começaram a tremer. Fui até o banheiro e chorei em silêncio. Não pelo dinheiro, mas porque alguém que não me conhecia olhou para algo que fiz e enxergou valor. Um familiar me perguntou se eu estava triste. Abri a porta e disse: “Não. Acho que estou voltando”. A pessoa não entendeu tudo, apenas me abraçou. Naquele abraço percebi o quanto precisava que alguém acreditasse em mim, mesmo que naquele momento fosse alguém que ainda achava que eu sabia fazer qualquer coisa.', '/demo-stories/udson-zero-06.png'),
  ('52000000-0000-0000-0000-000000000007'::uuid, '51000000-0000-0000-0000-000000000001'::uuid, 7, 'learned', 'Hoje acordei cedo e preparei café antes de todos levantarem. A casa estava silenciosa. Sentei na mesma mesa que, sete dias atrás, estava coberta de contas e coisas acumuladas. Nada mudou por completo. As dívidas continuam aqui, o medo continua aqui e eu ainda não sei se isso vai funcionar. Ainda comparo meu começo com o caminho de pessoas mais jovens. Mas compreendi algo: não estou começando sem nada. Estou começando com 43 anos de vida, erros que me ensinaram, responsabilidades que me fortaleceram e cicatrizes que provaram que sobrevivi a outras fases difíceis. Aos 20 eu tinha mais tempo. Hoje tenho mais motivos. Ainda estou no zero, só que agora o zero não parece o fim. Parece o primeiro número de uma história que ainda pode ser escrita.', '/demo-stories/udson-zero-07.png')
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
