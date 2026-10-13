import { z } from 'zod';
import { urlArray } from '@/shared/lib/urlSchema';
import { caseStatusSchema, casePrioritySchema } from './case';

/** Quick tabs are filter presets: the server interprets `tab` like any other filter. */
export const CASE_TABS = ['needsYou', 'overdue', 'all'] as const;

/** Column ids of the sortable columns — the table header and the sort menu share them. */
export const CASE_SORT_FIELDS = [
  'reference',
  'status',
  'priority',
  'type',
  'section',
  'owner',
  'dueDate',
  'updatedAt',
] as const;

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

/** 200 is above the 100-row budget, so DataTable virtualises it. */
export const CASE_PAGE_SIZES = [25, 50, 100, 200] as const;

/** Option value for "no owner" in the Owner filter. */
export const UNASSIGNED_OWNER_ID = 'unassigned';

export const SEARCH_DEBOUNCE_MS = 300;

export const caseTabSchema = z.enum(CASE_TABS);
export const caseSortFieldSchema = z.enum(CASE_SORT_FIELDS);
export const sortDirectionSchema = z.enum(SORT_DIRECTIONS);

/**
 * The URL shape of the case list. Every field has a `.catch()` so a stale or hand-edited
 * link falls back to defaults instead of breaking, and `parse({})` yields the defaults.
 */
export const caseFiltersSchema = z.object({
  tab: caseTabSchema.catch('needsYou'),
  q: z.string().catch(''),
  status: urlArray(caseStatusSchema),
  priority: urlArray(casePrioritySchema),
  typeId: urlArray(z.string()),
  sectionId: urlArray(z.string()),
  ownerId: urlArray(z.string()),
  sort: caseSortFieldSchema.catch('status'),
  dir: sortDirectionSchema.catch('asc'),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().pipe(z.literal(CASE_PAGE_SIZES)).catch(50),
});

/** The list/board switch also lives in the URL, but it is not part of the query. */
export const caseViewSchema = z.object({
  view: z.enum(['table', 'board']).catch('table'),
});

export type CaseTab = z.infer<typeof caseTabSchema>;
export type CaseSortField = z.infer<typeof caseSortFieldSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type CaseFilters = z.infer<typeof caseFiltersSchema>;
export type CaseView = z.infer<typeof caseViewSchema>['view'];

/** What the list query is keyed on and sends to the server. */
export type CaseListParams = CaseFilters;

/** Tab counts ignore the tab itself, the sort and the page. */
export type CaseCountsParams = Omit<CaseFilters, 'tab' | 'sort' | 'dir' | 'page' | 'pageSize'>;

/** The filter fields cleared by "Reset" — the tab, sort and page size are kept. */
export const RESETTABLE_FILTER_KEYS = [
  'q',
  'status',
  'priority',
  'typeId',
  'sectionId',
  'ownerId',
  'page',
] as const satisfies readonly (keyof CaseFilters)[];

export function hasActiveCaseFilters(filters: CaseFilters) {
  return (
    filters.q.trim() !== '' ||
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.typeId.length > 0 ||
    filters.sectionId.length > 0 ||
    filters.ownerId.length > 0
  );
}

/** True when an old or hand-edited link asks for a page beyond the last one. */
export function isPastLastPage({ page, pageSize }: CaseFilters, total: number) {
  return total > 0 && page > Math.ceil(total / pageSize);
}

export function toCaseCountsParams(params: CaseListParams): CaseCountsParams {
  return {
    q: params.q,
    status: params.status,
    priority: params.priority,
    typeId: params.typeId,
    sectionId: params.sectionId,
    ownerId: params.ownerId,
  };
}
