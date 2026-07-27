-- ============================================================
-- COMENTÁRIO EM CITAÇÃO / FOTO DO ÁLBUM — "Não foi possível enviar"
--
-- Citação e foto do álbum não são "dias de jornada": elas vivem na
-- tabela media, e o comentário delas grava media_id em vez de
-- update_id. Comentário em post de dia funciona porque grava
-- update_id — que é o campo que a tabela sempre teve.
--
-- A tabela comments nasceu com:
--     update_id uuid NOT NULL
--
-- e sem coluna media_id. Quem corrige isso é o media-interactions.sql.
-- Se ele não rodou (ou rodou pela metade), inserir um comentário sem
-- update_id viola o NOT NULL, o insert falha, a rota devolve erro e a
-- tela mostra "Não foi possível enviar. Tente de novo."
--
-- Rode este arquivo inteiro. É seguro rodar mais de uma vez.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Como está agora (antes de mexer)
-- ------------------------------------------------------------
select
  column_name  as coluna,
  is_nullable  as aceita_nulo,
  data_type    as tipo
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'comments'
  and column_name in ('update_id', 'media_id', 'challenge_id')
order by column_name;

-- ESPERADO DEPOIS DA CORREÇÃO:
--   challenge_id · YES
--   media_id     · YES
--   update_id    · YES   ← se estiver NO, é esta a causa
--
-- Se media_id nem aparecer na lista, a coluna não existe: mesma causa.


-- ------------------------------------------------------------
-- 2. A correção
-- ------------------------------------------------------------
alter table public.comments add column if not exists media_id     uuid;
alter table public.comments add column if not exists challenge_id uuid;
alter table public.comments alter column update_id drop not null;

create index if not exists idx_comments_media
  on public.comments (media_id, created_at);

-- Os apoios e os abraços têm exatamente o mesmo problema, pela mesma
-- razão. Corrigidos junto para não voltarem depois como "não consigo
-- apoiar a citação".
alter table public.encouragements add column if not exists media_id uuid;
alter table public.encouragements alter column update_id drop not null;
alter table public.hugs add column if not exists media_id uuid;


-- ------------------------------------------------------------
-- 3. Quem pode LER os comentários de uma mídia
-- ------------------------------------------------------------
-- A política antiga só sabia enxergar comentário de jornada. Sem esta,
-- mesmo depois de gravar, o comentário sumiria da tela.

drop policy if exists "comments read published" on public.comments;
create policy "comments read published" on public.comments for select using (
  status = 'published' and (
    (update_id is not null and exists (
      select 1
        from public.updates u
        join public.journeys j on j.id = u.journey_id
       where u.id = comments.update_id
         and (j.visibility = 'public' or j.owner_id = auth.uid())))
    or
    (media_id is not null and exists (
      select 1
        from public.media m
       where m.id = comments.media_id
         and (m.visibility = 'public'
              or m.user_id = auth.uid()
              or (m.visibility = 'followers' and exists (
                    select 1 from public.profile_follows f
                     where f.following_id = m.user_id
                       and f.follower_id  = auth.uid())))))
    or
    (challenge_id is not null and exists (
      select 1
        from public.challenges c
       where c.id = comments.challenge_id
         and (c.from_id = auth.uid() or c.to_id = auth.uid())))
  )
);


-- ------------------------------------------------------------
-- 4. Conferir que ficou certo
-- ------------------------------------------------------------
select
  column_name as coluna,
  is_nullable as aceita_nulo
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'comments'
  and column_name in ('update_id', 'media_id', 'challenge_id')
order by column_name;

-- As três têm que estar com aceita_nulo = YES.
-- Depois disso, comente numa citação no app: tem que funcionar na hora,
-- sem precisar subir nada de código.
