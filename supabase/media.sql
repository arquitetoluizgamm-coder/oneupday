-- One Up Day — álbum pessoal (foto/vídeo com visibilidade por item)
-- Requer profile-follows.sql (seguir pessoa). Rode no Supabase → SQL Editor → Run.
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  url        text not null,
  kind       text not null default 'photo',
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  caption    text,
  created_at timestamptz default now()
);
create index if not exists idx_media_user on public.media(user_id, created_at desc);
alter table public.media enable row level security;
drop policy if exists "media read" on public.media;
create policy "media read" on public.media for select using (
  visibility = 'public'
  or user_id = auth.uid()
  or (visibility = 'followers' and exists (
       select 1 from public.profile_follows pf where pf.following_id = media.user_id and pf.follower_id = auth.uid()
     ))
);
drop policy if exists "media own write" on public.media;
create policy "media own write" on public.media for all using (user_id = auth.uid()) with check (user_id = auth.uid());
