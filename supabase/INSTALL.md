# Banco Supabase — instalação

## Instalação nova (do zero) — 1 passo

No Supabase → **SQL Editor → New query**, cole todo o conteúdo de **`install-all.sql`** e clique **Run**.

Isso cria, na ordem certa, tudo que o app precisa:

1. `schema.sql` — perfis, jornadas, updates, encorajamentos, view de streak/progresso, RLS.
2. `storage-setup.sql` — bucket `photos` (fotos e vídeos) + permissões.
3. `add-video.sql` — coluna `video_url`.
4. `add-avatar.sql` — coluna `avatar_url` (foto do Google).
5. `add-banner.sql` — coluna `banner_url` (capa do perfil).
6. `follows.sql` — seguir jornadas.
7. `reports.sql` — denúncias.
8. `notifications.sql` — notificações in-app (triggers).
9. `analytics.sql` — eventos + view de retenção.

## Dados de teste (opcional)

Depois do `install-all.sql`, se quiser as 3 jornadas de exemplo, rode **`seed.sql`** separado.
Quando tiver usuários reais, pode apagar esses registros de teste.

## Já instalei antes (atualização)

Se você já rodou os SQLs em rodadas anteriores, rode só os que faltam. Os scripts usam
`if not exists` / `create policy` idempotentes onde dá — mas `create policy` repetido dá erro
"already exists" (inofensivo, só ignore). Na dúvida, os únicos novos da última rodada são
`reports.sql` e `notifications.sql`.

## Métrica que importa (retenção)

Depois de ter usuários, rode no SQL Editor:

```sql
select
  count(*) as usuarios,
  round(100.0*count(*) filter (where posted_day2)/nullif(count(*),0)) as retencao_dia2_pct,
  round(100.0*count(*) filter (where posted_day7)/nullif(count(*),0)) as retencao_dia7_pct
from public.user_retention;
```
