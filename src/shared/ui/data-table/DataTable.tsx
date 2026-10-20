import { useRef, type AriaAttributes, type ReactNode } from 'react';
import { FlexRender, useTable, type RowData, type SortingState, type Updater } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pagination, type PaginationProps } from '../Pagination';
import { DataTableBody } from './DataTableBody';
import { dataTableFeatures, type DataTableColumnDef } from './dataTableFeatures';

interface DataTableProps<TData extends RowData> {
  /** Accessible name of the table. */
  label: string;
  /** Module-scope constant — a new array every render invalidates the column model. */
  columns: DataTableColumnDef<TData>[];
  /** Pass the query result directly, with a module-scope empty-array fallback. */
  data: TData[];
  /** Must return the real entity id, never the array index. */
  getRowId: (row: TData) => string;
  /** Server-side sorting: the caller owns the state (usually in the URL) and refetches. */
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  /** First load — no rows yet. Shows the skeleton. */
  isLoading: boolean;
  /** Background refetch while the previous page stays visible. */
  isFetching?: boolean;
  emptyState: ReactNode;
  /** Enables the expander column and renders the detail row for an expanded row. */
  renderExpandedRow?: (row: TData) => ReactNode;
  pagination?: Omit<PaginationProps, 'className'>;
}

/** Minimum width of the one column without a `size` (it absorbs the remaining space). */
const FLEXIBLE_COLUMN_MIN_WIDTH = 320;
const EXPANDER_COLUMN_WIDTH = 40;

const SORT_ICON = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown } as const;
const ARIA_SORT: Record<keyof typeof SORT_ICON, AriaAttributes['aria-sort']> = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
};

/**
 * The one table in the app. Features provide columns and a query hook; this owns header
 * rendering, sorting UI, row expansion, empty/loading states, pagination, the sticky header
 * and virtualisation (automatic above 100 rows).
 */
export function DataTable<TData extends RowData>({
  label,
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  isLoading,
  isFetching = false,
  emptyState,
  renderExpandedRow,
  pagination,
}: DataTableProps<TData>) {
  const { t } = useTranslation('common');
  const scrollRef = useRef<HTMLDivElement>(null);
  const canExpand = renderExpandedRow !== undefined;

  function handleSortingChange(updater: Updater<SortingState>) {
    onSortingChange(typeof updater === 'function' ? updater(sorting) : updater);
  }

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowId,
    state: { sorting },
    onSortingChange: handleSortingChange,
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
    getRowCanExpand: () => canExpand,
  });

  const headers = table.getHeaderGroups()[0]?.headers ?? [];
  const rows = table.getRowModel().rows;
  const columnCount = headers.length + (canExpand ? 1 : 0);
  // Widths come from the definitions as written: the table's merged columnDef carries a
  // default size for every column, which would hide the one flexible column.
  const declaredWidths = headers.map((header) => columns.find((column) => column.id === header.id)?.size);
  // Below this width the table scrolls horizontally instead of squeezing columns.
  const tableMinWidth = declaredWidths.reduce<number>(
    (sum, width) => sum + (width ?? FLEXIBLE_COLUMN_MIN_WIDTH),
    canExpand ? EXPANDER_COLUMN_WIDTH : 0,
  );

  const headerCells = headers.map((header) => {
    const headerDef = header.column.columnDef.header;
    const sortState: keyof typeof SORT_ICON = header.column.getIsSorted() || 'none';
    return {
      header,
      content: typeof headerDef === 'string' ? t(headerDef) : <FlexRender header={header} />,
      canSort: header.column.getCanSort(),
      sortState,
      SortIcon: SORT_ICON[sortState],
    };
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
      {isFetching && (
        <div role="status" className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-primary">
          <span className="sr-only">{t('table.refreshing')}</span>
        </div>
      )}
      <div ref={scrollRef} className="min-h-72 flex-1 overflow-auto">
        <table
          aria-label={label}
          aria-busy={isLoading || isFetching}
          className="w-full table-fixed border-separate border-spacing-0 text-sm"
          style={{ minWidth: tableMinWidth }}
        >
          <colgroup>
            {canExpand && <col style={{ width: EXPANDER_COLUMN_WIDTH }} />}
            {headers.map((header, index) => (
              <col key={header.id} style={{ width: declaredWidths[index] }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              {canExpand && (
                <th scope="col" className="border-b border-border">
                  <span className="sr-only">{t('table.expandColumn')}</span>
                </th>
              )}
              {headerCells.map(({ header, content, canSort, sortState, SortIcon }) => (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={canSort ? ARIA_SORT[sortState] : undefined}
                  className="border-b border-border px-3 py-2.5 text-start text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex items-center gap-1 rounded uppercase hover:text-foreground"
                    >
                      {content}
                      <SortIcon aria-hidden className="size-3.5" />
                    </button>
                  ) : (
                    content
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <DataTableBody
            rows={rows}
            columnCount={columnCount}
            expanded={table.state.expanded}
            isLoading={isLoading}
            emptyState={emptyState}
            renderExpandedRow={renderExpandedRow}
            scrollRef={scrollRef}
          />
        </table>
      </div>
      {pagination && <Pagination {...pagination} className="border-t border-border" />}
    </div>
  );
}
