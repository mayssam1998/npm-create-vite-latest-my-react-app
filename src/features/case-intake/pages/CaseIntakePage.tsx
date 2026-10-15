import { use } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { Button } from '@/shared/ui/Button';
import { ClosedDraftsMenu } from '../components/ClosedDraftsMenu';
import { DraftTabs } from '../components/DraftTabs';
import { ensureDraftsHydrated, useDraftsStore } from '../model/draftsStore';

const CASE_MANAGEMENT_PATH = '/cases';

// Default export ONLY because this is a lazy-loaded route page.
export default function CaseIntakePage() {
  // Suspends (route skeleton) until the drafts are read from IndexedDB, so the tabs never
  // flash empty before they load.
  use(ensureDraftsHydrated());

  const { t } = useTranslation('caseIntake');
  const { formatNumber } = useFormatters();
  const openCount = useDraftsStore((state) => state.openIds.length);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 px-4 py-2 lg:px-6">
        <Button asChild variant="ghost">
          <Link to={CASE_MANAGEMENT_PATH}>
            <ArrowLeft aria-hidden className="rtl:-scale-x-100" />
            {t('page.back')}
          </Link>
        </Button>
        <h1 className="sr-only">{t('page.title')}</h1>
        <p className="text-sm text-content-muted">
          {t('page.openDrafts', { count: openCount, formattedCount: formatNumber(openCount) })}
        </p>
        <div className="ms-auto">
          <ClosedDraftsMenu />
        </div>
      </div>
      <DraftTabs />
    </div>
  );
}
