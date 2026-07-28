# IA e idioma

O idioma selecionado no app precisa atravessar todo o caminho da IA. Nesta
etapa, o Eco foi ajustado para aceitar `pt`, `en` e `es` em três pontos:

1. observacao deterministica do fato da jornada;
2. pergunta curta que devolve a palavra ao autor;
3. instrucao enviada ao modelo, que agora informa o idioma de resposta.

O Eco continua proibido de diagnosticar, elogiar automaticamente, inventar
fatos ou perguntar em dias marcados como dificeis. A localizacao nao muda essas
regras de seguranca.

## Teste manual

- selecione PT, registre um fato e aguarde o Eco;
- selecione EN e repita em outra jornada;
- selecione ES e confirme observacao e pergunta em espanhol;
- verifique que uma troca de idioma nao altera o texto original da pessoa.
