-- Rotinas são entidades próprias. Jornadas e seus registros antigos não são alterados.
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  ideal_text text not null check (char_length(trim(ideal_text)) between 1 and 240),
  minimum_text text,
  schedule_type text not null default 'daily' check (schedule_type in ('daily', 'weekdays', 'weekly_target')),
  weekdays smallint[] not null default '{}',
  weekly_target smallint check (weekly_target is null or weekly_target between 1 and 7),
  start_date date not null default current_date,
  preferred_time time,
  period text check (period is null or period in ('morning', 'afternoon', 'evening', 'anytime')),
  linked_journey_id uuid references public.journeys(id) on delete set null,
  privacy text not null default 'private' check (privacy in ('private', 'milestones', 'profile')),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  pause_until date,
  pause_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  state text not null check (state in ('ideal', 'minimum', 'not_today', 'paused')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (routine_id, log_date)
);

create index if not exists routines_owner_status_idx on public.routines(owner_id, status);
create index if not exists routine_logs_owner_date_idx on public.routine_logs(owner_id, log_date desc);
create index if not exists routine_logs_routine_date_idx on public.routine_logs(routine_id, log_date desc);

alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;

drop policy if exists routines_owner_all on public.routines;
create policy routines_owner_all on public.routines for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists routine_logs_owner_all on public.routine_logs;
create policy routine_logs_owner_all on public.routine_logs for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.touch_routine_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists routines_touch_updated_at on public.routines;
create trigger routines_touch_updated_at before update on public.routines for each row execute function public.touch_routine_updated_at();
drop trigger if exists routine_logs_touch_updated_at on public.routine_logs;
create trigger routine_logs_touch_updated_at before update on public.routine_logs for each row execute function public.touch_routine_updated_at();
