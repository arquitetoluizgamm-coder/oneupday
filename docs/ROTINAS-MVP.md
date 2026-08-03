# Rotinas, MVP

Rotinas são entidades separadas de `journeys` e não publicam registros diários no feed.

## Homologação

1. Aplicar `supabase/migrations/20260803000000_routines.sql` no projeto Supabase.
2. Habilitar `ROUTINE_FEATURE_ENABLED=true` no ambiente de homologação, ou usar o preview da Vercel, que abre a flag por padrão.
3. Acessar `/rotinas` pelo botão `+` da navegação.

Em produção a flag fica fechada até a revisão do MVP. Para abrir depois, defina `ROUTINE_FEATURE_ENABLED=true` no ambiente de produção.

## Modelo

- `routines`: nome, versão ideal, versão mínima, frequência, período, jornada vinculada, privacidade, pausa e status.
- `routine_logs`: um registro por rotina e data, com estado `ideal`, `minimum`, `not_today` ou `paused`.

`ideal` e `minimum` contam como presença. `not_today` não conta como presença. Um dia sem registro continua diferente de “hoje não deu”. Pausas preservam os logs e não zeram histórico.

## Eventos

O MVP registra `routine_created`, `routine_ideal_completed`, `routine_minimum_completed`, `routine_not_today_selected`, `routine_paused`, `routine_resumed`, `routine_return_detected` e `routine_archived`. O título da rotina e notas não são enviados nos metadados.

## Limitações atuais

- O MVP não envia notificações push de rotina ainda; a tela Hoje e o histórico estão prontos para receber esse serviço.
- O compartilhamento de marcos e a integração visual da Árvore da Vida ficam preparados pelo campo de privacidade e vínculo, mas ainda não criam um marco público.
- A revisão semanal é uma leitura simples de presença, versão mínima, pausas e retornos.
