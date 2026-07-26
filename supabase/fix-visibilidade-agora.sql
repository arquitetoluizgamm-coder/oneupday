-- ============================================================
-- CORRIGE JORNADAS QUE "ESTÃO PÚBLICAS" MAS NINGUÉM VÊ
-- Rode inteiro no SQL Editor do Supabase. Vale na hora.
-- ============================================================

-- 1. Garante que a coluna existe com o padrão certo
alter table public.journeys add column if not exists visibility text default 'public';
alter table public.journeys alter column visibility set default 'public';

-- 2. DIAGNÓSTICO — veja antes de corrigir
--    (jornadas com visibility vazio são invisíveis para todos)
select
  title,
  coalesce(visibility, '(VAZIO - invisivel)') as visibilidade,
  is_public,
  created_at
from public.journeys
order by created_at desc
limit 30;

-- 3. CORREÇÃO: preenche o que está vazio usando o campo antigo
update public.journeys
   set visibility = case when coalesce(is_public, true) then 'public' else 'private' end
 where visibility is null or btrim(visibility) = '';

-- 4. Mantém os dois campos sempre coerentes daqui pra frente
create or replace function public.sync_journey_visibility()
returns trigger language plpgsql as $$
begin
  if new.visibility is null or btrim(new.visibility) = '' then
    new.visibility := case when coalesce(new.is_public, true) then 'public' else 'private' end;
  end if;
  new.is_public := (new.visibility = 'public');
  return new;
end $$;

drop trigger if exists trg_sync_journey_visibility on public.journeys;
create trigger trg_sync_journey_visibility
  before insert or update on public.journeys
  for each row execute function public.sync_journey_visibility();

-- 5. Confere o resultado (nenhuma linha deve vir "(VAZIO)")
select
  title,
  coalesce(visibility, '(VAZIO)') as visibilidade,
  is_public,
  (select count(*) from public.updates u where u.journey_id = j.id) as dias_registrados
from public.journeys j
order by created_at desc
limit 30;
