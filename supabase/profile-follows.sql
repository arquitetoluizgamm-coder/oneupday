-- One Up Day — Seguir PESSOAS (perfil), além de seguir jornadas.
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create table if not exists public.profile_follows (
  follower_id  uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);
alter table public.profile_follows enable row level security;
drop policy if exists "pf read"  on public.profile_follows;
create policy "pf read"  on public.profile_follows for select using (true);
drop policy if exists "pf write" on public.profile_follows;
create policy "pf write" on public.profile_follows
  for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- seguir PESSOA -> notifica quem foi seguido
create or replace function public.notif_profile_follow() returns trigger as $$
begin
  if new.following_id <> new.follower_id then
    insert into public.notifications(recipient_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow');
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_profile_follow on public.profile_follows;
create trigger trg_notif_profile_follow after insert on public.profile_follows
  for each row execute function public.notif_profile_follow();
