import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useKeyboardShortcut } from '@/shared/hooks/useKeyboardShortcut';
import { useDraftActions } from '../hooks/useDraftActions';
import { caseDraftFormSchema, isBlankDraft, type CaseDraft, type CaseDraftValues } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';
import { CaseDraftForm } from './CaseDraftForm';
import { CorrespondencePanel } from './CorrespondencePanel';
import { DraftHeader } from './DraftHeader';

interface DraftPanelProps {
  draftId: string;
}

/**
 * One open draft. Mounted only while its tab is active, and keyed by draft id, so switching
 * tabs gives a fresh form seeded from the store.
 */
export function DraftPanel({ draftId }: DraftPanelProps) {
  // A one-time snapshot to seed the form — the store stays the source of truth and the
  // form writes back to it (useDraftAutosave). Reading once avoids re-rendering on autosave.
  const [initialDraft] = useState<CaseDraft | undefined>(() => useDraftsStore.getState().drafts[draftId]);

  if (!initialDraft) return null;
  return <DraftEditor draft={initialDraft} />;
}

function DraftEditor({ draft }: { draft: CaseDraft }) {
  const form = useForm<CaseDraftValues>({
    resolver: zodResolver(caseDraftFormSchema),
    defaultValues: draft.values,
    mode: 'onTouched',
  });
  const { handleCreate, handleSaveDraft, handleDiscard, isCreating, isSavingDraft } = useDraftActions(draft.id, form);

  useKeyboardShortcut({ key: 's', withModifier: true }, handleSaveDraft);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleCreate} noValidate className="flex min-h-0 flex-1 flex-col">
        <DraftHeader
          draftId={draft.id}
          isCreating={isCreating}
          isSavingDraft={isSavingDraft}
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
        />
        {/* One scroll area on small screens; two independent columns from lg up. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <CaseDraftForm shouldFocusFirstField={isBlankDraft(draft)} />
          </div>
          <aside className="border-t border-border bg-surface-muted lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:border-s lg:border-t-0 xl:w-lg">
            <CorrespondencePanel />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}
