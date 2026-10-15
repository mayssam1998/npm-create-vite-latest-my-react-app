import { redirect } from 'react-router';
import { loadCaseIntakePage } from './lazyPages';

export const CASE_INTAKE_PATH = '/cases/intake';

/**
 * POST /cases/intake — the "New case" button. Opens a draft tab (or focuses an untouched
 * one) before the page renders, then redirects to the workspace, so no effect has to react
 * to "just arrived". The drafts store is imported lazily to keep it out of the entry chunk.
 */
export async function newCaseDraftAction() {
  void loadCaseIntakePage(); // start fetching the page chunk in parallel
  const { ensureDraftsHydrated, useDraftsStore } = await import('@/features/case-intake/model/draftsStore');
  await ensureDraftsHydrated();
  useDraftsStore.getState().startNewCase();
  return redirect(CASE_INTAKE_PATH);
}
