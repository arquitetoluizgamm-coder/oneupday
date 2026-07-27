-- ============================================================
-- PUSH — sincronizar a chave (e tirá-la do código de vez)
--
-- CAUSA CONFIRMADA DO PROBLEMA:
-- o net._http_response está devolvendo 403. Isso significa que o
-- CRON_SECRET que a função disparar_push() envia é DIFERENTE do
-- que está nas variáveis da Vercel. A rota recusa, e o push morre
-- em silêncio — sem erro em lugar nenhum do app.
--
-- Este arquivo faz duas coisas ao mesmo tempo:
--   1. sincroniza a chave;
--   2. tira a chave do arquivo, guardando no cofre do Supabase.
--
-- ⚠️ POR QUE TROCAR A CHAVE, E NÃO SÓ COPIAR A ANTIGA:
-- o push-instantaneo.sql tem a chave escrita em texto puro. Se ele
-- foi para o GitHub, ela é pública. Gere uma NOVA — o trabalho é
-- o mesmo e o problema fica resolvido de verdade.
-- ============================================================


-- ------------------------------------------------------------
-- PASSO 0 — O cofre está disponível neste projeto?
-- ------------------------------------------------------------
select count(*) as tem_vault
from information_schema.tables
where table_schema = 'vault' and table_name = 'secrets';

-- 1 → siga normalmente.
-- 0 → seu projeto não tem o Vault. Vá para o PLANO B, no fim do arquivo.


-- ------------------------------------------------------------
-- PASSO 1 — Gerar a chave nova
-- ------------------------------------------------------------
-- Rode isto e copie o resultado: 32 caracteres, só letras e números.
--
-- Usa gen_random_uuid(), que é nativa do Postgres. A versão anterior
-- usava gen_random_bytes(), que vem do pgcrypto — e o pgcrypto não
-- está no caminho de busca padrão do editor do Supabase, por isso
-- dava "function does not exist".
--
-- Hexadecimal também é mais seguro de copiar: base64 tem +, / e =,
-- e o "=" do fim às vezes se perde ao colar em painel de variáveis.

select replace(gen_random_uuid()::text, '-', '') as chave_nova;


-- ------------------------------------------------------------
-- PASSO 2 — Colar na Vercel
-- ------------------------------------------------------------
-- Vercel → Settings → Environment Variables → CRON_SECRET
-- Cole o valor do PASSO 1. Sem espaço antes nem depois.
-- Depois: Deployments → ... → Redeploy (a variável só entra em
-- vigor num deploy novo).


-- ------------------------------------------------------------
-- PASSO 3 — Guardar a mesma chave no cofre do Supabase
-- ------------------------------------------------------------
-- Troque COLE_A_CHAVE_DO_PASSO_1 pelo valor (nos DOIS lugares abaixo).
-- O cofre (Vault) guarda criptografado: a chave deixa de existir
-- em texto puro em qualquer arquivo do projeto.
--
-- Este bloco serve para os dois casos: se o segredo 'cron_secret'
-- ainda não existe, ele cria; se já existe, ele atualiza.
--
-- (O create_secret sozinho falha com "duplicate key ... secrets_name_idx"
--  quando o nome já está no cofre — foi o que aconteceu aqui.)

do $$
declare
  v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'cron_secret';

  if v_id is null then
    perform vault.create_secret(
      'COLE_A_CHAVE_DO_PASSO_1',
      'cron_secret',
      'Chave que o gatilho usa para chamar /api/push/send'
    );
    raise notice 'segredo criado';
  else
    perform vault.update_secret(v_id, 'COLE_A_CHAVE_DO_PASSO_1');
    raise notice 'segredo atualizado';
  end if;
end $$;


-- ------------------------------------------------------------
-- PASSO 4 — A função passa a ler do cofre
-- ------------------------------------------------------------
create or replace function public.disparar_push()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, vault, net
as $$
declare
  chave text;
begin
  select decrypted_secret into chave
    from vault.decrypted_secrets
   where name = 'cron_secret'
   limit 1;

  if chave is null then
    return new;   -- sem chave, não tenta: nunca derruba o insert
  end if;

  perform net.http_post(
    url     := 'https://oneupday.app/api/push/send',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body    := jsonb_build_object('key', chave)
  );
  return new;
exception when others then
  return new;   -- push nunca pode impedir a notificação de existir
end $$;

drop trigger if exists trg_disparar_push on public.notifications;
create trigger trg_disparar_push
  after insert on public.notifications
  for each row execute function public.disparar_push();


-- ------------------------------------------------------------
-- PASSO 5 — Conferir SEM revelar a chave
-- ------------------------------------------------------------
-- Compare esta impressão digital com a que aparece em
-- /api/push/debug, no campo "impressao_digital". Têm que ser iguais.

-- md5() é nativa do Postgres: não depende de extensão nenhuma.
select left(md5(
  (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
), 12) as impressao_digital;


-- ------------------------------------------------------------
-- PASSO 6 — Testar de verdade
-- ------------------------------------------------------------
-- Faça o gatilho rodar: com a conta B, apoie um post da conta A.
-- Depois rode isto e confira o status_code da chamada mais recente.

select id, status_code, left(content::text, 200) as resposta, created
from net._http_response
order by id desc
limit 5;

-- 200 → resolvido.
-- 403 → as duas chaves ainda estão diferentes. Confira se o
--       redeploy da Vercel foi feito (passo 2) e se não sobrou
--       espaço no começo ou no fim do valor.


-- ------------------------------------------------------------
-- PASSO 7 — Limpar o rastro
-- ------------------------------------------------------------
-- Apague o arquivo supabase/push-instantaneo.sql do repositório:
-- ele tem a chave ANTIGA em texto puro e não serve mais para nada.
-- Se ele já foi para o GitHub, a chave antiga continua no histórico
-- do repositório — mas, tendo sido trocada aqui, ela não abre mais
-- nada.


-- ============================================================
-- PLANO B — se o PASSO 0 devolveu 0 (sem Vault)
--
-- Guarda a chave numa tabela própria, trancada: RLS ligada e
-- nenhuma política criada, ou seja, NINGUÉM lê pela API. Só
-- funções security definer, como o gatilho, enxergam.
-- ============================================================

-- create table if not exists public.segredos (
--   nome  text primary key,
--   valor text not null
-- );
-- alter table public.segredos enable row level security;
-- revoke all on public.segredos from anon, authenticated;

-- insert into public.segredos (nome, valor)
-- values ('cron_secret', 'COLE_A_CHAVE_DO_PASSO_1')
-- on conflict (nome) do update set valor = excluded.valor;

-- create or replace function public.disparar_push()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public, extensions, net
-- as $$
-- declare chave text;
-- begin
--   select valor into chave from public.segredos where nome = 'cron_secret';
--   if chave is null then return new; end if;
--   perform net.http_post(
--     url     := 'https://oneupday.app/api/push/send',
--     headers := jsonb_build_object('Content-Type', 'application/json'),
--     body    := jsonb_build_object('key', chave)
--   );
--   return new;
-- exception when others then return new;
-- end $$;

-- drop trigger if exists trg_disparar_push on public.notifications;
-- create trigger trg_disparar_push
--   after insert on public.notifications
--   for each row execute function public.disparar_push();

-- impressão digital, para comparar com /api/push/debug:
-- select left(md5((select valor from public.segredos where nome='cron_secret')), 12);
