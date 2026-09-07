-- Círculos: ecossistema privado e isolado do feed público do ONE.
-- Esta migração cria somente estruturas novas e um indicador de verificação
-- profissional em profiles. Não altera as policies das tabelas públicas atuais.

create extension if not exists pgcrypto;
create schema if not exists private;

alter table public.profiles
  add column if not exists is_professional_verified boolean not null default false,
  add column if not exists professional_verified_at timestamptz;

do $$ begin
  create type public.circle_role as enum ('owner', 'admin', 'moderator', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.circle_member_status as enum ('active', 'suspended', 'left', 'removed', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.circle_status as enum ('active', 'closed', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.circle_invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 3 and 80),
  description text not null default '',
  welcome_message text not null default '',
  cover_path text,
  visibility text not null default 'private' check (visibility = 'private'),
  status public.circle_status not null default 'active',
  settings jsonb not null default '{
    "who_can_post":"all",
    "who_can_comment":"all",
    "member_interaction":true,
    "private_messages":false,
    "show_member_list":false,
    "allow_images":true,
    "allow_videos":true,
    "allow_journeys":true,
    "allow_reactions":true,
    "allow_mentions":false,
    "admin_can_view_member_progress":false,
    "notification_details":false
  }'::jsonb,
  current_rules_version integer not null default 1 check (current_rules_version > 0),
  terms_version text not null default '2026-09',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.circle_role not null default 'member',
  status public.circle_member_status not null default 'active',
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  joined_at timestamptz not null default now(),
  accepted_at timestamptz,
  suspended_until timestamptz,
  left_at timestamptz,
  rules_version_accepted integer,
  terms_version_accepted text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

create table if not exists public.circle_rules (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  version integer not null check (version > 0),
  rules jsonb not null check (jsonb_typeof(rules) = 'array'),
  created_by uuid not null references public.profiles(id) on delete restrict,
  requires_reaccept boolean not null default false,
  created_at timestamptz not null default now(),
  unique (circle_id, version)
);

create table if not exists public.circle_rule_acceptances (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rules_version integer not null,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  unique (circle_id, user_id, rules_version, terms_version),
  foreign key (circle_id, rules_version)
    references public.circle_rules(circle_id, version) on delete restrict
);

create table if not exists public.circle_invites (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  invitee_id uuid references public.profiles(id) on delete cascade,
  expires_at timestamptz not null,
  max_uses integer not null default 1 check (max_uses between 1 and 1000),
  uses integer not null default 0 check (uses >= 0 and uses <= max_uses),
  status public.circle_invite_status not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz
);

create table if not exists public.circle_posts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'text' check (kind in ('text','image','video','link','journey','routine','checkin','reflection','admin_content')),
  body text not null default '',
  media_path text,
  media_type text check (media_type is null or media_type in ('image','video','file')),
  link_url text,
  metadata jsonb not null default '{}'::jsonb,
  comments_enabled boolean not null default true,
  status text not null default 'published' check (status in ('published','hidden','removed')),
  pinned_at timestamptz,
  pinned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (body <> '' or media_path is not null or link_url is not null)
);

create table if not exists public.circle_comments (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  post_id uuid not null references public.circle_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.circle_comments(id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  status text not null default 'published' check (status in ('published','hidden','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circle_reactions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  post_id uuid not null references public.circle_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'support' check (reaction in ('support','with_you','inspiring')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction)
);

create table if not exists public.circle_resources (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  kind text not null default 'link' check (kind in ('text','video','link','exercise','file')),
  url text,
  storage_path text,
  status text not null default 'published' check (status in ('draft','published','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (description <> '' or url is not null or storage_path is not null)
);

create table if not exists public.circle_journey_templates (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '',
  objective text not null default '',
  cover_path text,
  total_days integer not null check (total_days between 1 and 366),
  guidance jsonb not null default '[]'::jsonb check (jsonb_typeof(guidance) = 'array'),
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, circle_id)
);

create table if not exists public.circle_member_journeys (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  template_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','completed','left')),
  current_day integer not null default 0 check (current_day >= 0),
  progress jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (template_id, user_id),
  foreign key (template_id, circle_id)
    references public.circle_journey_templates(id, circle_id) on delete cascade
);

create table if not exists public.circle_routines (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 160),
  description text not null default '',
  schedule jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('draft','active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, circle_id)
);

create table if not exists public.circle_routine_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  routine_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active','paused','completed','left')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (routine_id, user_id),
  foreign key (routine_id, circle_id)
    references public.circle_routines(id, circle_id) on delete cascade
);

create table if not exists public.circle_routine_checkins (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  routine_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (routine_id, user_id, checkin_date),
  foreign key (routine_id, circle_id)
    references public.circle_routines(id, circle_id) on delete cascade
);

create table if not exists public.circle_reports (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','member')),
  target_id uuid not null,
  reason text not null check (reason in ('harassment','offensive','privacy','spam','inappropriate','other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  handled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.circle_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  action text not null check (action in ('member_warned','member_suspended','member_restored','member_removed','member_blocked','post_pinned','post_unpinned','post_hidden','post_removed','comments_closed','comment_hidden','comment_removed')),
  target_type text not null check (target_type in ('post','comment','member')),
  target_id uuid not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.circle_audit_logs (
  id bigint generated always as identity primary key,
  circle_id uuid not null references public.circles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.circle_notification_preferences (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  show_details boolean not null default false,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

create index if not exists circle_members_user_active_idx on public.circle_members(user_id, status, circle_id);
create index if not exists circle_members_circle_active_idx on public.circle_members(circle_id, status, role);
create index if not exists circle_invites_circle_status_idx on public.circle_invites(circle_id, status, expires_at);
create index if not exists circle_invites_invitee_idx on public.circle_invites(invitee_id, status);
create index if not exists circle_posts_feed_idx on public.circle_posts(circle_id, status, pinned_at desc, created_at desc);
create index if not exists circle_comments_post_idx on public.circle_comments(post_id, status, created_at);
create index if not exists circle_reactions_post_idx on public.circle_reactions(post_id, created_at);
create index if not exists circle_resources_circle_idx on public.circle_resources(circle_id, status, created_at desc);
create index if not exists circle_templates_circle_idx on public.circle_journey_templates(circle_id, status, created_at desc);
create index if not exists circle_member_journeys_user_idx on public.circle_member_journeys(user_id, status, updated_at desc);
create index if not exists circle_routines_circle_idx on public.circle_routines(circle_id, status, created_at desc);
create index if not exists circle_routine_members_user_idx on public.circle_routine_members(user_id, status, updated_at desc);
create index if not exists circle_routine_checkins_user_idx on public.circle_routine_checkins(user_id, checkin_date desc);
create index if not exists circle_reports_circle_idx on public.circle_reports(circle_id, status, created_at desc);
create index if not exists circle_audit_circle_idx on public.circle_audit_logs(circle_id, created_at desc);

create or replace function private.is_verified_professional()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.is_professional_verified is true
  );
$$;

create or replace function private.is_circle_member(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.circle_members m
    join public.circles c on c.id = m.circle_id
    where m.circle_id = p_circle_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'::public.circle_member_status
      and c.status = 'active'::public.circle_status
  );
$$;

create or replace function private.circle_role_for_user(p_circle_id uuid)
returns public.circle_role
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when c.owner_id = (select auth.uid()) then 'owner'::public.circle_role
    else m.role
  end
  from public.circles c
  left join public.circle_members m
    on m.circle_id = c.id
   and m.user_id = (select auth.uid())
   and m.status = 'active'::public.circle_member_status
  where c.id = p_circle_id
    and c.status = 'active'::public.circle_status
  limit 1;
$$;

create or replace function private.can_manage_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.circle_role_for_user(p_circle_id) in (
    'owner'::public.circle_role,
    'admin'::public.circle_role
  ), false);
$$;

create or replace function private.can_moderate_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.circle_role_for_user(p_circle_id) in (
    'owner'::public.circle_role,
    'admin'::public.circle_role,
    'moderator'::public.circle_role
  ), false);
$$;

create or replace function private.can_post_to_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.circles c
    where c.id = p_circle_id
      and c.status = 'active'::public.circle_status
      and private.is_circle_member(c.id)
      and case coalesce(c.settings->>'who_can_post', 'all')
        when 'all' then true
        when 'admins' then private.can_manage_circle(c.id)
        when 'moderators' then private.can_moderate_circle(c.id)
        else false
      end
  );
$$;

create or replace function private.can_comment_in_circle(p_circle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.circles c
    where c.id = p_circle_id
      and c.status = 'active'::public.circle_status
      and private.is_circle_member(c.id)
      and case coalesce(c.settings->>'who_can_comment', 'all')
        when 'all' then true
        when 'admins' then private.can_manage_circle(c.id)
        else false
      end
  );
$$;

create or replace function private.can_use_circle_post_kind(p_circle_id uuid, p_kind text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.circles c
    where c.id = p_circle_id
      and c.status = 'active'::public.circle_status
      and case
        when p_kind = 'admin_content' then private.can_manage_circle(c.id)
        when p_kind = 'image' then coalesce(c.settings->>'allow_images', 'true') = 'true'
        when p_kind = 'video' then coalesce(c.settings->>'allow_videos', 'true') = 'true'
        when p_kind = 'journey' then coalesce(c.settings->>'allow_journeys', 'true') = 'true'
        else true
      end
  );
$$;

create or replace function private.is_valid_circle_comment_parent(
  p_parent_id uuid,
  p_circle_id uuid,
  p_post_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_parent_id is null or exists (
    select 1 from public.circle_comments parent
    where parent.id = p_parent_id
      and parent.circle_id = p_circle_id
      and parent.post_id = p_post_id
      and parent.status = 'published'
  );
$$;

create or replace function private.is_valid_circle_report_target(
  p_circle_id uuid,
  p_target_type text,
  p_target_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_target_type
    when 'post' then exists (
      select 1 from public.circle_posts p
      where p.id = p_target_id and p.circle_id = p_circle_id
    )
    when 'comment' then exists (
      select 1 from public.circle_comments c
      where c.id = p_target_id and c.circle_id = p_circle_id
    )
    when 'member' then exists (
      select 1 from public.circle_members m
      where m.user_id = p_target_id and m.circle_id = p_circle_id
    )
    else false
  end;
$$;

create or replace function private.circle_id_from_storage_name(p_name text)
returns uuid
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  return split_part(p_name, '/', 1)::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.protect_circle_owner()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'circle_owner_is_immutable';
  end if;
  return new;
end;
$$;

create or replace function private.protect_professional_verification()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (new.is_professional_verified is distinct from old.is_professional_verified
      or new.professional_verified_at is distinct from old.professional_verified_at)
     and current_user <> 'postgres'
     and coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'professional_verification_requires_service_role';
  end if;
  return new;
end;
$$;

create or replace function private.protect_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid;
  v_circle_status public.circle_status;
begin
  select c.owner_id, c.status into v_owner, v_circle_status
  from public.circles c where c.id = old.circle_id;

  if old.user_id = v_owner and v_circle_status <> 'deleted'::public.circle_status then
    if tg_op = 'DELETE'
       or new.status <> 'active'::public.circle_member_status
       or new.role <> 'owner'::public.circle_role then
      raise exception 'circle_owner_membership_is_required';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists circles_touch_updated_at on public.circles;
create trigger circles_touch_updated_at before update on public.circles
for each row execute function private.touch_updated_at();
drop trigger if exists circle_members_touch_updated_at on public.circle_members;
create trigger circle_members_touch_updated_at before update on public.circle_members
for each row execute function private.touch_updated_at();
drop trigger if exists circle_posts_touch_updated_at on public.circle_posts;
create trigger circle_posts_touch_updated_at before update on public.circle_posts
for each row execute function private.touch_updated_at();
drop trigger if exists circle_comments_touch_updated_at on public.circle_comments;
create trigger circle_comments_touch_updated_at before update on public.circle_comments
for each row execute function private.touch_updated_at();
drop trigger if exists circle_resources_touch_updated_at on public.circle_resources;
create trigger circle_resources_touch_updated_at before update on public.circle_resources
for each row execute function private.touch_updated_at();
drop trigger if exists circle_templates_touch_updated_at on public.circle_journey_templates;
create trigger circle_templates_touch_updated_at before update on public.circle_journey_templates
for each row execute function private.touch_updated_at();
drop trigger if exists circle_member_journeys_touch_updated_at on public.circle_member_journeys;
create trigger circle_member_journeys_touch_updated_at before update on public.circle_member_journeys
for each row execute function private.touch_updated_at();
drop trigger if exists circle_routines_touch_updated_at on public.circle_routines;
create trigger circle_routines_touch_updated_at before update on public.circle_routines
for each row execute function private.touch_updated_at();
drop trigger if exists circle_routine_members_touch_updated_at on public.circle_routine_members;
create trigger circle_routine_members_touch_updated_at before update on public.circle_routine_members
for each row execute function private.touch_updated_at();
drop trigger if exists circle_reports_touch_updated_at on public.circle_reports;
create trigger circle_reports_touch_updated_at before update on public.circle_reports
for each row execute function private.touch_updated_at();
drop trigger if exists circle_notification_preferences_touch on public.circle_notification_preferences;
create trigger circle_notification_preferences_touch before update on public.circle_notification_preferences
for each row execute function private.touch_updated_at();
drop trigger if exists circles_protect_owner on public.circles;
create trigger circles_protect_owner before update on public.circles
for each row execute function private.protect_circle_owner();
drop trigger if exists profiles_protect_professional_verification on public.profiles;
create trigger profiles_protect_professional_verification
before update of is_professional_verified, professional_verified_at on public.profiles
for each row execute function private.protect_professional_verification();
drop trigger if exists circle_members_protect_owner on public.circle_members;
create trigger circle_members_protect_owner before update or delete on public.circle_members
for each row execute function private.protect_owner_membership();

create or replace function public.create_circle(
  p_name text,
  p_slug text,
  p_description text default '',
  p_welcome_message text default '',
  p_rules jsonb default '[]'::jsonb,
  p_settings jsonb default '{}'::jsonb
)
returns public.circles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_circle public.circles;
  v_settings jsonb;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not private.is_verified_professional() then raise exception 'verified_professional_required'; end if;
  if char_length(trim(p_name)) not between 3 and 80 then raise exception 'invalid_circle_name'; end if;
  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then raise exception 'invalid_circle_slug'; end if;
  if jsonb_typeof(p_rules) <> 'array' or jsonb_array_length(p_rules) = 0 then raise exception 'circle_rules_required'; end if;

  v_settings := jsonb_build_object(
    'who_can_post', case when p_settings->>'who_can_post' in ('all','admins','moderators') then p_settings->>'who_can_post' else 'all' end,
    'who_can_comment', case when p_settings->>'who_can_comment' in ('all','admins','disabled') then p_settings->>'who_can_comment' else 'all' end,
    'member_interaction', case when p_settings->>'member_interaction' in ('true','false') then (p_settings->>'member_interaction')::boolean else true end,
    'private_messages', case when p_settings->>'private_messages' in ('true','false') then (p_settings->>'private_messages')::boolean else false end,
    'show_member_list', case when p_settings->>'show_member_list' in ('true','false') then (p_settings->>'show_member_list')::boolean else false end,
    'allow_images', case when p_settings->>'allow_images' in ('true','false') then (p_settings->>'allow_images')::boolean else true end,
    'allow_videos', case when p_settings->>'allow_videos' in ('true','false') then (p_settings->>'allow_videos')::boolean else true end,
    'allow_journeys', case when p_settings->>'allow_journeys' in ('true','false') then (p_settings->>'allow_journeys')::boolean else true end,
    'allow_reactions', case when p_settings->>'allow_reactions' in ('true','false') then (p_settings->>'allow_reactions')::boolean else true end,
    'allow_mentions', case when p_settings->>'allow_mentions' in ('true','false') then (p_settings->>'allow_mentions')::boolean else false end,
    'admin_can_view_member_progress', case when p_settings->>'admin_can_view_member_progress' in ('true','false') then (p_settings->>'admin_can_view_member_progress')::boolean else false end,
    'notification_details', false
  );

  insert into public.circles(owner_id, slug, name, description, welcome_message, settings)
  values (v_user_id, p_slug, trim(p_name), coalesce(trim(p_description), ''), coalesce(trim(p_welcome_message), ''), v_settings)
  returning * into v_circle;

  insert into public.circle_members(circle_id, user_id, role, status, accepted_at, rules_version_accepted, terms_version_accepted)
  values (v_circle.id, v_user_id, 'owner', 'active', now(), 1, v_circle.terms_version);

  insert into public.circle_rules(circle_id, version, rules, created_by)
  values (v_circle.id, 1, p_rules, v_user_id);

  insert into public.circle_rule_acceptances(circle_id, user_id, rules_version, terms_version)
  values (v_circle.id, v_user_id, 1, v_circle.terms_version);

  insert into public.circle_notification_preferences(circle_id, user_id)
  values (v_circle.id, v_user_id);

  insert into public.circle_audit_logs(circle_id, actor_id, action, target_type, target_id)
  values (v_circle.id, v_user_id, 'circle_created', 'circle', v_circle.id);

  return v_circle;
end;
$$;

create or replace function public.create_circle_invite(
  p_circle_id uuid,
  p_token_hash text,
  p_invitee_id uuid default null,
  p_expires_at timestamptz default (now() + interval '7 days'),
  p_max_uses integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_invite_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not private.can_manage_circle(p_circle_id) then raise exception 'circle_manager_required'; end if;
  if p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'invalid_invite_token_hash'; end if;
  if p_expires_at <= now() then raise exception 'invite_expiry_must_be_future'; end if;
  if p_max_uses not between 1 and 1000 then raise exception 'invalid_invite_max_uses'; end if;

  insert into public.circle_invites(circle_id, created_by, token_hash, invitee_id, expires_at, max_uses)
  values (p_circle_id, v_user_id, p_token_hash, p_invitee_id, p_expires_at, p_max_uses)
  returning id into v_invite_id;

  insert into public.circle_audit_logs(circle_id, actor_id, action, target_type, target_id)
  values (p_circle_id, v_user_id, 'invite_created', 'invite', v_invite_id);

  return v_invite_id;
end;
$$;

create or replace function public.accept_circle_invite(
  p_token_hash text,
  p_accept_rules boolean,
  p_accept_privacy boolean,
  p_display_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_invite public.circle_invites;
  v_circle public.circles;
  v_existing public.circle_members;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not coalesce(p_accept_rules, false) or not coalesce(p_accept_privacy, false) then
    raise exception 'explicit_acceptance_required';
  end if;

  select * into v_invite
  from public.circle_invites i
  where i.token_hash = p_token_hash
  for update;

  if not found then raise exception 'invite_not_found'; end if;
  if v_invite.status <> 'pending'::public.circle_invite_status then raise exception 'invite_not_pending'; end if;
  if v_invite.expires_at <= now() then
    update public.circle_invites set status = 'expired' where id = v_invite.id;
    raise exception 'invite_expired';
  end if;
  if v_invite.uses >= v_invite.max_uses then raise exception 'invite_usage_exhausted'; end if;
  if v_invite.invitee_id is not null and v_invite.invitee_id <> v_user_id then raise exception 'invite_for_another_user'; end if;

  select * into v_circle from public.circles c
  where c.id = v_invite.circle_id and c.status = 'active'::public.circle_status;
  if not found then raise exception 'circle_unavailable'; end if;

  select * into v_existing from public.circle_members m
  where m.circle_id = v_circle.id and m.user_id = v_user_id;
  if found and v_existing.status = 'blocked'::public.circle_member_status then raise exception 'circle_return_blocked'; end if;

  insert into public.circle_members(
    circle_id, user_id, role, status, display_name, joined_at, accepted_at,
    rules_version_accepted, terms_version_accepted, suspended_until, left_at
  ) values (
    v_circle.id, v_user_id, 'member', 'active', nullif(trim(p_display_name), ''), now(), now(),
    v_circle.current_rules_version, v_circle.terms_version, null, null
  )
  on conflict (circle_id, user_id) do update set
    status = 'active',
    role = 'member',
    display_name = excluded.display_name,
    joined_at = now(),
    accepted_at = now(),
    rules_version_accepted = excluded.rules_version_accepted,
    terms_version_accepted = excluded.terms_version_accepted,
    suspended_until = null,
    left_at = null;

  insert into public.circle_rule_acceptances(circle_id, user_id, rules_version, terms_version)
  values (v_circle.id, v_user_id, v_circle.current_rules_version, v_circle.terms_version)
  on conflict do nothing;

  insert into public.circle_notification_preferences(circle_id, user_id)
  values (v_circle.id, v_user_id)
  on conflict do nothing;

  update public.circle_invites set
    uses = uses + 1,
    accepted_at = now(),
    status = case when uses + 1 >= max_uses or invitee_id is not null
      then 'accepted'::public.circle_invite_status else status end
  where id = v_invite.id;

  insert into public.circle_audit_logs(circle_id, actor_id, action, target_type, target_id)
  values (v_circle.id, v_user_id, 'invite_accepted', 'member', v_user_id);

  return v_circle.id;
end;
$$;

create or replace function public.leave_circle(p_circle_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_owner_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  select owner_id into v_owner_id from public.circles where id = p_circle_id;
  if v_owner_id = v_user_id then raise exception 'owner_cannot_leave_circle'; end if;

  update public.circle_members
  set status = 'left', left_at = now(), suspended_until = null
  where circle_id = p_circle_id and user_id = v_user_id and status = 'active';
  if not found then raise exception 'active_membership_not_found'; end if;

  update public.circle_notification_preferences
  set enabled = false where circle_id = p_circle_id and user_id = v_user_id;

  insert into public.circle_audit_logs(circle_id, actor_id, action, target_type, target_id)
  values (p_circle_id, v_user_id, 'member_left', 'member', v_user_id);
end;
$$;

revoke all on function public.create_circle(text,text,text,text,jsonb,jsonb) from public, anon;
revoke all on function public.create_circle_invite(uuid,text,uuid,timestamptz,integer) from public, anon;
revoke all on function public.accept_circle_invite(text,boolean,boolean,text) from public, anon;
revoke all on function public.leave_circle(uuid) from public, anon;
grant execute on function public.create_circle(text,text,text,text,jsonb,jsonb) to authenticated;
grant execute on function public.create_circle_invite(uuid,text,uuid,timestamptz,integer) to authenticated;
grant execute on function public.accept_circle_invite(text,boolean,boolean,text) to authenticated;
grant execute on function public.leave_circle(uuid) to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_verified_professional() to authenticated;
grant execute on function private.is_circle_member(uuid) to authenticated;
grant execute on function private.circle_role_for_user(uuid) to authenticated;
grant execute on function private.can_manage_circle(uuid) to authenticated;
grant execute on function private.can_moderate_circle(uuid) to authenticated;
grant execute on function private.can_post_to_circle(uuid) to authenticated;
grant execute on function private.can_comment_in_circle(uuid) to authenticated;
grant execute on function private.can_use_circle_post_kind(uuid,text) to authenticated;
grant execute on function private.is_valid_circle_comment_parent(uuid,uuid,uuid) to authenticated;
grant execute on function private.is_valid_circle_report_target(uuid,text,uuid) to authenticated;
grant execute on function private.circle_id_from_storage_name(text) to authenticated;

alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.circle_rules enable row level security;
alter table public.circle_rule_acceptances enable row level security;
alter table public.circle_invites enable row level security;
alter table public.circle_posts enable row level security;
alter table public.circle_comments enable row level security;
alter table public.circle_reactions enable row level security;
alter table public.circle_resources enable row level security;
alter table public.circle_journey_templates enable row level security;
alter table public.circle_member_journeys enable row level security;
alter table public.circle_routines enable row level security;
alter table public.circle_routine_members enable row level security;
alter table public.circle_routine_checkins enable row level security;
alter table public.circle_reports enable row level security;
alter table public.circle_moderation_actions enable row level security;
alter table public.circle_audit_logs enable row level security;
alter table public.circle_notification_preferences enable row level security;

revoke all on table public.circles, public.circle_members, public.circle_rules,
  public.circle_rule_acceptances, public.circle_invites, public.circle_posts,
  public.circle_comments, public.circle_reactions, public.circle_resources,
  public.circle_journey_templates, public.circle_member_journeys,
  public.circle_routines, public.circle_routine_members, public.circle_routine_checkins,
  public.circle_reports, public.circle_moderation_actions,
  public.circle_audit_logs, public.circle_notification_preferences
from anon, authenticated;

grant select on table public.circles, public.circle_members, public.circle_rules,
  public.circle_rule_acceptances, public.circle_invites, public.circle_posts,
  public.circle_comments, public.circle_reactions, public.circle_resources,
  public.circle_journey_templates, public.circle_member_journeys,
  public.circle_routines, public.circle_routine_members, public.circle_routine_checkins,
  public.circle_reports, public.circle_moderation_actions,
  public.circle_audit_logs, public.circle_notification_preferences
to authenticated;

grant insert on table public.circle_posts, public.circle_comments, public.circle_reactions,
  public.circle_resources, public.circle_journey_templates,
  public.circle_member_journeys, public.circle_routines, public.circle_routine_members,
  public.circle_routine_checkins, public.circle_reports,
  public.circle_notification_preferences
to authenticated;
grant update (status, current_day, progress, completed_at, updated_at)
  on public.circle_member_journeys to authenticated;
grant update (status, completed_at, updated_at)
  on public.circle_routine_members to authenticated;
grant update (status, handled_by, updated_at)
  on public.circle_reports to authenticated;
grant update (show_details, enabled, updated_at)
  on public.circle_notification_preferences to authenticated;
grant delete on table public.circle_posts, public.circle_comments, public.circle_reactions
to authenticated;

create policy circles_member_read on public.circles for select to authenticated
using (private.is_circle_member(id));

create policy circle_members_scoped_read on public.circle_members for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_manage_circle(circle_id)
  or (
    private.is_circle_member(circle_id)
    and coalesce((select c.settings->>'show_member_list' from public.circles c where c.id = circle_members.circle_id), 'false') = 'true'
  )
);

create policy circle_rules_member_read on public.circle_rules for select to authenticated
using (private.is_circle_member(circle_id));

create policy circle_acceptances_scoped_read on public.circle_rule_acceptances for select to authenticated
using (user_id = (select auth.uid()) or private.can_manage_circle(circle_id));

create policy circle_invites_manager_read on public.circle_invites for select to authenticated
using (private.can_manage_circle(circle_id) or invitee_id = (select auth.uid()));

create policy circle_posts_member_read on public.circle_posts for select to authenticated
using (
  private.is_circle_member(circle_id)
  and (status = 'published' or author_id = (select auth.uid()) or private.can_moderate_circle(circle_id))
);
create policy circle_posts_member_insert on public.circle_posts for insert to authenticated
with check (
  author_id = (select auth.uid())
  and private.can_post_to_circle(circle_id)
  and private.can_use_circle_post_kind(circle_id, kind)
  and status = 'published'
  and pinned_at is null
  and pinned_by is null
);
create policy circle_posts_author_delete on public.circle_posts for delete to authenticated
using (author_id = (select auth.uid()) and private.is_circle_member(circle_id));

create policy circle_comments_member_read on public.circle_comments for select to authenticated
using (
  private.is_circle_member(circle_id)
  and (status = 'published' or author_id = (select auth.uid()) or private.can_moderate_circle(circle_id))
);
create policy circle_comments_member_insert on public.circle_comments for insert to authenticated
with check (
  author_id = (select auth.uid())
  and private.can_comment_in_circle(circle_id)
  and status = 'published'
  and exists (
    select 1 from public.circle_posts p
    where p.id = circle_comments.post_id and p.circle_id = circle_comments.circle_id
      and p.status = 'published' and p.comments_enabled is true
  )
  and private.is_valid_circle_comment_parent(parent_id, circle_id, post_id)
);
create policy circle_comments_author_delete on public.circle_comments for delete to authenticated
using (author_id = (select auth.uid()) and private.is_circle_member(circle_id));

create policy circle_reactions_member_read on public.circle_reactions for select to authenticated
using (private.is_circle_member(circle_id));
create policy circle_reactions_member_insert on public.circle_reactions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_circle_member(circle_id)
  and coalesce((select c.settings->>'allow_reactions' from public.circles c where c.id = circle_reactions.circle_id), 'true') = 'true'
  and exists (
    select 1 from public.circle_posts p
    where p.id = circle_reactions.post_id
      and p.circle_id = circle_reactions.circle_id
      and p.status = 'published'
  )
);
create policy circle_reactions_own_delete on public.circle_reactions for delete to authenticated
using (user_id = (select auth.uid()) and private.is_circle_member(circle_id));

create policy circle_resources_member_read on public.circle_resources for select to authenticated
using (private.is_circle_member(circle_id) and (status = 'published' or private.can_manage_circle(circle_id)));
create policy circle_resources_manager_insert on public.circle_resources for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_circle(circle_id));

create policy circle_templates_member_read on public.circle_journey_templates for select to authenticated
using (private.is_circle_member(circle_id) and (status = 'active' or private.can_manage_circle(circle_id)));
create policy circle_templates_manager_insert on public.circle_journey_templates for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.can_manage_circle(circle_id)
  and coalesce((select c.settings->>'allow_journeys' from public.circles c where c.id = circle_journey_templates.circle_id), 'true') = 'true'
);

create policy circle_member_journeys_scoped_read on public.circle_member_journeys for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    private.can_manage_circle(circle_id)
    and coalesce((select c.settings->>'admin_can_view_member_progress' from public.circles c where c.id = circle_member_journeys.circle_id), 'false') = 'true'
  )
);
create policy circle_member_journeys_own_insert on public.circle_member_journeys for insert to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_circle_member(circle_id)
  and exists (
    select 1 from public.circle_journey_templates t
    where t.id = circle_member_journeys.template_id
      and t.circle_id = circle_member_journeys.circle_id
      and t.status = 'active'
  )
);
create policy circle_member_journeys_own_update on public.circle_member_journeys for update to authenticated
using (user_id = (select auth.uid()) and private.is_circle_member(circle_id))
with check (user_id = (select auth.uid()) and private.is_circle_member(circle_id));

create policy circle_routines_member_read on public.circle_routines for select to authenticated
using (private.is_circle_member(circle_id) and (status = 'active' or private.can_manage_circle(circle_id)));
create policy circle_routines_manager_insert on public.circle_routines for insert to authenticated
with check (created_by = (select auth.uid()) and private.can_manage_circle(circle_id));

create policy circle_routine_members_scoped_read on public.circle_routine_members for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    private.can_manage_circle(circle_id)
    and coalesce((select c.settings->>'admin_can_view_member_progress' from public.circles c where c.id = circle_routine_members.circle_id), 'false') = 'true'
  )
);
create policy circle_routine_members_own_insert on public.circle_routine_members for insert to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_circle_member(circle_id)
  and exists (
    select 1 from public.circle_routines r
    where r.id = circle_routine_members.routine_id
      and r.circle_id = circle_routine_members.circle_id
      and r.status = 'active'
  )
);
create policy circle_routine_members_own_update on public.circle_routine_members for update to authenticated
using (user_id = (select auth.uid()) and private.is_circle_member(circle_id))
with check (user_id = (select auth.uid()) and private.is_circle_member(circle_id));

create policy circle_routine_checkins_scoped_read on public.circle_routine_checkins for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    private.can_manage_circle(circle_id)
    and coalesce((select c.settings->>'admin_can_view_member_progress' from public.circles c where c.id = circle_routine_checkins.circle_id), 'false') = 'true'
  )
);
create policy circle_routine_checkins_own_insert on public.circle_routine_checkins for insert to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_circle_member(circle_id)
  and exists (
    select 1 from public.circle_routine_members rm
    where rm.routine_id = circle_routine_checkins.routine_id
      and rm.circle_id = circle_routine_checkins.circle_id
      and rm.user_id = (select auth.uid())
      and rm.status = 'active'
  )
);

create policy circle_reports_scoped_read on public.circle_reports for select to authenticated
using (reporter_id = (select auth.uid()) or private.can_moderate_circle(circle_id));
create policy circle_reports_member_insert on public.circle_reports for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and private.is_circle_member(circle_id)
  and private.is_valid_circle_report_target(circle_id, target_type, target_id)
);
create policy circle_reports_moderator_update on public.circle_reports for update to authenticated
using (private.can_moderate_circle(circle_id))
with check (private.can_moderate_circle(circle_id));

create policy circle_moderation_member_read on public.circle_moderation_actions for select to authenticated
using (private.can_moderate_circle(circle_id));
create policy circle_audit_manager_read on public.circle_audit_logs for select to authenticated
using (private.can_manage_circle(circle_id));

create policy circle_notification_own_read on public.circle_notification_preferences for select to authenticated
using (user_id = (select auth.uid()));
create policy circle_notification_own_insert on public.circle_notification_preferences for insert to authenticated
with check (user_id = (select auth.uid()) and private.is_circle_member(circle_id));
create policy circle_notification_own_update on public.circle_notification_preferences for update to authenticated
using (user_id = (select auth.uid()) and private.is_circle_member(circle_id))
with check (user_id = (select auth.uid()) and private.is_circle_member(circle_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'circle-media',
  'circle-media',
  false,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists circle_media_member_read on storage.objects;
create policy circle_media_member_read on storage.objects for select to authenticated
using (
  bucket_id = 'circle-media'
  and private.is_circle_member(private.circle_id_from_storage_name(name))
);

drop policy if exists circle_media_member_insert on storage.objects;
create policy circle_media_member_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'circle-media'
  and private.is_circle_member(private.circle_id_from_storage_name(name))
  and (storage.foldername(name))[2] = (select auth.uid())::text
);

drop policy if exists circle_media_owner_update on storage.objects;
create policy circle_media_owner_update on storage.objects for update to authenticated
using (
  bucket_id = 'circle-media'
  and (
    owner_id = (select auth.uid())::text
    or private.can_manage_circle(private.circle_id_from_storage_name(name))
  )
)
with check (
  bucket_id = 'circle-media'
  and private.is_circle_member(private.circle_id_from_storage_name(name))
);

drop policy if exists circle_media_owner_delete on storage.objects;
create policy circle_media_owner_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'circle-media'
  and private.is_circle_member(private.circle_id_from_storage_name(name))
  and (
    owner_id = (select auth.uid())::text
    or private.can_manage_circle(private.circle_id_from_storage_name(name))
  )
);
