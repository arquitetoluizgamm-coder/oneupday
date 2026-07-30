# Sistema visual do ONE

## Leitura da identidade atual

O ONE já possui uma base reconhecível: fundo claro, azul-noite para leitura e direção, sálvia para continuidade, terracota para ação humana e o degradê rosa–laranja–amarelo somente como energia da marca. O wordmark vetorial `public/brand/one.svg`, o símbolo `ONE` e a Upi são a referência oficial. O nome completo continua em páginas externas; dentro do produto, a abreviação ONE é adequada.

A melhor evolução não é trocar de identidade. É reduzir as exceções acumuladas no `app/globals.css`, tornar as decisões repetíveis e devolver hierarquia ao conteúdo.

## Princípios

- O relato é protagonista; a interface o sustenta.
- Continuidade não é vitória. Sálvia comunica presença; terracota comunica ação e novidade.
- Uma recaída é pausa ou dia difícil, nunca erro vermelho ou punição.
- A Upi aparece como companhia, não como decoração repetida.
- Vidro é navegação e escolha. Papel, argila e cerâmica são momentos íntimos e simbólicos.

## Materiais oficiais

| Uso | Material | Regra |
|---|---|---|
| Feed, comentários, formulários | superfície sólida / papel claro | leitura acima de efeito |
| Diário | papel premium quente | íntimo, sem transparência |
| Carta do Amanhã | papel + envelope sutil | reservado a abertura e carta |
| Cápsula / Eu do Futuro | vidro fosco suave | memória, tempo e espera |
| Árvore da Vida | argila e natureza suave | orgânico, nunca ranking |
| Navegação inferior | Liquid Glass | único vidro contínuo do app |

## Proporção de linguagem

- 65% interface limpa e sólida.
- 25% profundidade macia em recursos emocionais.
- 10% Liquid Glass em navegação, menus e escolhas pontuais.

Liquid Glass não deve ser aplicado como fundo de feed, texto longo, diário inteiro ou foto. Transparência sem conteúdo visual atrás parece apenas branco acinzentado; por isso o efeito deve ser reservado a elementos sobrepostos ou com contexto de fundo.

## Direção por área

| Área | Direção | Situação |
|---|---|---|
| Home/feed | plana, respirada, mídia em 4:5 | ajustar levemente |
| Perfil | identidade e trajetória, pequenas camadas | ajustar levemente |
| Jornada pública | capítulos e linha de dias, pouco painel | refatorar visualmente |
| Criar jornada | uma pergunta por vez, acolhedor | manter e refinar |
| Diário | caderno privado | refatorar visualmente em fase emocional |
| Futuro / cápsula | tempo guardado, vidro e papel pontuais | ajustar levemente |
| Árvore | orgânica e progressiva | manter e refinar |
| Landing / convite | nome completo, explicação clara | ajustar levemente |

## Decisão importante sobre o CSS atual

O arquivo `app/globals.css` contém camadas de patches históricos e variáveis reatribuídas. A migração não deve acrescentar mais estilos genéricos no fim. Cada fase deve mover componentes para tokens sem apagar regras antigas até que a tela correspondente seja validada.

