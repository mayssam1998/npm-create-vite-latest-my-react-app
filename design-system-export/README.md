# O.P.H.I.S design system export

This folder holds the design tokens and shared design configuration of the semantic-ui-kit (Lovable) app, ready to drop into another React project. It was generated from `src/styles.css` with the values copied verbatim. Nothing in the source app was changed.

## What's in it

| Path | What it is |
| --- | --- |
| `index.css` | The one entry point: Tailwind, `tw-animate-css` and the four files below, in order. |
| `css/tokens.css` | Every CSS custom property for the 4 themes (default light, default dark, Analyst light, Analyst dark). Plain CSS that works with or without Tailwind. |
| `css/tailwind-theme.css` | The Tailwind v4 bridge, copied verbatim: the `dark` variant, the `@theme inline` map (token → `bg-*`/`text-*`/`border-*`/`rounded-*`/`font-*` utilities), the `scroll-thin` utility and the base layer. |
| `css/fonts.css` | `@font-face` rules for IBM Plex Sans, Mono and Sans Arabic (self-hosted). |
| `css/extras.css` | Optional shared styles: login-stage effects and animations, the Analyst typography overlay, board print layout, empty-portrait hatch. |
| `tokens.json` | The same values as data: each theme fully resolved (183 variables in the default themes, 187 in Analyst), split into `ui` and `board`, plus typography, radius scale, the utility map and dependency versions. |
| `tokens.ts` | `tokens.json` as a typed `as const` object, plus `readToken(name)` to read a token's live value for canvas, chart or map code. |
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge), as shadcn expects it. |
| `components/ltr.tsx` | `<Ltr>`, the RTL-safe wrapper for IDs, dates and numbers. The Analyst mono layer hooks onto its `data-ltr` attribute. |
| `components.json` | The shadcn config (new-york, slate, CSS variables, lucide), with `tailwind.css` pointed at `src/design-system/index.css`. |
| `public/fonts/*.woff2` | The 6 self-hosted font files. |
| `public/brand/ophis-mark.png`, `public/favicon*` | The logo and favicons. |
| `DESIGN-RULES.md` | Usage rules to paste into the new project's `CLAUDE.md`, so Claude Code applies the tokens the same way. |
| `scripts/generate-tokens.mjs` | The generator. Re-run it in the source app whenever its `styles.css` changes. |

### The values are the resolved cascade

The source `styles.css` declares `:root` and `.dark` four times: the shadcn slate defaults, a "single accent" layer, the board tokens, and the O.P.H.I.S brand layer that overrides most surfaces. `css/tokens.css` holds the result of that cascade, which is what the app actually renders. For example, light `--primary` is the brand cedar green `oklch(0.4 0.09 152)`, not the shadcn navy that the file declares first. The generator re-parses its own output and checks that all four themes and the `@theme inline` map resolve to exactly the source's values, and that every source rule appears in the export (only the app-specific `@import "tailwindcss" source(none)` and `@source` lines are left out).

## Install in the new project

Requirements: React and Tailwind CSS **v4** (the bridge uses `@theme inline`, `@custom-variant` and `@utility`, which v3 does not have).

1. **Install the same packages** (the versions the source app's lockfile pins):

   ```sh
   npm i tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 tw-animate-css@1.4.0 \
         class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.6.0 \
         lucide-react@0.575.0 @radix-ui/react-direction@1.1.4
   ```

2. **Copy the files:**

   ```
   design-system-export/index.css, css/, tokens.json, tokens.ts  →  src/design-system/
   design-system-export/components/ltr.tsx                       →  src/design-system/components/ltr.tsx
   design-system-export/lib/utils.ts                             →  src/lib/utils.ts
   design-system-export/public/*                                 →  public/        (fonts must be served at /fonts/)
   design-system-export/components.json                          →  ./components.json
   ```

3. **Add the Tailwind plugin** (Vite):

   ```ts
   // vite.config.ts
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";
   import path from "node:path";

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: { alias: { "@": path.resolve(__dirname, "src") } },
   });
   ```

   Also add `"paths": { "@/*": ["./src/*"] }` (with `"baseUrl": "."`) to `tsconfig.json`, so the `@/lib/utils` imports and the shadcn aliases resolve.

4. **Import the CSS once**, in `src/main.tsx`:

   ```ts
   import "./design-system/index.css";
   ```

   `index.css` uses `@import "tailwindcss";`, which scans the whole project automatically. To limit scanning the way the source app does, change it to `@import "tailwindcss" source(none);` and add `@source "../";` pointing at your `src`.

5. **Load the default text fonts** in `index.html` `<head>` (the source app loads Inter and Noto Sans Arabic from Google Fonts, not self-hosted):

   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap" />
   <link rel="icon" href="/favicon.ico" sizes="any" />
   <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
   <link rel="apple-touch-icon" href="/favicon-192.png" />
   ```

6. **Switch themes on `<html>`**, the way the source app's `AppearanceProvider` does:

   ```ts
   const root = document.documentElement;
   root.classList.toggle("dark", theme === "dark");             // light is the default
   if (family === "analyst") root.dataset.theme = "analyst";    // optional second family
   else delete root.dataset.theme;
   root.lang = lang; root.dir = lang === "ar" ? "rtl" : "ltr";  // Arabic implies RTL
   ```

   Do this in an effect, never during render, if you server-render. Wrap the app in `<DirectionProvider dir={dir}>` from `@radix-ui/react-direction` so Radix primitives mirror in Arabic.

7. **Add shadcn primitives** as you need them: `npx shadcn@latest add button dialog …`. They read `components.json` and pick up the tokens with no changes.

8. **Paste `DESIGN-RULES.md` into the new project's `CLAUDE.md`.** That's what keeps Claude Code on the tokens instead of inventing colours.

## Using the tokens

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg" />
<span className="bg-status-open-soft text-status-open rounded-md px-2 text-xs">Open</span>
<span className="bg-tag-sage text-tag-sage-fg">…</span>
<i className="bg-[var(--map-id-2)]" />          {/* tokens without a utility */}
<div className="scroll-thin overflow-auto" />
<Ltr>CASE-2026-0042</Ltr>
```

```ts
import { tokens, readToken } from "@/design-system/tokens";
tokens.themes.defaultDark.ui["--primary"];   // "oklch(0.74 0.12 150)"
readToken("--board-edge");                   // the live value for the current theme (canvas/WebGL)
```

## Not included

- **The shadcn primitives' source** (`src/components/ui`). They are stock new-york plus a few tweaks (an 18px Checkbox with a minus glyph for `indeterminate`, a restyled Switch and RadioGroup), but several import the app's i18n layer (`UiText`, `useT`, `formatDate`), so they can't be copied as they are. Add stock ones with the shadcn CLI. The modernised three can be ported on request.
- **Feature components** (surface kit, status chips, tables). Their colour maps are described in `DESIGN-RULES.md`.

## Regenerate

In the source app, after `src/styles.css` changes:

```sh
node design-system-export/scripts/generate-tokens.mjs .
```

The script exits non-zero if any theme stops resolving to the source's values. Hand-written files (this README, `DESIGN-RULES.md`, `components/`, `components.json`, `scripts/`) are left alone.
