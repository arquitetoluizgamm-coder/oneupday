-- ============================================================
-- ACOMPANHAR UMA JORNADA SEM CRIAR CONTA
--
-- A porta de entrada com menos atrito que existe: quem chega por
-- um link compartilhado pode pedir para ser avisado do próximo
-- capítulo com UM toque — sem formulário, sem senha, sem e-mail.
-- Vira audiência antes de virar usuária. A conta nasce depois,
-- quando ela quiser responder ou começar a própria jornada.
--
-- Tecnicamente é a inscrição de push do navegador, que o app já
-- usa. A diferença é que aqui ela não está amarrada a um user_id.
--
-- ⚠️ O QUE ESTA TABELA NÃO GUARDA:
-- nome, e-mail, IP, nada que identifique a pessoa. Só o endereço
-- opaco que o navegador dela gera — e que ela pode revogar a
-- qualquer momento nas configurações do próprio navegador.
--
-- Rode inteiro. É seguro rodar mais de uma vez.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Quem acompanha sem conta
-- ------------------------------------------------------------
create table if not exists public.jornada_seguidores (
  id         uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  criado_em  timestamptz not null default now(),
  unique (journey_id, endpoint)
);

create index if not exists idx_jseg_journey on public.jornada_seguidores (journey_id);

-- Trancada: RLS ligada e NENHUMA política.
-- Ninguém lê nem escreve pela API pública. Só a chave de serviço
-- (as rotas do servidor) enxerga.
alter table public.jornada_seguidores enable row level security;
revoke all on public.jornada_seguidores from anon, authenticated;


-- ------------------------------------------------------------
-- 2. Marca de "já avisei sobre este capítulo"
-- ------------------------------------------------------------
alter table public.updates
  add column if not exists avisado boolean not null default false;

create index if not exists idx_updates_avisado
  on public.updates (avisado) where avisado = false;


-- ------------------------------------------------------------
-- 3. Capítulo novo dispara o aviso na hora
-- ------------------------------------------------------------
-- Usa o mesmo bilhete de uso único do push das notificações:
-- nenhum segredo compartilhado, nada que possa sair de sincronia.

create or replace function public.disparar_aviso_jornada()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, net
as $$
declare
  t uuid;
  tem int;
begin
  -- só chama a rota se ALGUÉM estiver acompanhando esta jornada
  select count(*) into tem
    from public.jornada_seguidores
   where journey_id = new.journey_id;
  if tem = 0 then return new; end if;

  insert into public.push_tickets default values returning token into t;

  perform net.http_post(
    url     := 'https://oneupday.app/api/push/send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('ticket', t::text)
  );
  return new;
exception when others then
  return new;   -- o aviso nunca pode impedir o capítulo de existir
end $$;

drop trigger if exists trg_aviso_jornada on public.updates;
create trigger trg_aviso_jornada
  after insert on public.updates
  for each row execute function public.disparar_aviso_jornada();


-- ------------------------------------------------------------
-- 4. Conferir
-- ------------------------------------------------------------
select
  (select count(*) from public.jornada_seguidores) as acompanhando_sem_conta,
  (select count(*) from public.updates where avisado = false) as capitulos_por_avisar;

select c.relname as tabela, t.tgname as gatilho
from pg_trigger t join pg_class c on c.oid = t.tgrelid
where t.tgname in ('trg_aviso_jornada', 'trg_disparar_push');
-- os dois têm que aparecer


-- ============================================================
-- DEPENDÊNCIA
-- Este arquivo precisa da tabela push_tickets, criada em
-- supabase/push-bilhete.sql. Rode aquele primeiro se ainda não
-- tiver rodado.
-- ============================================================
