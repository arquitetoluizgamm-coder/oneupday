-- One Up Day — preferência de IA salva no perfil (ligar/desligar entre dispositivos)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
alter table public.profiles add column if not exists ai_opt_out boolean default false;
