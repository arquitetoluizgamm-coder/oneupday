begin;

-- Separa escrita e leitura para evitar duas políticas permissivas no SELECT.
drop policy if exists routines_owner_all on public.routines;
drop policy if exists routines_social_read on public.routines;

create policy routines_owner_insert
  on public.routines
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy routines_owner_update
  on public.routines
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy routines_owner_delete
  on public.routines
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy routines_read
  on public.routines
  for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or privacy = 'public'
    or (
      privacy = 'followers'
      and exists (
        select 1
        from public.profile_follows pf
        where pf.following_id = routines.owner_id
          and pf.follower_id = (select auth.uid())
      )
    )
  );

alter function public.touch_routine_updated_at() set search_path = '';

commit;
