-- ============================================================
-- One Up Day — Notificações in-app
-- Rode no Supabase: SQL Editor > New query > Run
-- Popula automaticamente por trigger (encorajar / seguir).
-- ============================================================
create table if not exists public.notifications (
  id          bigserial primary key,
  recipient_id uuid not null,
  actor_id    uuid,
  type        text not null,          -- 'encourage' | 'follow'
  update_id   uuid,
  journey_id  uuid,
  read        boolean default false,
  created_at  timestamptz default now()
);
create index if not exists idx_notif_recipient on public.notifications(recipient_id, read, created_at desc);

alter table public.notifications enable row level security;
create policy "notif read"   on public.notifications for select using (recipient_id = auth.uid());
create policy "notif update" on public.notifications for update using (recipient_id = auth.uid());

-- encorajar -> notifica o dono da jornada
create or replace function public.notif_encourage() returns trigger as $$
declare o uuid; jid uuid;
begin
  select j.owner_id, j.id into o, jid
  from public.updates u join public.journeys j on j.id = u.journey_id
  where u.id = new.update_id;
  if o is not null and o <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, update_id, journey_id)
    values (o, new.user_id, 'encourage', new.update_id, jid);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_encourage on public.encouragements;
create trigger trg_notif_encourage after insert on public.encouragements
  for each row execute function public.notif_encourage();

-- seguir -> notifica o dono da jornada
create or replace function public.notif_follow() returns trigger as $$
declare o uuid;
begin
  select owner_id into o from public.journeys where id = new.journey_id;
  if o is not null and o <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, journey_id)
    values (o, new.user_id, 'follow', new.journey_id);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_follow on public.follows;
create trigger trg_notif_follow after insert on public.follows
  for each row execute function public.notif_follow();
