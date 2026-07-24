-- One Up Day — "Eu também" (identificação anônima em posts de recaída/recomeço)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create table if not exists public.me_too (
  id         bigserial primary key,
  update_id  uuid not null,
  user_id    uuid not null,
  msg_key    text not null default 'metoo' check (msg_key in ('metoo','back','trying','hard')),
  created_at timestamptz default now(),
  unique(update_id, user_id)
);
create index if not exists idx_metoo_update on public.me_too(update_id);
alter table public.me_too enable row level security;

drop policy if exists "metoo insert" on public.me_too;
create policy "metoo insert" on public.me_too for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "metoo delete own" on public.me_too;
create policy "metoo delete own" on public.me_too for delete using (user_id = auth.uid());
-- leitura: quem enviou vê o seu; o DONO do post vê todos (sem precisar dos nomes)
drop policy if exists "metoo read" on public.me_too;
create policy "metoo read" on public.me_too for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where u.id = me_too.update_id and j.owner_id = auth.uid()
  )
);

-- notificação anônima pro autor (o texto exibido não usa o nome)
create or replace function public.notif_metoo() returns trigger as $$
declare owner uuid;
begin
  select j.owner_id into owner from public.updates u join public.journeys j on j.id = u.journey_id where u.id = new.update_id;
  if owner is not null and owner <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, update_id)
    values (owner, new.user_id, 'metoo', new.update_id);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_metoo on public.me_too;
create trigger trg_notif_metoo after insert on public.me_too for each row execute function public.notif_metoo();
