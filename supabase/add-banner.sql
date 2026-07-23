-- ============================================================
-- One Up Day — Banner (capa) do perfil
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================
alter table public.profiles add column if not exists banner_url text;
