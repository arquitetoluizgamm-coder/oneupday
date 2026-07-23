-- ============================================================
-- One Up Day — FIX RÁPIDO (resolve o erro 500)
-- 100% seguro de rodar: só adiciona o que falta, sem tocar em políticas.
-- Supabase → SQL Editor → New query → cole → Run
-- ============================================================
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists banner_url text;
alter table public.updates   add column if not exists video_url  text;

-- tabelas de recursos (se ainda não existirem)
create table if not exists public.follows (
  user_id uuid, journey_id uuid, created_at timestamptz default now(),
  primary key (user_id, journey_id)
);
create table if not exists public.reports (
  id bigserial primary key, reporter_id uuid, update_id uuid,
  reason text, created_at timestamptz default now()
);
create table if not exists public.notifications (
  id bigserial primary key, recipient_id uuid not null, actor_id uuid,
  type text not null, update_id uuid, journey_id uuid,
  read boolean default false, created_at timestamptz default now()
);
alter table public.follows enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
