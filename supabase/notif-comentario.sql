-- ============================================================
-- NOTIFICAÇÃO DE COMENTÁRIO
-- Faltava: comentar não avisava ninguém.
-- Avisa o dono do conteúdo e, em respostas, também o autor
-- do comentário respondido.
-- Rode inteiro no SQL Editor do Supabase.
-- ============================================================

create or replace function public.notif_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dono uuid;
  jid uuid;
  pai uuid;
begin
  -- 1. quem é o dono do conteúdo comentado
  if new.update_id is not null then
    select j.owner_id, j.id into dono, jid
      from public.updates u
      join public.journeys j on j.id = u.journey_id
     where u.id = new.update_id;

  elsif new.media_id is not null then
    begin
      select m.user_id into dono from public.media m where m.id = new.media_id;
    exception when others then dono := null;
    end;

  else
    -- comentário em desafio: avisa o outro participante
    begin
      select case when c.from_id = new.user_id then c.to_id else c.from_id end
        into dono
        from public.challenges c
       where c.id = new.challenge_id;
    exception when others then dono := null;
    end;
  end if;

  -- 2. avisa o dono (nunca a si mesmo)
  if dono is not null and dono <> new.user_id then
    insert into public.notifications(recipient_id, actor_id, type, journey_id)
    values (dono, new.user_id, 'comment', jid);
  end if;

  -- 3. se for resposta, avisa também quem foi respondido
  if new.parent_id is not null then
    select user_id into pai from public.comments where id = new.parent_id;
    if pai is not null and pai <> new.user_id and pai is distinct from dono then
      insert into public.notifications(recipient_id, actor_id, type, journey_id)
      values (pai, new.user_id, 'comment', jid);
    end if;
  end if;

  return new;
exception when others then
  -- nunca deixa a notificação quebrar o comentário
  return new;
end $$;

drop trigger if exists trg_notif_comment on public.comments;
create trigger trg_notif_comment
  after insert on public.comments
  for each row execute function public.notif_comment();

-- Confirma que ficou criado
select tgname as gatilho_criado
  from pg_trigger
 where tgname = 'trg_notif_comment';
