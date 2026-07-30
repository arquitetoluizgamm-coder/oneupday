-- One Up Day — jornada editorial separada com 7 dias
-- O dono é encontrado pelo handle editorial, nunca pelos e-mails dos editores.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;

with owner as (
  select p.id
  from public.profiles p
  where lower(p.handle) = lower('@historias.one')
  limit 1
)
insert into public.journeys
  (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, cover_url, is_public, visibility, editorial_seed)
select
  '25000000-0000-0000-0000-000000000001'::uuid,
  owner.id,
  'recomecar-com-calma-7-dias',
  'Recomeçar com calma',
  'life',
  'rebuilding',
  'Voltar a cuidar de mim em pequenos gestos, sem esperar uma versão perfeita.',
  7,
  '#8b9b83',
  '/demo-stories/one-7d-01.png',
  true,
  'public',
  true
from owner
on conflict (id) do update set
  owner_id = excluded.owner_id,
  title = excluded.title,
  goal = excluded.goal,
  total_days = 7,
  cover_url = excluded.cover_url,
  is_public = true,
  visibility = 'public',
  editorial_seed = true;

with owner as (
  select p.id
  from public.profiles p
  where lower(p.handle) = lower('@historias.one')
  limit 1
), posts (id, day_number, kind, text, photo_url) as (
  values
  ('26000000-0000-0000-0000-000000000001'::uuid,1,'step','Hoje eu abri a janela antes de abrir o celular. Fiquei ali alguns minutos e lembrei que o dia não precisava começar correndo.','/demo-stories/one-7d-01.png'),
  ('26000000-0000-0000-0000-000000000002'::uuid,2,'step','Arrumei uma pequena parte da sala. Não resolvi a vida, mas consegui deixar um canto com espaço para eu sentar.','/demo-stories/one-7d-02.png'),
  ('26000000-0000-0000-0000-000000000003'::uuid,3,'win','Saí para caminhar sem transformar isso em promessa. Voltei cansada e um pouco mais presente.','/demo-stories/one-7d-03.png'),
  ('26000000-0000-0000-0000-000000000004'::uuid,4,'setback','Hoje eu não consegui fazer o que tinha planejado. Comi qualquer coisa e chorei. Escrevo mesmo assim, porque desaparecer não vai me ajudar a voltar.','/demo-stories/one-7d-04.png'),
  ('26000000-0000-0000-0000-000000000005'::uuid,5,'step','Anotei três coisas que ainda são minhas: meu tempo, meu corpo e a coragem de tentar de novo.','/demo-stories/one-7d-05.png'),
  ('26000000-0000-0000-0000-000000000006'::uuid,6,'win','Fiz uma tarefa que estava adiando há semanas. Foi só uma ligação, mas depois dela a casa pareceu um pouco menos pesada.','/demo-stories/one-7d-06.png'),
  ('26000000-0000-0000-0000-000000000007'::uuid,7,'learned','Uma semana não mudou tudo. Mudou o jeito como eu olho para o próximo dia. Hoje já é uma forma de continuar.','/demo-stories/one-7d-07.png')
)
insert into public.updates (id, journey_id, day_number, kind, text, photo_url)
select p.id, '25000000-0000-0000-0000-000000000001'::uuid, p.day_number, p.kind, p.text, p.photo_url
from posts p
join owner on true
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
