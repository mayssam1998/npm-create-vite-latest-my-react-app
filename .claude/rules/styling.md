# Styling and the design system

**Tailwind v4 only.** No CSS Modules, no styled-components, no Emotion. Mixing styling
systems in a large app is one of the more expensive mistakes available, and runtime
CSS-in-JS costs render time you cannot afford next to WebGL.

## Design tokens as CSS variables

The palette is the **O.P.H.I.S design system** (adopted Oct 20, 2026), generated from the
approved Lovable app and copied verbatim into `src/shared/design-system/` — never edit those
files. `css/tokens.css` defines every variable for four themes, `css/tailwind-theme.css`
maps them to utilities (`bg-primary`, `text-muted-foreground`, `bg-status-open-soft`,
`bg-tag-sage text-tag-sage-fg` …). **Never write a raw colour in a component.** Usage rules:
the "Design rules (O.P.H.I.S)" section of `CLAUDE.md`. Tweaking a colour or adding a theme:
`src/shared/design-system/README.md`.

This is also what makes dark mode a single stylesheet change instead of a hunt through
400 files.

## Variants with `cva`

Badges, buttons and status chips have many combinations. Declare them once:

```ts
const badge = cva('inline-flex items-center rounded-md px-2 text-xs', {
  variants: { tone: { pending: '…', urgent: '…', normal: '…' } },
});
```

Use `cn()` (clsx + tailwind-merge) for conditional classes. **Never build class strings
with template literals and ternaries.**

## Rules

- No arbitrary values (`w-[437px]`, `text-[#2A5C3F]`) outside prototypes. If a value is
  needed twice, it is a token.
- Status, priority and entity-type colours come from a **mapping function**, not from
  conditionals in JSX.
- Use logical properties for RTL: `ms-` / `me-` / `ps-` / `pe-` / `start-` / `end-`.
  Never `ml-` / `mr-` / `pl-` / `pr-` / `left-` / `right-`.
- Dark mode via a **`.dark` class on `<html>`** (decided Oct 13, 2026); the Analyst family via
  **`data-theme="analyst"`** on `<html>` (Oct 20, 2026). Both are driven by the one
  `ThemeProvider`, stored under `cm:theme` / `cm:theme-family`, and switched from the header
  user menu. `tokens.css` redefines the same tokens per theme, so components never need
  `dark:` variants.
- `shared/ui` components may contain Tailwind classes. Feature components should mostly
  **compose** `shared/ui`, not restyle it.
- Self-host the Arabic font — see `i18n-rtl.md`.

Recipe: the `design-system-component` skill.
