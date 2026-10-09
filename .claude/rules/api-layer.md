# Server data and the API layer

## Three layers, no shortcuts

1. `shared/lib/apiClient.ts` — one configured fetch/axios instance. Base URL, auth header,
   error normalisation, `AbortSignal` support. **Nothing else in the app calls `fetch`
   directly.** (fetch vs axios is open — see `open-questions.md`.)
2. `features/<domain>/api/*.api.ts` — plain async functions that call the client and
   return typed data. **No React in these files.**
3. `features/<domain>/api/*.queries.ts` — the `useQuery` / `useMutation` hooks that
   components actually import.

Components import **only layer 3**. This is what lets you test layer 2 without React and
swap the transport without touching a component.

## Query keys come from a factory, never written inline

```ts
export const caseKeys = {
  all: ['cases'] as const,
  list: (filters: CaseFilters) => [...caseKeys.all, 'list', filters] as const,
  detail: (id: string) => [...caseKeys.all, 'detail', id] as const,
};
```

Inline keys are how cache invalidation silently stops working. With a factory,
`invalidateQueries({ queryKey: caseKeys.all })` refreshes every case view at once.

## Rules

- Every query function receives and forwards `signal` so TanStack Query can cancel
  in-flight requests. This matters on every keystroke in search and every filter change.
- Validate server responses with Zod at the boundary for anything complex. Do not trust
  the type annotation alone.
- Set `staleTime` per data type, deliberately. Reference data (sections, case types, tags)
  can be minutes. A case list is seconds.
- Use `placeholderData: keepPreviousData` on paginated tables so the table does not flash
  empty between pages.
- Mutations **invalidate**; they do not manually rewrite the cache, unless you specifically
  want an optimistic update.
- Errors are handled in one place: a shared error boundary plus a toast from the mutation.
  **Do not write `try/catch` in components.**
- Overlay content that fetches mounts its query only when the overlay opens.

Recipe: the `add-api-endpoint` skill.
