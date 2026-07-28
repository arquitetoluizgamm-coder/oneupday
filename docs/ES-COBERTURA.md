# Cobertura do espanhol

O espanhol (`es`) esta disponivel no seletor de idioma e pode ser escolhido
manualmente no topo do app. O cookie `oud_locale` mantem a preferencia do
usuario.

## Estado desta etapa

Na ultima auditoria, o dicionario ingles tinha 858 chaves. O nucleo espanhol
passou a ter 862 substituicoes, cobrindo entrada, feed, jornada, criacao,
midia, comentarios, perfil, notificacoes, desafios, retrospectiva, landing,
regras, envelope e citacoes.

O auditor nao encontra chaves espanholas herdando o ingles:

```bash
cd web
node scripts/audit-locales.cjs
```

O espanhol pode ser tratado como idioma completo na Play Store. Ainda vale uma
revisao visual nativa para confirmar que cada traducao cabe em botoes, cards e
telas pequenas.
