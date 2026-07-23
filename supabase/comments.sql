-- Comentários moderados do One Up Day.
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  update_id uuid not null references public.updates(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  status text not null default 'published' check (status in ('published','blocked','pending')),
  created_at timestamptz default now()
);
alter table public.comments add column if not exists parent_id uuid references public.comments(id) on delete cascade;
create index if not exists idx_comments_update on public.comments(update_id, created_at);
create index if not exists idx_comments_parent on public.comments(parent_id, created_at);
alter table public.comments enable row level security;
drop policy if exists "comments read published" on public.comments;
create policy "comments read published" on public.comments for select using (
  status = 'published' and exists (select 1 from public.updates u join public.journeys j on j.id = u.journey_id
    where u.id = update_id and (j.visibility = 'public' or j.owner_id = auth.uid()))
);
drop policy if exists "comments own insert" on public.comments;
create policy "comments own insert" on public.comments for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists "comments own delete" on public.comments;
create policy "comments own delete" on public.comments for delete using (user_id = auth.uid());
