-- One Up Day — foto de capa própria da jornada (editável pelo dono)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
alter table public.journeys add column if not exists cover_url text;
