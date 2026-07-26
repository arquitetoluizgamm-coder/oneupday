-- ============================================================
-- PRIMEIRO ECO
-- O Upi deixa a primeira observação quando um post fica sem
-- comentário. Ninguém publica no vazio, e o primeiro comentário
-- humano fica mais fácil porque a conversa já começou.
--
-- Regra que protege tudo:
-- o Eco reconhece O QUE ACONTECEU. Nunca inventa quem a pessoa é.
--
-- Rode inteiro no SQL Editor do Supabase.
-- ============================================================

-- 1. o comentário do Upi não pertence a nenhuma pessoa
alter table public.comments alter column user_id drop not null;
alter table public.comments add column if not exists eco boolean not null default false;
alter table public.comments add column if not exists eco_tipo text;

-- garante coerência: ou é de alguém, ou é Eco — nunca os dois, nunca nenhum
alter table public.comments drop constraint if exists comments_autor_ok;
alter table public.comments add constraint comments_autor_ok
  check ((eco = true and user_id is null) or (eco = false and user_id is not null));

-- 2. quem não quer, desliga
alter table public.profiles add column if not exists eco_on boolean not null default true;

-- 3. leitura: o Eco aparece como qualquer comentário publicado
drop policy if exists "comments read published" on public.comments;
create policy "comments read published" on public.comments for select using (
  status = 'published' and exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
     where u.id = update_id and (j.visibility = 'public' or j.owner_id = auth.uid())
  )
);

-- 4. o dono do post pode apagar o Eco dele
drop policy if exists "comments eco delete pelo dono" on public.comments;
create policy "comments eco delete pelo dono" on public.comments for delete using (
  eco = true and exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
     where u.id = update_id and j.owner_id = auth.uid()
  )
);

-- 5. índice para achar posts elegíveis rápido
create index if not exists comments_eco_idx on public.comments(update_id) where eco = true;

select 'pronto' as status,
  (select count(*) from information_schema.columns
    where table_name='comments' and column_name in ('eco','eco_tipo')) as colunas_comments,
  (select count(*) from information_schema.columns
    where table_name='profiles' and column_name='eco_on') as coluna_perfil;
