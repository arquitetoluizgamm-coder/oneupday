-- ============================================================
-- DE ONDE VEM O 403
--
-- Rode os blocos na ordem. O bloco 2 é o que decide.
-- ============================================================


-- ------------------------------------------------------------
-- 1. A chave que está no cofre agora
-- ------------------------------------------------------------
-- Guarde estes 12 caracteres. Vamos comparar com a Vercel.

select
  left(md5((select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')), 12) as impressao_do_cofre,
  length((select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')) as tamanho,
  (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    <> trim((select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')) as tem_espaco_sobrando;

-- tamanho tem que ser 32. tem_espaco_sobrando tem que ser false.
-- Se o tamanho vier diferente de 32, a chave do PASSO 3 não entrou:
-- você provavelmente trocou o texto em só um dos dois lugares do bloco.


-- ------------------------------------------------------------
-- 2. Chamar a rota AGORA, com a chave do cofre
-- ------------------------------------------------------------
-- Isto faz uma chamada nova, deste instante. Assim não corremos o
-- risco de ler um 403 antigo que ficou guardado na tabela.

select net.http_post(
  url     := 'https://oneupday.app/api/push/send',
  headers := jsonb_build_object('Content-Type', 'application/json'),
  body    := jsonb_build_object(
               'key',
               (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
             )
) as id_da_chamada;


-- ------------------------------------------------------------
-- 3. Esperar uns 5 segundos e ler a resposta
-- ------------------------------------------------------------
select
  id,
  status_code,
  created,
  left(content::text, 300) as conteudo
from net._http_response
order by id desc
limit 3;


-- ============================================================
-- COMO LER O RESULTADO — esta parte é a que importa
--
-- Olhe a coluna "created": tem que ser de agora. Se for de horas
-- atrás, a chamada do bloco 2 ainda não voltou; espere e repita.
--
-- Agora o "conteudo":
--
-- ▸ {"error":"forbidden"}
--     É a NOSSA rota recusando. As duas chaves estão diferentes
--     mesmo. Causa quase certa: a variável na Vercel foi salva,
--     mas NÃO houve redeploy. Variável de ambiente só passa a
--     valer num deploy novo — salvar não basta.
--     Vercel → Deployments → o mais recente → ... → Redeploy.
--     (Deixe "Use existing Build Cache" desmarcado.)
--
-- ▸ HTML, ou algo com "Authentication Required" / "Vercel"
--     Não é a nossa rota. É a proteção de deploy da Vercel
--     barrando antes de chegar no código.
--     Vercel → Settings → Deployment Protection → desligar para
--     produção, ou liberar /api/push/send.
--
-- ▸ {"error":"no-vapid"}
--     A chave passou! O problema agora é outro: faltam as
--     variáveis VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY.
--
-- ▸ {"ok":true,...}
--     Resolvido.
-- ============================================================


-- ------------------------------------------------------------
-- 4. Só se o bloco 3 continuar dando forbidden depois do redeploy
-- ------------------------------------------------------------
-- Aí o valor que está na Vercel é outro. Pegue o valor real de lá
-- (Vercel → Settings → Environment Variables → CRON_SECRET → olho
-- para revelar), cole abaixo e rode. Isto joga a chave da Vercel
-- para dentro do cofre, em vez do contrário.

-- do $$
-- declare v_id uuid;
-- begin
--   select id into v_id from vault.secrets where name = 'cron_secret';
--   perform vault.update_secret(v_id, 'COLE_AQUI_O_VALOR_QUE_ESTA_NA_VERCEL');
-- end $$;

-- e confira que a impressão digital mudou:
-- select left(md5((select decrypted_secret from vault.decrypted_secrets where name='cron_secret')),12);
