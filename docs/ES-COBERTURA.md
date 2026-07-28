# Cobertura do espanhol

O espanhol (`es`) está disponível no seletor de idioma e pode ser escolhido
manualmente no topo do app. O cookie `oud_locale` mantém a preferência do
usuário.

## Estado desta etapa

Na última auditoria, o dicionário inglês tinha 858 chaves. O núcleo espanhol
passou a ter 648 substituições, cobrindo o percurso de entrada, feed, jornada,
criação, mídia, comentários, perfil, notificações, desafios e retrospectiva.

Ainda existem 214 chaves que herdam o inglês. Isso é intencional nesta fase:
evita exibir uma tradução incompleta ou inventada em telas menos usadas. O
relatório exato pode ser atualizado com:

```bash
cd web
node scripts/audit-locales.cjs
```

O espanhol só deve ser marcado como idioma completo na Play Store depois que o
comando retornar `Spanish coverage complete.`. Até lá, a publicação pode usar
espanhol como acesso antecipado, com revisão dos grupos restantes por tela.
