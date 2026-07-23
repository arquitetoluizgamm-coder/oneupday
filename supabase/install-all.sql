-- ============================================================
-- One Up Day — INSTALACAO COMPLETA (re-executavel / idempotente)
-- Supabase -> SQL Editor -> cole tudo -> Run
-- ============================================================


-- ###### schema.sql ######

-- ============================================================
-- One Up Day — schema base (MVP)
-- Cole no Supabase: SQL Editor > New query > Run
-- ============================================================

-- 1. PERFIS (1:1 com auth.users do Supabase)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique not null,
  name        text not null,
  bio         text,
  avatar_color text default '#ff7a45',
  created_at  timestamptz default now()
);

-- 2. JORNADAS
create table if not exists public.journeys (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references public.profiles(id) on delete cascade,
  slug        text unique not null,
  title       text not null,
  category    text not null default 'life',
  goal        text,
  total_days  int  not null default 30,
  cover_color text default '#ff7a45',
  is_public   boolean default true,
  created_at  timestamptz default now()
);

-- 3. UPDATES (posts diários)
-- kind: 'step' (padrão), 'win', 'setback', 'learned'
create table if not exists public.updates (
  id          uuid primary key default gen_random_uuid(),
  journey_id  uuid references public.journeys(id) on delete cascade,
  day_number  int  not null,
  kind        text not null default 'step',
  text        text not null,
  photo_url   text,
  created_at  timestamptz default now()
);

create index if not exists idx_updates_journey on public.updates(journey_id, day_number);

-- 4. ENCORAJAMENTOS (o "like" do produto)
create table if not exists public.encouragements (
  id          uuid primary key default gen_random_uuid(),
  update_id   uuid references public.updates(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(update_id, user_id)
);

-- ============================================================
-- STREAK — regra do setback embutida
-- Presença conta, não perfeição. Um setback MANTÉM o streak,
-- porque ainda é um dia em que a pessoa apareceu.
-- O streak = nº de dias distintos com QUALQUER update (inclui setback).
-- Só quebra quando a pessoa some (dia sem nenhum post).
-- ============================================================
create or replace view public.journey_stats as
select
  j.id                                            as journey_id,
  j.slug,
  count(distinct u.day_number)                    as days_posted,
  coalesce(max(u.day_number), 0)                  as current_day,
  j.total_days,
  count(distinct u.day_number)                    as streak, -- presença total; setbacks incluídos
  round(
    100.0 * least(coalesce(max(u.day_number),0), j.total_days) / j.total_days
  )                                               as progress_pct
from public.journeys j
left join public.updates u on u.journey_id = j.id
group by j.id;

-- ============================================================
-- RLS (Row Level Security)
-- Leitura pública de jornadas públicas; escrita só do dono.
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.journeys       enable row level security;
alter table public.updates        enable row level security;
alter table public.encouragements enable row level security;

-- Perfis: leitura pública, cada um edita o seu
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read"  on public.profiles for select using (true);
drop policy if exists "profiles write" on public.profiles;
create policy "profiles write" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update" on public.profiles;
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

-- Jornadas: públicas são visíveis a todos; dono vê e edita as suas
drop policy if exists "journeys public read" on public.journeys;
create policy "journeys public read" on public.journeys
  for select using (is_public = true or owner_id = auth.uid());
drop policy if exists "journeys owner write" on public.journeys;
create policy "journeys owner write" on public.journeys
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Updates: visíveis se a jornada é visível; só o dono posta
drop policy if exists "updates read" on public.updates;
create policy "updates read" on public.updates
  for select using (
    exists (select 1 from public.journeys j
            where j.id = journey_id
              and (j.is_public = true or j.owner_id = auth.uid()))
  );
drop policy if exists "updates owner write" on public.updates;
create policy "updates owner write" on public.updates
  for all using (
    exists (select 1 from public.journeys j
            where j.id = journey_id and j.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.journeys j
            where j.id = journey_id and j.owner_id = auth.uid())
  );

-- Encorajamentos: leitura pública, cada usuário cria/apaga o seu
drop policy if exists "enc read" on public.encouragements;
create policy "enc read"  on public.encouragements for select using (true);
drop policy if exists "enc write" on public.encouragements;
create policy "enc write" on public.encouragements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ###### storage-setup.sql ######

-- ============================================================
-- One Up Day — Storage para fotos de progresso
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================

-- bucket público de fotos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- leitura pública das fotos
drop policy if exists "photos public read" on storage.objects;
create policy "photos public read"
  on storage.objects for select
  using (bucket_id = 'photos');

-- upload permitido a usuários logados
drop policy if exists "photos authenticated upload" on storage.objects;
create policy "photos authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- dono pode apagar suas fotos
drop policy if exists "photos owner delete" on storage.objects;
create policy "photos owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());


-- ###### add-video.sql ######

-- ============================================================
-- One Up Day — Vídeo no update
-- Rode no Supabase: SQL Editor > New query > Run
-- Reutiliza o bucket 'photos' (é object storage; serve vídeo também).
-- ============================================================
alter table public.updates add column if not exists video_url text;


-- ###### add-avatar.sql ######

-- ============================================================
-- One Up Day — Foto de perfil do Google
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================
alter table public.profiles add column if not exists avatar_url text;


-- ###### add-banner.sql ######

-- ============================================================
-- One Up Day — Banner (capa) do perfil
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================
alter table public.profiles add column if not exists banner_url text;


-- ###### follows.sql ######

-- ============================================================
-- One Up Day — Seguir jornadas (follows)
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================
create table if not exists public.follows (
  user_id    uuid references public.profiles(id) on delete cascade,
  journey_id uuid references public.journeys(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, journey_id)
);
alter table public.follows enable row level security;

drop policy if exists "follows read" on public.follows;
create policy "follows read"  on public.follows for select using (true);
drop policy if exists "follows write" on public.follows;
create policy "follows write" on public.follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ###### reports.sql ######

-- One Up Day — denúncias de conteúdo. Rode no SQL Editor.
create table if not exists public.reports (
  id bigserial primary key,
  reporter_id uuid,
  update_id uuid references public.updates(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
drop policy if exists "reports insert" on public.reports;
create policy "reports insert" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());


-- ###### notifications.sql ######

-- ============================================================
-- One Up Day — Notificações in-app
-- Rode no Supabase: SQL Editor > New query > Run
-- Popula automaticamente por trigger (encorajar / seguir).
-- ============================================================
create table if not exists public.notifications (
  id          bigserial primary key,
  recipient_id uuid not null,
  actor_id    uuid,
  type        text not null,          -- 'encourage' | 'follow'
  update_id   uuid,
  journey_id  uuid,
  read        boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_notif_recipient on public.notifications(recipient_id, read, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notif read" on public.notifications;
create policy "notif read"   on public.notifications for select using (recipient_id = auth.uid());
drop policy if exists "notif update" on public.notifications;
create policy "notif update" on public.notifications for update using (recipient_id = auth.uid());

-- encorajar -> notifica o dono da jornada
create or replace function public.notif_encourage() returns trigger as $$
declare o uuid; jid uuid;
begin
  select j.owner_id, j.id into o, jid
  from public.updates u join public.journeys j on j.id = u.journey_id
  where u.id = new.update_id;
  if o is not null and o <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, update_id, journey_id)
    values (o, new.user_id, 'encourage', new.update_id, jid);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_encourage on public.encouragements;
create trigger trg_notif_encourage after insert on public.encouragements
  for each row execute function public.notif_encourage();

-- seguir -> notifica o dono da jornada
create or replace function public.notif_follow() returns trigger as $$
declare o uuid;
begin
  select owner_id into o from public.journeys where id = new.journey_id;
  if o is not null and o <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, journey_id)
    values (o, new.user_id, 'follow', new.journey_id);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_follow on public.follows;
create trigger trg_notif_follow after insert on public.follows
  for each row execute function public.notif_follow();


-- ###### analytics.sql ######

-- ============================================================
-- One Up Day — Analytics mínimo (eventos + retenção)
-- Rode no Supabase: SQL Editor > New query > Run
-- Registra eventos automaticamente por trigger (sem código no app).
-- ============================================================

-- Tabela de eventos
create table if not exists public.events (
  id         bigserial primary key,
  user_id    uuid,
  name       text not null,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_events_name_time on public.events(name, created_at);

alter table public.events enable row level security;
-- leitura só via dashboard/SQL (sem policy de select = ninguém lê via API pública)

-- Trigger: cada update postado gera evento 'update_posted'
create or replace function public.log_update_event() returns trigger as $$
begin
  insert into public.events(user_id, name, meta)
  select j.owner_id, 'update_posted',
         jsonb_build_object('journey_id', new.journey_id, 'kind', new.kind, 'day', new.day_number)
  from public.journeys j where j.id = new.journey_id;
  return new;
end $$ language plpgsql security definer;

drop trigger if exists trg_update_event on public.updates;
create trigger trg_update_event after insert on public.updates
  for each row execute function public.log_update_event();

-- Trigger: cada jornada criada gera evento 'journey_created'
create or replace function public.log_journey_event() returns trigger as $$
begin
  insert into public.events(user_id, name, meta)
  values (new.owner_id, 'journey_created', jsonb_build_object('journey_id', new.id, 'category', new.category));
  return new;
end $$ language plpgsql security definer;

drop trigger if exists trg_journey_event on public.journeys;
create trigger trg_journey_event after insert on public.journeys
  for each row execute function public.log_journey_event();

-- ============================================================
-- MÉTRICA ÚNICA: retenção de postagem por usuário
-- posted_day2 = postou no dia seguinte ao cadastro
-- posted_day7 = postou 6 dias após o cadastro
-- ============================================================
create or replace view public.user_retention as
select
  p.id as user_id,
  p.created_at::date as signup_day,
  exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where j.owner_id = p.id and u.created_at::date = (p.created_at + interval '1 day')::date
  ) as posted_day2,
  exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where j.owner_id = p.id and u.created_at::date = (p.created_at + interval '6 day')::date
  ) as posted_day7
from public.profiles p;

-- Como ler o número que importa (rode quando tiver usuários reais):
-- select
--   count(*)                                   as usuarios,
--   round(100.0*count(*) filter (where posted_day2)/nullif(count(*),0)) as retencao_dia2_pct,
--   round(100.0*count(*) filter (where posted_day7)/nullif(count(*),0)) as retencao_dia7_pct
-- from public.user_retention;


-- ###### privacy.sql ######

-- ============================================================
-- One Up Day — Privacidade em 3 níveis (público / seguidores / privado)
-- Supabase → SQL Editor → New query → Run. Re-executável.
-- ============================================================
alter table public.journeys add column if not exists visibility text default 'public';
update public.journeys
  set visibility = case when coalesce(is_public, true) then 'public' else 'private' end
  where visibility is null;

-- Leitura de jornadas conforme visibilidade
drop policy if exists "journeys public read" on public.journeys;
drop policy if exists "journeys read" on public.journeys;
drop policy if exists "journeys read" on public.journeys;
create policy "journeys read" on public.journeys for select using (
  visibility = 'public'
  or owner_id = auth.uid()
  or (visibility = 'followers' and exists (
    select 1 from public.follows f where f.journey_id = public.journeys.id and f.user_id = auth.uid()))
);

-- Leitura de updates segue a visibilidade da jornada
drop policy if exists "updates read" on public.updates;
drop policy if exists "updates read" on public.updates;
create policy "updates read" on public.updates for select using (
  exists (select 1 from public.journeys j where j.id = journey_id and (
    j.visibility = 'public'
    or j.owner_id = auth.uid()
    or (j.visibility = 'followers' and exists (
      select 1 from public.follows f where f.journey_id = j.id and f.user_id = auth.uid()))
  ))
);


-- ###### care-extra.sql ######

-- ============================================================
-- One Up Day — Bloquear, ocultar temas, pausar notificações
-- Supabase → SQL Editor → New query → Run. Re-executável.
-- ============================================================
create table if not exists public.blocks (
  blocker_id uuid, blocked_id uuid, created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists "blocks own" on public.blocks;
drop policy if exists "blocks own" on public.blocks;
create policy "blocks own" on public.blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

alter table public.profiles add column if not exists muted_cats  text;
alter table public.profiles add column if not exists notif_paused boolean default false;


-- ###### moments.sql ######

-- One Up Day — Grupos por momento de vida. SQL Editor → Run.
alter table public.journeys add column if not exists moment text;

-- ###### comments.sql ######
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'published' check (status in ('published','blocked','pending')),
  created_at timestamptz default now()
);
alter table public.comments add column if not exists parent_id uuid references public.comments(id) on delete cascade;
create index if not exists idx_comments_update on public.comments(update_id, created_at);
create index if not exists idx_comments_parent on public.comments(parent_id, created_at);
alter table public.comments enable row level security;
drop policy if exists "comments read published" on public.comments;
create policy "comments read published" on public.comments for select using (
  status = 'published' and exists (select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where u.id = update_id and (j.visibility = 'public' or j.owner_id = auth.uid()))
);
drop policy if exists "comments own insert" on public.comments;
create policy "comments own insert" on public.comments for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "comments own delete" on public.comments;
create policy "comments own delete" on public.comments for delete using (user_id = auth.uid());

-- ###### messages.sql ######
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_no_self check (sender_id <> recipient_id)
);
create index if not exists idx_messages_conversation on public.messages(sender_id, recipient_id, created_at desc);
create index if not exists idx_messages_recipient on public.messages(recipient_id, read_at, created_at desc);
alter table public.messages enable row level security;
drop policy if exists "messages own read" on public.messages;
create policy "messages own read" on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());
drop policy if exists "messages own insert" on public.messages;
create policy "messages own insert" on public.messages for insert to authenticated with check (sender_id = auth.uid());
drop policy if exists "messages recipient update" on public.messages;
create policy "messages recipient update" on public.messages for update using (recipient_id = auth.uid());
