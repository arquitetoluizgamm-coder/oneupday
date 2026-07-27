-- ============================================================
-- DIAGNÓSTICO DE NOTIFICAÇÃO E PUSH
--
-- Rode BLOCO POR BLOCO no SQL Editor do Supabase, na ordem.
-- Cada bloco responde uma pergunta. Pare no primeiro que
-- vier errado — é ali que a corrente quebrou.
--
-- Não contém nenhuma chave. Pode colar em qualquer lugar.
-- ============================================================


-- ------------------------------------------------------------
-- BLOCO 1 — As notificações estão sendo CRIADAS?
-- Esta é a pergunta que separa os dois problemas possíveis.
-- ------------------------------------------------------------
select
  id,
  type,
  recipient_id,
  actor_id,
  read,
  pushed,
  created_at
from public.notifications
order by created_at desc
limit 20;

-- COMO LER:
--   Vazio ou nada nas últimas horas → o problema é de CRIAÇÃO.
--       Vá para o BLOCO 2.
--   Tem linhas recentes com pushed = false → foram criadas mas
--       NÃO foram enviadas. Vá para o BLOCO 4.
--   Tem linhas recentes com pushed = true → o servidor achou que
--       enviou. Vá para o BLOCO 5.


-- ------------------------------------------------------------
-- BLOCO 2 — Os gatilhos que criam notificação existem?
-- ------------------------------------------------------------
select
  c.relname  as tabela,
  t.tgname   as gatilho,
  case when t.tgenabled = 'D' then 'DESATIVADO' else 'ativo' end as estado
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
where not t.tgisinternal
  and c.relname in (
    'encouragements','follows','profile_follows','hugs',
    'me_too','challenges','comments','updates','profiles','notifications'
  )
order by c.relname, t.tgname;

-- ESPERADO — estes devem aparecer:
--   encouragements    trg_notif_encourage
--   follows           trg_notif_follow
--   profile_follows   trg_notif_profile_follow
--   hugs              trg_notif_hug
--   me_too            trg_notif_metoo
--   challenges        trg_notify_challenge, trg_notify_challenge_accept
--   comments          trg_notif_comment
--   updates           trg_notif_comeback
--   profiles          trg_notif_mood_low
--   notifications     trg_disparar_push        ← o do push instantâneo
--
-- Faltando algum → rode de novo o .sql correspondente.


-- ------------------------------------------------------------
-- BLOCO 3 — Atenção: ação no próprio conteúdo NÃO notifica.
-- ------------------------------------------------------------
-- Os gatilhos têm, de propósito, a condição "só notifica se o
-- autor da ação for diferente do dono do conteúdo".
--
-- Ou seja: apoiar o próprio post, comentar na própria jornada ou
-- seguir a si mesmo NÃO gera notificação nenhuma. Isso não é bug.
--
-- Para testar de verdade é preciso DUAS contas:
--   conta A publica  →  conta B apoia  →  conta A recebe.


-- ------------------------------------------------------------
-- BLOCO 4 — O disparador do push está funcionando?
-- Mostra o que o banco recebeu de volta ao chamar o site.
-- ------------------------------------------------------------
select
  id,
  status_code,
  left(content::text, 200) as resposta,
  created
from net._http_response
order by id desc
limit 10;

-- COMO LER O status_code:
--   200 → o servidor aceitou e processou. O problema está na
--         inscrição do aparelho. Vá para o BLOCO 5.
--   403 → CHAVE ERRADA. O CRON_SECRET da Vercel está diferente
--         do que está escrito na função disparar_push().
--         Esta é a causa mais comum. Veja a NOTA no fim.
--   500 → faltam as chaves VAPID nas variáveis da Vercel.
--   Vazio / nenhuma linha → o gatilho não está disparando:
--         confira o pg_net no BLOCO 6.


-- ------------------------------------------------------------
-- BLOCO 5 — Existe aparelho inscrito para receber?
-- ------------------------------------------------------------
select
  s.user_id,
  p.handle,
  p.push_on,
  left(s.endpoint, 60) as endpoint,
  s.last_sent_at
from public.push_subs s
left join public.profiles p on p.id = s.user_id
order by s.last_sent_at desc nulls last;

-- COMO LER:
--   Nenhuma linha sua → o aparelho não está inscrito.
--       No app: perfil → engrenagem → desligar e ligar as
--       notificações. Isso recria a inscrição.
--   Tem linha mas push_on = false → as notificações estão
--       desligadas no seu perfil.
--   Tem linha e push_on = true, e mesmo assim não chega →
--       as chaves VAPID do servidor mudaram depois que a
--       inscrição foi criada. Desligue e ligue de novo.


-- ------------------------------------------------------------
-- BLOCO 6 — O pg_net está instalado?
-- ------------------------------------------------------------
select extname as extensao, extversion as versao
from pg_extension
where extname = 'pg_net';

-- Vazio → o push instantâneo nunca funcionou. Sem ele, o envio
-- só acontece UMA VEZ POR DIA, no horário do cron da Vercel
-- (23h UTC = 20h de Brasília). Se você testou de manhã e não
-- recebeu nada, pode ser só isto.


-- ============================================================
-- NOTA DE SEGURANÇA — leia antes de corrigir a chave
--
-- O arquivo push-instantaneo.sql tem o CRON_SECRET escrito em
-- texto puro dentro da função disparar_push().
--
-- 1. Confira se esse arquivo foi para o GitHub. Se foi, a chave
--    é pública e precisa ser TROCADA: gere uma nova, atualize
--    na Vercel e rode a função de novo com o valor novo.
-- 2. A rota /api/push/debug hoje só exige estar logado, e mostra
--    pedaços do CRON_SECRET. Qualquer testador consegue abrir.
--    Ela deveria ter a mesma proteção por e-mail que /metricas.
-- ============================================================
