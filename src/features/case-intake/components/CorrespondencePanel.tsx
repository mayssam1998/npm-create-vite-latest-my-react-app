import { useTranslation } from 'react-i18next';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { FileField } from '@/shared/ui/form/FileField';
import { CORRESPONDENCE_ACCEPT, CORRESPONDENCE_MAX_BYTES } from '../model/caseDraft';

/**
 * The incoming correspondence beside the form: drop or pick one image or PDF, then read it
 * while filling the fields. Kept with the draft on this device.
 */
export function CorrespondencePanel() {
  const { t } = useTranslation('caseIntake');
  const { formatFileSize } = useFormatters();

  return (
    <section aria-labelledby="correspondence-heading" className="flex h-full min-h-0 flex-col gap-3 p-4 lg:p-6">
      <h3 id="correspondence-heading" className="text-sm font-semibold text-content">
        {t('correspondence.title')}
      </h3>
      <FileField
        name="correspondenceFile"
        label={t('correspondence.dropTitle')}
        hint={t('correspondence.dropHint', { size: formatFileSize(CORRESPONDENCE_MAX_BYTES) })}
        accept={CORRESPONDENCE_ACCEPT}
        maxSizeBytes={CORRESPONDENCE_MAX_BYTES}
        className="min-h-72 flex-1"
      />
    </section>
  );
}
