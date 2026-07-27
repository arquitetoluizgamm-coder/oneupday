-- ============================================================
-- One Up Day — Citações separadas do álbum
--
-- ⚠️ RODE ANTES: supabase/media-caption.sql
--
-- NÃO É OBRIGATÓRIO. O app funciona sem rodar nada disto: toda
-- citação nova nasce com kind 'quote' e vai direto para a aba
-- Citações.
--
-- Este arquivo existe só para as citações publicadas ANTES da
-- mudança, que entraram como kind 'photo' e continuam no álbum.
--
-- ------------------------------------------------------------
-- A PISTA QUE EU ACHEI QUE TINHA, E NÃO TENHO
--
-- A primeira versão deste arquivo procurava por "PNG COM
-- legenda". Só que a coluna `caption` nunca existiu neste banco
-- — e o app, ao ver o erro, regravava a linha sem a legenda. Ou
-- seja: as citações antigas não têm legenda nenhuma. O texto
-- delas existe como pixel dentro do PNG, não como dado.
--
-- Sobrou uma pista só, e ela é fraca: a citação é sempre .png.
-- Foto de celular costuma ser .jpg, mas print de tela é .png —
-- então .png sozinho NÃO prova que a linha é citação.
--
-- Por isso continua não havendo UPDATE solto aqui. Olhe
-- primeiro. É o acervo de pessoas reais.
-- ============================================================

-- PASSO 1 — Veja os candidatos. Rode só isto.
-- Abra cada `url` no navegador: em dois segundos você sabe se é
-- uma frase desenhada ou uma foto.
select id, user_id, url, created_at
from public.media
where kind = 'photo'
  and url ilike '%.png'
order by created_at desc;

-- PASSO 2 — Converta SÓ as que você confirmou, pelo id.
-- É o caminho recomendado: são poucas linhas hoje, e um engano
-- aqui manda uma foto de alguém para a aba errada.
--
-- update public.media set kind = 'quote'
--  where id in ('cole-o-id-aqui', 'e-outro-aqui');

-- PASSO 3 — Só se TODAS as linhas do passo 1 forem citações:
--
-- update public.media set kind = 'quote'
--  where kind = 'photo' and url ilike '%.png';

-- Desfazer qualquer conversão:
--
-- update public.media set kind = 'photo' where id = 'o-id';

-- ------------------------------------------------------------
-- Conferir como ficou:
-- select kind, count(*) from public.media group by kind;
