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
create policy "blocks own" on public.blocks
  for all using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

alter table public.profiles add column if not exists muted_cats  text;
alter table public.profiles add column if not exists notif_paused boolean default false;
