-- One Up Day — campos básicos de música nas postagens.
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
-- A URL pode apontar para o catálogo oficial no Storage ou para posts antigos.
alter table public.updates add column if not exists track_title     text;
alter table public.updates add column if not exists track_artist    text;
alter table public.updates add column if not exists track_audio_url text;
