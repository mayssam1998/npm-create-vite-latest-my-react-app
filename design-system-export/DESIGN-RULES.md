# Design rules (O.P.H.I.S)

Paste this section into the new project's `CLAUDE.md`. Every value lives in
`src/design-system/`; this file says how to use it.

## Tokens

- Every colour is an oklch CSS variable from `src/design-system/css/tokens.css`. Never write a hex, rgb or oklch literal in a component. Use the Tailwind utility (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-status-open-soft text-status-open`) or `var(--token)`.
- Exception: canvas, WebGL and map APIs that cannot read CSS. Read the live value with `readToken("--board-edge")` from `src/design-system/tokens.ts`, never a copied literal. The `--board-*` tokens are hex because the WebGL renderer parses them.
- Tokens with no Tailwind utility (`--map-id-1…6`, `--brand-green`, `--brand-gold`, `--shadow-elegant`, `--shadow-hover`, `--board-*`) are used through `var()`, e.g. `bg-[var(--map-id-1)]`. Don't add them to `@theme inline` unless asked.
- Don't edit `css/tokens.css`, `css/tailwind-theme.css`, `tokens.json` or `tokens.ts` by hand. They're generated from the source app.
- To add a semantic colour: give it a light value in `:root` and a dark value in `.dark`, then register `--color-<name>: var(--<name>)` in `@theme inline`.

## Themes

- Light is the default. Dark is `class="dark"` on `<html>`. The Analyst family is `data-theme="analyst"` on `<html>` and combines with `.dark`.
- Read the theme from `localStorage` in an effect, never during render (SSR safety). Keys used by the source app: `cm:theme` (`light | dark`) and `cm:theme-family` (`analyst`).
- Status, priority, tag, entity, event and reference colours are semantic token families (`status-*`, `priority-*`, `tag-*`, `entity-*`, `ev-*`, `ref-*`, `certainty-*`, `vip*`) with values in every theme. A chip is `bg-<family>-soft text-<family>`. A dot or flag is `bg-<family>` or `text-<family>`.
- Case status mapping used by the source app: draft → `status-draft`, pending signature (in/out) → `status-review`, open → `status-open`, in progress → `status-progress`, in review → `status-ack`, done → `status-done`, archived → `status-closed`. Tags: `neutral | sand | sage | slate | clay` as `bg-tag-x text-tag-x-fg`. Priority: `text-priority-low|normal|high|urgent`.
- Gold (`vip`, `--brand-gold`) means VIP. Red (`destructive`, `ev-alert`, `priority-urgent`) means danger or urgency. Amber (`certainty-probable`) means "probable". Don't reuse these colours for other meanings.

## Look

- Dense and restrained: no gradients, and no shadows outside popovers and dropdowns. Use one accent colour (`primary`), 1px borders instead of filled blocks, no card wrapped around a table, and 56px (`h-14`) table rows that still fit Arabic text.
- Radius scale: `rounded-sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `4xl`, all derived from `--radius` (0.625rem default, 0.5rem in Analyst). Use `rounded-md` or `rounded-lg` for most surfaces.
- Spacing is Tailwind's default scale (`--spacing: 0.25rem`). There are no custom spacing tokens.
- Glow, blur, grid and scanlines (`.ophis-stage`, `.ophis-glass`) are allowed on the login screen only.
- Dense scroll panes use the `scroll-thin` utility.
- Mixing a token with a surface: `color-mix(in oklab, …)`, never `in oklch`. The oklch interpolation shifts the hue toward blue.

## Typography

- Sans: `Inter, "Noto Sans Arabic", "Segoe UI", system-ui, -apple-system, sans-serif`, loaded from Google Fonts (link in the README). Mono: IBM Plex Mono, self-hosted.
- The Analyst family switches to IBM Plex Sans / IBM Plex Sans Arabic, caps `font-semibold` and `font-bold` at 500, and sets IDs, refs, dates and counts in mono through `[data-ltr]`.

## RTL (Arabic)

- Use logical utilities only: `ps-/pe-/ms-/me-/start-/end-/text-start`. Never `left/right/ml/mr/pl/pr`.
- Mirror chevrons and sort arrows (`rtl:rotate-180`, `rtl:-scale-x-100`). Never mirror status dots, priority flags, avatars or entity icons.
- Wrap IDs, refs, dates, phone numbers and counts in `<Ltr>` (`src/design-system/components/ltr.tsx`).
- `<html lang dir>` follows the language: Arabic implies `dir="rtl"`. Wrap the app in Radix `DirectionProvider` so Radix primitives mirror.

## Components

- shadcn/ui, style `new-york`, `cssVariables: true`, icons from `lucide-react`. Primitives go in `src/components/ui` and are styled only through tokens.
- Compose classes with `cn()` from `@/lib/utils` (clsx + tailwind-merge).
