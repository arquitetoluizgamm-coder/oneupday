-- One Up Day — segunda jornada editorial da Lia, 7 dias.
-- Perfil separado de usuários e editores: owner_id é o perfil editorial fixo.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;

with owner as (
  select id from public.profiles
  where id = 'cb1615b5-e40a-4577-83f8-d5526187f2f8'::uuid
  limit 1
)
insert into public.journeys
  (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, cover_url, is_public, visibility, editorial_seed)
select
  '27000000-0000-0000-0000-000000000001'::uuid,
  owner.id,
  'voltar-a-estar-presente',
  'Voltar a estar presente',
  'life',
  'rebuilding',
  'Estar mais presente na vida da minha filha, um momento de cada vez.',
  7,
  '#c47152',
  '/demo-stories/lia-presenca-01.png',
  true,
  'public',
  true
from owner
on conflict (id) do update set
  owner_id = excluded.owner_id,
  title = excluded.title,
  goal = excluded.goal,
  total_days = 7,
  cover_color = excluded.cover_color,
  cover_url = excluded.cover_url,
  is_public = true,
  visibility = 'public',
  editorial_seed = true;

with posts (id, day_number, kind, text, photo_url) as (
  values
  ('28000000-0000-0000-0000-000000000001'::uuid,1,'step','Hoje percebi que sei responder e-mails melhor do que sei conversar com minha filha. Decidi começar por cinco minutos sem celular.','/demo-stories/lia-presenca-01.png'),
  ('28000000-0000-0000-0000-000000000002'::uuid,2,'step','Ela me mostrou um desenho. Eu quase respondi olhando para a tela, mas parei e olhei para ela.','/demo-stories/lia-presenca-02.png'),
  ('28000000-0000-0000-0000-000000000003'::uuid,3,'step','Perguntei como foi o dia. Ela respondeu “normal”. Mesmo assim, ficamos sentados juntos.','/demo-stories/lia-presenca-03.png'),
  ('28000000-0000-0000-0000-000000000004'::uuid,4,'setback','Perdi a paciência e falei alto. Depois pedi desculpas. Ainda estou aprendendo a ficar.','/demo-stories/lia-presenca-04.png'),
  ('28000000-0000-0000-0000-000000000005'::uuid,5,'win','Ela deixou um bilhete na minha mesa: “Hoje foi legal você estar aqui”.','/demo-stories/lia-presenca-05.png'),
  ('28000000-0000-0000-0000-000000000006'::uuid,6,'win','Fizemos um bolo simples. A cozinha ficou uma bagunça e nós dois rimos.','/demo-stories/lia-presenca-06.png'),
  ('28000000-0000-0000-0000-000000000007'::uuid,7,'learned','Ela segurou minha mão no caminho da escola. Não resolvi os anos que passaram, mas hoje eu estava presente.','/demo-stories/lia-presenca-07.png')
)
insert into public.updates (id, journey_id, day_number, kind, text, photo_url)
select p.id, '27000000-0000-0000-0000-000000000001'::uuid, p.day_number, p.kind, p.text, p.photo_url
from posts p
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
