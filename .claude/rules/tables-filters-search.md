# Tables, filters and search

## Tables

Build **one** `DataTable` in `shared/ui/data-table/`, on TanStack Table, and never build a
second one. The Case Management table, the entity lists, the watchlist tables and the CDR
tables are all the same component with different column definitions.

**The shared `DataTable` owns:** header rendering, sorting UI, row selection, row expansion
(the chevron), empty state, loading skeleton, pagination footer, column visibility, sticky
header, and virtualisation.

**Each feature provides:** a `columns.tsx` file and a query hook. That is all.

Rules:

- Column definitions live in their own file, e.g.
  `features/cases/components/case-table/columns.tsx`. They are data, not JSX inside a
  component.
- Sorting, filtering and pagination are **server-side by default** (`manualSorting`,
  `manualFiltering`, `manualPagination`). Client-side only for lists you know are under
  ~500 rows.
- Turn on TanStack Virtual whenever a table can exceed 100 visible rows.
- `getRowId` must return the real entity id, **never the array index**.
- Cell renderers are small named components, not inline arrow functions returning JSX.

## Filters

**Filter state lives in the URL, always.** An analyst will send a colleague a link to "all
urgent cases in the Cybercrime Bureau" — that only works if the filters are in the query
string. It also gives back-button support and survivable refreshes for free.

- One hook per table: `useCaseFilters()` reads and writes the URL, returns typed values and
  setters, and is the **single input to the query key**.
- Quick-tabs (*Needs you* / *Overdue* / *All cases*) are just filter presets — same
  mechanism, not a separate feature.
- The counts next to those tabs (49 / 40 / 79) come from the server in **one call**, not
  from three separate list queries.

## Search — three different things that must not share code

| Kind | Where | How |
|---|---|---|
| Global search (⌘K) | Header | Its own route/dialog, debounced 300 ms, cancellable, grouped results by type |
| In-table search | Above the table | Part of the filter state, in the URL, debounced 300 ms, feeds the list query |
| Local filter | Inside a dropdown or picker | Plain client-side `filter()`, no debounce needed |

Debounce the **value**, not the request — use `useDebouncedValue` and let TanStack Query
cancel superseded requests via `signal`. **Never debounce with `setTimeout` inside a
`useEffect`.**

Recipes: the `add-data-table` and `add-table-filters` skills.
