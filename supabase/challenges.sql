-- ---- Desafios: caminhada junta, sem vencedor ----
-- Rode este arquivo no SQL Editor do Supabase.

create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  from_id uuid not null references profiles(id) on delete cascade,
  to_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  days int not null default 7,
  status text not null default 'pending', -- pending | active | declined
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
alter table challenges enable row level security;
drop policy if exists "challenges read" on challenges;
create policy "challenges read" on challenges for select using (true);
drop policy if exists "challenges insert" on challenges;
create policy "challenges insert" on challenges for insert with check (auth.uid() = from_id);
drop policy if exists "challenges update" on challenges;
create policy "challenges update" on challenges for update using (auth.uid() = from_id or auth.uid() = to_id);

create table if not exists challenge_checks (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  day_key date not null,
  created_at timestamptz not null default now(),
  unique(challenge_id, user_id, day_key)
);
alter table challenge_checks enable row level security;
drop policy if exists "checks read" on challenge_checks;
create policy "checks read" on challenge_checks for select using (true);
drop policy if exists "checks insert" on challenge_checks;
create policy "checks insert" on challenge_checks for insert with check (auth.uid() = user_id);

-- notificação: convite de desafio
create or replace function notify_challenge() returns trigger
language plpgsql security definer as $$
begin
  insert into notifications (recipient_id, actor_id, type)
  values (new.to_id, new.from_id, 'challenge');
  return new;
end $$;
drop trigger if exists trg_notify_challenge on challenges;
create trigger trg_notify_challenge after insert on challenges
for each row execute function notify_challenge();

-- notificação: desafio aceito
create or replace function notify_challenge_accept() returns trigger
language plpgsql security definer as $$
begin
  if new.status = 'active' and old.status = 'pending' then
    insert into notifications (recipient_id, actor_id, type)
    values (new.from_id, new.to_id, 'challenge_accept');
  end if;
  return new;
end $$;
drop trigger if exists trg_notify_challenge_accept on challenges;
create trigger trg_notify_challenge_accept after update on challenges
for each row execute function notify_challenge_accept();
