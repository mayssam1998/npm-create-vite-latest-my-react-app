// Layer 2: plain async functions — no React in this file.
// Each forwards `signal` and parses the response at the boundary with Zod.
import { apiClient } from '@/shared/lib/apiClient';
import {
  caseCountsSchema,
  caseListResponseSchema,
  caseReferenceDataSchema,
  caseSchema,
  linkedItemsResponseSchema,
} from '../model/case';
import type { CaseCountsParams, CaseListParams } from '../model/caseFilters';
import type { CreateCaseInput } from '../model/createCase';

export async function fetchCases(params: CaseListParams, signal?: AbortSignal) {
  const data = await apiClient.get('/cases', { params, signal });
  return caseListResponseSchema.parse(data);
}

export async function fetchCaseCounts(params: CaseCountsParams, signal?: AbortSignal) {
  const data = await apiClient.get('/cases/counts', { params, signal });
  return caseCountsSchema.parse(data);
}

export async function fetchCaseReferenceData(signal?: AbortSignal) {
  const data = await apiClient.get('/cases/reference-data', { signal });
  return caseReferenceDataSchema.parse(data);
}

export async function fetchCaseLinkedItems(caseId: string, signal?: AbortSignal) {
  const data = await apiClient.get(`/cases/${encodeURIComponent(caseId)}/linked-items`, { signal });
  return linkedItemsResponseSchema.parse(data);
}

export interface CreateCaseRequest {
  input: CreateCaseInput;
  /** The intake draft this case comes from; the server converts it and keeps its reserved number. */
  draftId?: string;
}

export async function createCase({ input, draftId }: CreateCaseRequest, signal?: AbortSignal) {
  const data = await apiClient.post('/cases', { ...input, draftId }, { signal });
  return caseSchema.parse(data);
}
