import type { SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/data-table/DataTable';
import { ErrorState } from '@/shared/ui/ErrorState';
import { useCases } from '../../api/case.queries';
import { useCaseFilters } from '../../hooks/useCaseFilters';
import type { Case } from '../../model/case';
import { CASE_PAGE_SIZES, caseSortFieldSchema, isPastLastPage } from '../../model/caseFilters';
import { CaseEmptyState } from '../CaseEmptyState';
import { CaseLinkedItems } from './CaseLinkedItems';
import { caseColumns } from './columns';

// Module scope: stable references, so the table does not rebuild its models every render.
const EMPTY_CASES: Case[] = [];

function getCaseId(row: Case) {
  return row.id;
}

function renderCaseDetails(row: Case) {
  return <CaseLinkedItems caseId={row.id} />;
}

/** Container: owns the data and the URL state; DataTable does all the rendering. */
export function CaseTable() {
  const { t } = useTranslation('cases');
  const { filters, listParams, hasActiveFilters, setFilters, setPage, setPageSize, resetFilters } =
    useCaseFilters();
  const { data, isPending, isFetching, isError, refetch } = useCases(listParams);

  if (isError) return <ErrorState title={t('error.title')} onRetry={refetch} />;

  const total = data?.total ?? 0;
  const sorting: SortingState = [{ id: filters.sort, desc: filters.dir === 'desc' }];

  function handleSortingChange(next: SortingState) {
    const [first] = next;
    const field = caseSortFieldSchema.safeParse(first?.id);
    if (!field.success) return;
    setFilters({ sort: field.data, dir: first.desc ? 'desc' : 'asc' });
  }

  function handleFirstPage() {
    setPage(1);
  }

  return (
    <DataTable
      label={t('table.label')}
      columns={caseColumns}
      data={data?.items ?? EMPTY_CASES}
      getRowId={getCaseId}
      sorting={sorting}
      onSortingChange={handleSortingChange}
      isLoading={isPending}
      isFetching={isFetching && !isPending}
      renderExpandedRow={renderCaseDetails}
      emptyState={
        <CaseEmptyState
          hasActiveFilters={hasActiveFilters}
          isPastLastPage={isPastLastPage(filters, total)}
          onResetFilters={resetFilters}
          onFirstPage={handleFirstPage}
        />
      }
      pagination={{
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        pageSizeOptions: CASE_PAGE_SIZES,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );
}
