-- One Up Day — eventos de produto (compatível com analytics.sql: coluna "name")
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create table if not exists public.events (
  id         bigserial primary key,
  user_id    uuid,
  name       text not null,
  meta       jsonb,
  created_at timestamptz default now()
);
-- coluna para visitantes anônimos (pré-cadastro)
alter table public.events add column if not exists anon_id text;
create index if not exists idx_events_name_time on public.events(name, created_at);
create index if not exists idx_events_user_time on public.events(user_id, created_at);

alter table public.events enable row level security;
drop policy if exists "events insert" on public.events;
create policy "events insert" on public.events for insert to anon, authenticated with check (true);
drop policy if exists "events admin read" on public.events;
create policy "events admin read" on public.events for select
  using ((auth.jwt() ->> 'email') = 'arquitetoluizgamm@gmail.com');

-- data de cadastro (para cohorts)
alter table public.profiles add column if not exists created_at timestamptz default now();
