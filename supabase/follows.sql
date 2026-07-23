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

create policy "follows read"  on public.follows for select using (true);
create policy "follows write" on public.follows
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
