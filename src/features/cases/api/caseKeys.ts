import type { CaseCountsParams, CaseListParams } from '../model/caseFilters';

/** Every case query key comes from here. `invalidateQueries({ queryKey: caseKeys.all })` refreshes them all. */
export const caseKeys = {
  all: ['cases'] as const,
  lists: () => [...caseKeys.all, 'list'] as const,
  list: (params: CaseListParams) => [...caseKeys.lists(), params] as const,
  counts: (params: CaseCountsParams) => [...caseKeys.all, 'counts', params] as const,
  referenceData: () => [...caseKeys.all, 'reference-data'] as const,
  details: () => [...caseKeys.all, 'detail'] as const,
  linkedItems: (caseId: string) => [...caseKeys.details(), caseId, 'linked-items'] as const,
};
