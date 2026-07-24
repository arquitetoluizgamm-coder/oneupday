-- One Up Day — notificações de cuidado (retorno com propósito)
-- Requer: mood.sql (profiles.mood/mood_at), follows.sql, profile-follows.sql, notifications.sql
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.

-- 1) Alguém que você segue marcou um sentimento "pra baixo" -> notifica seus seguidores
create or replace function public.notif_mood_low() returns trigger as $$
begin
  if new.mood in ('down','anxious','tired')
     and (old.mood is distinct from new.mood or old.mood_at is distinct from new.mood_at) then
    insert into public.notifications(recipient_id, actor_id, type)
    select distinct f.follower_id, new.id, 'mood_low'
    from (
      select follower_id from public.profile_follows where following_id = new.id
      union
      select fu.user_id as follower_id from public.follows fu
        join public.journeys j on j.id = fu.journey_id where j.owner_id = new.id
    ) f
    where f.follower_id is not null and f.follower_id <> new.id;
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_mood_low on public.profiles;
create trigger trg_notif_mood_low after update of mood, mood_at on public.profiles
  for each row execute function public.notif_mood_low();

-- 2) Alguém que você segue voltou depois de uma pausa (>=3 dias) -> notifica seus seguidores
create or replace function public.notif_comeback() returns trigger as $$
declare prev_day int; oid uuid; gap int;
begin
  select j.owner_id into oid from public.journeys j where j.id = new.journey_id;
  select max(u.day_number) into prev_day from public.updates u
    where u.journey_id = new.journey_id and u.day_number < new.day_number;
  if prev_day is not null then
    gap := new.day_number - prev_day;
    if gap >= 3 then
      insert into public.notifications(recipient_id, actor_id, type, update_id, journey_id)
      select distinct f.follower_id, oid, 'comeback', new.id, new.journey_id
      from (
        select follower_id from public.profile_follows where following_id = oid
        union
        select fu.user_id as follower_id from public.follows fu where fu.journey_id = new.journey_id
      ) f
      where f.follower_id is not null and f.follower_id <> oid;
    end if;
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_comeback on public.updates;
create trigger trg_notif_comeback after insert on public.updates
  for each row execute function public.notif_comeback();
