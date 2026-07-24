-- One Up Day — Envelope de Amanhã (mensagem que a pessoa deixa pra si mesma)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create table if not exists public.envelopes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  journey_id uuid,
  text       text not null,
  created_at timestamptz default now(),
  opened_at  timestamptz
);
create index if not exists idx_env_user on public.envelopes(user_id, created_at desc);
alter table public.envelopes enable row level security;
drop policy if exists "env own" on public.envelopes;
create policy "env own" on public.envelopes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
