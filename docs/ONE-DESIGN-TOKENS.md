# Tokens de design do ONE

Fonte atual: `app/globals.css`, `components/Logo.jsx` e ativos em `public/brand/`.

## Cores propostas

| Token | Valor | Uso |
|---|---:|---|
| `--one-bg` | `#FAF7F2` | fundo principal oficial |
| `--one-bg-soft` | `#F3F0EA` | agrupamentos discretos |
| `--one-surface` | `#FFFFFF` | cartões e campos de leitura |
| `--one-ink` | `#10132D` | texto e ação principal |
| `--one-muted` | `#69707D` | texto secundário |
| `--one-line` | `#E6E2DA` | divisores e bordas |
| `--one-terracotta` | `#C16F54` | ação, alerta gentil, novidade |
| `--one-terracotta-soft` | `#F4E3DC` | apoio e estado selecionado |
| `--one-sage` | `#84957E` | continuidade e presença |
| `--one-sage-soft` | `#EEF3EA` | contexto positivo sem competição |
| `--one-difficult` | `#C9A392` | dia difícil, sem semântica de erro |
| `--one-info` | `#61758A` | informação neutra |
| `--one-danger` | `#A55C57` | somente ações destrutivas |
| `--one-focus` | `rgba(193,111,84,.25)` | foco visível |

O rosa, laranja e amarelo originais permanecem no degradê do símbolo e em peças de campanha. Não devem ser a paleta operacional de todos os botões.

## Tipografia existente

- `Inter`: interface, corpo, botões e leitura funcional.
- `Fraunces`: mensagens emocionais, títulos especiais e memória.
- `Montserrat`: labels de marca, uso pontual.

Escala proposta: título de tela 30/34, título de seção 22/27, card 16/22, corpo 15/23, secundário 13/19, legenda 11/15. Em celular, nenhum texto funcional abaixo de 12px.

## Espaçamento e forma

| Token | Valor |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--radius-control` | 12px |
| `--radius-card` | 18px |
| `--radius-sheet` | 24px |
| `--radius-pill` | 999px |
| `--touch-min` | 44px |

## Profundidade

| Nível | Uso | Sombra |
|---|---|---|
| 0 | feed e texto | sem sombra |
| 1 | card comum | `0 6px 18px rgba(16,19,45,.05)` |
| 2 | controle | `0 8px 22px rgba(16,19,45,.08)` |
| 3 | menu / modal | `0 18px 48px rgba(16,19,45,.16)` |
| 4 | memória / cápsula | `0 22px 56px rgba(16,19,45,.14)` |

## Próxima implementação segura

Criar os tokens acima como aliases compatíveis no início de `app/globals.css`, sem substituir visualmente todos os componentes. Cada componente migra em sua própria fase.

