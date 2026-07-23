-- ============================================================
-- One Up Day — Histórias de recomeço (conteúdo de exemplo / seed)
-- Rode DEPOIS do install-all.sql. Popula landing, Explorar e Comunidades.
-- São jornadas de EXEMPLO pra o app não nascer vazio. Substitua por
-- pessoas reais conforme elas chegarem (e não use como depoimento em ads).
-- ============================================================

insert into public.profiles (id, handle, name, avatar_color) values
  ('20000000-0000-0000-0000-000000000001','@marcos.recomeco','Marcos','#0ea5e9'),
  ('20000000-0000-0000-0000-000000000002','@ana.depois','Ana Paula','#f02f87'),
  ('20000000-0000-0000-0000-000000000003','@rafa.estudando','Rafael','#2563eb'),
  ('20000000-0000-0000-0000-000000000004','@ju.mente','Juliana','#6c5ce7'),
  ('20000000-0000-0000-0000-000000000005','@pedro.negocio','Pedro','#16a34a')
on conflict (id) do nothing;

insert into public.journeys (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, is_public, visibility) values
  ('21000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','dia-1-sem-alcool','Meu Dia 1 sem álcool','health','notgiveup','Parar de beber, um dia de cada vez, sem me cobrar perfeição.',90,'#0ea5e9',true,'public'),
  ('21000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','dia-1-depois-da-demissao','Meu Dia 1 depois da demissão','work','starting','Me reconstruir depois de perder o emprego e achar meu próximo caminho.',60,'#111827',true,'public'),
  ('21000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','dia-1-voltando-a-estudar','Meu Dia 1 voltando a estudar','study','rebuilding','Voltar a estudar depois de anos parado, sem pressa e sem vergonha.',100,'#2563eb',true,'public'),
  ('21000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','dia-1-saude-mental','Meu Dia 1 cuidando da saúde mental','mind','hardphase','Cuidar da minha cabeça um pouco a cada dia, mesmo nos dias ruins.',60,'#6c5ce7',true,'public'),
  ('21000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','dia-1-meu-negocio','Meu Dia 1 abrindo meu negócio','work','building','Tirar minha ideia do papel e construir meu negócio, um passo por dia.',100,'#16a34a',true,'public')
on conflict (id) do nothing;

-- Marcos — sem álcool
insert into public.updates (journey_id, day_number, kind, text) values
  ('21000000-0000-0000-0000-000000000001',1,'step','Dia 1. Faz tempo que eu queria escrever isso. Hoje eu não bebi. Só isso já é diferente.'),
  ('21000000-0000-0000-0000-000000000001',3,'win','Passei pela sexta-feira sem beber. Fui dormir cedo. Acordei sem culpa pela primeira vez em meses.'),
  ('21000000-0000-0000-0000-000000000001',7,'setback','Quase escorreguei ontem num aniversário. Tomei um gole e parei. Não zerei nada. Estou aqui, voltando.'),
  ('21000000-0000-0000-0000-000000000001',12,'win','Uma semana inteira limpo depois do tropeço. Minha filha disse que eu estou diferente.');

-- Ana — depois da demissão
insert into public.updates (journey_id, day_number, kind, text) values
  ('21000000-0000-0000-0000-000000000002',1,'step','Fui demitida na terça. Hoje decidi que isso não vai me definir. Atualizei o currículo.'),
  ('21000000-0000-0000-0000-000000000002',4,'learned','Mandei 8 currículos. Nenhuma resposta ainda. Mas aprendi a falar melhor do que eu sei fazer.'),
  ('21000000-0000-0000-0000-000000000002',9,'setback','Dia difícil. Chorei de manhã, achei que não ia dar conta. Mas abri o notebook de novo à tarde.'),
  ('21000000-0000-0000-0000-000000000002',15,'win','Primeira entrevista marcada. Ainda estou com medo, mas o medo agora tem direção.');

-- Rafael — voltando a estudar
insert into public.updates (journey_id, day_number, kind, text) values
  ('21000000-0000-0000-0000-000000000003',1,'step','30 anos e voltando pros estudos. Sentei 20 minutos hoje. A cabeça reclamou, mas eu fiquei.'),
  ('21000000-0000-0000-0000-000000000003',5,'win','Terminei o primeiro módulo. Achei que tinha esquecido como estudar. Não esqueci.'),
  ('21000000-0000-0000-0000-000000000003',10,'setback','Semana corrida, não abri o material 3 dias. Voltei hoje. Sem drama, só voltei.'),
  ('21000000-0000-0000-0000-000000000003',18,'step','Peguei o ritmo: meia hora por dia. Pequeno, mas todo dia.');

-- Juliana — saúde mental
insert into public.updates (journey_id, day_number, kind, text) values
  ('21000000-0000-0000-0000-000000000004',1,'step','Marquei a primeira terapia em anos. Só isso já pesou. Dia 1.'),
  ('21000000-0000-0000-0000-000000000004',4,'win','Consegui sair pra caminhar mesmo sem vontade. 15 minutos de sol.'),
  ('21000000-0000-0000-0000-000000000004',8,'setback','Hoje foi só sobreviver. Não fiz quase nada. Mas apareci aqui pra dizer que continuo.'),
  ('21000000-0000-0000-0000-000000000004',14,'learned','Aprendi que dia ruim não apaga o progresso. Ele faz parte.');

-- Pedro — negócio
insert into public.updates (journey_id, day_number, kind, text) values
  ('21000000-0000-0000-0000-000000000005',1,'step','Dia 1 do meu negócio. Registrei o nome. Ninguém sabe ainda. Estou construindo em silêncio.'),
  ('21000000-0000-0000-0000-000000000005',6,'win','Fechei meu primeiro cliente. Foi pouco dinheiro, mas foi a prova de que existe caminho.'),
  ('21000000-0000-0000-0000-000000000005',13,'setback','Perdi uma proposta grande. Fiquei pra baixo o dia todo. Amanhã eu tento de novo.'),
  ('21000000-0000-0000-0000-000000000005',22,'win','Três clientes agora. Ainda pequeno, mas é meu, e cresce um pouco a cada dia.');
