-- One Up Day — Paulo: reconstruindo meu casamento um dia de cada vez.
-- Perfil editorial separado, sem vínculo com e-mails de teste.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;
alter table public.profiles add column if not exists avatar_url text;

insert into public.profiles (id, handle, name, bio, avatar_color, avatar_url)
values (
  '40000000-0000-0000-0000-000000000001'::uuid,
  '@paulo.recomeca',
  'Paulo',
  'Tentando estar presente outra vez.',
  '#8c786b',
  '/demo-stories/paulo-avatar.png'
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
  '41000000-0000-0000-0000-000000000001'::uuid,
  '40000000-0000-0000-0000-000000000001'::uuid,
  'reconstruindo-meu-casamento-um-dia-de-cada-vez',
  'Reconstruindo meu casamento um dia de cada vez',
  'relationships',
  'rebuilding',
  'Voltar a estar presente antes de desistir do que ainda pode ser cuidado.',
  7,
  '#8c786b',
  '/demo-stories/paulo-casamento-01.png',
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
  ('42000000-0000-0000-0000-000000000001'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 1, 'step', 'Hoje não fiz nenhuma promessa. Apenas me sentei ao lado dela no sofá, enquanto ela assistia a uma série. Durante alguns minutos, ficamos em silêncio, como dois desconhecidos que ainda se lembram de como era se conhecer. Quase peguei o celular para fugir, mas fiquei. Nossos braços se encostaram e nenhum de nós se afastou. Hoje eu não consertei o nosso casamento. Só parei de fugir dele.', '/demo-stories/paulo-casamento-01.png'),
  ('42000000-0000-0000-0000-000000000002'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 2, 'step', 'Perguntei como ela estava. Ela respondeu automaticamente que estava bem. Então eu disse que não estava perguntando por educação, queria saber de verdade. Ela ficou em silêncio e depois falou que estava cansada de se sentir sozinha mesmo estando casada. Minha vontade foi lembrar tudo o que faço e tudo o que carrego. Pela primeira vez, apenas ouvi. Eu estava tentando provar que era um bom marido, quando ela só precisava sentir que ainda tinha um companheiro.', '/demo-stories/paulo-casamento-02.png'),
  ('42000000-0000-0000-0000-000000000003'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 3, 'learned', 'Encontrei uma fotografia do nosso primeiro apartamento. Não tínhamos quase nada: um sofá usado, uma mesa com duas cadeiras e um colchão no chão. Mesmo assim, parecíamos felizes. Mostrei a fotografia e perguntei em que momento nós nos perdemos. Ela respondeu: “Não foi em um momento. Foi um pouco por dia.” Talvez um casamento termine assim, em centenas de pequenas ausências. Então talvez também possa ser reconstruído da mesma forma: um pouco por dia.', '/demo-stories/paulo-casamento-03.png'),
  ('42000000-0000-0000-0000-000000000004'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 4, 'setback', 'Hoje discutimos. Ela falou de uma situação antiga e eu me senti acusado. Levantei a voz, interrompi e disse coisas que não precisava dizer. Ela foi para o quarto e fechou a porta. Quase deixei o orgulho vencer outra vez, mas bati na porta. Não pedi desculpas dizendo “mas você também”. Apenas disse: “Eu fiz de novo. Transformei a sua dor em uma acusação contra mim. Você não merecia isso.” Ela não me abraçou nem disse que estava tudo bem. Só respondeu: “Pelo menos, desta vez, você voltou.” Hoje eu recaí, mas não fui embora.', '/demo-stories/paulo-casamento-04.png'),
  ('42000000-0000-0000-0000-000000000005'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 5, 'win', 'Coloquei nossos celulares em outro cômodo durante o jantar. No começo, o silêncio foi estranho. Depois conversamos sobre coisas pequenas: uma música antiga, o cachorro do vizinho e uma viagem que nunca fizemos. Em determinado momento, ela riu. Eu tinha esquecido como era bonito ouvi-la rir por minha causa. Fiquei olhando por tempo demais e ela perguntou o que foi. Respondi que estava com saudade dela. Ela abaixou os olhos e disse que também estava com saudade de nós.', '/demo-stories/paulo-casamento-05.png'),
  ('42000000-0000-0000-0000-000000000006'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 6, 'setback', 'Hoje ela disse que tem medo de acreditar na minha mudança. Já ouviu promessas antes e não quer criar esperança para se decepcionar novamente. Depois falou: “Talvez seja tarde demais.” Eu queria convencê-la de que desta vez seria diferente, mas percebi que ela não precisa de mais palavras. Respondi: “Eu entendo. Não vou pedir que você confie em mim hoje. Vou tentar me tornar alguém em quem você possa confiar novamente.” Não recebi nenhuma certeza. Mesmo assim, permaneci.', '/demo-stories/paulo-casamento-06.png'),
  ('42000000-0000-0000-0000-000000000007'::uuid, '41000000-0000-0000-0000-000000000001'::uuid, 7, 'learned', 'Caminhamos juntos depois do jantar. Não falamos sobre separação, erros ou futuro. Apenas caminhamos. Tomei coragem e segurei a mão dela. Por alguns segundos, senti que ela poderia soltá-la, mas ela apertou a minha. Não sei como essa história termina. Talvez sete dias não sejam suficientes para salvar um casamento ferido por anos. Mas entendi uma coisa: não preciso reconstruir tudo de uma vez. Preciso escolher, todos os dias, não abandonar o que ainda pode ser cuidado. Amanhã vou escolher novamente.', '/demo-stories/paulo-casamento-07.png')
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
