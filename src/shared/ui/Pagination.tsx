import type { ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

export interface PaginationProps {
  /** 1-based page number. */
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const { t } = useTranslation('common');
  const { formatNumber } = useFormatters();

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // An old link can point past the last page: show an empty range rather than "401–79".
  const hasRowsOnPage = total > 0 && page <= pageCount;
  const firstRow = hasRowsOnPage ? (page - 1) * pageSize + 1 : 0;
  const lastRow = hasRowsOnPage ? Math.min(page * pageSize, total) : 0;
  const canGoBack = page > 1;
  const canGoForward = page < pageCount;
  const rangeLabel = t('pagination.range', {
    from: formatNumber(firstRow),
    to: formatNumber(lastRow),
    total: formatNumber(total),
  });

  function handlePrevious() {
    onPageChange(page - 1);
  }

  function handleNext() {
    onPageChange(page + 1);
  }

  function handlePageSizeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSize = pageSizeOptions.find((option) => option === Number(event.currentTarget.value));
    if (nextSize !== undefined) onPageSizeChange(nextSize);
  }

  return (
    <nav
      aria-label={t('pagination.label')}
      className={cn('flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-sm text-muted-foreground', className)}
    >
      <label className="flex items-center gap-2">
        {t('pagination.rowsPerPage')}
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="h-8 rounded-md border border-border bg-card px-2 text-foreground"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {formatNumber(option)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-3">
        <span aria-live="polite">{rangeLabel}</span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handlePrevious} disabled={!canGoBack} aria-label={t('pagination.previous')}>
            <ChevronLeft aria-hidden className="rtl:-scale-x-100" />
          </Button>
          <span>{t('pagination.pageOf', { page: formatNumber(page), pageCount: formatNumber(pageCount) })}</span>
          <Button size="icon" variant="ghost" onClick={handleNext} disabled={!canGoForward} aria-label={t('pagination.next')}>
            <ChevronRight aria-hidden className="rtl:-scale-x-100" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
