-- ============================================================
-- O COFRE DO /invite
--
-- Aqui fica o que a pessoa escreve ANTES de ter conta: uma frase
-- dizendo o que ela quer continuar, e um e-mail para avisá-la.
--
-- A regra combinada, e ela é de identidade, não de privacidade:
--
--   O que alguém escreve antes de entrar no ONE pertence só a essa
--   pessoa. Não é publicado, não vira marketing, não é compartilhado
--   nem anonimizado sem autorização explícita.
--
-- Esta tabela é o lugar onde essa regra vira mecanismo. Por isso ela
-- é escrita de fora e NÃO é lida de fora — por ninguém, nem logado.
-- ============================================================

create table if not exists public.invite_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),

  -- o que a pessoa quer continuar. É o coração da linha.
  jornada      text not null,

  -- por onde avisar. Guardado em minúsculas e sem espaço nas pontas
  -- para o índice único fazer sentido.
  email        text not null,

  -- O CÓDIGO PESSOAL.
  --
  -- É ele que faz a promessa "a sua jornada estará esperando"
  -- sobreviver a 40 dias, a outro aparelho e a um e-mail diferente
  -- na hora de criar a conta. Vai no link da resposta que o Fernando
  -- manda à mão — o gesto humano é também o transporte do dado.
  token        uuid not null default gen_random_uuid(),

  locale       text,
  origem       text,                       -- de onde ela veio, se souber

  -- o acompanhamento, do lado de cá
  respondido   boolean not null default false,
  convidado_em timestamptz,
  resgatado_em timestamptz                 -- quando ela usou o link
);

create unique index if not exists invite_requests_token_key
  on public.invite_requests (token);

-- Um e-mail, uma linha. Se a pessoa se inscrever de novo, a segunda
-- vez atualiza a primeira em vez de criar duplicata — assim ela não
-- fica com duas jornadas guardadas e dois tokens.
create unique index if not exists invite_requests_email_key
  on public.invite_requests (lower(email));

create index if not exists invite_requests_created_idx
  on public.invite_requests (created_at desc);

-- ============================================================
-- RLS: escreve-se de fora, não se lê de fora
-- ============================================================
alter table public.invite_requests enable row level security;

-- A página é pública: quem chega não tem conta. Então `anon` precisa
-- poder inserir.
drop policy if exists "convite: qualquer um pode se inscrever" on public.invite_requests;
create policy "convite: qualquer um pode se inscrever"
  on public.invite_requests for insert
  to anon, authenticated
  with check (true);

-- E não existe policy de SELECT, UPDATE ou DELETE.
--
-- Sem policy, a RLS nega. Ou seja: ninguém — nem visitante, nem
-- usuário logado, nem o dono da conta pela API pública — consegue
-- ler uma linha desta tabela. Só a chave de serviço (o painel do
-- Supabase, onde você vai ler as inscrições) enxerga.
--
-- O cofre é isto. Se um dia alguém escrever uma policy de SELECT
-- aqui, terá desfeito a decisão de propósito — e é bom que precise
-- ser de propósito.

-- ============================================================
-- O RESGATE
--
-- A pessoa volta com o link `/convite/<token>`. O app precisa
-- devolver a frase dela — e só a dela.
--
-- Como não há SELECT liberado, isso passa por uma função
-- SECURITY DEFINER: ela roda com os poderes do dono da tabela e
-- devolve UMA coluna de UMA linha, achada por um UUID que só quem
-- recebeu o e-mail conhece.
--
-- Não devolve e-mail, não devolve data, não devolve nada além da
-- frase. Mesmo com o token em mãos, não dá para descobrir quem é a
-- pessoa. E sem o token não dá para descobrir nada: adivinhar um
-- UUID v4 é procurar uma agulha em 2^122 palheiros.
-- ============================================================
create or replace function public.resgatar_convite(p_token uuid)
returns text
language sql
security definer
set search_path = public
as $$
  update public.invite_requests
     set resgatado_em = coalesce(resgatado_em, now())
   where token = p_token
  returning jornada;
$$;

revoke all on function public.resgatar_convite(uuid) from public;
grant execute on function public.resgatar_convite(uuid) to anon, authenticated;

-- ============================================================
-- PARA VOCÊ LER AS INSCRIÇÕES
--
-- No painel do Supabase (SQL Editor), que usa a chave de serviço:
--
--   select created_at, jornada, email, respondido,
--          'https://oneupday.app/convite/' || token as link
--     from invite_requests
--    order by created_at desc;
--
-- Depois de responder alguém à mão:
--
--   update invite_requests set respondido = true
--    where email = 'pessoa@exemplo.com';
-- ============================================================
