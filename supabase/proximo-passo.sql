-- ============================================================
-- CAPÍTULO EM ABERTO
-- O post deixa de terminar em si mesmo: quem publica pode dizer
-- qual é o próximo passo, e quem lê pode pedir para acompanhar.
--
-- Rode inteiro no SQL Editor do Supabase.
-- ============================================================

-- 1. o próximo passo mora no próprio dia publicado
alter table public.updates add column if not exists next_step text;
alter table public.updates add column if not exists next_when text;   -- "amanhã de manhã", "quinta", livre
alter table public.updates add column if not exists closed_by uuid;   -- o dia que trouxe o resultado

-- 2. quem quer saber como terminou
create table if not exists public.step_follows (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (update_id, user_id)
);

alter table public.step_follows enable row level security;

drop policy if exists "step_follows_read" on public.step_follows;
create policy "step_follows_read" on public.step_follows
  for select using (true);

drop policy if exists "step_follows_insert" on public.step_follows;
create policy "step_follows_insert" on public.step_follows
  for insert with check (auth.uid() = user_id);

drop policy if exists "step_follows_delete" on public.step_follows;
create policy "step_follows_delete" on public.step_follows
  for delete using (auth.uid() = user_id);

create index if not exists step_follows_update_idx on public.step_follows(update_id);
create index if not exists step_follows_user_idx on public.step_follows(user_id);
create index if not exists updates_next_step_idx on public.updates(journey_id)
  where next_step is not null;

-- 3. quando um passo é concluído, avisa QUEM PEDIU para acompanhar.
--    Nunca avisa ninguém quando alguém NÃO volta: capítulo em aberto
--    não é falha, e não existe cobrança pública neste app.
create or replace function public.notif_step_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dono uuid;
  jid uuid;
begin
  if new.closed_by is null or (old.closed_by is not null) then
    return new;
  end if;

  select j.owner_id, j.id into dono, jid
    from public.journeys j where j.id = new.journey_id;

  insert into public.notifications(recipient_id, actor_id, type, journey_id)
  select sf.user_id, dono, 'step_result', jid
    from public.step_follows sf
   where sf.update_id = new.id
     and sf.user_id <> dono;

  return new;
exception when others then
  return new;
end $$;

drop trigger if exists trg_notif_step_result on public.updates;
create trigger trg_notif_step_result
  after update of closed_by on public.updates
  for each row execute function public.notif_step_result();

-- confirmação
select
  (select count(*) from information_schema.columns
    where table_name='updates' and column_name in ('next_step','next_when','closed_by')) as colunas_criadas,
  (select count(*) from information_schema.tables
    where table_name='step_follows') as tabela_criada;
