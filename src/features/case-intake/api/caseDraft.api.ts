// Layer 2: plain async functions — no React in this file.
import { apiClient } from '@/shared/lib/apiClient';
import { serverDraftSchema, type CaseDraftPayload } from '../model/caseDraft';

/** Idempotent upsert: the client owns the draft id. */
export async function saveCaseDraft(draftId: string, payload: CaseDraftPayload, signal?: AbortSignal) {
  const data = await apiClient.put(`/case-drafts/${encodeURIComponent(draftId)}`, payload, { signal });
  return serverDraftSchema.parse(data);
}

export async function deleteCaseDraft(draftId: string, signal?: AbortSignal) {
  await apiClient.delete(`/case-drafts/${encodeURIComponent(draftId)}`, { signal });
}
