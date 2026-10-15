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
| Handler in a component | `handleX` — never also `onX` | `handleStatusChange` |
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
