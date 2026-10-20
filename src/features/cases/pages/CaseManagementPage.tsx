import { useTranslation } from 'react-i18next';
import { CaseBoard } from '../components/case-board/CaseBoard';
import { CaseTable } from '../components/case-table/CaseTable';
import { CaseFilterBar } from '../components/case-toolbar/CaseFilterBar';
import { CaseListSummary } from '../components/case-toolbar/CaseListSummary';
import { CaseToolbar } from '../components/case-toolbar/CaseToolbar';
import { useCaseView } from '../hooks/useCaseView';

// Default export ONLY because this is a lazy-loaded route page.
export default function CaseManagementPage() {
  const { t } = useTranslation('cases');
  const { view } = useCaseView();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:p-6">
      <header>
        <h1 className="text-xl font-semibold text-foreground">{t('page.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('page.subtitle')}</p>
      </header>
      <CaseToolbar />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CaseFilterBar />
        <CaseListSummary />
      </div>
      {view === 'board' ? <CaseBoard /> : <CaseTable />}
    </div>
  );
}
