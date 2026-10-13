import { LayoutGrid, Plus, Table2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useFormatters } from '@/shared/hooks/useFormatters';
import { Button } from '@/shared/ui/Button';
import { SearchInput } from '@/shared/ui/SearchInput';
import { SegmentedControl, type SegmentedControlItem } from '@/shared/ui/SegmentedControl';
import { useCaseCounts } from '../../api/case.queries';
import { useCaseFilters } from '../../hooks/useCaseFilters';
import { useCaseView } from '../../hooks/useCaseView';
import { CASE_TABS, type CaseTab, type CaseView } from '../../model/caseFilters';

/** The intake module is not built yet; both actions land on its route. */
const CASE_INTAKE_PATH = '/case-intake';

export function CaseToolbar() {
  const { t } = useTranslation('cases');
  const { formatNumber } = useFormatters();
  const { filters, countsParams, setFilters, setSearch } = useCaseFilters();
  const { view, setView } = useCaseView();
  // One server call for all three tab badges — never one list query per tab.
  const { data: counts } = useCaseCounts(countsParams);

  const tabItems: SegmentedControlItem<CaseTab>[] = CASE_TABS.map((tab) => ({
    value: tab,
    label: t(`tabs.${tab}`),
    count: counts ? formatNumber(counts[tab]) : undefined,
  }));

  const viewItems: SegmentedControlItem<CaseView>[] = [
    { value: 'board', label: t('view.board'), icon: LayoutGrid },
    { value: 'table', label: t('view.table'), icon: Table2 },
  ];

  function handleTabChange(tab: CaseTab) {
    setFilters({ tab });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SegmentedControl label={t('tabs.label')} items={tabItems} value={filters.tab} onValueChange={handleTabChange} />
      <SearchInput
        className="w-full sm:w-72"
        label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={filters.q}
        onValueChange={setSearch}
      />
      <div className="ms-auto flex flex-wrap items-center gap-2">
        <SegmentedControl label={t('view.label')} items={viewItems} value={view} onValueChange={setView} />
        <Button asChild>
          <Link to={CASE_INTAKE_PATH}>
            <Upload aria-hidden />
            {t('actions.bulkUpload')}
          </Link>
        </Button>
        <Button asChild variant="primary">
          <Link to={CASE_INTAKE_PATH}>
            <Plus aria-hidden />
            {t('actions.newCase')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
