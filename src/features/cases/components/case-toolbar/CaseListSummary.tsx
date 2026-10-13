import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { Button } from '@/shared/ui/Button';
import { RadioMenu, type RadioMenuGroup } from '@/shared/ui/RadioMenu';
import { useCaseCounts, useCases } from '../../api/case.queries';
import { useCaseFilters } from '../../hooks/useCaseFilters';
import { CASE_SORT_FIELDS, SORT_DIRECTIONS, caseSortFieldSchema, sortDirectionSchema } from '../../model/caseFilters';

/** "49 of 79 cases" plus the sort menu. Reuses the list and count queries — no extra request. */
export function CaseListSummary() {
  const { t } = useTranslation('cases');
  const { formatNumber } = useFormatters();
  const { filters, listParams, countsParams, setFilters } = useCaseFilters();
  const { data: list } = useCases(listParams);
  const { data: counts } = useCaseCounts(countsParams);

  const summary = getSummary();
  const DirectionIcon = filters.dir === 'asc' ? ArrowUp : ArrowDown;

  function getSummary() {
    if (!list || !counts) return null;
    if (filters.tab === 'all' || list.total === counts.all) {
      return t('summary.total', { count: list.total, formattedCount: formatNumber(list.total) });
    }
    return t('summary.ofTotal', {
      count: counts.all,
      shown: formatNumber(list.total),
      formattedCount: formatNumber(counts.all),
    });
  }

  function handleSortFieldChange(value: string) {
    const field = caseSortFieldSchema.safeParse(value);
    if (field.success) setFilters({ sort: field.data });
  }

  function handleDirectionChange(value: string) {
    const direction = sortDirectionSchema.safeParse(value);
    if (direction.success) setFilters({ dir: direction.data });
  }

  const sortGroups: RadioMenuGroup[] = [
    {
      label: t('sort.field'),
      value: filters.sort,
      options: CASE_SORT_FIELDS.map((field) => ({ value: field, label: t(`sort.fields.${field}`) })),
      onValueChange: handleSortFieldChange,
    },
    {
      label: t('sort.direction'),
      value: filters.dir,
      options: SORT_DIRECTIONS.map((direction) => ({ value: direction, label: t(`sort.${direction}`) })),
      onValueChange: handleDirectionChange,
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <p aria-live="polite" className="text-sm text-content-muted">
        {summary}
      </p>
      <RadioMenu
        groups={sortGroups}
        trigger={
          <Button>
            <span className="text-content-muted">{t('sort.trigger')}</span>
            {t(`sort.fields.${filters.sort}`)}
            <DirectionIcon aria-hidden />
            <span className="sr-only">{t(`sort.${filters.dir}`)}</span>
          </Button>
        }
      />
    </div>
  );
}
