---
name: add-table-filters
description: Add URL-backed filters, quick-tab presets, sorting or an in-table search box to a list view. Use for filtering, searching within a table, sorting, filter dropdowns, shareable filtered links, or putting state in the URL. Produces the typed filter hook, the filter-bar components, debouncing and query-key wiring.
---

# Add filters and search to a table

> Written from the architecture document before `useCaseFilters` existed. Replace the
> example with that hook once it is built.

Rules: `.claude/rules/tables-filters-search.md`.

**Filter state lives in the URL, always.** An analyst sends a colleague a link to "all
urgent cases in the Cybercrime Bureau". That only works if the filters are query params —
and it buys back-button support and survivable refreshes for free.

## Steps

1. **Define the filter shape** in `features/<domain>/model/<domain>Filters.ts` as a Zod
   schema, with defaults. Parsing the URL through it is what makes the hook typed.
2. **One hook per table**: `features/<domain>/hooks/use<Domain>Filters.ts`, built on
   `shared/hooks/useUrlState`. It reads and writes the URL and returns typed values plus
   setters. It is the **single input to the query key**.
3. **Quick tabs are presets** — *Needs you* / *Overdue* / *All cases* set the same filter
   fields. Not a separate mechanism, not a separate feature.
4. **Counts come from the server in one call** — never three list queries to fill three
   tab badges.
5. **In-table search** is a filter field like any other: in the URL, debounced 300 ms via
   `useDebouncedValue`, feeding the same list query.
6. **Reset** clears to defaults, which means clearing the params, not writing default
   values into the URL.

## Template

```ts
// features/cases/model/caseFilters.ts
export const caseFiltersSchema = z.object({
  q: z.string().default(''),
  status: z.array(z.string()).default([]),
  priority: z.array(z.string()).default([]),
  sectionId: z.array(z.string()).default([]),
  tab: z.enum(['needsYou', 'overdue', 'all']).default('all'),
  sort: z.string().default('-updatedAt'),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(50),
});
export type CaseFilters = z.infer<typeof caseFiltersSchema>;
```

```ts
// features/cases/hooks/useCaseFilters.ts
export function useCaseFilters() {
  const [raw, setRaw] = useUrlState();
  const filters = caseFiltersSchema.parse(raw);

  // debounce the VALUE; TanStack Query cancels the superseded request via signal
  const debouncedQ = useDebouncedValue(filters.q, 300);

  function setFilters(patch: Partial<CaseFilters>) {
    setRaw({ ...patch, page: patch.page ?? 1 }); // any filter change resets the page
  }

  function resetFilters() {
    setRaw({});
  }

  return {
    filters,
    queryFilters: { ...filters, q: debouncedQ }, // what the query key is built from
    setFilters,
    resetFilters,
  };
}
```

```tsx
// features/cases/components/case-table/CaseFilterBar.tsx
export function CaseFilterBar() {
  const { filters, setFilters, resetFilters } = useCaseFilters();
  const { data: counts } = useCaseCounts(filters);   // ONE server call for all tabs

  return (
    <div className="flex flex-wrap items-center gap-2">
      <QuickTabs
        value={filters.tab}
        counts={counts}
        onChange={(tab) => setFilters({ tab })}
      />
      <SearchInput value={filters.q} onChange={(q) => setFilters({ q })} />
      <MultiSelectFilter
        label="cases.filters.status"
        value={filters.status}
        onChange={(status) => setFilters({ status })}
      />
      <Button variant="ghost" onClick={resetFilters}>cases.filters.reset</Button>
    </div>
  );
}
```

## The three kinds of search must not share code

| Kind | Where | How |
|---|---|---|
| Global (⌘K) | Header | Own route/dialog, debounced 300 ms, cancellable, results grouped by type |
| In-table | Above the table | Filter state, in the URL, debounced 300 ms, feeds the list query |
| Local filter | Inside a dropdown or picker | Plain client-side `filter()`, no debounce |

## Do not

- Keep filter state in `useState` or Zustand. It goes in the URL.
- Debounce with `setTimeout` inside a `useEffect`. Debounce the value.
- Fire one list query per quick tab to get its count.
- Forget to reset `page` when a filter changes.
- Build a second filter hook for the same table.

`useUrlState` exists in `src/shared/hooks/useUrlState.ts` (React Router v7). The real hook is
`src/features/cases/hooks/useCaseFilters.ts`.
