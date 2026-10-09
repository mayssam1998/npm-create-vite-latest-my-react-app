---
name: add-data-table
description: Add a table, list page or grid using the one shared DataTable. Use when building any list view, results table, watchlist or CDR table, or adding columns, row expansion, row selection or virtualisation. Produces columns.tsx, the query hook wiring, server-side paging and sorting, and empty/loading states.
---

# Add a data table

> Written from the architecture document before `CaseTable.tsx` existed. Replace the
> example with that file once it is built.

Rules: `.claude/rules/tables-filters-search.md`.

**There is exactly one `DataTable`, in `shared/ui/data-table/`. Never build a second one.**
If the table needs something `DataTable` cannot do, extend `DataTable` — do not fork it.

## Division of labour

| Owned by `shared/ui/data-table` | Provided by the feature |
|---|---|
| Header rendering, sorting UI, row selection, row expansion, empty state, loading skeleton, pagination footer, column visibility, sticky header, virtualisation | `columns.tsx` and a query hook |

## Steps

1. **Columns file** — `features/<domain>/components/<x>-table/columns.tsx`. Column defs are
   *data*, not JSX inside a component.
2. **Cell renderers** — small named components in the same folder. Never inline arrow
   functions returning JSX.
3. **Query hook** — from the feature's `api/*.queries.ts`, keyed on the filter object.
   See the `add-api-endpoint` skill.
4. **Wire the table** — `manualSorting`, `manualFiltering`, `manualPagination` on by
   default; `getRowId` returns the real entity id.
5. **Virtualise** if the table can exceed 100 visible rows.
6. **Check** — translated headers and empty state, RTL, keyboard navigation, loading and
   error states.

## Template

```tsx
// features/cases/components/case-table/columns.tsx
export const caseColumns: ColumnDef<Case>[] = [
  { id: 'select', header: SelectAllHeader, cell: SelectRowCell, size: 40 },
  {
    accessorKey: 'number',
    header: 'cases.table.number',          // a translation key, resolved by DataTable
    cell: CaseNumberCell,
    enableSorting: true,
  },
  { accessorKey: 'status', header: 'cases.table.status', cell: CaseStatusCell },
  { accessorKey: 'priority', header: 'cases.table.priority', cell: CasePriorityCell },
  { accessorKey: 'updatedAt', header: 'cases.table.updated', cell: RelativeDateCell },
  { id: 'actions', cell: CaseRowActionsCell, size: 48 },
];

// one small named component per cell — never an inline arrow
function CasePriorityCell({ row }: CellContext<Case, unknown>) {
  return <Badge tone={getPriorityTone(row.original.priority)}>
    {getPriorityLabel(row.original.priority)}
  </Badge>;
}
```

```tsx
// features/cases/components/case-table/CaseTable.tsx — container
export function CaseTable() {
  const { filters, setFilters } = useCaseFilters();        // URL-backed, see add-table-filters
  const { data, isLoading, isError } = useCases(filters);

  if (isError) return <ErrorState onRetry={...} />;

  return (
    <DataTable
      columns={caseColumns}
      data={data?.items ?? []}
      rowCount={data?.total ?? 0}
      getRowId={(row) => row.id}            // the real id, never the array index
      isLoading={isLoading}
      sorting={filters.sort}
      onSortingChange={(sort) => setFilters({ sort })}
      pagination={{ page: filters.page, pageSize: filters.pageSize }}
      onPaginationChange={(page) => setFilters(page)}
      isVirtualised
      emptyState={<EmptyState titleKey="cases.table.emptyState" />}
      renderExpandedRow={(row) => <CaseRowDetail caseId={row.id} />}
    />
  );
}
```

## Server-side vs client-side

Server-side by default. Client-side sorting/filtering only for a list you *know* stays
under ~500 rows — a picker, a reference list. If it can grow, it is server-side.

## Do not

- Use the array index in `getRowId`. Row selection and expansion break on re-sort.
- Put column definitions inside the component file.
- Write an inline `cell: ({ row }) => <Badge ...>` renderer.
- Render more than 100 rows without virtualisation (it is a CI budget).
- Hardcode a header string — headers are translation keys.
- Build a second table component.
