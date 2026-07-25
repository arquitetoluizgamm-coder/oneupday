-- ============================================================
-- PUSH INSTANTÂNEO
-- Faz o banco chamar o disparador assim que uma notificação
-- nasce — a pessoa recebe em segundos, sem esperar o cron.
--
-- ANTES DE RODAR: troque COLE_SEU_CRON_SECRET_AQUI (2 lugares)
-- pelo valor do CRON_SECRET que está no CHAVES-VERCEL.txt
-- ============================================================

-- 1. Extensão que permite o banco fazer chamadas HTTP
create extension if not exists pg_net with schema extensions;

-- 2. Função: chama o disparador do push
create or replace function public.disparar_push()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://oneupday.app/api/push/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer JVnoKnlnAPYcwczf5OdINnJcaLb7vRZX'
    ),
    body := '{}'::jsonb
  );
  return new;
exception when others then
  -- nunca deixa o push quebrar a criação da notificação
  return new;
end $$;

-- 3. Gatilho: toda notificação nova aciona o disparador
drop trigger if exists trg_disparar_push on public.notifications;
create trigger trg_disparar_push
  after insert on public.notifications
  for each row execute function public.disparar_push();

-- ============================================================
-- TESTE MANUAL (opcional): roda o disparador agora mesmo.
-- Troque o secret aqui também antes de executar.
-- ============================================================
-- select net.http_post(
--   url := 'https://oneupday.app/api/push/send',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer COLE_SEU_CRON_SECRET_AQUI'
--   ),
--   body := '{}'::jsonb
-- );
