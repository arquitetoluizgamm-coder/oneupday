-- One Up Day — sentimento diário no perfil (atualiza o halo do avatar)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
alter table public.profiles add column if not exists mood text;
alter table public.profiles add column if not exists mood_at timestamptz;
