import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { ErrorState } from '@/shared/ui/ErrorState';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useCaseLinkedItems } from '../../api/case.queries';
import type { LinkedItem } from '../../model/case';
import { CaseStatusBadge } from '../CaseStatusBadge';

const SKELETON_ITEMS = 2;

interface CaseLinkedItemsProps {
  caseId: string;
}

/** Detail row of an expanded case. Mounted only while expanded, so it fetches on demand. */
export function CaseLinkedItems({ caseId }: CaseLinkedItemsProps) {
  const { t } = useTranslation('cases');
  const { data, isPending, isError, refetch } = useCaseLinkedItems(caseId);

  if (isPending) {
    return (
      <div role="status" className="flex flex-col gap-2 py-3 ps-12 pe-4">
        <span className="sr-only">{t('linked.loading')}</span>
        {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
          <Skeleton key={index} className="h-5" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState className="py-6" title={t('linked.error')} onRetry={refetch} />;
  }

  if (data.items.length === 0) {
    return <p className="py-3 ps-12 pe-4 text-sm text-muted-foreground">{t('linked.empty')}</p>;
  }

  return (
    <ul aria-label={t('linked.label')} className="divide-y divide-border">
      {data.items.map((item) => (
        <LinkedItemRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

function LinkedItemRow({ item }: { item: LinkedItem }) {
  const { t } = useTranslation('cases');
  const { formatDate } = useFormatters();

  return (
    <li className="grid grid-cols-12 items-center gap-3 py-2.5 ps-12 pe-4 text-sm">
      <span className="col-span-5 text-status-open">{item.title}</span>
      <span className="col-span-2">
        <CaseStatusBadge status={item.status} />
      </span>
      <span className="col-span-2 truncate">{item.section.name}</span>
      <span className="col-span-1 truncate text-muted-foreground">{item.owner?.name ?? t('table.unassigned')}</span>
      <span className="col-span-1 text-muted-foreground">{formatDate(item.dueDate)}</span>
      <span className="col-span-1 text-muted-foreground">{formatDate(item.updatedAt)}</span>
    </li>
  );
}
