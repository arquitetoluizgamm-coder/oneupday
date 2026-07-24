-- One Up Day — sentimento opcional por publicação (retenção com cuidado)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
alter table public.updates add column if not exists mood text;
