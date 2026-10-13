import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useUrlState } from '@/shared/hooks/useUrlState';
import {
  CASE_PAGE_SIZES,
  caseFiltersSchema,
  hasActiveCaseFilters,
  RESETTABLE_FILTER_KEYS,
  SEARCH_DEBOUNCE_MS,
  toCaseCountsParams,
  type CaseFilters,
  type CaseListParams,
} from '../model/caseFilters';

/**
 * The case list's filters, sort and page — all in the URL, so a filtered view is a
 * shareable link with back-button support. This hook is the single input to the
 * list and count query keys.
 */
export function useCaseFilters() {
  const { values: filters, setValues, resetValues } = useUrlState(caseFiltersSchema);

  // Debounce the value, not the request: the query key changes 300 ms after typing
  // stops, and TanStack Query cancels any superseded request through its signal.
  const debouncedQuery = useDebouncedValue(filters.q.trim(), SEARCH_DEBOUNCE_MS);

  const listParams: CaseListParams = { ...filters, q: debouncedQuery };
  const countsParams = toCaseCountsParams(listParams);

  /** Any change to what is listed returns to page 1, unless the patch sets the page itself. */
  function setFilters(patch: Partial<CaseFilters>) {
    setValues({ page: 1, ...patch });
  }

  /** Keystrokes replace the history entry instead of pushing one per character. */
  function setSearch(q: string) {
    setValues({ q, page: 1 }, { replace: true });
  }

  function setPage(page: number) {
    setValues({ page });
  }

  function setPageSize(pageSize: number) {
    const size = CASE_PAGE_SIZES.find((option) => option === pageSize);
    if (size) setValues({ pageSize: size, page: 1 });
  }

  function resetFilters() {
    resetValues(RESETTABLE_FILTER_KEYS);
  }

  return {
    filters,
    listParams,
    countsParams,
    hasActiveFilters: hasActiveCaseFilters(filters),
    setFilters,
    setSearch,
    setPage,
    setPageSize,
    resetFilters,
  };
}
