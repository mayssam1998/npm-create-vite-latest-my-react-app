# Architecture — folders and module boundaries

Organise by **feature**, not by file type. A `components/` folder holding 300 components
is the single most common reason large React apps become unmaintainable.

```
src/
  app/                  # router, providers, layout shell, i18n setup, auth bootstrap
  shared/               # anything used by 2+ features
    ui/                 # design-system components: Button, Badge, Dialog, DataTable
    lib/                # api client, query client, date/format helpers, cn()
    hooks/              # generic hooks: useDebounce, useMediaQuery, useUrlState
    types/              # cross-domain types only
  features/
    cases/
      api/              # queries + mutations for this domain only
      components/       # components only this feature uses
      hooks/            # hooks only this feature uses
      model/            # types, zod schemas, enums, pure logic
      pages/            # route entry points
      index.ts          # the feature public API — the ONLY import path from outside
    entities/
    graph/
    map/
    workflows/
    search/
```

## The four import rules

1. `shared/` never imports from `features/`. Ever.
2. A feature imports another feature **only through its `index.ts`**, never a deep path.
   `import { CaseBadge } from '@/features/cases'` is fine;
   `import { CaseBadge } from '@/features/cases/components/CaseBadge'` is not.
3. If two features need the same thing, it moves to `shared/`. Do not import sideways to
   avoid the move.
4. `app/` may import anything. Nothing imports `app/`.

## Enforcement

**`eslint-plugin-boundaries`** (decided Oct 15, 2026), configured in `eslint.config.js` and
run by `npm run lint`. **A boundary that is not enforced by a tool is a boundary that lasts
about four weeks.**

Chosen over `eslint-plugin-import` restricted zones because that plugin does not support
ESLint 10, and because `boundaries` knows what a feature is: "another feature only through
its `index.ts`" is one policy, not one zone per pair of the sixteen modules. Imports are
resolved through `tsconfig.app.json` (`eslint-import-resolver-typescript`), so `@/…` aliases
and relative paths are checked alike. Both are dev-only; nothing reaches the bundle.

What the config enforces (default is **disallow** — an import needs a policy to pass):

| From | May import |
|---|---|
| `src/main.tsx` | `app/`, `src/*.css` |
| `app/` | anything — including deep `features/*/pages/*` imports for lazy routes |
| `shared/` | `shared/` only (rule 1) |
| `features/<x>/` | `shared/`, anything in `features/<x>/`, another feature's `index.ts` only (rule 2) |
| `mocks/` | `mocks/`, `shared/` |

Nothing but `app/` imports `app/` (rule 4) and nothing but `app/` imports `mocks/`. Also
enforced: `components/`, `pages/` and `hooks/` never import `api/*.api.ts` (layer 3 only —
`api-layer.md`); `*.api.ts` imports no React; features never import `radix-ui`
(`overlays.md`); only `shared/lib/apiClient.ts` uses `fetch`. A file under `src/` outside
every element is an error (`boundaries/no-unknown-files`) — a new top-level folder must be
added to the config deliberately.

Feedback loops: the VS Code ESLint extension (recommended in `.vscode/extensions.json`)
shows violations as you edit; `.githooks/pre-commit` runs `npm run lint` and aborts the
commit on failure. `npm install` activates the hook via the `prepare` script
(`core.hooksPath`). `git commit --no-verify` bypasses it, so a CI lint step is still needed.

Rule 3 ("move it to `shared/`") is a judgement call no tool can make; it stays a review rule.

The `@/*` path alias resolves to `src/*` in both `tsconfig.app.json` and `vite.config.ts`.

## Router

**React Router v7** (`react-router`, decided Oct 13, 2026). Routes live in
`app/router/router.tsx`; lazy page components and their chunk loaders live in
`app/router/lazyPages.ts`, so the sidebar can prefetch the same chunk on hover. Each route
has its own `errorElement`. URL state goes through `shared/hooks/useUrlState`, built on
`useSearchParams`.

## Sixteen modules

The sidebar carries sixteen modules including Link Analysis, Map Analysis and ETL.
Route-level code splitting is therefore not optional — it is the only way first paint
stays fast. Every feature registers exactly one lazy route. See `performance.md`.

## Suggested order of work

Build `shared/ui` primitives and the API client first, then the Case Management table end
to end, then the Create Case form and intake tabs. Those three produce real examples for
the four most important skills, after which most of the app is repetition.
