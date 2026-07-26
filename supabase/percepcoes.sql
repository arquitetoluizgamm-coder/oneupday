-- ============================================================
-- REAÇÕES DE PERCEPÇÃO
-- Em vez de "curti", a pessoa diz o que PERCEBEU na outra:
-- coragem para começar, capacidade de voltar, honestidade...
--
-- Fecha o circuito das Capacidades: hoje o app observa você
-- pelos seus dados; aqui é outra pessoa que reconhece.
--
-- Rode inteiro no SQL Editor do Supabase.
-- ============================================================

create table if not exists public.percepcoes (
  id uuid primary key default gen_random_uuid(),
  update_id uuid references public.updates(id) on delete cascade,
  to_id uuid not null references auth.users(id) on delete cascade,
  from_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,                       -- coragem | voltar | honestidade | sem_perfeicao | adaptar | limite | mudanca
  created_at timestamptz not null default now(),
  unique (update_id, from_id, tipo)
);

alter table public.percepcoes enable row level security;

-- qualquer pessoa logada lê (o agregado é público no perfil)
drop policy if exists "percepcoes read" on public.percepcoes;
create policy "percepcoes read" on public.percepcoes for select using (true);

-- só dá para reconhecer em nome de si mesmo, e nunca em si mesmo
drop policy if exists "percepcoes insert" on public.percepcoes;
create policy "percepcoes insert" on public.percepcoes
  for insert with check (auth.uid() = from_id and auth.uid() <> to_id);

drop policy if exists "percepcoes delete" on public.percepcoes;
create policy "percepcoes delete" on public.percepcoes
  for delete using (auth.uid() = from_id);

create index if not exists percepcoes_to_idx on public.percepcoes(to_id);
create index if not exists percepcoes_update_idx on public.percepcoes(update_id);

-- avisa quem foi reconhecido
create or replace function public.notif_percepcao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare jid uuid;
begin
  select journey_id into jid from public.updates where id = new.update_id;
  if new.to_id <> new.from_id then
    insert into public.notifications(recipient_id, actor_id, type, journey_id)
    values (new.to_id, new.from_id, 'percepcao', jid);
  end if;
  return new;
exception when others then
  return new;
end $$;

drop trigger if exists trg_notif_percepcao on public.percepcoes;
create trigger trg_notif_percepcao
  after insert on public.percepcoes
  for each row execute function public.notif_percepcao();

-- marcador de quando o resumo semanal foi enviado
alter table public.profiles add column if not exists espelho_push_em timestamptz;

select 'pronto' as status,
  (select count(*) from information_schema.tables where table_name='percepcoes') as tabela,
  (select count(*) from information_schema.columns
    where table_name='profiles' and column_name='espelho_push_em') as coluna;
