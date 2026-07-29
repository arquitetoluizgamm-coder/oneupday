-- ============================================================
-- One Up Day — AVISO DE INSCRIÇÃO NO CONVITE
-- Rode no Supabase: SQL Editor > New query > Run
-- Pode rodar mais de uma vez sem estragar nada.
--
-- ------------------------------------------------------------
-- O QUE ISTO RESOLVE
--
-- O cofre do /invite funciona: a pessoa escreve, a linha é
-- gravada, o link pessoal devolve a frase. Só que ninguém avisa
-- você — para saber que alguém se inscreveu era preciso abrir o
-- painel e rodar SQL.
--
-- E a tela de confirmação promete, com todas as letras:
--
--     "Vou ler o que você escreveu e te responder nos
--      próximos dias."
--
-- Uma promessa que depende de você LEMBRAR de olhar um painel é
-- uma promessa frágil. Este gatilho tira essa dependência.
--
-- ------------------------------------------------------------
-- POR QUE UM GATILHO, E NÃO UMA CHAMADA NA ROTA
--
-- Quem preenche o convite é um visitante anônimo. Para a rota
-- inserir na tabela `notifications` em nome dele, seria preciso
-- abrir uma policy de INSERT ali para `anon` — e aí qualquer um
-- poderia encher o seu sino com o que quisesse.
--
-- O gatilho roda do lado de dentro, com os poderes do dono da
-- tabela. Ele só existe pendurado no INSERT de `invite_requests`,
-- e só sabe fazer uma coisa: avisar você. Não dá para chamar
-- avulso, não aceita parâmetro, não escolhe destinatário.
--
-- É o mesmo padrão do `notif_mention`, que já está no ar.
-- ============================================================

create or replace function public.notif_convite() returns trigger as $$
declare
  dono uuid;
begin
  -- Quem recebe o aviso: o dono do produto, achado pelo handle.
  --
  -- O handle é guardado COM a arroba nesta base (foi uma descoberta
  -- do patch das menções), mas nem sempre — então procuro das duas
  -- formas, sem depender de qual versão está gravada.
  select id into dono
    from public.profiles
   where lower(handle) in ('@fernandogamarano', 'fernandogamarano')
   limit 1;

  -- Se não achar, NÃO falha.
  --
  -- Este gatilho está pendurado no insert da inscrição. Se ele
  -- levantar exceção, a transação inteira volta atrás e a pessoa
  -- que escreveu a jornada dela recebe um erro — perdendo o
  -- registro por causa de um aviso que é secundário.
  --
  -- Guardar a jornada é o que não pode falhar. O aviso é desejável.
  if dono is null then
    return new;
  end if;

  insert into public.notifications(recipient_id, actor_id, type)
  values (dono, null, 'convite');

  return new;
exception when others then
  -- Mesma razão: qualquer problema no aviso é engolido de propósito.
  -- Melhor você não ser avisado do que alguém perder a jornada.
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_notif_convite on public.invite_requests;
create trigger trg_notif_convite
  after insert on public.invite_requests
  for each row execute function public.notif_convite();

-- ============================================================
-- CONFERIR
--
-- 1) o gatilho existe?
--    select tgname from pg_trigger where tgname = 'trg_notif_convite';
--
-- 2) o handle achou alguém? (tem que voltar uma linha)
--    select id, name, handle from profiles
--     where lower(handle) in ('@fernandogamarano','fernandogamarano');
--
--    Se voltar VAZIO, troque o handle nas duas linhas da função
--    acima pelo seu e rode de novo — senão o aviso nunca chega e
--    nada dá erro.
--
-- 3) as inscrições que já entraram ANTES deste gatilho não geram
--    aviso. Para ver o que já está guardado:
--
--    select created_at, jornada, email, respondido,
--           'https://oneupday.app/convite/' || token as link
--      from invite_requests
--     order by created_at desc;
-- ============================================================
