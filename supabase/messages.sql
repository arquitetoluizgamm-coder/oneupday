-- Mensagens privadas com controle de conexao e leitura.
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
