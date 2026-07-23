-- One Up Day — Música nas postagens (via Jamendo, sem upload)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
-- Guardamos o link direto da faixa (hospedada no Jamendo) no próprio post.
alter table public.updates add column if not exists track_title     text;
alter table public.updates add column if not exists track_artist    text;
alter table public.updates add column if not exists track_audio_url text;
