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

## One client-state library: Zustand (decided Oct 21, 2026)

Chosen after reviewing every state holder in the source app: the
investigation board, analyst workspace, map analysis, assistant dock, intake tabs and drafts.
Server data is the bulk and belongs to TanStack Query; what is left is browser-only,
fast-changing and often needs to survive a reload — which is what Zustand + IndexedDB do.

- **Zustand is the only library for global client state, in every feature.** Do not
  install or import Redux / Redux Toolkit / RTK Query, `react-redux`, Jotai, Recoil, MobX,
  Valtio or XState. `npm run lint` fails on these imports (`OTHER_STATE_LIBRARIES` in
  `eslint.config.js`).
- **A real reason for another library means asking the user first.** Explain what Zustand
  cannot do and why, then wait for a decision. Never install it, loosen the lint rule, or
  work around it on your own judgement.
- **Every feature uses the same shape**: `features/<x>/model/<x>Store.ts`, exporting
  `use<X>Store`. Don't invent a different pattern per feature.
- **Zustand is not a server cache.** Store ids and UI state, never a fetched entity —
  that stays in the query cache.
- **Persist the same way everywhere**: `persist` + `createIndexedDbStorage()`, with a
  `version` and `migrate`. No new `localStorage` / `sessionStorage` code for app state
  (theme and language keys are the exception: tiny and read before first paint).
- **Canvas libraries read the store imperatively** (`useXStore.getState()` /
  `.subscribe()` inside the wrapper's effect) so a selection or hover never re-renders React.
- **Never store per-frame values** (map viewport, graph camera while dragging). Write them
  to the store or URL when the gesture ends.
- **Cap undo/redo history** at a fixed number of frames.
- `useReducer` stays valid for one page's own state machine; Context stays valid for
  theme, locale and user. Neither is a reason to add a library.

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
