-- ============================================================
-- One Up Day — seed de teste (3 jornadas públicas)
-- Rode DEPOIS do schema.sql. Cria perfis "fake" sem auth
-- só para testar as páginas públicas /slug antes do login existir.
-- Quando o login estiver pronto, apague estes registros.
-- ============================================================

-- perfis de teste (id fixo, não ligados a auth.users reais)
insert into public.profiles (id, handle, name, avatar_color) values
  ('00000000-0000-0000-0000-000000000001', '@ana.home', 'Ana',  '#ff7a45'),
  ('00000000-0000-0000-0000-000000000002', '@tomruns',  'Tom',  '#0ea5e9'),
  ('00000000-0000-0000-0000-000000000003', '@mayadraws','Maya', '#6c5ce7')
on conflict (id) do nothing;

-- jornadas
insert into public.journeys (id, owner_id, slug, title, category, goal, total_days, cover_color) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','ana-reset','Reset my room','home','Small daily actions to make my space feel calm again.',30,'#ff7a45'),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','tom-5k','Couch to 5k, for real this time','body','Run three times a week without quitting.',60,'#0ea5e9'),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000003','maya-faces','100 days drawing faces','art','Draw one face every day for 100 days.',100,'#6c5ce7')
on conflict (id) do nothing;

-- updates da Ana (inclui um setback para demonstrar a regra)
insert into public.updates (journey_id, day_number, kind, text) values
  ('10000000-0000-0000-0000-000000000001',1,'step','Removed everything from the desk and took the first photo.'),
  ('10000000-0000-0000-0000-000000000001',5,'step','Cleaned the closet. It took longer than expected.'),
  ('10000000-0000-0000-0000-000000000001',8,'setback','Did nothing today. Tired. Posting anyway — a setback is still a day in the journey.'),
  ('10000000-0000-0000-0000-000000000001',12,'win','Kept the room clean for one full week. Small win, big relief.');

-- updates do Tom
insert into public.updates (journey_id, day_number, kind, text) values
  ('10000000-0000-0000-0000-000000000002',1,'step','First slow run. 8 minutes. It counted.'),
  ('10000000-0000-0000-0000-000000000002',21,'setback','Skipped my run and ate badly. Posting anyway. Streak stays.');

-- updates da Maya
insert into public.updates (journey_id, day_number, kind, text) values
  ('10000000-0000-0000-0000-000000000003',28,'win','Not perfect, but today the eyes finally looked alive.');
