# InSightX V3 — Frontend

Source of truth: *InSightX V3 — Frontend Architecture & React Rules* (Oct 8, 2026).
This file is always loaded and deliberately short. Longer reference lives in
`.claude/rules/` — read the relevant file before non-trivial work. Step-by-step
recipes live in `.claude/skills/`. Anything not yet decided is in
`.claude/rules/open-questions.md`; never silently resolve one of those.

## Stack (target — most of it is not installed yet)

React 19 with the React Compiler ON · TypeScript strict · Vite · Tailwind v4 · Radix ·
Lucide · TanStack Query / Table / Virtual · react-hook-form + Zod + `@hookform/resolvers` ·
Zustand · cva + clsx + tailwind-merge · i18next · MapLibre + deck.gl · D3 modules ·
Vitest + Testing Library + Playwright.

No Redux. No CSS Modules, styled-components or Emotion. No new library without a note
saying why.

**Keep it light.** This app carries heavy maps and graphs, so before adding any
dependency check whether existing libraries (e.g. Radix for toasts, dialogs, tooltips,
dropdowns) or native React/browser APIs do the job. Never add a library just for
convenience. If one is truly needed, pick the lightest and justify it briefly — see
"Lightweight dependencies" in `.claude/rules/performance.md`.

## Import direction — enforced by `npm run lint` (`eslint-plugin-boundaries`)

1. `shared/` never imports from `features/`. Ever.
2. A feature imports another feature **only through its `index.ts`**, never a deep path.
3. If two features need the same thing it moves to `shared/`. Never import sideways to
   avoid the move.
4. `app/` may import anything. Nothing imports `app/`.

A lint error here means move the code, never loosen `eslint.config.js`.

Layout: `src/app/` · `src/shared/{ui,lib,hooks,types}/` ·
`src/features/<domain>/{api,components,hooks,model,pages}/ + index.ts`.
Details: `.claude/rules/architecture.md`.

## Naming

| Thing | Rule | Example |
|---|---|---|
| Component | PascalCase, file matches the component | `CaseTable.tsx` |
| Hook | `useX`, camelCase file | `useCaseFilters.ts` |
| Other `.ts` | camelCase file | `formatCaseNumber.ts` |
| Folder | kebab-case | `case-intake/` |
| Callback prop | starts with `on` | `onRowSelect` |
| Handler in a component | `handleX` (confirmed Oct 15, 2026) — never also `onX` | `handleStatusChange` |
| Boolean prop / state | `is` `has` `can` `should` | `isLoading`, `canEdit` |
| Type / interface | PascalCase, no `I` prefix | `Case`, `CaseFilters` |
| Zod schema | `xSchema` | `createCaseSchema` |
| Constants | SCREAMING_SNAKE | `MAX_GRAPH_NODES` |
| Query key factory | `xKeys` | `caseKeys.list(filters)` |

## Components

- Keep logic out of JSX. Any calculation, data shaping, or condition longer than one
  ternary happens above the `return` or in a hook.
- Pass handlers by reference: `onClick={handleOpen}`, not `handleOpen()`. Wrap in an
  arrow only to pass an argument — and avoid even that in virtualised rows.
- Split container from presentation wherever a component has **both** a data source and
  real markup. Not everywhere.
- One exported component per file; small private sub-components in the same file are fine.
- Props interface above the component, named `<Component>Props`.
- No default exports except lazy-loaded route pages.
- Under ~200 lines. Past that, extract a sub-component or a hook.
- Never spread unknown props (`{...props}`) onto DOM elements outside `shared/ui`.
- Early-return loading and error states; don't nest the tree in a conditional.
- State updates that depend on the old value use the updater form:
  `setSelectedIds(prev => [...prev, id])`. Never mutate — in state or in a store.

## State — stop at the first row that fits

| If the state is… | Use |
|---|---|
| Data that lives on the server | **TanStack Query** — never copy it into `useState` |
| Shareable / bookmarkable | **The URL** (search params) — filters, sort, page, open id |
| Used by one component | `useState` |
| Several values that change together with clear actions | `useReducer` |
| Rarely-changing, app-wide, read by many | **Context** — theme, locale, user, permissions |
| Frequently-changing, shared across unrelated features | **Zustand** (selectors, always) |
| Form field values | **react-hook-form** — never `useState` per field |

**Above all: server data has exactly one owner, the query cache.** Don't mirror a fetched
entity into `useState` to edit it — use a form for the draft and a mutation to write back.
Context is not a state manager; every consumer re-renders.

## useEffect is a last resort

Legitimate: creating/destroying a Sigma, MapLibre or deck.gl instance · subscribing to a
WebSocket/SSE · `window`/`document` listeners · driving a non-React library imperatively
when a prop changes · setting up an observer. **Every setup returns a cleanup.**

Everything else: fetching → `useQuery`. Deriving a value → compute it during render.
Resetting state on a prop change → give the component a `key`. Syncing two states →
delete one. Reacting to a click → the event handler. Toast after a mutation → `onSuccess`.

## Always

- **No hardcoded user-facing strings** — everything through `t()`, structured keys
  (`cases.table.emptyState`), ICU plurals for counts, one namespace per feature.
- **Logical CSS properties only** — `ms-` `me-` `ps-` `pe-` `start-` `end-`, never
  `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`. Canvas containers stay `dir="ltr"`.
- **No raw colours** — tokens from `@theme` only. Status/priority/entity colours come
  from a mapping function, never conditionals in JSX. `cva` for variants, `cn()` for
  conditional classes, no arbitrary values (`w-[437px]`, `text-[#2A5C3F]`).
- **Dates, numbers and relative times go through `Intl`**, centralised in
  `shared/lib/format.ts`.
- **Check `shared/hooks` before writing a utility hook.**
- **Every route is lazy.** No heavy library (graph, map, PDF.js, D3) in the entry chunk.
- **React Compiler is on** — don't hand-write `useMemo`/`useCallback`/`React.memo` except
  for genuinely expensive work, values passed to non-React libraries, costly effect deps,
  context values, and rows rendered in the hundreds.
- **Errors in one place**: a shared error boundary plus a toast from the mutation. No
  `try/catch` in components.

## Definition of done — run this before saying a task is finished

1. Types strict, no `any`
2. Loading, empty and error states all exist
3. Keyboard accessible, focus visible
4. Works in Arabic/RTL and in dark mode
5. No new library added without a note saying why
6. Lists over 100 rows virtualised
7. Strings translated

## Reference

`.claude/rules/`: architecture · state-management · api-layer · tables-filters-search ·
forms · overlays · styling · i18n-rtl · performance · heavy-visual-modules · hooks ·
testing · open-questions.

When you are corrected twice on the same thing, that correction belongs here or in a
skill. After a feature lands, run the `review-project-instructions` skill to check what
in these files has gone stale.

## Design rules (O.P.H.I.S)

Appended from `design-system-export/DESIGN-RULES.md` (Oct 20, 2026). Paths are adapted to
this repo: the export lives in `src/shared/design-system/` (not `src/shared/design-system/`),
`<Ltr>` is `src/shared/ui/Ltr.tsx`, and `cn()` is `src/shared/lib/cn.ts`. Every value lives
in `src/shared/design-system/`; this section says how to use it.

### Tokens

- Every colour is an oklch CSS variable from `src/shared/design-system/css/tokens.css`. Never write a hex, rgb or oklch literal in a component. Use the Tailwind utility (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-status-open-soft text-status-open`) or `var(--token)`.
- Exception: canvas, WebGL and map APIs that cannot read CSS. Read the live value with `readToken("--board-edge")` from `src/shared/design-system/tokens.ts`, never a copied literal. The `--board-*` tokens are hex because the WebGL renderer parses them.
- Tokens with no Tailwind utility (`--map-id-1…6`, `--brand-green`, `--brand-gold`, `--shadow-elegant`, `--shadow-hover`, `--board-*`) are used through `var()`, e.g. `bg-[var(--map-id-1)]`. Don't add them to `@theme inline` unless asked.
- Don't edit `css/tokens.css`, `css/tailwind-theme.css`, `tokens.json` or `tokens.ts` by hand. They're generated from the source app.
- To add a semantic colour: give it a light value in `:root` and a dark value in `.dark`, then register `--color-<name>: var(--<name>)` in `@theme inline`.

### Themes

- Light is the default. Dark is `class="dark"` on `<html>`. The Analyst family is `data-theme="analyst"` on `<html>` and combines with `.dark`.
- Read the theme from `localStorage` in an effect, never during render (SSR safety). Keys used by the source app: `cm:theme` (`light | dark`) and `cm:theme-family` (`analyst`).
- Status, priority, tag, entity, event and reference colours are semantic token families (`status-*`, `priority-*`, `tag-*`, `entity-*`, `ev-*`, `ref-*`, `certainty-*`, `vip*`) with values in every theme. A chip is `bg-<family>-soft text-<family>`. A dot or flag is `bg-<family>` or `text-<family>`.
- Case status mapping used by the source app: draft → `status-draft`, pending signature (in/out) → `status-review`, open → `status-open`, in progress → `status-progress`, in review → `status-ack`, done → `status-done`, archived → `status-closed`. Tags: `neutral | sand | sage | slate | clay` as `bg-tag-x text-tag-x-fg`. Priority: `text-priority-low|normal|high|urgent`.
- Gold (`vip`, `--brand-gold`) means VIP. Red (`destructive`, `ev-alert`, `priority-urgent`) means danger or urgency. Amber (`certainty-probable`) means "probable". Don't reuse these colours for other meanings.

### Look

- Dense and restrained: no gradients, and no shadows outside popovers and dropdowns. Use one accent colour (`primary`), 1px borders instead of filled blocks, no card wrapped around a table, and 56px (`h-14`) table rows that still fit Arabic text.
- Radius scale: `rounded-sm` / `md` / `lg` / `xl` / `2xl` / `3xl` / `4xl`, all derived from `--radius` (0.625rem default, 0.5rem in Analyst). Use `rounded-md` or `rounded-lg` for most surfaces.
- Spacing is Tailwind's default scale (`--spacing: 0.25rem`). There are no custom spacing tokens.
- Glow, blur, grid and scanlines (`.ophis-stage`, `.ophis-glass`) are allowed on the login screen only.
- Dense scroll panes use the `scroll-thin` utility.
- Mixing a token with a surface: `color-mix(in oklab, …)`, never `in oklch`. The oklch interpolation shifts the hue toward blue.

### Typography

- Sans: `Inter, "Noto Sans Arabic", "Segoe UI", system-ui, -apple-system, sans-serif`, loaded from Google Fonts (link in the README). Mono: IBM Plex Mono, self-hosted.
- The Analyst family switches to IBM Plex Sans / IBM Plex Sans Arabic, caps `font-semibold` and `font-bold` at 500, and sets IDs, refs, dates and counts in mono through `[data-ltr]`.

### RTL (Arabic)

- Use logical utilities only: `ps-/pe-/ms-/me-/start-/end-/text-start`. Never `left/right/ml/mr/pl/pr`.
- Mirror chevrons and sort arrows (`rtl:rotate-180`, `rtl:-scale-x-100`). Never mirror status dots, priority flags, avatars or entity icons.
- Wrap IDs, refs, dates, phone numbers and counts in `<Ltr>` (`src/shared/ui/Ltr.tsx`).
- `<html lang dir>` follows the language: Arabic implies `dir="rtl"`. Wrap the app in Radix `DirectionProvider` so Radix primitives mirror.

### Components

- Icons from `lucide-react`. In this repo primitives are **not** shadcn: they are Radix
  wrapped once in `src/shared/ui/` (see `overlays.md`), styled only through tokens, using the
  shadcn token names (`bg-popover` on floating surfaces, `bg-accent` for hover/selected,
  `bg-card`, `text-muted-foreground`, `border-input`).
- Compose classes with `cn()` from `@/shared/lib/cn` (clsx + tailwind-merge).
