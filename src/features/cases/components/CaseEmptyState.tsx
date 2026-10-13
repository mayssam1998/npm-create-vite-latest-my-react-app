import { FilterX, Inbox, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';

interface CaseEmptyStateProps {
  hasActiveFilters: boolean;
  /** The server reports matches, but the requested page is past the last one (e.g. an old link). */
  isPastLastPage: boolean;
  onResetFilters: () => void;
  onFirstPage: () => void;
}

/** Explains *why* the list is empty and offers the one action that fixes it. */
export function CaseEmptyState({ hasActiveFilters, isPastLastPage, onResetFilters, onFirstPage }: CaseEmptyStateProps) {
  const { t } = useTranslation('cases');

  if (isPastLastPage) {
    return (
      <EmptyState
        icon={SearchX}
        title={t('empty.pastLastPageTitle')}
        action={<Button onClick={onFirstPage}>{t('empty.firstPage')}</Button>}
      />
    );
  }

  if (hasActiveFilters) {
    return (
      <EmptyState
        icon={FilterX}
        title={t('empty.filteredTitle')}
        description={t('empty.filteredDescription')}
        action={<Button onClick={onResetFilters}>{t('filters.reset')}</Button>}
      />
    );
  }

  return <EmptyState icon={Inbox} title={t('empty.title')} description={t('empty.description')} />;
}
