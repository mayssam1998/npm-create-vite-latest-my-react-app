import { FilePlus2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { WorkspaceTabs } from '@/shared/ui/WorkspaceTabs';
import { useDraftsStore } from '../model/draftsStore';
import { DraftPanel } from './DraftPanel';
import { DraftTab } from './DraftTab';

/**
 * The open drafts as tabs over the active draft. Only the active draft is mounted; the
 * others live in the store. Closing a tab keeps its draft (see ClosedDraftsMenu) — only
 * Discard deletes one.
 */
export function DraftTabs() {
  const { t } = useTranslation('caseIntake');
  const openIds = useDraftsStore((state) => state.openIds);
  const activeId = useDraftsStore((state) => state.activeId);
  const setActive = useDraftsStore((state) => state.setActive);
  const createDraft = useDraftsStore((state) => state.createDraft);
  const closeTab = useDraftsStore((state) => state.closeTab);

  const visibleActiveId = activeId && openIds.includes(activeId) ? activeId : openIds[0];

  function handleNewDraft() {
    createDraft();
  }

  if (!visibleActiveId) {
    return (
      <EmptyState
        className="flex-1"
        icon={FilePlus2}
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <Button variant="primary" onClick={handleNewDraft}>
            <Plus aria-hidden />
            {t('actions.newDraft')}
          </Button>
        }
      />
    );
  }

  return (
    <WorkspaceTabs
      label={t('tabs.label')}
      value={visibleActiveId}
      onValueChange={setActive}
      tabs={openIds.map((id) => (
        <DraftTab key={id} draftId={id} onClose={closeTab} />
      ))}
      actions={
        <Button variant="ghost" onClick={handleNewDraft} title={t('actions.newDraftTitle')}>
          <Plus aria-hidden />
          {t('actions.newDraft')}
        </Button>
      }
    >
      <DraftPanel key={visibleActiveId} draftId={visibleActiveId} />
    </WorkspaceTabs>
  );
}
