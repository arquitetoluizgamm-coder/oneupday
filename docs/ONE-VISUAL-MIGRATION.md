# Migração visual do ONE

## Fase 1 — Fundação

Objetivo: centralizar tokens, sem alterar estrutura ou banco.

Arquivos: `app/globals.css`, `docs/ONE-*.md`.

Complexidade baixa. Risco baixo. Critério: tokens coexistem com variáveis atuais, build passa e nenhuma tela muda sem decisão explícita. Reversão: remover bloco de aliases.

## Fase 2 — Navegação

Objetivo: consolidar cabeçalho, barra inferior, abas, menus e notificações.

Arquivos: `components/AppTop.jsx`, `components/BottomNav.jsx`, `components/CriarMenu.jsx`, `components/ProfileTabs.jsx`, CSS associado.

Complexidade média. Risco médio em TWA e área segura. Critério: 44px de toque, nenhuma ação duplicada, testes em celular. Reversão: restaurar componentes individuais.

## Fase 3 — Conteúdo principal

Objetivo: padronizar feed, perfil, jornada e comentários com superfícies sólidas.

Arquivos: `app/home/*`, `app/[slug]/*`, `app/perfil/*`, `components/Comments.jsx`.

Complexidade alta. Risco alto na jornada. Critério: leitura de post, suporte, comentário, edição e navegação por dia testados. Reversão por tela.

## Fase 4 — Recursos emocionais

Objetivo: dar linguagem própria a Diário, Carta, Futuro, Cápsula e Árvore.

Arquivos: `app/diario/*`, `app/futuro/*`, `app/arvore/*`, `components/Amanha.jsx`.

Complexidade média. Risco médio. Critério: intimidade visual sem queda de desempenho.

## Fase 5 — Movimento e refinamento

Objetivo: remover animações isoladas, usar tokens e validar acessibilidade.

Complexidade média. Risco médio. Critério: `prefers-reduced-motion`, desempenho em celular intermediário e revisão de contraste.

## Primeira pull request recomendada

Somente documentação + aliases de tokens no topo de `app/globals.css`. Sem componentes, sem banco, sem assets e sem modificação de rotas. A PR deve ser avaliada visualmente antes de migrar qualquer tela.

