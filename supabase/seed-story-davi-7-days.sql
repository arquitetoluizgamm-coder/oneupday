-- One Up Day — jornada editorial do Davi, 7 dias.
-- Perfil separado dos usuários e editores.

alter table public.journeys add column if not exists editorial_seed boolean not null default false;
alter table public.journeys add column if not exists cover_url text;
alter table public.profiles add column if not exists avatar_url text;

insert into public.profiles (id, handle, name, bio, avatar_color, avatar_url)
values (
  '30000000-0000-0000-0000-000000000001'::uuid,
  '@davi.recomeca',
  'Davi',
  'Aprendendo a não carregar tudo sozinho.',
  '#6f7d8b',
  '/demo-stories/davi-avatar.png'
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
  '31000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  'aprender-a-pedir-ajuda',
  'Aprender a pedir ajuda',
  'life',
  'rebuilding',
  'Parar de carregar tudo sozinho e aceitar que cuidado também pode vir de outras pessoas.',
  7,
  '#6f7d8b',
  '/demo-stories/davi-ajuda-01.png',
  true,
  'public',
  true
)
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

insert into public.updates (id, journey_id, day_number, kind, text, photo_url)
values
  ('32000000-0000-0000-0000-000000000001'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 1, 'step', 'Hoje admiti que estou cansado. Não foi bonito, mas foi honesto.', '/demo-stories/davi-ajuda-01.png'),
  ('32000000-0000-0000-0000-000000000002'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 2, 'step', 'Mandei uma mensagem para meu irmão: “Você pode falar comigo hoje?”. Fiquei olhando a tela por dez minutos antes de enviar.', '/demo-stories/davi-ajuda-02.png'),
  ('32000000-0000-0000-0000-000000000003'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 3, 'win', 'Ele veio. Tomamos café na cozinha. Não resolvemos nada, mas eu não precisei fingir.', '/demo-stories/davi-ajuda-03.png'),
  ('32000000-0000-0000-0000-000000000004'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 4, 'setback', 'Passei o dia inteiro dizendo que estava tudo bem. À noite, chorei no carro.', '/demo-stories/davi-ajuda-04.png'),
  ('32000000-0000-0000-0000-000000000005'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 5, 'step', 'Marquei uma consulta que vinha adiando. Cuidar de mim também é responsabilidade.', '/demo-stories/davi-ajuda-05.png'),
  ('32000000-0000-0000-0000-000000000006'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 6, 'win', 'Meu filho perguntou se eu estava melhor. Respondi a verdade: “Estou aprendendo”.', '/demo-stories/davi-ajuda-06.png'),
  ('32000000-0000-0000-0000-000000000007'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 7, 'learned', 'Ainda não sei fazer isso direito. Mas hoje não carreguei tudo sozinho.', '/demo-stories/davi-ajuda-07.png')
on conflict (id) do update set
  day_number = excluded.day_number,
  kind = excluded.kind,
  text = excluded.text,
  photo_url = excluded.photo_url;
