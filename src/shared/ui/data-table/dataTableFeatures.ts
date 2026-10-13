import {
  columnSizingFeature,
  rowExpandingFeature,
  rowSortingFeature,
  tableFeatures,
  type CellContext,
  type ColumnDef,
  type Row,
  type RowData,
} from '@tanstack/react-table';

/**
 * The feature set every DataTable registers. Sorting is server-side (manualSorting),
 * so no client sorted-row model is registered. Expansion renders a custom detail row.
 * Module scope: features must be a stable reference.
 */
export const dataTableFeatures = tableFeatures({
  columnSizingFeature,
  rowSortingFeature,
  rowExpandingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/**
 * A column for the shared DataTable. `header` is a translation key (`cases:table.status`),
 * resolved by DataTable. Every column needs an `id`. Give a column an accessor only when it is
 * sortable. Omit `size` on the one column that should absorb the remaining width.
 */
export type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

/** Props of a cell renderer — cell renderers are small named components. */
export type DataTableCellProps<TData extends RowData> = CellContext<DataTableFeatures, TData>;

export type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>;
