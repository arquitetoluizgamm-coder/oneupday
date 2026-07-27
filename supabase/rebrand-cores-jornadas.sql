-- ============================================================
-- REBRAND — recolorir as jornadas que JÁ EXISTEM
--
-- A cor da capa fica GRAVADA em journeys.cover_color no momento
-- em que a jornada é criada. Trocar o mapa no código arruma só
-- as novas — as que já existem mantêm o verde-bandeira, o violeta
-- e o magenta da paleta antiga.
--
-- Mesmo problema das fotos 4:3: o valor já foi escrito.
-- A diferença é que aqui dá para consertar, porque é só uma cor.
--
-- Rode inteiro. É seguro rodar mais de uma vez.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Antes: quantas jornadas em cada cor
-- ------------------------------------------------------------
select
  cover_color as cor,
  category    as categoria,
  count(*)    as jornadas
from public.journeys
group by cover_color, category
order by count(*) desc;


-- ------------------------------------------------------------
-- 2. A troca, categoria por categoria
-- ------------------------------------------------------------
-- As cores novas saem da paleta da marca e todas passam no
-- contraste com o título branco que fica por cima (mínimo 3:1
-- da WCAG para texto grande — a mais justa dá 3,2:1).

update public.journeys set cover_color = case category
  when 'art'          then '#8A6A9B'   -- roxo terroso
  when 'body'         then '#5E6B55'   -- sálvia profunda
  when 'health'       then '#6E8168'   -- sálvia média
  when 'mind'         then '#5B7189'   -- azul acinzentado
  when 'study'        then '#4A6076'   -- azul profundo
  when 'work'         then '#10132D'   -- noite
  when 'money'        then '#6B7F5E'
  when 'relationship' then '#A8637A'   -- rosa profundo
  when 'creative'     then '#96523C'   -- terracota profunda
  when 'home'         then '#C16F54'   -- terracota
  when 'habit'        then '#B3874A'   -- dourado profundo
  when 'life'         then '#84917A'   -- sálvia
  else '#7A7A72'                       -- neutro
end
where cover_color is distinct from (case category
  when 'art'          then '#8A6A9B'
  when 'body'         then '#5E6B55'
  when 'health'       then '#6E8168'
  when 'mind'         then '#5B7189'
  when 'study'        then '#4A6076'
  when 'work'         then '#10132D'
  when 'money'        then '#6B7F5E'
  when 'relationship' then '#A8637A'
  when 'creative'     then '#96523C'
  when 'home'         then '#C16F54'
  when 'habit'        then '#B3874A'
  when 'life'         then '#84917A'
  else '#7A7A72'
end);


-- ------------------------------------------------------------
-- 3. Os avatares sem foto também eram da paleta antiga
-- ------------------------------------------------------------
-- Só mexe em quem NÃO tem foto: quem tem avatar_url não vê a cor.

update public.profiles
set avatar_color = case (abs(hashtext(id::text)) % 6)
  when 0 then '#C16F54'
  when 1 then '#84917A'
  when 2 then '#5B7189'
  when 3 then '#96523C'
  when 4 then '#B3874A'
  else        '#A8637A'
end
where avatar_color in (
  '#ff7a45', '#6c5ce7', '#2563eb', '#16a34a', '#0ea5e9', '#f02f87'
);


-- ------------------------------------------------------------
-- 4. Depois: conferir
-- ------------------------------------------------------------
select cover_color as cor, count(*) as jornadas
from public.journeys
group by cover_color
order by count(*) desc;

-- Nenhuma cor da lista antiga deve sobrar:
--   #6c5ce7 · #0ea5e9 · #16a34a · #2563eb · #0e9f6e
--   #f02f87 · #ff7a45 · #a855f7 · #111827 · #8a8a8a

select count(*) as ainda_na_paleta_antiga
from public.journeys
where cover_color in (
  '#6c5ce7','#0ea5e9','#16a34a','#2563eb','#0e9f6e',
  '#f02f87','#ff7a45','#a855f7','#111827','#8a8a8a'
);
-- tem que dar 0
