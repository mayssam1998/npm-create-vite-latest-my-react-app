import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { cn } from '@/shared/lib/cn';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Pagination } from '@/shared/ui/Pagination';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCases } from '../../api/case.queries';
import { useCaseFilters } from '../../hooks/useCaseFilters';
import type { Case } from '../../model/case';
import { CASE_PAGE_SIZES, isPastLastPage } from '../../model/caseFilters';
import { groupCasesByStatus, type CaseStatusGroup } from '../../model/groupCasesByStatus';
import { CaseEmptyState } from '../CaseEmptyState';
import { CasePriorityBadge } from '../CasePriorityBadge';
import { CaseStatusBadge } from '../CaseStatusBadge';

const SKELETON_COLUMNS = 3;

/** The same page of the same query as the table, grouped into status columns. */
export function CaseBoard() {
  const { t } = useTranslation('cases');
  const { filters, listParams, hasActiveFilters, setPage, setPageSize, resetFilters } = useCaseFilters();
  const { data, isPending, isFetching, isError, refetch } = useCases(listParams);

  if (isError) return <ErrorState title={t('error.title')} onRetry={refetch} />;
  if (isPending) return <BoardSkeleton />;

  const groups = groupCasesByStatus(data.items);

  function handleFirstPage() {
    setPage(1);
  }

  if (groups.length === 0) {
    return (
      <CaseEmptyState
        hasActiveFilters={hasActiveFilters}
        isPastLastPage={isPastLastPage(filters, data.total)}
        onResetFilters={resetFilters}
        onFirstPage={handleFirstPage}
      />
    );
  }

  return (
    <section aria-label={t('board.label')} aria-busy={isFetching} className="flex min-h-0 flex-1 flex-col gap-3">
      <div className={cn('flex min-h-0 flex-1 gap-3 overflow-x-auto pb-2', isFetching && 'opacity-70')}>
        {groups.map((group) => (
          <BoardColumn key={group.status} group={group} />
        ))}
      </div>
      <Pagination
        className="rounded-lg border border-border bg-surface-raised"
        page={filters.page}
        pageSize={filters.pageSize}
        total={data.total}
        pageSizeOptions={CASE_PAGE_SIZES}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  );
}

function BoardColumn({ group }: { group: CaseStatusGroup }) {
  const { formatNumber } = useFormatters();

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface-muted">
      <div className="flex items-center justify-between px-3 py-2">
        <CaseStatusBadge status={group.status} />
        <span className="text-xs text-content-subtle">{formatNumber(group.cases.length)}</span>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
        {group.cases.map((item) => (
          <BoardCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function BoardCard({ item }: { item: Case }) {
  const { t } = useTranslation('cases');
  const { formatDate } = useFormatters();

  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-content-muted">{item.reference}</span>
        <CasePriorityBadge priority={item.priority} />
      </div>
      <p className="font-medium text-content">{item.title}</p>
      <div className="flex items-center justify-between gap-2 text-xs text-content-muted">
        <span className="truncate">{item.owner?.name ?? t('table.unassigned')}</span>
        <span className={cn(item.isOverdue && 'font-medium text-danger')}>{formatDate(item.dueDate)}</span>
      </div>
    </li>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3" aria-hidden>
      {Array.from({ length: SKELETON_COLUMNS }, (_, index) => (
        <Skeleton key={index} className="h-96 w-72" />
      ))}
    </div>
  );
}
