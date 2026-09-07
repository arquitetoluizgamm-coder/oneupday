# ONE — Design System for Círculos

## Product

One Up Day is a mobile-first social network for honest personal journeys. Círculos are private, invitation-only spaces inside the same product. They must feel like ONE, never like a CRM, hospital portal, corporate dashboard, or messaging clone.

## Visual language

- Primary font: Inter. Use Montserrat only where the existing app already uses it. Fraunces is reserved for editorial/reflection accents.
- Ink: `#2D2924`; muted text: `#756C63`.
- Page background: `#FAF7F2`; soft background: `#F1E9DE`.
- Surface: `#FDF9F3`; elevated surface: `#FFFDF8`.
- Terracotta: `#C16F54`; dark terracotta: `#A95740`; soft terracotta: `#F4E3DC`.
- Sage: `#84957E`; soft sage: `#EEF3EA`.
- Borders: `#E5D9CB`.
- Control radius: 12px; card radius: 18px; sheet radius: 24px; pills: 999px.
- Spacing scale: 4, 8, 12, 16, 24, 32px.
- Touch targets: at least 44px.
- Shadows are warm and restrained. Cards use `0 8px 18px rgba(106,81,59,.10)`.

## Interaction

- Mobile-first, single-column content with the current ONE top bar and floating bottom navigation.
- Reveal advanced permissions progressively; avoid showing a dense settings matrix on the first screen.
- Privacy is visible in plain language and not conveyed by color alone.
- Default audience inside a Circle is “Somente neste Círculo”.
- Use confirmation before publishing an author's own content outside a Circle.
- No rankings, streak competition, diagnostic language, or health-risk inference.
- All focus states must be visible; respect `prefers-reduced-motion`.

## Círculos information architecture

- Hub: Meus Círculos, Administro, Convites, Criar Círculo.
- Circle: Início, Jornadas, Recursos, Membros, Sobre; Administração only for authorized roles.
- First-run creation is a short wizard: identity, welcome/rules, permissions, invite.
- Circle header shows cover, name, short description, Private status, member count only when allowed, and administrator.
- Feed cards reuse ONE publication hierarchy and actions, with a clear private-context marker.

## Privacy invariants

- Never display Circle identity, membership, reactions, comments, or participant names outside the Circle.
- Private media must not use permanent public URLs.
- Removed or inactive members cannot read any Circle route, row, notification detail, or file.
- Cross-posting creates a sanitized copy owned by the author; it never changes the original private record.

## Responsive behavior

- Primary target: 360–430px portrait.
- Support 320px without horizontal overflow.
- Desktop centers the same content column, with optional secondary navigation/administration panel only when useful.
- Keep the approved ONE bottom navigation unchanged; Círculos enters through Explore and the creation menu in the MVP.
