import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/Badge';
import type { DataTableCellProps, DataTableColumnDef } from '@/shared/ui/data-table/dataTableFeatures';
import type { Case, CaseSource } from '../../model/case';
import { CasePriorityBadge } from '../CasePriorityBadge';
import { CaseStatusBadge } from '../CaseStatusBadge';
import { SOURCE_ICON, getTagTone } from '../casePresentation';

/**
 * Column definitions are data. Ids of sortable columns match CASE_SORT_FIELDS; their
 * accessor exists only so the table knows the column can sort (sorting is server-side).
 * Title has no size, so it absorbs the remaining width.
 */
export const caseColumns: DataTableColumnDef<Case>[] = [
  { id: 'reference', accessorFn: (row) => row.reference, header: 'cases:table.reference', cell: ReferenceCell, size: 150 },
  { id: 'title', header: 'cases:table.title', cell: TitleCell },
  { id: 'status', accessorFn: (row) => row.status, header: 'cases:table.status', cell: StatusCell, size: 190 },
  { id: 'priority', accessorFn: (row) => row.priority, header: 'cases:table.priority', cell: PriorityCell, size: 110 },
  { id: 'type', accessorFn: (row) => row.type.name, header: 'cases:table.type', cell: TypeCell, size: 150 },
  { id: 'section', accessorFn: (row) => row.section.name, header: 'cases:table.section', cell: SectionCell, size: 210 },
  { id: 'owner', accessorFn: (row) => row.owner?.name, header: 'cases:table.owner', cell: OwnerCell, size: 120 },
  { id: 'dueDate', accessorFn: (row) => row.dueDate, header: 'cases:table.due', cell: DueDateCell, size: 130 },
  { id: 'tags', header: 'cases:table.tags', cell: TagsCell, size: 160 },
  { id: 'tasks', header: 'cases:table.tasks', cell: TasksCell, size: 80 },
  { id: 'updatedAt', accessorFn: (row) => row.updatedAt, header: 'cases:table.updated', cell: UpdatedCell, size: 130 },
];

// One small named component per cell — never an inline arrow returning JSX.

function ReferenceCell({ row }: DataTableCellProps<Case>) {
  return <span className="font-mono text-xs text-content-muted">{row.original.reference}</span>;
}

function TitleCell({ row }: DataTableCellProps<Case>) {
  const { t } = useTranslation('cases');
  const { title, source, isProcessed } = row.original;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-medium text-content">{title}</span>
      {source && <SourceBadge source={source} />}
      {isProcessed && (
        <Badge tone="teal" appearance="outline">
          {t('badge.processed')}
        </Badge>
      )}
    </div>
  );
}

function SourceBadge({ source }: { source: CaseSource }) {
  const { t } = useTranslation('cases');
  const Icon = SOURCE_ICON[source];

  return (
    <Badge tone="amber" appearance="plain">
      <Icon aria-hidden />
      {t(`source.${source}`)}
    </Badge>
  );
}

function StatusCell({ row }: DataTableCellProps<Case>) {
  return <CaseStatusBadge status={row.original.status} />;
}

function PriorityCell({ row }: DataTableCellProps<Case>) {
  return <CasePriorityBadge priority={row.original.priority} />;
}

function TypeCell({ row }: DataTableCellProps<Case>) {
  return <span className="block truncate">{row.original.type.name}</span>;
}

function SectionCell({ row }: DataTableCellProps<Case>) {
  return <span className="block truncate">{row.original.section.name}</span>;
}

function OwnerCell({ row }: DataTableCellProps<Case>) {
  const { t } = useTranslation('cases');
  const { owner } = row.original;

  return (
    <span className={cn('block truncate', !owner && 'text-content-subtle')}>
      {owner?.name ?? t('table.unassigned')}
    </span>
  );
}

function DueDateCell({ row }: DataTableCellProps<Case>) {
  const { t } = useTranslation('cases');
  const { formatDate } = useFormatters();
  const { dueDate, isOverdue } = row.original;

  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap', isOverdue && 'font-medium text-danger')}>
      {isOverdue && <CircleAlert aria-hidden className="size-3.5" />}
      {formatDate(dueDate)}
      {isOverdue && <span className="sr-only">{t('table.overdue')}</span>}
    </span>
  );
}

function TagsCell({ row }: DataTableCellProps<Case>) {
  const { t } = useTranslation('cases');
  const { tags } = row.original;

  if (tags.length === 0) return <span className="text-content-subtle">{t('table.none')}</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} tone={getTagTone(tag)}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}

function TasksCell({ row }: DataTableCellProps<Case>) {
  const { t } = useTranslation('cases');
  const { formatNumber } = useFormatters();
  const { done, total } = row.original.tasks;

  return (
    <span className="text-content-muted tabular-nums">
      {t('table.tasksProgress', { done: formatNumber(done), total: formatNumber(total) })}
    </span>
  );
}

function UpdatedCell({ row }: DataTableCellProps<Case>) {
  const { formatDate } = useFormatters();
  return <span className="whitespace-nowrap text-content-muted">{formatDate(row.original.updatedAt)}</span>;
}
