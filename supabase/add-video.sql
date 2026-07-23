-- ============================================================
-- One Up Day — Vídeo no update
-- Rode no Supabase: SQL Editor > New query > Run
-- Reutiliza o bucket 'photos' (é object storage; serve vídeo também).
-- ============================================================
alter table public.updates add column if not exists video_url text;
