-- One Up Day — apoio/comentário/abraço também nas fotos do álbum
-- Requer media.sql, notifications.sql, comments.sql, hugs.sql. Rode no Supabase → Run.
alter table public.encouragements add column if not exists media_id uuid;
alter table public.encouragements alter column update_id drop not null;
alter table public.comments add column if not exists media_id uuid;
alter table public.comments alter column update_id drop not null;
alter table public.hugs add column if not exists media_id uuid;

-- apoio -> notifica o dono (jornada OU mídia)
create or replace function public.notif_encourage() returns trigger as $$
declare o uuid; jid uuid;
begin
  if new.update_id is not null then
    select j.owner_id, j.id into o, jid
      from public.updates u join public.journeys j on j.id = u.journey_id
      where u.id = new.update_id;
  elsif new.media_id is not null then
    select m.user_id into o from public.media m where m.id = new.media_id;
  end if;
  if o is not null and o <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, update_id, journey_id)
    values (o, new.user_id, 'encourage', new.update_id, jid);
  end if;
  return new;
end $$ language plpgsql security definer;

-- leitura de comentários: jornada OU mídia visível
drop policy if exists "comments read published" on public.comments;
create policy "comments read published" on public.comments for select using (
  status = 'published' and (
    (update_id is not null and exists (
      select 1 from public.updates u join public.journeys j on j.id = u.journey_id
      where u.id = update_id and (j.visibility = 'public' or j.owner_id = auth.uid())))
    or
    (media_id is not null and exists (
      select 1 from public.media m
      where m.id = media_id and (m.visibility = 'public' or m.user_id = auth.uid()
        or (m.visibility = 'followers' and exists (
             select 1 from public.profile_follows pf where pf.following_id = m.user_id and pf.follower_id = auth.uid())))))
  )
);
