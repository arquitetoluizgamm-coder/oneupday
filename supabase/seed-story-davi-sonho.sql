-- One Up Day — segunda jornada editorial do Davi.
-- Textos mais desenvolvidos para mostrar a evolução de um sonho pausado.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;

insert into public.journeys
  (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, cover_url, is_public, visibility, editorial_seed)
values (
  '33000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  'meu-sonho-ficou-parado-mas-nao-morreu',
  'Meu sonho ficou parado, mas não morreu.',
  'projects',
  'rebuilding',
  'Voltar a construir, aos poucos, o plano de abrir uma pequena oficina de consertos.',
  7,
  '#b58a42',
  '/demo-stories/davi-avatar.png',
  true,
  'public',
  true
)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  title = excluded.title,
  category = excluded.category,
  goal = excluded.goal,
  total_days = 7,
  cover_color = excluded.cover_color,
  cover_url = excluded.cover_url,
  is_public = true,
  visibility = 'public',
  editorial_seed = true;

insert into public.updates (id, journey_id, day_number, kind, text, photo_url)
values
  ('34000000-0000-0000-0000-000000000001'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 1, 'step', 'Durante anos eu disse que abrir uma pequena oficina era só uma ideia bonita. Hoje percebi que, quando a gente repete isso por tempo demais, começa a tratar o próprio sonho como se ele não tivesse importância. Ainda não tenho uma oficina, mas escrevi o nome dela no alto de uma página.', '/demo-stories/davi-sonho-01.png'),
  ('34000000-0000-0000-0000-000000000002'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 2, 'step', 'Encontrei uma caixa com ferramentas que não uso há quase quatro anos. Algumas estão enferrujadas, outras ainda funcionam. Passei a tarde limpando uma por uma e lembrando de quando eu consertava coisas só pelo prazer de descobrir como elas funcionavam.', '/demo-stories/davi-sonho-02.png'),
  ('34000000-0000-0000-0000-000000000003'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 3, 'win', 'Contei para meu irmão que quero voltar a trabalhar com as mãos. Eu esperava ouvir aquela pergunta antiga: “Mas isso vai dar dinheiro?”. Ele só perguntou qual seria a primeira coisa que eu precisaria comprar. Foi a primeira vez que falei do plano sem pedir desculpas por ele.', '/demo-stories/davi-sonho-03.png'),
  ('34000000-0000-0000-0000-000000000004'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 4, 'setback', 'Passei horas fazendo contas e quase desisti antes de começar. O aluguel, as ferramentas e as contas de casa parecem maiores do que a coragem que eu tinha ontem. Fechei o caderno, mas não joguei fora. Amanhã eu volto para a página onde parei.', '/demo-stories/davi-sonho-04.png'),
  ('34000000-0000-0000-0000-000000000005'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 5, 'step', 'Descobri que não preciso começar alugando um lugar. Posso oferecer dois consertos por semana na garagem e aprender o que as pessoas realmente precisam. Não é a oficina que imaginei, com placa e bancada nova, mas é uma porta pequena para o mesmo caminho.', '/demo-stories/davi-sonho-05.png'),
  ('34000000-0000-0000-0000-000000000006'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 6, 'win', 'Hoje consertei uma cadeira que estava quebrada na casa da minha mãe. Ela disse que a cadeira ficou boa, mas o que me emocionou foi vê-la sentar e confiar que ela não cairia. Talvez seja isso que eu queira fazer: devolver segurança para as coisas que alguém já tinha desistido de usar.', '/demo-stories/davi-sonho-06.png'),
  ('34000000-0000-0000-0000-000000000007'::uuid, '33000000-0000-0000-0000-000000000001'::uuid, 7, 'learned', 'Meu sonho ainda não virou uma oficina. Não tenho placa, clientes fixos ou certeza de que vai funcionar. Mas ele deixou de ser uma frase guardada numa gaveta. Agora existe uma lista, uma primeira encomenda e um homem que voltou a se reconhecer no que faz.', '/demo-stories/davi-sonho-07.png')
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
