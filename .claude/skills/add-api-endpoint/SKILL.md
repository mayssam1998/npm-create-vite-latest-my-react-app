---
name: add-api-endpoint
description: Add a server call to a feature as the three required layers plus a query-key factory entry. Use whenever work involves a fetch, an endpoint, a query, a mutation, loading data from the server, or invalidating the cache. Produces the .api.ts function, the .queries.ts hook, Zod validation and AbortSignal cancellation.
---

# Add an API endpoint

> Written from the architecture document before the first real endpoint existed. The first
> time you build one for real, replace the example below with that code.

Rules: `.claude/rules/api-layer.md`. Components import **layer 3 only**.

## Steps

1. **Types and schema** — add or extend the Zod schema in
   `features/<domain>/model/<entity>.ts` and derive the type with `z.infer`. Never
   hand-write a type that a schema already describes.
2. **Key factory** — add the entry to `features/<domain>/api/<domain>Keys.ts`. Create the
   factory if it does not exist. Never write a query key inline.
3. **Layer 2** — a plain async function in `features/<domain>/api/<entity>.api.ts`. No
   React. It takes `{ signal }` and forwards it. It parses the response with the schema.
4. **Layer 3** — the `useQuery` / `useMutation` hook in
   `features/<domain>/api/<entity>.queries.ts`. Pick `staleTime` deliberately.
5. **Export** — re-export the layer-3 hook from the feature's `index.ts` only if another
   feature needs it.
6. **Check** — no `try/catch` in a component, no `fetch` outside `apiClient`, mutation
   invalidates rather than rewriting the cache.

## Template

```ts
// features/cases/model/case.ts
export const caseSchema = z.object({
  id: z.string(),
  number: z.string(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']),
});
export type Case = z.infer<typeof caseSchema>;

export const caseListSchema = z.object({
  items: z.array(caseSchema),
  total: z.number(),
});
```

```ts
// features/cases/api/caseKeys.ts
export const caseKeys = {
  all: ['cases'] as const,
  list: (filters: CaseFilters) => [...caseKeys.all, 'list', filters] as const,
  detail: (id: string) => [...caseKeys.all, 'detail', id] as const,
};
```

```ts
// features/cases/api/case.api.ts  — no React in this file
import { apiClient } from '@/shared/lib/apiClient';
import { caseListSchema, caseSchema } from '../model/case';
import type { CaseFilters } from '../model/caseFilters';

export async function fetchCases(filters: CaseFilters, signal?: AbortSignal) {
  const data = await apiClient.get('/cases', { params: filters, signal });
  return caseListSchema.parse(data);
}

export async function createCase(input: CreateCaseInput, signal?: AbortSignal) {
  const data = await apiClient.post('/cases', input, { signal });
  return caseSchema.parse(data);
}
```

```ts
// features/cases/api/case.queries.ts — the only layer components import
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCase, fetchCases } from './case.api';
import { caseKeys } from './caseKeys';

export function useCases(filters: CaseFilters) {
  return useQuery({
    queryKey: caseKeys.list(filters),
    queryFn: ({ signal }) => fetchCases(filters, signal),
    placeholderData: keepPreviousData, // paginated table must not flash empty
    staleTime: 10_000,                 // a case list is seconds
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCaseInput) => createCase(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  });
}
```

## staleTime guidance

| Data | staleTime |
|---|---|
| Reference data — sections, case types, tags | minutes |
| A list that changes with user action — cases | seconds |
| Detail opened from a list | seconds, with the list row as `placeholderData` |

## Do not

- Write a query key inline, anywhere.
- Call `fetch` outside `shared/lib/apiClient.ts`.
- Drop `signal` — search and filter changes depend on cancellation.
- Rewrite the cache by hand in `onSuccess` unless you are deliberately doing an optimistic
  update.
- Put a `try/catch` in a component. Errors go to the shared error boundary and a toast.

The client is native `fetch` (`src/shared/lib/apiClient.ts`). Still open: the real
endpoint/pagination shape — see `.claude/rules/open-questions.md`.
