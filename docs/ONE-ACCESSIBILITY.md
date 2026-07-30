# Acessibilidade visual do ONE

## Regras obrigatórias

- Texto funcional mínimo de 12px em celular; corpo recomendado de 15px.
- Alvos de toque de 44×44px.
- Contraste mínimo 4.5:1 para texto comum e 3:1 para ícones/controles.
- Foco visível com anel terracota; não remover `outline` sem alternativa.
- Estado ativo não depende apenas de cor: usar forma, rótulo, ícone preenchido ou posição.
- `prefers-reduced-motion` deve desativar movimentos decorativos, incluindo rolagem suave em JavaScript.
- Imagens publicadas precisam de alt útil; o feed não pode ser uma sequência de “imagem”.

## Liquid Glass

Vidro só pode ficar atrás de texto curto e controles. Para modal com texto maior, usar base opaca suficiente. Backdrop blur não substitui contraste.

## Pontos para validação manual

- Navegação inferior no iPhone com área segura e zoom do sistema.
- Modal de comentários, menu de criar e configurações com teclado/Esc.
- Perfil com ponto de notificação, verificando leitor de tela e estado não lido.
- Linha de dias com arraste, teclado e redução de movimento.
- Fluxo de criação com fonte aumentada.

