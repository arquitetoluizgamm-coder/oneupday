-- One Up Day — corrige jornadas antigas sem visibilidade (senão somem do feed).
-- Rode no Supabase → SQL Editor → Run. Seguro rodar quantas vezes quiser.
update public.journeys
  set visibility = case when coalesce(is_public, true) then 'public' else 'private' end
  where visibility is null;
