-- ============================================================
-- One Up Day — Foto de perfil do Google
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================
alter table public.profiles add column if not exists avatar_url text;
