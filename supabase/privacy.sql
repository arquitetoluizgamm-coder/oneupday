-- ============================================================
-- One Up Day — Privacidade em 3 níveis (público / seguidores / privado)
-- Supabase → SQL Editor → New query → Run. Re-executável.
-- ============================================================
alter table public.journeys add column if not exists visibility text default 'public';
update public.journeys
  set visibility = case when coalesce(is_public, true) then 'public' else 'private' end
  where visibility is null;

-- Leitura de jornadas conforme visibilidade
drop policy if exists "journeys public read" on public.journeys;
drop policy if exists "journeys read" on public.journeys;
create policy "journeys read" on public.journeys for select using (
  visibility = 'public'
  or owner_id = auth.uid()
  or (visibility = 'followers' and exists (
    select 1 from public.follows f where f.journey_id = public.journeys.id and f.user_id = auth.uid()))
);

-- Leitura de updates segue a visibilidade da jornada
drop policy if exists "updates read" on public.updates;
create policy "updates read" on public.updates for select using (
  exists (select 1 from public.journeys j where j.id = journey_id and (
    j.visibility = 'public'
    or j.owner_id = auth.uid()
    or (j.visibility = 'followers' and exists (
      select 1 from public.follows f where f.journey_id = j.id and f.user_id = auth.uid()))
  ))
);
