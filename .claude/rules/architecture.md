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

Rules 1 and 2 are enforced in CI with `eslint-plugin-boundaries` or
`eslint-plugin-import` restricted zones (choice open — see `open-questions.md`).
**A boundary that is not enforced by a tool is a boundary that lasts about four weeks.**

The `@/*` path alias must resolve to `src/*` in both `tsconfig.app.json` and
`vite.config.ts`. Neither is configured yet.

## Sixteen modules

The sidebar carries sixteen modules including Link Analysis, Map Analysis and ETL.
Route-level code splitting is therefore not optional — it is the only way first paint
stays fast. Every feature registers exactly one lazy route. See `performance.md`.

## Suggested order of work

Build `shared/ui` primitives and the API client first, then the Case Management table end
to end, then the Create Case form and intake tabs. Those three produce real examples for
the four most important skills, after which most of the app is repetition.
