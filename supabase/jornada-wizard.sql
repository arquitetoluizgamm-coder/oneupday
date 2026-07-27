-- ============================================================
-- One Up Day — O wizard de criação guarda mais que título e prazo
-- Rode no Supabase: SQL Editor > New query > Run
--
-- Três informações que o wizard passa a perguntar e que hoje não
-- teriam onde ficar:
--
--   pratica     o que a pessoa vai fazer, em forma observável
--               ("correr 20 minutos", não "melhorar o corpo")
--
--   ritmo       'diario' | '3x' | 'fds' | ou o texto livre que a
--               pessoa escreveu em "personalizado". Fica como
--               chave para o dia em que o app precisar saber se
--               hoje é dia — "não registrou" e "hoje não é dia"
--               não são a mesma coisa, e tratar como se fossem
--               seria cobrar alguém por um dia de descanso.
--
--   obstaculos  o que ela acha que pode atrapalhar. Ainda não é
--               perguntado em tela: a coluna entra agora para que
--               o patch seguinte não precise de outra migração.
--
-- Tudo opcional e sem default: jornada antiga continua válida com
-- os três campos nulos, e o app trata nulo como "não perguntado".
--
-- Nada de RLS novo: as colunas vivem em journeys e herdam as
-- políticas que já existem lá.
-- ============================================================
alter table public.journeys add column if not exists pratica text;
alter table public.journeys add column if not exists ritmo text;
alter table public.journeys add column if not exists obstaculos text;
