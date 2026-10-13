import { CASE_STATUSES, type Case, type CaseStatus } from './case';

export interface CaseStatusGroup {
  status: CaseStatus;
  cases: Case[];
}

/** Board columns in workflow order, skipping statuses with no cases. Keeps the server's sort within a column. */
export function groupCasesByStatus(cases: readonly Case[]): CaseStatusGroup[] {
  return CASE_STATUSES.map((status) => ({
    status,
    cases: cases.filter((item) => item.status === status),
  })).filter((group) => group.cases.length > 0);
}
