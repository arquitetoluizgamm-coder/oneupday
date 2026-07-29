-- ============================================================
-- One Up Day — Menções (@)
-- Rode no Supabase: SQL Editor > New query > Run
--
-- Pode rodar mais de uma vez sem estragar nada.
-- ============================================================
--
-- POR QUE UMA TABELA, E NÃO SÓ O @ NO TEXTO
--
-- O handle é editável: a pessoa troca @ana.dezembro por @ana
-- quando quiser, em Editar perfil. Se a menção fosse só texto:
--
--   1. toda menção antiga apontaria para um handle que não existe
--      mais — link quebrado;
--   2. pior: se outra pessoa registrar o handle abandonado, ela
--      HERDA todas as menções antigas. Alguém pode reivindicar um
--      handle de propósito para aparecer em registros que não são
--      dela.
--
-- Aqui o vínculo é o `id`, que não muda nunca. O texto guarda o @
-- para a pessoa poder editar, mas quem manda é esta tabela — e o
-- @ mostrado na tela é sempre o handle ATUAL de quem foi marcado.
-- ============================================================

create table if not exists public.mentions (
  id           bigserial primary key,
  -- quem foi marcado
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  -- quem marcou
  author_id    uuid not null references public.profiles(id) on delete cascade,
  -- onde: exatamente um dos três é preenchido
  update_id    uuid references public.updates(id)  on delete cascade,
  comment_id   uuid references public.comments(id) on delete cascade,
  journey_id   uuid references public.journeys(id) on delete cascade,
  created_at   timestamptz default now(),

  -- "exatamente um" é regra de integridade, não de aplicação:
  -- uma menção órfã ou uma menção em dois lugares ao mesmo tempo
  -- seriam impossíveis de mostrar direito.
  constraint mentions_um_lugar check (
    (case when update_id  is not null then 1 else 0 end) +
    (case when comment_id is not null then 1 else 0 end) +
    (case when journey_id is not null then 1 else 0 end) = 1
  )
);

-- Marcar a mesma pessoa duas vezes no mesmo lugar é uma menção só.
-- Índices parciais porque os NULOS não colidem entre si em UNIQUE.
create unique index if not exists uniq_mention_update
  on public.mentions(profile_id, update_id)  where update_id  is not null;
create unique index if not exists uniq_mention_comment
  on public.mentions(profile_id, comment_id) where comment_id is not null;
create unique index if not exists uniq_mention_journey
  on public.mentions(profile_id, journey_id) where journey_id is not null;

-- "quem me marcou" é a consulta que a tela de notificações faz
create index if not exists idx_mentions_profile
  on public.mentions(profile_id, created_at desc);

alter table public.mentions enable row level security;

-- Ler: qualquer pessoa logada. A menção só aparece junto com o
-- conteúdo, e o conteúdo já tem a própria regra de visibilidade —
-- quem não pode ver o registro não recebe o registro, e a menção
-- solta não diz nada.
drop policy if exists "mentions read" on public.mentions;
create policy "mentions read" on public.mentions for select using (true);

-- Escrever: só em nome de si mesmo. Sem isto, alguém poderia
-- inserir menções fingindo ser outro autor.
drop policy if exists "mentions write" on public.mentions;
create policy "mentions write" on public.mentions
  for insert with check (auth.uid() = author_id);

drop policy if exists "mentions delete" on public.mentions;
create policy "mentions delete" on public.mentions
  for delete using (auth.uid() = author_id);

-- ============================================================
-- A NOTIFICAÇÃO
--
-- A tabela `notifications` já existe e já tem os tipos
-- 'encourage' e 'follow'. Aqui entra 'mention'.
--
-- Duas guardas que importam:
--
--   · não notifica quem marca a si mesmo;
--   · não notifica se a jornada não for pública. Marcar alguém
--     num registro privado é uma anotação sua; avisar a pessoa
--     seria dar a ela um aviso sobre um conteúdo que ela não pode
--     abrir — e induzi-la a pedir acesso. Este app inteiro se
--     apoia em "você escolhe quem vê"; a menção não pode ser a
--     porta dos fundos disso.
-- ============================================================
create or replace function public.notif_mention() returns trigger as $$
declare
  jid uuid;
  publico boolean;
begin
  if new.profile_id = new.author_id then
    return new;
  end if;

  -- de onde veio a menção, qual jornada
  if new.update_id is not null then
    select u.journey_id into jid from public.updates u where u.id = new.update_id;
  elsif new.comment_id is not null then
    select u.journey_id into jid
      from public.comments c join public.updates u on u.id = c.update_id
     where c.id = new.comment_id;
  else
    jid := new.journey_id;
  end if;

  select coalesce(j.is_public, true) into publico
    from public.journeys j where j.id = jid;

  if coalesce(publico, false) is not true then
    return new;
  end if;

  insert into public.notifications(recipient_id, actor_id, type, update_id, journey_id)
  values (new.profile_id, new.author_id, 'mention', new.update_id, jid);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notif_mention on public.mentions;
create trigger trg_notif_mention
  after insert on public.mentions
  for each row execute function public.notif_mention();

-- ============================================================
-- CONFERIR (rode depois e leia a saída)
-- ============================================================
select
  (select count(*) from public.mentions)                                as mencoes,
  (select count(*) from pg_policies
    where tablename = 'mentions')                                       as policies,
  (select count(*) from pg_trigger
    where tgname = 'trg_notif_mention')                                 as trigger_ok,
  (select count(*) from pg_indexes
    where tablename = 'mentions' and indexname like 'uniq_mention_%')   as indices_unicos;
-- esperado: mencoes 0 · policies 3 · trigger_ok 1 · indices_unicos 3
