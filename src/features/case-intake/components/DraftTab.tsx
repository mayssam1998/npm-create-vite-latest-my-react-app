import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkspaceTab } from '@/shared/ui/WorkspaceTabs';
import { hasUnsavedChanges } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';

interface DraftTabProps {
  draftId: string;
  onClose: (draftId: string) => void;
}

/** One tab. Subscribes to its own draft's title and save state only, never the whole store. */
export function DraftTab({ draftId, onClose }: DraftTabProps) {
  const { t } = useTranslation('caseIntake');
  const title = useDraftsStore((state) => state.drafts[draftId]?.values.title.trim() ?? '');
  const isUnsaved = useDraftsStore((state) => {
    const draft = state.drafts[draftId];
    return draft ? hasUnsavedChanges(draft) : false;
  });
  const label = title || t('tabs.untitled');

  return (
    <WorkspaceTab
      value={draftId}
      label={label}
      icon={FileText}
      hasUnsavedChanges={isUnsaved}
      unsavedChangesLabel={t('tabs.unsaved')}
      closeLabel={t('tabs.close', { title: label })}
      onClose={onClose}
    />
  );
}
