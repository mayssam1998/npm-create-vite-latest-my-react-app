// Layer 3: the hooks components import.
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from '@/shared/lib/toast';
import type { CaseDraftPayload } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';
import { deleteCaseDraft, saveCaseDraft } from './caseDraft.api';
import { caseDraftKeys } from './caseDraftKeys';

interface SaveCaseDraftRequest {
  draftId: string;
  payload: CaseDraftPayload;
  /** The local revision being saved, so edits made while the request is in flight stay unsaved. */
  revision: number;
}

/** "Save as draft": send the partial draft to the server and record the reserved case number. */
export function useSaveCaseDraft() {
  const { t } = useTranslation('caseIntake');
  const queryClient = useQueryClient();
  const markSavedToServer = useDraftsStore((state) => state.markSavedToServer);

  return useMutation({
    mutationFn: ({ draftId, payload }: SaveCaseDraftRequest) => saveCaseDraft(draftId, payload),
    onSuccess: (serverDraft, { draftId, revision }) => {
      markSavedToServer(draftId, serverDraft, revision);
      toast.success(t('toast.draftSaved'), t('toast.draftSavedDescription', { reference: serverDraft.reference }));
      return queryClient.invalidateQueries({ queryKey: caseDraftKeys.all });
    },
    onError: () => {
      toast.error(t('toast.draftSaveFailed'), t('toast.draftSaveFailedDescription'));
    },
  });
}

/** Delete the server copy of a discarded draft. The local copy is already gone. */
export function useDeleteServerDraft() {
  const { t } = useTranslation('caseIntake');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => deleteCaseDraft(draftId),
    onSuccess: () => {
      toast.info(t('toast.draftDiscarded'));
      return queryClient.invalidateQueries({ queryKey: caseDraftKeys.all });
    },
    onError: () => {
      toast.error(t('toast.draftDeleteFailed'));
    },
  });
}
