-- ============================================================
-- One Up Day — Analytics mínimo (eventos + retenção)
-- Rode no Supabase: SQL Editor > New query > Run
-- Registra eventos automaticamente por trigger (sem código no app).
-- ============================================================

-- Tabela de eventos
create table if not exists public.events (
  id         bigserial primary key,
  user_id    uuid,
  name       text not null,
  meta       jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_events_name_time on public.events(name, created_at);

alter table public.events enable row level security;
-- leitura só via dashboard/SQL (sem policy de select = ninguém lê via API pública)

-- Trigger: cada update postado gera evento 'update_posted'
create or replace function public.log_update_event() returns trigger as $$
begin
  insert into public.events(user_id, name, meta)
  select j.owner_id, 'update_posted',
         jsonb_build_object('journey_id', new.journey_id, 'kind', new.kind, 'day', new.day_number)
  from public.journeys j where j.id = new.journey_id;
  return new;
end $$ language plpgsql security definer;

drop trigger if exists trg_update_event on public.updates;
create trigger trg_update_event after insert on public.updates
  for each row execute function public.log_update_event();

-- Trigger: cada jornada criada gera evento 'journey_created'
create or replace function public.log_journey_event() returns trigger as $$
begin
  insert into public.events(user_id, name, meta)
  values (new.owner_id, 'journey_created', jsonb_build_object('journey_id', new.id, 'category', new.category));
  return new;
end $$ language plpgsql security definer;

drop trigger if exists trg_journey_event on public.journeys;
create trigger trg_journey_event after insert on public.journeys
  for each row execute function public.log_journey_event();

-- ============================================================
-- MÉTRICA ÚNICA: retenção de postagem por usuário
-- posted_day2 = postou no dia seguinte ao cadastro
-- posted_day7 = postou 6 dias após o cadastro
-- ============================================================
create or replace view public.user_retention as
select
  p.id as user_id,
  p.created_at::date as signup_day,
  exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where j.owner_id = p.id and u.created_at::date = (p.created_at + interval '1 day')::date
  ) as posted_day2,
  exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where j.owner_id = p.id and u.created_at::date = (p.created_at + interval '6 day')::date
  ) as posted_day7
from public.profiles p;

-- Como ler o número que importa (rode quando tiver usuários reais):
-- select
--   count(*)                                   as usuarios,
--   round(100.0*count(*) filter (where posted_day2)/nullif(count(*),0)) as retencao_dia2_pct,
--   round(100.0*count(*) filter (where posted_day7)/nullif(count(*),0)) as retencao_dia7_pct
-- from public.user_retention;
