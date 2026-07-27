-- ============================================================
-- PAINEL /admin — suspensão de conta e origem do cadastro
--
-- Rode este arquivo inteiro no Supabase → SQL Editor → Run.
-- É seguro rodar mais de uma vez.
--
-- O que ele faz:
--   1. cria a coluna que marca uma conta como suspensa
--   2. esconde o conteúdo de quem está suspenso, no banco
--   3. guarda de onde a pessoa veio quando se cadastrou
--   4. registra quem suspendeu quem, e por quê
-- ============================================================


-- ------------------------------------------------------------
-- 1. A suspensão
-- ------------------------------------------------------------
-- suspenso_em nulo = conta normal. Preenchido = conta suspensa.
-- Guardar a DATA em vez de um sim/não deixa saber há quanto tempo,
-- e é a diferença entre "está suspenso" e "foi suspenso uma vez".
alter table public.profiles add column if not exists suspenso_em  timestamptz;
alter table public.profiles add column if not exists suspenso_por uuid;
alter table public.profiles add column if not exists suspenso_motivo text;

-- de onde a pessoa veio (o ?fb= do link que ela clicou)
alter table public.profiles add column if not exists origem text;

create index if not exists idx_profiles_suspenso on public.profiles(suspenso_em);
create index if not exists idx_profiles_origem   on public.profiles(origem);


-- ------------------------------------------------------------
-- 2. Suspenso some do app — no banco, não só na tela
-- ------------------------------------------------------------
-- Esconder pela interface não serve: qualquer um que fale direto
-- com a API continuaria vendo tudo. A regra tem que morar aqui.
--
-- Repare que a pessoa suspensa continua enxergando o PRÓPRIO
-- conteúdo. Isso é deliberado: suspender é tirar do convívio,
-- não confiscar a história de alguém. Se um dia ela for
-- reativada, nada se perdeu.

drop policy if exists "journeys read public" on public.journeys;
create policy "journeys read public" on public.journeys for select using (
  owner_id = auth.uid()
  or (
    visibility = 'public'
    and not exists (
      select 1 from public.profiles p
       where p.id = journeys.owner_id and p.suspenso_em is not null
    )
  )
);

-- Comentário de quem está suspenso também sai de circulação.
-- A política de leitura de comments é reescrita pelo
-- fix-comentario-citacao.sql; aqui só acrescentamos a condição,
-- sem tocar no resto.
drop policy if exists "comments hide suspended" on public.comments;
create policy "comments hide suspended" on public.comments for select using (
  not exists (
    select 1 from public.profiles p
     where p.id = comments.user_id and p.suspenso_em is not null
  )
);


-- ------------------------------------------------------------
-- 3. O registro de quem fez o quê
-- ------------------------------------------------------------
-- Suspender e excluir são decisões que a gente esquece por que
-- tomou. Daqui a seis meses, diante de um pedido de revisão,
-- esta tabela é a única coisa que responde.
create table if not exists public.admin_log (
  id         bigserial primary key,
  admin_id   uuid,
  acao       text not null,          -- 'suspender' | 'reativar' | 'excluir'
  alvo_id    uuid,
  alvo_handle text,
  motivo     text,
  criado_em  timestamptz not null default now()
);

alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;
-- Ninguém lê nem escreve pelo navegador. Só a chave de serviço,
-- pelas rotas do servidor.


-- ------------------------------------------------------------
-- 4. Conferência
-- ------------------------------------------------------------
select column_name as coluna
  from information_schema.columns
 where table_schema = 'public' and table_name = 'profiles'
   and column_name in ('suspenso_em','suspenso_por','suspenso_motivo','origem')
 order by column_name;

-- Esperado: origem · suspenso_em · suspenso_motivo · suspenso_por

select count(*) as contas_suspensas
  from public.profiles where suspenso_em is not null;

-- Esperado agora: 0
