begin;

-- Rotinas passam a usar as mesmas opções de visibilidade das publicações.
update public.routines
set privacy = case privacy
  when 'profile' then 'public'
  else 'private'
end
where privacy in ('milestones', 'profile');

alter table public.routines
  drop constraint if exists routines_privacy_check;

alter table public.routines
  add constraint routines_privacy_check
  check (privacy in ('public', 'followers', 'private', 'milestones', 'profile'));

-- Uma publicação de rotina reutiliza mídia, música e interações do feed.
alter table public.media
  alter column url drop not null,
  add column if not exists routine_id uuid
    references public.routines(id) on delete cascade;

create unique index if not exists media_routine_unique_idx
  on public.media(routine_id)
  where routine_id is not null;

create index if not exists routines_owner_privacy_idx
  on public.routines(owner_id, privacy);

alter table public.routines enable row level security;

drop policy if exists routines_owner_all on public.routines;
create policy routines_owner_all
  on public.routines
  for all
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists routines_social_read on public.routines;
create policy routines_social_read
  on public.routines
  for select
  to authenticated
  using (
    privacy = 'public'
    or owner_id = (select auth.uid())
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

commit;
