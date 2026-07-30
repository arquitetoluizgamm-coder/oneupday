-- One Up Day — oito jornadas editoriais de exemplo
--
-- Conteúdo demonstrativo para o feed inicial. São histórias fictícias,
-- escritas em primeira pessoa para parecerem registros reais, mas não devem
-- ser apresentadas como depoimentos de pessoas reais em campanhas.
-- Rode depois de seed-stories.sql.

alter table public.journeys
  add column if not exists editorial_seed boolean not null default false;

-- Lista fechada de usuários que podem trocar/enquadrar as imagens dos
-- exemplos. Ela começa vazia de propósito: preencha os dois UUIDs reais no
-- SQL indicado no LEIA.md do patch.
create table if not exists public.editorial_image_editors (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.editorial_image_editors enable row level security;
revoke all on public.editorial_image_editors from anon, authenticated;
drop policy if exists "editorial editors read own" on public.editorial_image_editors;
create policy "editorial editors read own" on public.editorial_image_editors
  for select using (auth.uid() = user_id);

-- Editores autorizados pelo proprietário do projeto.
-- Se uma conta ainda não existir no Auth, ela será incluída quando o SQL
-- for executado novamente depois do primeiro login.
insert into public.editorial_image_editors (user_id)
select id
from auth.users u
join public.profiles p on p.id = u.id
where lower(u.email) in (
  lower('tha.anna.maia@gmail.com'),
  lower('arquitetoluizgamm@gmail.com')
)
on conflict (user_id) do nothing;

-- Quem estiver na lista pode editar os registros dos exemplos. A condição
-- editorial_seed impede que a permissão alcance jornadas normais.
drop policy if exists "editorial editors update demo media" on public.updates;
create policy "editorial editors update demo media" on public.updates
  for update using (
    exists (
      select 1 from public.journeys j
      join public.editorial_image_editors e on e.user_id = auth.uid()
      where j.id = journey_id and j.editorial_seed = true
    )
  ) with check (
    exists (
      select 1 from public.journeys j
      join public.editorial_image_editors e on e.user_id = auth.uid()
      where j.id = journey_id and j.editorial_seed = true
    )
  );

insert into public.journeys
  (id, owner_id, slug, title, category, moment, goal, total_days, cover_color, is_public, visibility, editorial_seed)
values
  ('23000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','voltar-a-respirar','Voltar a respirar com calma','mind','rebuilding','Criar pequenos espaços de calma no meio dos dias difíceis.',45,'#8b9b83',true,'public',true),
  ('23000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','um-dia-sem-cigarro','Um dia de cada vez sem cigarro','health','notgiveup','Cuidar do meu corpo sem transformar cada tropeço em culpa.',60,'#c27458',true,'public',true),
  ('23000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','ingles-aos-41','Inglês aos 41','study','rebuilding','Voltar a aprender, mesmo achando que comecei tarde.',100,'#64758b',true,'public',true),
  ('23000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','recomecar-depois-do-divorcio','Recomeçar depois do divórcio','life','courage','Reconstruir uma rotina que volte a parecer minha.',90,'#b47a69',true,'public',true),
  ('23000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','primeiro-cliente','Do rascunho ao primeiro cliente','work','building','Tirar uma ideia da gaveta e descobrir se ela pode ajudar alguém.',75,'#6f8f86',true,'public',true),
  ('23000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000004','caminhar-depois-da-cirurgia','Caminhar depois da cirurgia','health','starting','Voltar a confiar no meu corpo, no ritmo que ele permitir.',60,'#849a91',true,'public',true),
  ('23000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002','voltar-a-pintar','Voltar a pintar','art','rebuilding','Abrir espaço para criar depois de um ano muito silencioso.',50,'#9c7d91',true,'public',true),
  ('23000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000005','sair-do-aluguel','Guardar para sair do aluguel','money','building','Organizar meu dinheiro sem vergonha de começar pequeno.',180,'#7c8e6d',true,'public',true)
on conflict (id) do update set
  title = excluded.title,
  goal = excluded.goal,
  editorial_seed = true,
  is_public = true,
  visibility = 'public';

insert into public.updates (id, journey_id, day_number, kind, text)
values
  ('24000000-0000-0000-0000-000000000001','23000000-0000-0000-0000-000000000001',1,'step','Hoje eu sentei cinco minutos sem tentar resolver tudo. Respirei até o peito desacelerar. Parece pequeno, mas foi o meu primeiro espaço de calma.'),
  ('24000000-0000-0000-0000-000000000002','23000000-0000-0000-0000-000000000001',6,'setback','O dia apertou e eu chorei no banheiro do trabalho. Não fiz a prática inteira. Parei, respirei duas vezes e voltei para casa. Ainda conta.'),
  ('24000000-0000-0000-0000-000000000003','23000000-0000-0000-0000-000000000001',14,'win','Percebi que hoje eu respirei antes de responder. Não fiquei perfeita, só tive um segundo a mais para escolher.'),
  ('24000000-0000-0000-0000-000000000004','23000000-0000-0000-0000-000000000002',1,'step','A vontade veio forte depois do café. Caminhei até a esquina e voltei. Não foi bonito, foi possível.'),
  ('24000000-0000-0000-0000-000000000005','23000000-0000-0000-0000-000000000002',4,'setback','Acendi um cigarro numa tarde difícil. Escrevo isso para não fingir que a caminhada é uma linha reta. Amanhã continuo.'),
  ('24000000-0000-0000-0000-000000000006','23000000-0000-0000-0000-000000000002',11,'win','Onze dias escolhendo ficar comigo por mais alguns minutos. Meu filho percebeu que estou dormindo melhor.'),
  ('24000000-0000-0000-0000-000000000007','23000000-0000-0000-0000-000000000003',1,'step','Aprendi a dizer meu nome em inglês sem rir de mim. Estudei quinze minutos e deixei o caderno aberto para amanhã.'),
  ('24000000-0000-0000-0000-000000000008','23000000-0000-0000-0000-000000000003',9,'setback','Hoje eu não entendi quase nada. Quase fechei tudo. Voltei para uma lição antiga e encontrei uma palavra que eu já sabia.'),
  ('24000000-0000-0000-0000-000000000009','23000000-0000-0000-0000-000000000003',21,'win','Consegui assistir a uma música inteira entendendo algumas frases. Não é fluência. É uma porta que antes parecia parede.'),
  ('24000000-0000-0000-0000-000000000010','23000000-0000-0000-0000-000000000004',1,'step','A casa ficou quieta depois que ele foi embora. Hoje eu fiz uma lista de três coisas que ainda são minhas.'),
  ('24000000-0000-0000-0000-000000000011','23000000-0000-0000-0000-000000000004',8,'setback','Tive saudade e desmarquei o jantar. Não vou chamar isso de fracasso. Fiz sopa, tomei banho e dormi cedo.'),
  ('24000000-0000-0000-0000-000000000012','23000000-0000-0000-0000-000000000004',19,'win','Comprei uma planta para a sala. Escolhi sozinha. Pela primeira vez em muito tempo, isso pareceu uma coisa boa.'),
  ('24000000-0000-0000-0000-000000000013','23000000-0000-0000-0000-000000000005',1,'step','Abri a página do projeto e escrevi o nome do serviço. Ainda não vendi nada, mas agora a ideia tem uma porta de entrada.'),
  ('24000000-0000-0000-0000-000000000014','23000000-0000-0000-0000-000000000005',7,'setback','Mandei uma proposta e recebi um não. Fiquei sentado olhando para a tela. Depois corrigi uma frase e enviei para outra pessoa.'),
  ('24000000-0000-0000-0000-000000000015','23000000-0000-0000-0000-000000000005',16,'win','Meu primeiro cliente respondeu sim. O valor foi pequeno, mas alguém confiou no que eu fiz. Hoje eu entendi por que comecei.'),
  ('24000000-0000-0000-0000-000000000016','23000000-0000-0000-0000-000000000006',1,'step','Dei oito passos no corredor. Minha perna tremeu e eu precisei sentar. Oito passos ainda são oito passos.'),
  ('24000000-0000-0000-0000-000000000017','23000000-0000-0000-0000-000000000006',10,'win','Cheguei até a janela. Senti o sol no rosto e percebi que estava com medo, mas não estava parado.'),
  ('24000000-0000-0000-0000-000000000018','23000000-0000-0000-0000-000000000007',1,'step','Tirei as tintas da caixa depois de um ano. Não pintei nada. Só deixei tudo em cima da mesa e isso já abriu uma janela.'),
  ('24000000-0000-0000-0000-000000000019','23000000-0000-0000-0000-000000000007',5,'setback','Comecei um desenho e parei no meio. Ainda dói criar sem lembrar de quem se foi. Guardei o papel, não joguei fora.'),
  ('24000000-0000-0000-0000-000000000020','23000000-0000-0000-0000-000000000007',12,'win','Pintei uma janela amarela. Não é uma obra pronta. É a primeira coisa que fiz só porque quis.'),
  ('24000000-0000-0000-0000-000000000021','23000000-0000-0000-0000-000000000008',1,'step','Anotei todas as despesas do dia, inclusive o cafezinho. Não para me punir, para finalmente enxergar.'),
  ('24000000-0000-0000-0000-000000000022','23000000-0000-0000-0000-000000000008',14,'setback','Gastei mais do que planejava e fiquei com vergonha de registrar. Registrei mesmo. O plano não precisa ser perfeito para continuar.'),
  ('24000000-0000-0000-0000-000000000023','23000000-0000-0000-0000-000000000008',30,'win','Primeiro mês fechado. Guardei pouco, mas guardei. Pela primeira vez a saída do aluguel parece uma direção, não só um desejo.')
on conflict (id) do update set
  text = excluded.text,
  kind = excluded.kind;
