-- One Up Day — denúncias de conteúdo. Rode no SQL Editor.
create table if not exists public.reports (
  id bigserial primary key,
  reporter_id uuid,
  update_id uuid references public.updates(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
create policy "reports insert" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
