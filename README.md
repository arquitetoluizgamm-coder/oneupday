# One Up Day

One Up Day é uma aplicação web para registrar jornadas pessoais, acompanhar o progresso e retomar uma rotina depois de uma pausa. A ideia é dar espaço tanto ao primeiro registro quanto ao recomeço.

## O que o projeto faz

- Criação e acompanhamento de jornadas pessoais.
- Registro de avanços ao longo do tempo.
- Retomada de jornadas depois de uma pausa.

## Tecnologias

- **Next.js e React** para a aplicação web e suas interfaces.
- **Supabase** para os serviços de dados e autenticação.

## Por onde começar no código

| O que você quer avaliar | Onde olhar | O que observar |
| --- | --- | --- |
| Tela de uma jornada | [`app/[slug]/page.js`](app/%5Bslug%5D/page.js) | A rota carrega a jornada pelo slug, busca os registros em ordem e monta a tela conforme a sessão de quem está acessando. |
| Sessão e acesso a dados | [`lib/supabase/server.js`](lib/supabase/server.js) | O cliente de servidor integra a sessão do Supabase aos cookies do Next.js para uso em páginas e rotas. |
| Teste de regressão do feed | [`tests/feed-entry-performance.test.mjs`](tests/feed-entry-performance.test.mjs) | O teste inspeciona o código para verificar, entre outras coisas, que as requisições auxiliares aguardam a primeira página do feed. |

## Desenvolvimento local

Instale as dependências e inicie o servidor de desenvolvimento:

```sh
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000). Para usar os recursos conectados, configure um projeto Supabase de desenvolvimento com as variáveis de ambiente esperadas pelo código.

`npm test` executa os testes do repositório. `npm run build` gera o build de produção.

## Sobre o projeto

Projeto desenvolvido por [Fernando Gamarano](https://www.linkedin.com/in/fernando-gamarano-arq/). O [artigo técnico no LinkedIn](https://www.linkedin.com/pulse/por-dentro-do-one-up-day-nextjs-react-e-supabase-gamarano-gfvtc/) apresenta as escolhas de produto e tecnologia.
