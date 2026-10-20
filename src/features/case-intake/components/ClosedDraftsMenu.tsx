import { ChevronDown, FileClock, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { ActionMenu, type ActionMenuItem } from '@/shared/ui/ActionMenu';
import { Button } from '@/shared/ui/Button';
import type { CaseDraft } from '../model/caseDraft';
import { useDraftsStore } from '../model/draftsStore';

function byMostRecentlyEdited(a: CaseDraft, b: CaseDraft) {
  return b.updatedAt.localeCompare(a.updatedAt);
}

/** Drafts whose tab was closed. Closing a tab keeps the draft; this is how it comes back. */
export function ClosedDraftsMenu() {
  const { t } = useTranslation('caseIntake');
  const { formatDateTime, formatNumber } = useFormatters();
  const drafts = useDraftsStore((state) => state.drafts);
  const openIds = useDraftsStore((state) => state.openIds);
  const openDraft = useDraftsStore((state) => state.openDraft);

  const closedDrafts = Object.values(drafts)
    .filter((draft) => !openIds.includes(draft.id))
    .sort(byMostRecentlyEdited);

  const items: ActionMenuItem[] = closedDrafts.map((draft) => ({
    id: draft.id,
    icon: FileText,
    label: draft.values.title.trim() || t('tabs.untitled'),
    description: [draft.serverDraft?.reference, t('closedDrafts.edited', { time: formatDateTime(draft.updatedAt) })]
      .filter(Boolean)
      .join(' · '),
    onSelect: () => openDraft(draft.id),
  }));
  const hasClosedDrafts = closedDrafts.length > 0;

  return (
    <ActionMenu
      label={t('closedDrafts.label')}
      emptyText={t('closedDrafts.empty')}
      items={items}
      trigger={
        <Button variant="ghost" aria-label={t('closedDrafts.trigger', { count: closedDrafts.length })}>
          <FileClock aria-hidden />
          <span>{t('closedDrafts.button')}</span>
          {hasClosedDrafts && (
            <span className="rounded bg-accent px-1 text-xs text-primary">{formatNumber(closedDrafts.length)}</span>
          )}
          <ChevronDown aria-hidden />
        </Button>
      }
    />
  );
}
