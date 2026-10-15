import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useCreateCase } from '@/features/cases';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { applyFieldIssues, getServerFieldIssues, getZodFieldIssues } from '@/shared/lib/formErrors';
import { useDeleteServerDraft, useSaveCaseDraft } from '../api/caseDraft.queries';
import {
  caseDraftPayloadSchema,
  isBlankDraft,
  toCreateCaseInput,
  toDraftPayloadInput,
  type CaseDraftValues,
} from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';
import { useDraftAutosave } from './useDraftAutosave';

/** Where a new case is shown after it is created: the full list, searched to that case. */
function getCreatedCasePath(reference: string) {
  return `/cases?tab=all&q=${encodeURIComponent(reference)}`;
}

/**
 * The three save actions of a draft tab (forms.md):
 * - Create case — full validation → mutation → navigate to the case (toast + invalidation in the mutation)
 * - Save as draft — partial validation → server → stay on the page
 * - Discard — confirm unless blank → delete the draft, locally and on the server
 */
export function useDraftActions(draftId: string, form: UseFormReturn<CaseDraftValues>) {
  const { t } = useTranslation('caseIntake');
  const navigate = useNavigate();
  const confirm = useConfirm();
  const autosave = useDraftAutosave(draftId, form);
  const removeDraft = useDraftsStore((state) => state.removeDraft);
  const createCase = useCreateCase();
  const saveCaseDraft = useSaveCaseDraft();
  const deleteServerDraft = useDeleteServerDraft();

  const handleCreate = form.handleSubmit((values) => {
    createCase.mutate(
      { input: toCreateCaseInput(values), draftId },
      {
        onSuccess: (created) => {
          autosave.cancel();
          void navigate(getCreatedCasePath(created.reference));
          removeDraft(draftId);
        },
        onError: (error) => {
          applyFieldIssues(getServerFieldIssues(error), form.setError);
        },
      },
    );
  });

  function handleSaveDraft() {
    if (saveCaseDraft.isPending) return;
    form.clearErrors();
    const parsed = caseDraftPayloadSchema.safeParse(toDraftPayloadInput(form.getValues()));
    if (!parsed.success) {
      applyFieldIssues(getZodFieldIssues(parsed.error), form.setError);
      return;
    }
    autosave.flush(); // the store now holds exactly what is being saved
    const revision = useDraftsStore.getState().drafts[draftId]?.revision ?? 0;
    saveCaseDraft.mutate({ draftId, payload: parsed.data, revision });
  }

  async function handleDiscard() {
    autosave.flush();
    const draft = useDraftsStore.getState().drafts[draftId];
    if (!draft) return;

    if (!isBlankDraft(draft)) {
      const title = draft.values.title.trim() || t('tabs.untitled');
      const isConfirmed = await confirm({
        title: t('discard.title'),
        description: t('discard.description', { title }),
        confirmLabel: t('discard.confirm'),
        cancelLabel: t('discard.cancel'),
        tone: 'danger',
      });
      if (!isConfirmed) return;
    }

    autosave.cancel();
    removeDraft(draftId);
    if (draft.serverDraft) deleteServerDraft.mutate(draftId);
  }

  return {
    handleCreate,
    handleSaveDraft,
    handleDiscard,
    isCreating: createCase.isPending,
    isSavingDraft: saveCaseDraft.isPending,
  };
}
