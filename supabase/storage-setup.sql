-- ============================================================
-- One Up Day — Storage para fotos de progresso
-- Rode no Supabase: SQL Editor > New query > Run
-- ============================================================

-- bucket público de fotos
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- leitura pública das fotos
create policy "photos public read"
  on storage.objects for select
  using (bucket_id = 'photos');

-- upload permitido a usuários logados
create policy "photos authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- dono pode apagar suas fotos
create policy "photos owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and owner = auth.uid());
