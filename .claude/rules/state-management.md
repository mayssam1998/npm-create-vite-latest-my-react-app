# State management — the decision ladder

Most state bugs in large React apps come from putting state one level too high. Work down
this list and stop at the first row that fits. **Never skip ahead.**

| If the state is… | Use | Example in InSightX |
|---|---|---|
| Data that lives on the server | TanStack Query — never copy it into `useState` | Case list, case detail, entity search results |
| Something a user should be able to share or bookmark | The URL (search params) | Table filters, sort, page, active quick-tab, open case id |
| Used by one component only | `useState` | Dropdown open, hovered row |
| Several related values that change together with clear actions | `useReducer` | Graph viewport mode, multi-step selection |
| Rarely-changing, app-wide, read by many | Context | Theme, language, current user, permissions |
| Frequently-changing and shared across unrelated features | Zustand | Open intake tabs, active workspace, graph selection shared with a side panel |
| Form field values | react-hook-form — not `useState` | Create Case form |

## One rule above all

**Server data has exactly one owner: the query cache.** Do not mirror a fetched case into
`useState` so you can edit it. Use a form for the draft copy and a mutation to write it back.

## Why no Redux

Redux Toolkit is a fine library, but in this app almost everything people call "global
state" is server state, and TanStack Query handles that far better — caching,
deduplication, background refresh, request cancellation. What is genuinely client-side and
global here is small: open tabs, selections, UI preferences. Zustand covers that in a few
lines with no boilerplate and no provider tree. Adding Redux on top would mean two caches
for the same data, which is the classic way these apps get slow and inconsistent.

## Context warning

Context is not a state manager. Every consumer re-renders when the value changes. Use it
for values that change rarely — theme, locale, user. If you find yourself putting a value
that changes on every keystroke into Context, that value belongs in Zustand or in local
state.

## Zustand conventions

- One store per concern, living in the owning feature `model/` directory.
- **Always subscribe with a selector**: `useDraftsStore(s => s.drafts[id])`, never
  `useDraftsStore()`. Selecting the whole store defeats the point of using Zustand.
- Never mutate — produce a new value, including in Immer-style updates.
- Persistence: IndexedDB for anything that can hold a lot of text or a file reference —
  Zustand `persist` with `createIndexedDbStorage()` from `shared/lib/indexedDbStorage.ts`
  (idb-keyval underneath, decided Oct 15, 2026). It stores structured clones, so `File`s
  persist. Use `skipHydration` and hydrate on demand (see `ensureDraftsHydrated`).
  See the `multi-tab-workspace` skill.

URL state is a first-class tier, not a fallback — see `tables-filters-search.md`.
