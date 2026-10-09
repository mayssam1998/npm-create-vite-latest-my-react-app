---
name: new-feature-module
description: Scaffold a new feature module under src/features with its folders, public index.ts, lazy route registration and i18n namespace. Use when starting a new module, a new section of the app, or scaffolding a domain such as entities, graph, map, workflows or ETL.
---

# Scaffold a new feature module

> Written from the architecture document before the first module existed. Replace the route
> snippet with the real one once the router is chosen.

Rules: `.claude/rules/architecture.md`. The sidebar has sixteen modules, so **every feature
is one lazy route** — that is the only way first paint stays fast.

## Steps

1. **Create the folders** (omit any the feature genuinely does not need — do not create
   empty placeholders just to match the shape):

```
src/features/<domain>/
  api/          # *.api.ts + *.queries.ts + <domain>Keys.ts
  components/   # components only this feature uses
  hooks/        # hooks only this feature uses
  model/        # types, zod schemas, enums, pure logic
  pages/        # route entry points — default export, lazy loaded
  index.ts      # the ONLY import path from outside
```

2. **Write `index.ts` deliberately.** It is the feature's public API, not a barrel of
   everything. Export only what other features actually need today.
3. **Register the lazy route** in `app/router`. The page is the one place a default export
   is allowed.
4. **Create the i18n namespace** `src/locales/<lang>/<domain>.json`, loaded with the route —
   never merged into a single global file.
5. **Prefetch on intent** — the sidebar item starts loading the chunk on hover.
6. **Check the boundaries**: nothing in `shared/` imports this feature; this feature imports
   others only through their `index.ts`.

## Template

```ts
// src/features/graph/index.ts — the public API, kept small on purpose
export { GraphPage } from './pages/GraphPage';
export { useGraphSelection } from './hooks/useGraphSelection';
export type { GraphNode, GraphEdge } from './model/graph';
```

```tsx
// src/features/graph/pages/GraphPage.tsx
// default export ONLY because this is a lazy route page
export default function GraphPage() {
  const { t } = useTranslation('graph');
  return (
    <ErrorBoundary fallback={<RouteErrorState />}>
      <PageHeader title={t('page.title')} />
      <GraphCanvas />
    </ErrorBoundary>
  );
}
```

```tsx
// src/app/router/routes.tsx
const GraphPage = lazy(() => import('@/features/graph/pages/GraphPage'));

{
  path: '/graph',
  element: (
    <Suspense fallback={<RouteSkeleton />}>
      <GraphPage />
    </Suspense>
  ),
}
```

```tsx
// prefetch on intent — sidebar item
<SidebarLink
  to="/graph"
  onMouseEnter={() => import('@/features/graph/pages/GraphPage')}
/>
```

## Where things go

| Thing | Location |
|---|---|
| Used by this feature only | inside the feature |
| Used by two or more features | moves to `shared/` — never import sideways |
| Wraps a server call | `api/` as a query hook, not `hooks/` |
| Pure logic, enums, schemas | `model/` |

## Do not

- Import a feature by a deep path. `@/features/cases` only.
- Import anything from `features/` inside `shared/`.
- Import `app/` from anywhere.
- Export the whole feature from `index.ts` "just in case".
- Register a non-lazy route, or put a heavy library in the entry chunk.
- Add strings to a global translation file.

Router choice is still open — see `.claude/rules/open-questions.md`. The `@/*` alias also
has to be added to `tsconfig.app.json` and `vite.config.ts` before any of this resolves.
