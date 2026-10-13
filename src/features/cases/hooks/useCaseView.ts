import { useUrlState } from '@/shared/hooks/useUrlState';
import { caseViewSchema, type CaseView } from '../model/caseFilters';

/** Board or table — in the URL so a shared link opens the same view. */
export function useCaseView() {
  const { values, setValues } = useUrlState(caseViewSchema);

  function setView(view: CaseView) {
    setValues({ view });
  }

  return { view: values.view, setView };
}
