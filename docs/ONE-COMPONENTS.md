# Componentes visuais do ONE

## Regras comuns

Todos os controles clicáveis têm alvo mínimo de 44px no celular. Estado ativo usa forma + cor + texto/ícone, nunca cor isolada. Foco usa anel terracota suave. Loading mantém o tamanho do controle; não desloca conteúdo.

| Componente | Estado padrão | Ativo / pressionado | Movimento permitido |
|---|---|---|---|
| CTA principal | azul-noite, texto branco | escurece 4%, escala 0,98 | 160ms |
| Secundário | superfície e borda | terracota suave | 160ms |
| Texto | sem caixa | sublinhado curto | 120ms |
| Destrutivo | texto `--one-danger` | fundo rosado suave | nenhum destaque festivo |
| Apoio | ícone e texto discretos | terracota suave + rótulo muda | 160ms |
| Campo | branco sólido, borda clara | anel de foco | nenhum blur |
| Card de feed | plano, divisor leve | não ganha 3D | nenhum |
| Card de ferramenta | papel/argila macia | elevação 2px | 180ms |
| Modal / sheet | vidro fosco ou papel conforme contexto | botão de fechar sempre visível | entrada 180ms |
| Avatar | círculo, imagem sem distorção | anel sálvia ou terracota | nenhum |
| Progresso | barra ou linha de dias | sálvia = continuidade | 300–600ms uma vez |
| Toast | superfície sólida elevada | desaparece em 3–5s | 180ms |

## Componentes encontrados

| Componente | Arquivo | Direção |
|---|---|---|
| Navegação inferior | `components/BottomNav.jsx` | Liquid Glass, único material contínuo de vidro |
| Cabeçalho | `components/AppTop.jsx` | limpo, marca central, sem vidro de corpo inteiro |
| Criar | `components/CriarMenu.jsx` | bottom sheet de vidro pontual |
| Comentários | `components/Comments.jsx` | painel sólido ou vidro leve, leitura primeiro |
| Apoio | `app/[slug]/EncourageBar.jsx` | controle de presença, não curtida competitiva |
| Perfil | `app/perfil/page.js` e `components/ProfileTabs.jsx` | identidade e percurso, abas claras |
| Wizard | `app/new/NewJourneyForm.jsx` | formulário guiado, papel sólido |
| Diário | `app/diario/DiarioClient.jsx` | caderno, superfície de papel |
| Futuro | `app/futuro/FuturoClient.jsx` | cápsula / memória guardada |
| Árvore | `app/arvore/ArvoreDaVida.jsx` | recurso orgânico, argila e natureza |

## Ícones

Funcionais: traço simples, 1.8–2px, arredondado, sem gradiente. Inclui home, busca, criar, voltar, fechar, editar, salvar, excluir, compartilhar e comentar.

Emocionais: podem usar ilustração própria e profundidade leve. Inclui Upi, árvore, diário, cápsula, carta, Eu do Futuro, recomeço e recaída. Não substituir os ícones existentes agora. **PENDENTE DE CONFIRMAÇÃO:** catálogo final de ícones emocionais.

