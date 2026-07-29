-- Memoria privada da Upi
-- A Upi guarda respostas e sinais pessoais sem publicar nada no feed.

create table if not exists public.upi_memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  source_type text not null,
  source_id   text not null,
  kind        text not null default 'identity',
  title       text not null,
  body        text not null,
  summary     text,
  happened_on date,
  is_pinned   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);

create index if not exists idx_upi_memories_user_created
  on public.upi_memories(user_id, created_at desc);

alter table public.upi_memories enable row level security;

drop policy if exists "upi memories read own" on public.upi_memories;
drop policy if exists "upi memories insert own" on public.upi_memories;
drop policy if exists "upi memories update own" on public.upi_memories;
drop policy if exists "upi memories delete own" on public.upi_memories;

create policy "upi memories read own"
  on public.upi_memories for select
  using (auth.uid() = user_id);

create policy "upi memories insert own"
  on public.upi_memories for insert
  with check (auth.uid() = user_id);

create policy "upi memories update own"
  on public.upi_memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "upi memories delete own"
  on public.upi_memories for delete
  using (auth.uid() = user_id);
