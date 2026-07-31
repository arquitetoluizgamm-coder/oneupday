# Mapa e auditoria de telas

| Tela | Rota / arquivo | Função | Estado atual | Próxima ação | Prioridade | Risco |
|---|---|---|---|---|---|---|
| Landing | `app/page.js` | explicar e captar | marca consistente, proposta ainda depende de texto | ajustar levemente | alta | baixo |
| Login | `app/login/page.js` | entrada | funcional | manter | média | baixo |
| Home | `app/home/page.js` | começo e feed | concentra muitos papéis | ajustar levemente | alta | médio |
| Feed | `app/home/FeedClient.jsx` | histórias e apoio | leitura boa, estilos históricos concorrentes | refatorar visualmente | alta | médio |
| Buscar | `app/buscar/page.js` | descobrir pessoas | funcional | ajustar levemente | média | baixo |
| Explorar | `app/explore/page.js` | descobrir jornadas | cards podem ser mais editoriais | ajustar levemente | média | baixo |
| Criar jornada | `app/new/NewJourneyForm.jsx` | iniciar em 7 etapas | orientação forte, precisa de consistência | manter e refinar | alta | médio |
| Perfil | `app/perfil/page.js` | identidade e gestão | muitas ações concentradas | refatorar visualmente | alta | médio |
| Jornada pública | `app/[slug]/page.js` | acompanhar caminho | timeline e capítulos ainda disputam espaço | reestruturar | alta | alto |
| Jornada própria | `app/perfil/jornada/[slug]/page.js` | registrar e editar | edição pode confundir | refatorar visualmente | alta | alto |
| Diário | `app/diario/DiarioClient.jsx` | registro privado | função forte, visual ainda de lista | refatorar visualmente | média | médio |
| Eu do Futuro | `app/futuro/FuturoClient.jsx` | carta e cápsula | recurso emocional forte | ajustar levemente | média | baixo |
| Árvore | `app/arvore/ArvoreDaVida.jsx` | evolução visual | linguagem já coerente | manter e refinar | média | médio |
| Citação | `app/citacao/CitacaoForm.jsx` | publicar reflexão | funcional | ajustar levemente | baixa | baixo |
| Mídia | `app/midia/page.js` | álbum | funcional | pendente de confirmação | baixa | baixo |
| Notificações | `app/notifications/page.js` | retorno e apoio | posição na navegação foi revisada | ajustar levemente | média | baixo |
| Convite | `app/invite/page.js` | aquisição | visual genérico relatado | refatorar visualmente | alta | baixo |
| Onboarding / Dia 1 | `app/dia1/page.js` | explicar proposta | mensagens existem, sequência a validar | ajustar levemente | média | baixo |
| Admin | `app/admin/*` | operação | funcional, não é superfície de marca | manter | baixa | baixo |

## Pontos críticos

1. `app/globals.css` precisa sair do modelo de correções acumuladas.
2. Jornada pública e jornada própria têm maior risco por misturarem leitura, edição, navegação por dias e ações sociais.
3. Feed não deve receber efeitos de vidro ou profundidade decorativa.
4. O diário precisa de uma linguagem própria de papel e privacidade, não de mais cards genéricos.

