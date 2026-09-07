-- Solicitação e revisão de perfis profissionais.
-- A candidatura é privada entre a pessoa e a administração do ONE.

alter table public.profiles
  add column if not exists professional_title text,
  add column if not exists professional_verified_by uuid references public.profiles(id) on delete set null;

create table if not exists public.professional_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  profession text not null check (char_length(trim(profession)) between 2 and 100),
  credential text not null default '' check (char_length(credential) <= 160),
  evidence_url text check (
    evidence_url is null
    or (
      char_length(evidence_url) <= 500
      and evidence_url ~* '^https?://'
    )
  ),
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text not null default '' check (char_length(review_note) <= 1000),
  reviewed_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(credential)) > 0 or evidence_url is not null)
);

create unique index if not exists professional_verification_one_pending_idx
  on public.professional_verification_requests(user_id)
  where status = 'pending';

create index if not exists professional_verification_status_idx
  on public.professional_verification_requests(status, submitted_at desc);

alter table public.professional_verification_requests enable row level security;

drop policy if exists professional_verification_select_own on public.professional_verification_requests;
create policy professional_verification_select_own
on public.professional_verification_requests
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists professional_verification_insert_own on public.professional_verification_requests;
create policy professional_verification_insert_own
on public.professional_verification_requests
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and not exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_professional_verified is true
  )
);

revoke all on table public.professional_verification_requests from anon;
revoke update, delete on table public.professional_verification_requests from authenticated;
grant select, insert on table public.professional_verification_requests to authenticated;
grant all on table public.professional_verification_requests to service_role;

create or replace function public.review_professional_verification(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_approved boolean,
  p_review_note text default ''
)
returns public.professional_verification_requests
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request public.professional_verification_requests;
begin
  if current_user not in ('postgres', 'service_role')
     and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'professional_review_requires_service_role';
  end if;

  select * into v_request
  from public.professional_verification_requests
  where id = p_request_id
  for update;

  if v_request.id is null then
    raise exception 'professional_request_not_found';
  end if;
  if v_request.status <> 'pending' then
    raise exception 'professional_request_already_reviewed';
  end if;

  if p_approved then
    update public.profiles
    set is_professional_verified = true,
        professional_verified_at = now(),
        professional_verified_by = p_reviewer_id,
        professional_title = v_request.profession
    where id = v_request.user_id;
  end if;

  update public.professional_verification_requests
  set status = case when p_approved then 'approved' else 'rejected' end,
      review_note = left(coalesce(p_review_note, ''), 1000),
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      updated_at = now()
  where id = v_request.id
  returning * into v_request;

  return v_request;
end;
$$;

revoke all on function public.review_professional_verification(uuid, uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.review_professional_verification(uuid, uuid, boolean, text) to service_role;

-- Chaves secretas novas podem chegar ao PostgREST com current_user=service_role
-- sem preencher a claim JWT legada. A proteção aceita os dois formatos e
-- continua bloqueando qualquer atualização feita por um usuário comum.
create or replace function private.protect_professional_verification()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if ((tg_op = 'INSERT' and (
        new.is_professional_verified is true
        or new.professional_verified_at is not null
        or new.professional_verified_by is not null
        or new.professional_title is not null
      ))
      or (tg_op = 'UPDATE' and (
        new.is_professional_verified is distinct from old.is_professional_verified
        or new.professional_verified_at is distinct from old.professional_verified_at
        or new.professional_verified_by is distinct from old.professional_verified_by
        or new.professional_title is distinct from old.professional_title
      )))
     and current_user not in ('postgres', 'service_role')
     and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'professional_verification_requires_service_role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_professional_verification on public.profiles;
create trigger profiles_protect_professional_verification
before insert or update
on public.profiles
for each row execute function private.protect_professional_verification();
