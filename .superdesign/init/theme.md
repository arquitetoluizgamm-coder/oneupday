# Theme

## Compact token summary

- Fonts: Inter for UI/body; Montserrat for selected strong labels; Fraunces for editorial accents.
- Background `#FAF7F2`; soft background `#F1E9DE`; surface `#FDF9F3`; elevated `#FFFDF8`.
- Ink `#2D2924`; muted `#756C63`; line `#E5D9CB`.
- Primary terracotta `#C16F54`; light `#D88E72`; dark `#A95740`; soft `#F4E3DC`.
- Sage `#84957E`; soft sage `#EEF3EA`; danger `#9B584C`.
- Spacing: 4, 8, 12, 16, 24, 32px.
- Radius: controls 12px, cards 18px, sheets 24px, pills 999px.
- Minimum touch size: 44px.
- Breakpoints used repeatedly: 430px, 640px, 767px, 900px.
- Card shadow: `0 8px 18px rgba(106,81,59,.10)`.

## Raw source: `app/one-tokens.css`

```css
:root {
  --one-bg:#FAF7F2; --one-bg-soft:#F1E9DE; --one-surface:#FDF9F3; --one-surface-elevated:#FFFDF8; --one-surface-pressed:#EEE6DB;
  --one-ink:#2D2924; --one-muted:#756C63; --one-line:#E5D9CB;
  --one-terracotta:#C16F54; --one-terracotta-soft:#F4E3DC; --one-primary:#C16F54; --one-primary-light:#D88E72; --one-primary-dark:#A95740;
  --one-text:#2D2924; --one-text-muted:#756C63; --one-border-soft:#E5D9CB; --one-highlight:#FFF7ED;
  --one-sage:#84957E; --one-sage-soft:#EEF3EA; --one-difficult:#C9A392; --one-info:#806F63; --one-danger:#9B584C; --one-focus:rgba(193,111,84,.25);
  --one-space-1:4px; --one-space-2:8px; --one-space-3:12px; --one-space-4:16px; --one-space-5:24px; --one-space-6:32px;
  --one-radius-control:12px; --one-radius-card:18px; --one-radius-sheet:24px; --one-radius-pill:999px; --one-touch-min:44px;
  --one-shadow-card:0 8px 18px rgba(106,81,59,.10); --one-shadow-control:0 10px 22px rgba(106,81,59,.14); --one-shadow-sheet:0 20px 48px rgba(82,61,44,.20);
  --one-ease:cubic-bezier(.22,1,.36,1); --one-motion-fast:160ms; --one-motion-base:220ms;
  --bg:var(--one-bg); --surface:var(--one-surface); --ink:var(--one-ink); --muted:var(--one-muted); --line:var(--one-line); --orange:var(--one-terracotta); --pink:var(--one-terracotta); --sage:var(--one-sage); --sage-soft:var(--one-sage-soft);
}
```

The legacy `app/globals.css` is 14,483 lines and contains historical overrides. For generation, use its initial `:root` block plus `app/one-tokens.css` and target-specific CSS rather than passing it whole.
