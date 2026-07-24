-- CORREÇÃO: garante que a policy de leitura pública do álbum exista.
-- Causa comum de "fotos não aparecem pra ninguém": media.sql foi rodado antes
-- de profile-follows.sql, a criação da policy falhou e a tabela ficou com RLS
-- ligado e SEM policy de leitura. Este script é seguro e independe da ordem.
alter table public.media enable row level security;

drop policy if exists "media read" on public.media;
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='profile_follows') then
    execute $p$create policy "media read" on public.media for select using (
      visibility = 'public'
      or user_id = auth.uid()
      or (visibility = 'followers' and exists (
        select 1 from public.profile_follows pf
        where pf.following_id = media.user_id and pf.follower_id = auth.uid()))
    )$p$;
  else
    execute $p$create policy "media read" on public.media for select using (
      visibility = 'public' or user_id = auth.uid()
    )$p$;
  end if;
end $$;

drop policy if exists "media own write" on public.media;
create policy "media own write" on public.media for all using (user_id = auth.uid()) with check (user_id = auth.uid());
