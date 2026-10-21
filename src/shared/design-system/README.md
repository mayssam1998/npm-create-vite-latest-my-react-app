# Themes and colours

Every colour is a CSS variable (`--primary`, `--card`, `--status-open` …) defined in
`css/tokens.css`. Components use it through utilities (`bg-primary`, `text-status-open`),
so changing a variable changes it everywhere.

The files in this folder are **generated** from the O.P.H.I.S (Lovable) app. Don't edit them
by hand: the next update would overwrite your change.

## Switch the theme

- **Users:** use the account menu at the end of the header. It has *Theme family* (Default /
  Analyst), *Dark/Light theme* and the language switch.
- **Code:** `const { theme, toggleTheme, family, setFamily } = useTheme();`
- **How it works:** dark is `class="dark"` on `<html>`, the family is
  `data-theme="<name>"` on `<html>`, and both are saved in `localStorage` (`cm:theme`,
  `cm:theme-family`).

## Change a colour

1. Change it in the O.P.H.I.S source app, then regenerate (see the last section).
2. Check it in default and Analyst, light and dark.

## Add a theme

Example: `contrast`.

1. Add its colours at the end of `src/index.css`. Only list what differs from the default
   theme:
   ```css
   :root[data-theme="contrast"]      { --background: oklch(1 0 0); --primary: oklch(0.3 0.1 250); }
   :root[data-theme="contrast"].dark { --background: oklch(0 0 0); --primary: oklch(0.8 0.1 250); }
   ```
2. Add `'contrast'` to `THEME_FAMILIES` in `src/shared/hooks/useTheme.ts`.
3. Add its label in `FAMILY_LABEL_KEY` (`src/app/layout/UserMenu.tsx`) and in
   `src/locales/en/common.json` and `src/locales/ar/common.json`. The typecheck fails until
   you do.

It now appears in the account menu.

## Regenerate from the source app

1. In the source app: `node design-system-export/scripts/generate-tokens.mjs .`
2. Copy `css/*.css`, `tokens.json` and `tokens.ts` from the new export into this folder.
