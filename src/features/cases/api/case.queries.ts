// Layer 3: the hooks components import. Nothing else in the feature touches layer 2.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from '@/shared/lib/toast';
import type { CaseCountsParams, CaseListParams } from '../model/caseFilters';
import {
  createCase,
  fetchCaseCounts,
  fetchCaseLinkedItems,
  fetchCaseReferenceData,
  fetchCases,
  type CreateCaseRequest,
} from './case.api';
import { caseKeys } from './caseKeys';

const SECOND = 1_000;
const MINUTE = 60 * SECOND;

export function useCases(params: CaseListParams) {
  return useQuery({
    queryKey: caseKeys.list(params),
    queryFn: ({ signal }) => fetchCases(params, signal),
    placeholderData: keepPreviousData, // paginated table must not flash empty between pages
    staleTime: 15 * SECOND, // a case list changes with user action: seconds
  });
}

export function useCaseCounts(params: CaseCountsParams) {
  return useQuery({
    queryKey: caseKeys.counts(params),
    queryFn: ({ signal }) => fetchCaseCounts(params, signal),
    placeholderData: keepPreviousData, // keep the old numbers while the filters change
    staleTime: 15 * SECOND,
  });
}

export function useCaseReferenceData() {
  return useQuery({
    queryKey: caseKeys.referenceData(),
    queryFn: ({ signal }) => fetchCaseReferenceData(signal),
    staleTime: 10 * MINUTE, // reference data — sections, types, owners — rarely changes
  });
}

/** Mounted by the expanded row, so the request only fires when a row is opened. */
export function useCaseLinkedItems(caseId: string) {
  return useQuery({
    queryKey: caseKeys.linkedItems(caseId),
    queryFn: ({ signal }) => fetchCaseLinkedItems(caseId, signal),
    staleTime: 30 * SECOND,
  });
}

/**
 * Create a case. Invalidates every case view and toasts the result; field-level server
 * errors are left to the form (`applyFieldIssues` in the caller's `onError`).
 */
export function useCreateCase() {
  const { t } = useTranslation('cases');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCaseRequest) => createCase(request),
    onSuccess: (created) => {
      toast.success(t('create.success', { reference: created.reference }), created.title);
      return queryClient.invalidateQueries({ queryKey: caseKeys.all });
    },
    onError: () => {
      toast.error(t('create.error'));
    },
  });
}
