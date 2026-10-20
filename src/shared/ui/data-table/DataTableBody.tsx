import type { ReactNode, Ref, RefObject } from 'react';
import { FlexRender, type ExpandedState, type RowData } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '../Skeleton';
import type { DataTableRow as Row } from './dataTableFeatures';

/** Budget from performance.md: never render more DOM rows than this without virtualisation. */
const MAX_UNVIRTUALISED_ROWS = 100;
const ESTIMATED_ROW_HEIGHT = 44;
const VIRTUAL_OVERSCAN = 10;
const SKELETON_ROWS = 8;

interface DataTableBodyProps<TData extends RowData> {
  rows: Row<TData>[];
  /** Rendered column count, including the expander column. */
  columnCount: number;
  expanded: ExpandedState;
  isLoading: boolean;
  emptyState: ReactNode;
  renderExpandedRow?: (row: TData) => ReactNode;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function DataTableBody<TData extends RowData>({
  rows,
  columnCount,
  expanded,
  isLoading,
  emptyState,
  renderExpandedRow,
  scrollRef,
}: DataTableBodyProps<TData>) {
  if (isLoading) return <SkeletonRows columnCount={columnCount} />;

  if (rows.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={columnCount}>{emptyState}</td>
        </tr>
      </tbody>
    );
  }

  const rowProps = { columnCount, expanded, renderExpandedRow };

  if (rows.length > MAX_UNVIRTUALISED_ROWS) {
    return <VirtualRows rows={rows} scrollRef={scrollRef} {...rowProps} />;
  }

  return rows.map((row) => <DataTableRow key={row.id} row={row} {...rowProps} />);
}

interface RowRenderProps<TData extends RowData> {
  columnCount: number;
  expanded: ExpandedState;
  renderExpandedRow?: (row: TData) => ReactNode;
}

interface VirtualRowsProps<TData extends RowData> extends RowRenderProps<TData> {
  rows: Row<TData>[];
  scrollRef: RefObject<HTMLDivElement | null>;
}

function VirtualRows<TData extends RowData>({ rows, scrollRef, ...rowProps }: VirtualRowsProps<TData>) {
  // The virtualizer is a mutable instance read during render, so the React Compiler skips
  // memoising this component on purpose — the visible window must recompute on every scroll.
  // eslint-disable-next-line react-hooks/incompatible-library -- known and intended, see above
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getItemKey: (index) => rows[index].id,
    overscan: VIRTUAL_OVERSCAN,
  });

  const items = virtualizer.getVirtualItems();
  const paddingTop = items[0]?.start ?? 0;
  const paddingBottom = virtualizer.getTotalSize() - (items.at(-1)?.end ?? 0);

  return (
    <>
      {paddingTop > 0 && <SpacerRow height={paddingTop} columnCount={rowProps.columnCount} />}
      {items.map((item) => (
        <DataTableRow
          key={item.key}
          ref={virtualizer.measureElement}
          dataIndex={item.index}
          row={rows[item.index]}
          {...rowProps}
        />
      ))}
      {paddingBottom > 0 && <SpacerRow height={paddingBottom} columnCount={rowProps.columnCount} />}
    </>
  );
}

function SpacerRow({ height, columnCount }: { height: number; columnCount: number }) {
  return (
    <tbody aria-hidden>
      <tr style={{ height }}>
        <td colSpan={columnCount} />
      </tr>
    </tbody>
  );
}

interface DataTableRowProps<TData extends RowData> extends RowRenderProps<TData> {
  row: Row<TData>;
  ref?: Ref<HTMLTableSectionElement>;
  /** Index for the virtualizer's measurement. */
  dataIndex?: number;
}

/** One <tbody> per row, so a row and its detail row are measured together when virtualised. */
function DataTableRow<TData extends RowData>({
  row,
  columnCount,
  expanded,
  renderExpandedRow,
  ref,
  dataIndex,
}: DataTableRowProps<TData>) {
  const { t } = useTranslation('common');
  // Read from the `expanded` prop, not row.getIsExpanded(): a hidden builder read would let
  // the compiler serve a stale row when only the expansion state changes.
  const isExpanded = expanded === true || Boolean(expanded[row.id]);
  const detailsId = `${row.id}-details`;
  const ExpandIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <tbody ref={ref} data-index={dataIndex}>
      <tr className={cn('hover:bg-accent', isExpanded && 'bg-muted')}>
        {renderExpandedRow && (
          <td className="border-b border-border ps-2 align-middle">
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={isExpanded ? detailsId : undefined}
              aria-label={isExpanded ? t('table.collapseRow') : t('table.expandRow')}
              onClick={row.getToggleExpandedHandler()}
              className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ExpandIcon aria-hidden className="size-4 rtl:-scale-x-100" />
            </button>
          </td>
        )}
        {row.getAllCells().map((cell) => (
          <td key={cell.id} className="border-b border-border px-3 py-2.5 align-middle">
            <FlexRender cell={cell} />
          </td>
        ))}
      </tr>
      {isExpanded && renderExpandedRow && (
        <tr id={detailsId}>
          <td colSpan={columnCount} className="border-b border-border bg-muted p-0">
            {renderExpandedRow(row.original)}
          </td>
        </tr>
      )}
    </tbody>
  );
}

function SkeletonRows({ columnCount }: { columnCount: number }) {
  const rows = Array.from({ length: SKELETON_ROWS }, (_, index) => index);
  const columns = Array.from({ length: columnCount }, (_, index) => index);

  return (
    <tbody aria-hidden>
      {rows.map((rowIndex) => (
        <tr key={rowIndex}>
          {columns.map((columnIndex) => (
            <td key={columnIndex} className="border-b border-border px-3 py-3">
              <Skeleton className="h-4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
