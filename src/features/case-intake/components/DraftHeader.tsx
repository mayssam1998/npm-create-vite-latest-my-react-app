import { CircleCheck, CircleDot, HardDrive, Plus, Save, Trash2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { Button } from '@/shared/ui/Button';
import { hasUnsavedChanges, type CaseDraftValues } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';

interface DraftHeaderProps {
  draftId: string;
  isCreating: boolean;
  isSavingDraft: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

/** Title, case number, save status and the three save actions of the active draft. */
export function DraftHeader({ draftId, isCreating, isSavingDraft, onSaveDraft, onDiscard }: DraftHeaderProps) {
  const { t } = useTranslation('caseIntake');
  const title = useWatch<CaseDraftValues, 'title'>({ name: 'title' }).trim();
  const reference = useDraftsStore((state) => state.drafts[draftId]?.serverDraft?.reference);
  const isBusy = isCreating || isSavingDraft;
  const saveDraftLabel = isSavingDraft ? t('actions.savingDraft') : t('actions.saveDraft');
  const createLabel = isCreating ? t('actions.creating') : t('actions.create');

  return (
    <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 lg:px-6">
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-foreground">{title || t('tabs.untitled')}</h2>
        <p className="text-sm text-muted-foreground">
          {reference ? (
            <>
              {t('header.caseNumber')} <span className="font-mono font-medium text-foreground">{reference}</span>
            </>
          ) : (
            t('header.caseNumberPending')
          )}
        </p>
        <div role="status" aria-live="polite">
          <DraftSaveStatus draftId={draftId} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="dangerGhost" onClick={onDiscard} disabled={isBusy}>
          <Trash2 aria-hidden />
          {t('actions.discard')}
        </Button>
        <Button onClick={onSaveDraft} isPending={isSavingDraft} disabled={isCreating} title={t('actions.saveDraftShortcut')}>
          <Save aria-hidden />
          {saveDraftLabel}
        </Button>
        <Button type="submit" variant="primary" isPending={isCreating} disabled={isSavingDraft}>
          <Plus aria-hidden />
          {createLabel}
        </Button>
      </div>
    </div>
  );
}

/** Where the draft's latest changes live: this device only, or also on the server. */
function DraftSaveStatus({ draftId }: { draftId: string }) {
  const { t } = useTranslation('caseIntake');
  const { formatDateTime } = useFormatters();
  const savedAt = useDraftsStore((state) => state.drafts[draftId]?.serverDraft?.savedAt);
  const isUnsaved = useDraftsStore((state) => {
    const draft = state.drafts[draftId];
    return draft ? hasUnsavedChanges(draft) : false;
  });

  if (isUnsaved) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleDot aria-hidden className="size-3.5 text-ev-warn" />
        {t('status.localOnly')}
      </p>
    );
  }

  if (savedAt) {
    return (
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleCheck aria-hidden className="size-3.5 text-ev-ok" />
        {t('status.savedAsDraft', { time: formatDateTime(savedAt) })}
      </p>
    );
  }

  return (
    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
      <HardDrive aria-hidden className="size-3.5" />
      {t('status.onThisDevice')}
    </p>
  );
}
