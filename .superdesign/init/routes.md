# Routes

Next.js 14 App Router; no central router configuration.

| URL | Entry | Layout / purpose |
|---|---|---|
| `/` | `app/page.js` | Public landing |
| `/home` | `app/home/page.js` | Authenticated global feed |
| `/explore` | `app/explore/page.js` | Explore journeys; proposed Círculos entry |
| `/buscar` | `app/buscar/page.js` | People search |
| `/perfil` | `app/perfil/page.js` | Owner profile and content tabs |
| `/new` | `app/new/page.js` | Journey creation wizard |
| `/midia` | `app/midia/page.js` | Media publication flow |
| `/rotinas` | `app/rotinas/page.js` | Routines hub and wizard |
| `/mensagens` | `app/mensagens/page.js` | Private messages |
| `/notifications` | `app/notifications/page.js` | Notifications |
| `/citacao` | `app/citacao/page.js` | Quote creation |
| `/mensagem-biblica` | `app/mensagem-biblica/page.js` | Biblical reflection creation |
| `/diario` | `app/diario/page.js` | Private diary |
| `/futuro` | `app/futuro/page.js` | Future-self messages |
| `/arvore` | `app/arvore/page.js` | Tree of Life |
| `/[slug]` | `app/[slug]/page.js` | Public journey/profile route |
| `/perfil/jornada/[slug]` | `app/perfil/jornada/[slug]/page.js` | Owner journey details |
| `/convite/[token]` | `app/convite/[token]/page.js` | Existing journey invite |
| `/desafio/[id]` | `app/desafio/[id]/page.js` | Pair challenge |
| `/login` | `app/login/page.js` | Authentication |
| `/admin/*` | `app/admin/*` | Global ONE moderation |

Proposed new routes: `/circulos`, `/circulos/novo`, `/circulos/convite/[token]`, `/circulos/[circleId]`, `/circulos/[circleId]/jornadas`, `/circulos/[circleId]/recursos`, `/circulos/[circleId]/membros`, `/circulos/[circleId]/sobre`, `/circulos/[circleId]/administrar`.
