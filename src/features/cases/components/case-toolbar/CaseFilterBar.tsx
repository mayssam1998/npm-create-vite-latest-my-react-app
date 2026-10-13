import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { MultiSelectFilter, type MultiSelectOption } from '@/shared/ui/filters/MultiSelectFilter';
import { useCaseReferenceData } from '../../api/case.queries';
import { useCaseFilters } from '../../hooks/useCaseFilters';
import { CASE_PRIORITIES, CASE_STATUSES, type CasePriority, type CaseStatus, type Reference } from '../../model/case';
import { UNASSIGNED_OWNER_ID } from '../../model/caseFilters';

function toOptions(references: readonly Reference[] = []): MultiSelectOption<string>[] {
  return references.map((reference) => ({ value: reference.id, label: reference.name }));
}

export function CaseFilterBar() {
  const { t } = useTranslation('cases');
  const { filters, hasActiveFilters, setFilters, resetFilters } = useCaseFilters();
  const { data: referenceData, isPending: isReferenceLoading } = useCaseReferenceData();

  const statusOptions: MultiSelectOption<CaseStatus>[] = CASE_STATUSES.map((status) => ({
    value: status,
    label: t(`status.${status}`),
  }));
  const priorityOptions: MultiSelectOption<CasePriority>[] = CASE_PRIORITIES.map((priority) => ({
    value: priority,
    label: t(`priority.${priority}`),
  }));
  const ownerOptions = [
    { value: UNASSIGNED_OWNER_ID, label: t('table.unassigned') },
    ...toOptions(referenceData?.owners),
  ];

  function handleStatusChange(status: CaseStatus[]) {
    setFilters({ status });
  }

  function handlePriorityChange(priority: CasePriority[]) {
    setFilters({ priority });
  }

  function handleTypeChange(typeId: string[]) {
    setFilters({ typeId });
  }

  function handleSectionChange(sectionId: string[]) {
    setFilters({ sectionId });
  }

  function handleOwnerChange(ownerId: string[]) {
    setFilters({ ownerId });
  }

  return (
    <div role="group" aria-label={t('filters.label')} className="flex flex-wrap items-center gap-2">
      <MultiSelectFilter
        label={t('filters.status')}
        options={statusOptions}
        value={filters.status}
        onValueChange={handleStatusChange}
      />
      <MultiSelectFilter
        label={t('filters.priority')}
        options={priorityOptions}
        value={filters.priority}
        onValueChange={handlePriorityChange}
      />
      <MultiSelectFilter
        label={t('filters.type')}
        options={toOptions(referenceData?.types)}
        value={filters.typeId}
        onValueChange={handleTypeChange}
        isLoading={isReferenceLoading}
      />
      <MultiSelectFilter
        label={t('filters.section')}
        options={toOptions(referenceData?.sections)}
        value={filters.sectionId}
        onValueChange={handleSectionChange}
        isLoading={isReferenceLoading}
      />
      <MultiSelectFilter
        label={t('filters.owner')}
        options={ownerOptions}
        value={filters.ownerId}
        onValueChange={handleOwnerChange}
        isLoading={isReferenceLoading}
      />
      {hasActiveFilters && (
        <Button variant="ghost" onClick={resetFilters}>
          <X aria-hidden />
          {t('filters.reset')}
        </Button>
      )}
    </div>
  );
}
