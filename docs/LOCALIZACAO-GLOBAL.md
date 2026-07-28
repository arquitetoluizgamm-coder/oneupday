# Localização global do One Up Day

## Estado atual

O app tem dois idiomas no dicionário principal:

```js
export const locales = ['en', 'pt'];
```

O idioma é escolhido pelo cabeçalho `Accept-Language`, com fallback para inglês. Links compartilhados por robôs de WhatsApp, Facebook e redes semelhantes usam português para preservar a experiência do mercado brasileiro.

## Ordem recomendada

### Etapa 1 — fundação (iniciada)

- documentar a estratégia;
- centralizar qualquer texto novo no dicionário;
- retirar strings fixas de componentes novos, como a tela Hoje;
- garantir que cada componente receba seus textos por `labels` ou `t`.

### Etapa 2 — espanhol (em andamento)

- adicionar `es` em `locales`; **feito nesta etapa**;
- criar o núcleo espanhol das telas de entrada, wizard, feed, comentários, perfil e ações; **feito nesta etapa**;
- concluir o dicionário espanhol completo, sem copiar traduções automáticas sem revisão; **pendente**;
- incluir Espanha, México, Colômbia, Argentina e Chile como primeiros mercados de teste;
- revisar plural, gênero, tratamento e vocabulário de apoio;
- testar wizard, feed, comentários, notificações, perfil, moderação e mensagens de erro.

### Etapa 3 — preferência de idioma (iniciada)

- reconhecer `pt`, `en` e `es` pelo navegador; **feito**;
- permitir troca manual no topo do app; **feito nesta etapa**;
- salvar a preferência em cookie para não depender do navegador em cada acesso; **feito nesta etapa**;
- revisar o seletor e mover para perfil/configurações se a navegação global ficar pesada; **pendente**;
- manter o idioma dos textos gerados pela IA igual ao idioma escolhido.

### Etapa 4 — conteúdo e operação

- traduzir exemplos de jornadas e perguntas do Up;
- revisar prompts da IA, mensagens de segurança e moderação;
- preparar suporte e política de privacidade nos três idiomas;
- revisar datas, números, plurais e formatos de compartilhamento.

### Etapa 5 — Play Store

- página em português para o Brasil;
- página em inglês para Estados Unidos, Canadá, Reino Unido, Austrália e Irlanda;
- página em espanhol para Espanha e América Latina;
- cards, screenshots, título, descrição e palavras-chave adaptados por região;
- testar campanhas com páginas personalizadas antes de ampliar a distribuição.

## Critério para avançar

Não liberar um idioma apenas porque a página da Play Store está traduzida. O usuário precisa conseguir criar uma jornada, publicar, comentar, receber notificações e entender a moderação no mesmo idioma.

## Próximo trabalho

Depois deste núcleo, a próxima entrega deve ser completar as chaves restantes do dicionário `es`, revisar gênero/plural e fazer uma passagem visual em todas as telas. Só então vale abrir o teste espanhol na Play Store.
