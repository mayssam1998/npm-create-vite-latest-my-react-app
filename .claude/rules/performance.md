# Performance — memoisation and loading

## `useMemo` and `useCallback` in React 19

**The React Compiler is enabled in this repo** (`babel-plugin-react-compiler` via
`vite.config.ts`). It memoises components and values automatically, so mostly stop writing
them by hand. Hand-written `useMemo` and `useCallback` across a codebase this size add
noise, go stale, and are frequently wrong — missing deps, or deps that change every render
anyway.

Keep them in four cases only:

1. A genuinely expensive computation — graph metrics, parsing a large CDR file, building
   10,000 map features.
2. A value passed into a **non-React** library that compares by reference — deck.gl layer
   arrays, Sigma settings objects.
3. A value in a `useEffect` dependency array where re-running the effect is costly
   (recreating a map instance).
4. A context value, so consumers do not re-render on every parent render.

`React.memo` follows the same logic. Keep it for table rows and graph overlays where you
are rendering hundreds of instances.

## Code splitting and lazy loading

With sixteen sidebar modules the initial bundle must contain almost none of them.

- **Every route is lazy.** `React.lazy` + `<Suspense>` with a skeleton, defined in the
  router.
- **Every heavy library is behind a lazy route or a dynamic import**: Sigma/Cytoscape,
  MapLibre, deck.gl, PDF.js, React Flow, react-markdown, the D3 modules. None of these
  appear in the entry chunk.
- **Prefetch on intent** — start loading the Link Analysis chunk when the user hovers the
  sidebar item.
- **i18n namespaces load per module**, not all at once.

## Budgets to enforce in CI

| Budget | Limit |
|---|---|
| Initial JS (gzipped) | 250 KB |
| Any lazy route chunk | 400 KB |
| DOM rows rendered without virtualisation | 100 |
| Timeline markers before switching SVG → Canvas | 2,000 |

**Fail the build when a budget is exceeded** (`vite-plugin-bundle-visualizer` +
`size-limit`). A budget that only produces a warning is not a budget.

## Lightweight dependencies

This app carries maps, graphs and heavy visualisations, so every kilobyte and every
runtime cost competes with them. Before adding a dependency, work down this list:

1. **Can what we already have do it?** Existing libraries (Radix, TanStack, cva, Lucide,
   i18next, Zod) and native React/browser APIs (`Intl`, `fetch`, `AbortController`,
   `IntersectionObserver`, `ResizeObserver`, CSS) come first. Toasts, dialogs, tooltips,
   popovers and dropdowns are Radix primitives wrapped once in `shared/ui/` — customise
   those; never install a second UI kit for them.
2. **Is it only for convenience?** Then don't add it. A small local helper beats a
   dependency used in one place.
3. **Does the existing option genuinely fall short** on function, accessibility, design
   or performance? Only then evaluate alternatives, and recommend the lightest one that
   fits.

When evaluating a candidate, check: gzipped size, tree-shaking (ESM, `sideEffects`),
whether it can sit behind a lazy route or dynamic import, runtime cost, overlap with
something already installed, and its effect on the map/graph chunks and the budgets above.

If a dependency is justified, say so in the PR or reply in a few lines: why the existing
options are insufficient, and why this one is the best trade-off (size, alternatives
considered). That is the "note saying why" the definition of done requires.

Equally: no speculative abstractions, duplicated utilities or over-engineering — but
don't trade away readability or maintainability just to save lines. Check `shared/lib`
and `shared/hooks` before writing a helper.

## Other required practices

Skeletons instead of full-page spinners · `requestAnimationFrame` for animation ·
debounced inputs · **Web Workers for graph layout and CSV/CDR parsing** · IndexedDB for
saved workspaces.
