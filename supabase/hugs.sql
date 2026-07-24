-- One Up Day — abraços (gesto caloroso, notifica quem recebe)
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create table if not exists public.hugs (
  id         bigserial primary key,
  from_id    uuid not null,
  to_id      uuid not null,
  update_id  uuid,
  created_at timestamptz default now()
);
create index if not exists idx_hugs_to on public.hugs(to_id, created_at desc);
alter table public.hugs enable row level security;
drop policy if exists "hugs insert" on public.hugs;
create policy "hugs insert" on public.hugs for insert to authenticated with check (from_id = auth.uid());
drop policy if exists "hugs read" on public.hugs;
create policy "hugs read" on public.hugs for select using (from_id = auth.uid() or to_id = auth.uid());

create or replace function public.notif_hug() returns trigger as $$
begin
  if new.to_id <> new.from_id then
    insert into public.notifications(recipient_id, actor_id, type, update_id)
    values (new.to_id, new.from_id, 'hug', new.update_id);
  end if;
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_hug on public.hugs;
create trigger trg_notif_hug after insert on public.hugs for each row execute function public.notif_hug();
