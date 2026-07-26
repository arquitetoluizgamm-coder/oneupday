-- ============================================================
-- PUSH INSTANTÂNEO (v2 — chave no corpo, não no cabeçalho)
--
-- ATENÇÃO: esta é a versão SEGURA para o GitHub.
-- A chave real foi trocada por COLE_AQUI_O_CRON_SECRET.
-- A versão com a chave preenchida fica só na sua máquina, em
-- web/supabase/push-instantaneo.sql — essa NUNCA vai para o GitHub.
--
-- Se precisar rodar de novo: copie este arquivo, troque as duas
-- ocorrências de COLE_AQUI_O_CRON_SECRET pelo valor do CRON_SECRET
-- (Vercel -> Settings -> Environment Variables) e rode no SQL Editor.
-- ============================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.disparar_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
begin
  perform net.http_post(
    url := 'https://oneupday.app/api/push/send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('key', 'COLE_AQUI_O_CRON_SECRET')
  );
  return new;
exception when others then
  return new;
end $$;

drop trigger if exists trg_disparar_push on public.notifications;
create trigger trg_disparar_push
  after insert on public.notifications
  for each row execute function public.disparar_push();

-- Teste imediato
select net.http_post(
  url := 'https://oneupday.app/api/push/send',
  headers := jsonb_build_object('Content-Type', 'application/json'),
  body := jsonb_build_object('key', 'COLE_AQUI_O_CRON_SECRET')
) as id_da_chamada;

-- Confira 5 segundos depois (rode esta parte sozinha):
-- select id, status_code, content, created
--   from net._http_response
--  order by id desc
--  limit 3;
