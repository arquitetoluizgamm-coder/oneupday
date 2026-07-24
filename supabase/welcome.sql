-- One Up Day — Dia 1 acolhido: toda jornada nova gera um aceno de boas-vindas
-- Rode no Supabase → SQL Editor → Run. Seguro rodar de novo.
create or replace function public.notif_welcome() returns trigger as $$
begin
  insert into public.notifications(recipient_id, type, journey_id)
  values (new.owner_id, 'welcome', new.id);
  return new;
end $$ language plpgsql security definer;
drop trigger if exists trg_notif_welcome on public.journeys;
create trigger trg_notif_welcome after insert on public.journeys
  for each row execute function public.notif_welcome();
