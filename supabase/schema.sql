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
create policy "profiles read"  on public.profiles for select using (true);
create policy "profiles write" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

-- Jornadas: públicas são visíveis a todos; dono vê e edita as suas
create policy "journeys public read" on public.journeys
  for select using (is_public = true or owner_id = auth.uid());
create policy "journeys owner write" on public.journeys
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Updates: visíveis se a jornada é visível; só o dono posta
create policy "updates read" on public.updates
  for select using (
    exists (select 1 from public.journeys j
            where j.id = journey_id
              and (j.is_public = true or j.owner_id = auth.uid()))
  );
create policy "updates owner write" on public.updates
  for all using (
    exists (select 1 from public.journeys j
            where j.id = journey_id and j.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.journeys j
            where j.id = journey_id and j.owner_id = auth.uid())
  );

-- Encorajamentos: leitura pública, cada usuário cria/apaga o seu
create policy "enc read"  on public.encouragements for select using (true);
create policy "enc write" on public.encouragements
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
