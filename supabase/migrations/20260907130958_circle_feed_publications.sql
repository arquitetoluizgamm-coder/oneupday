-- Apresentação opcional de um Círculo no feed do ONE.
-- Somente o nome, a descrição e o link público de convite são expostos.
-- Conteúdo, membros e configurações privadas continuam nas tabelas fechadas.

create table if not exists public.circle_feed_publications (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  invite_id uuid not null references public.circle_invites(id) on delete cascade,
  invite_token text not null check (invite_token ~ '^[A-Za-z0-9_-]{32,160}$'),
  circle_name text not null check (char_length(circle_name) between 3 and 80),
  circle_description text not null default '' check (char_length(circle_description) <= 5000),
  status text not null default 'active' check (status in ('active', 'withdrawn', 'expired')),
  published_at timestamptz not null default now(),
  invite_expires_at timestamptz not null,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (invite_id)
);

create unique index if not exists circle_feed_publications_one_active_idx
  on public.circle_feed_publications(circle_id)
  where status = 'active';

create index if not exists circle_feed_publications_feed_idx
  on public.circle_feed_publications(status, published_at desc);

alter table public.circle_feed_publications enable row level security;

-- O navegador não consulta esta tabela diretamente. A API autenticada valida
-- bloqueios e escopo do feed antes de devolver somente o cartão público.
revoke all on table public.circle_feed_publications from public, anon, authenticated;
grant all on table public.circle_feed_publications to service_role;

drop trigger if exists circle_feed_publications_touch_updated_at on public.circle_feed_publications;
create trigger circle_feed_publications_touch_updated_at
before update on public.circle_feed_publications
for each row execute function private.touch_updated_at();
