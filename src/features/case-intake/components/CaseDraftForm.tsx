import { CircleAlert, RotateCw } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CASE_PRIORITIES, PRIORITY_DUE_DAYS, useCaseReferenceData, type CasePriority } from '@/features/cases';
import { Button } from '@/shared/ui/Button';
import { DateField } from '@/shared/ui/form/DateField';
import { FormSection } from '@/shared/ui/form/FormSection';
import { MultiSelectField } from '@/shared/ui/form/MultiSelectField';
import { SelectField } from '@/shared/ui/form/SelectField';
import { TagsField } from '@/shared/ui/form/TagsField';
import { TextareaField } from '@/shared/ui/form/TextareaField';
import { TextField } from '@/shared/ui/form/TextField';
import { getDefaultDueDate, type CaseDraftValues } from '../model/caseDraft';

interface CaseDraftFormProps {
  /** Focus the first field — for a draft that was just opened blank. */
  shouldFocusFirstField: boolean;
}

interface Reference {
  id: string;
  name: string;
}

function toOptions(references: readonly Reference[] = []) {
  return references.map((reference) => ({ value: reference.id, label: reference.name }));
}

function findPriority(value: string) {
  return CASE_PRIORITIES.find((priority) => priority === value);
}

/** The Create Case fields. Values live in react-hook-form, provided by the draft panel. */
export function CaseDraftForm({ shouldFocusFirstField }: CaseDraftFormProps) {
  const { t } = useTranslation('caseIntake');
  const { t: tCases } = useTranslation('cases');
  const { control, setValue } = useFormContext<CaseDraftValues>();
  const priority = useWatch({ control, name: 'priority' });
  const referenceData = useCaseReferenceData();

  const priorityOptions = CASE_PRIORITIES.map((value) => ({ value, label: tCases(`priority.${value}`) }));
  const dueDateHint = t('form.dueDateHint', {
    priority: tCases(`priority.${priority}`),
    count: PRIORITY_DUE_DAYS[priority],
  });
  const isLoadingReferenceData = referenceData.isPending;

  /** A priority change resets the due date to that priority's allowance; the user can still edit it. */
  function handlePriorityChange(value: string) {
    const nextPriority: CasePriority | undefined = findPriority(value);
    if (!nextPriority) return;
    setValue('dueDate', getDefaultDueDate(nextPriority), { shouldDirty: true, shouldValidate: true });
  }

  function handleReferenceRetry() {
    void referenceData.refetch();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 lg:p-6">
      {referenceData.isError && <ReferenceDataAlert onRetry={handleReferenceRetry} />}

      <FormSection title={t('form.sections.details')}>
        <TextField
          name="title"
          label={t('form.title')}
          placeholder={t('form.titlePlaceholder')}
          isRequired
          autoFocus={shouldFocusFirstField}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="priority"
            label={t('form.priority')}
            options={priorityOptions}
            isRequired
            onValueChange={handlePriorityChange}
          />
          <DateField name="dueDate" label={t('form.dueDate')} description={dueDateHint} isRequired />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            name="typeId"
            label={t('form.caseType')}
            placeholder={t('form.caseTypePlaceholder')}
            options={toOptions(referenceData.data?.types)}
            isLoading={isLoadingReferenceData}
            isRequired
          />
          <TagsField
            name="tags"
            label={t('form.tags')}
            placeholder={t('form.tagsPlaceholder')}
            suggestions={referenceData.data?.tags}
            description={t('form.tagsHint')}
          />
        </div>
        <TextareaField
          name="description"
          label={t('form.description')}
          placeholder={t('form.descriptionPlaceholder')}
          rows={5}
          isRequired
        />
      </FormSection>

      <FormSection title={t('form.sections.event')} description={t('form.sections.eventDescription')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField name="event.date" label={t('form.eventDate')} />
          <SelectField
            name="event.typeId"
            label={t('form.eventType')}
            emptyOptionLabel={t('form.notSet')}
            options={toOptions(referenceData.data?.eventTypes)}
            isLoading={isLoadingReferenceData}
          />
        </div>
        <TextField name="event.location" label={t('form.eventLocation')} placeholder={t('form.eventLocationPlaceholder')} />
      </FormSection>

      <FormSection title={t('form.sections.correspondence')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="correspondence.number" label={t('form.correspondenceNumber')} />
          <DateField name="correspondence.date" label={t('form.correspondenceDate')} />
        </div>
      </FormSection>

      <FormSection title={t('form.sections.routing')}>
        <MultiSelectField
          name="sectionIds"
          label={t('form.sectionIds')}
          placeholder={t('form.sectionsPlaceholder')}
          options={toOptions(referenceData.data?.sections)}
          isLoading={isLoadingReferenceData}
          description={t('form.sectionsHint')}
        />
      </FormSection>
    </div>
  );
}

function ReferenceDataAlert({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation('caseIntake');

  return (
    <div role="alert" className="flex items-center gap-3 rounded-md border border-danger bg-danger-soft p-3 text-sm">
      <CircleAlert aria-hidden className="size-4 shrink-0 text-danger" />
      <p className="flex-1 text-content">{t('form.referenceDataError')}</p>
      <Button size="sm" onClick={onRetry}>
        <RotateCw aria-hidden />
        {t('form.retry')}
      </Button>
    </div>
  );
}
