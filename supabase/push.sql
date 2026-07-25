-- ---- Push notifications (Web Push / TWA) ----
-- Rode no SQL Editor do Supabase.

create table if not exists push_subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz
);
alter table push_subs enable row level security;
drop policy if exists "push read own" on push_subs;
create policy "push read own" on push_subs for select using (auth.uid() = user_id);
drop policy if exists "push insert own" on push_subs;
create policy "push insert own" on push_subs for insert with check (auth.uid() = user_id);
drop policy if exists "push delete own" on push_subs;
create policy "push delete own" on push_subs for delete using (auth.uid() = user_id);

-- preferências e controle do lembrete diário
alter table profiles add column if not exists push_on boolean default true;
alter table profiles add column if not exists reminder_hour int default 20;   -- hora BRT
alter table profiles add column if not exists last_reminder_key text;         -- YYYY-MM-DD já enviado

-- marca notificações que já viraram push (evita duplicar)
alter table notifications add column if not exists pushed boolean default false;
create index if not exists notifications_pushed_idx on notifications (pushed) where pushed = false;
