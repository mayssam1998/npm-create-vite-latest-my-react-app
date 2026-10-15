import {
  MOCK_CASES,
  MOCK_EVENT_TYPES,
  MOCK_LINKED_ITEMS,
  MOCK_OWNERS,
  MOCK_SECTIONS,
  MOCK_TAGS,
  MOCK_TYPES,
  isoDateFromToday,
  type MockCaseRow,
  type MockPriority,
  type MockReference,
  type MockStatus,
} from '../data/cases';

/** What a route handler returns; the transport turns it into a JSON Response. */
export interface MockResult {
  status: number;
  body: unknown;
}

const STATUS_ORDER: MockStatus[] = ['new', 'open', 'inProgress', 'pendingSignatureIn', 'pendingSignatureOut', 'closed'];
const PRIORITY_ORDER: MockPriority[] = ['urgent', 'high', 'normal', 'low'];
const NEEDS_YOU_STATUSES: MockStatus[] = ['new', 'pendingSignatureIn', 'pendingSignatureOut'];
const STALLED_AFTER_DAYS = 14;
const UNASSIGNED_OWNER_ID = 'unassigned';
const DEFAULT_PAGE_SIZE = 50;

// ---- joining rows into the API shape -------------------------------------------------

function findReference(references: MockReference[], id: string | null) {
  return references.find((reference) => reference.id === id) ?? null;
}

function isOverdue(row: { status: MockStatus; dueDate: string }) {
  return row.status !== 'closed' && row.dueDate < isoDateFromToday(0);
}

export function toApiCase(row: MockCaseRow) {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    status: row.status,
    priority: row.priority,
    type: findReference(MOCK_TYPES, row.typeId),
    section: findReference(MOCK_SECTIONS, row.sectionId),
    owner: findReference(MOCK_OWNERS, row.ownerId),
    dueDate: row.dueDate,
    updatedAt: row.updatedAt,
    isOverdue: isOverdue(row),
    source: row.source,
    isProcessed: row.isProcessed,
    tags: row.tags,
    tasks: row.tasks,
  };
}

// ---- filtering, tabs, sorting ----------------------------------------------------------

function matchesList(values: string[], value: string) {
  return values.length === 0 || values.includes(value);
}

function matchesFilters(row: MockCaseRow, query: URLSearchParams) {
  const search = (query.get('q') ?? '').trim().toLowerCase();
  const ownerName = findReference(MOCK_OWNERS, row.ownerId)?.name ?? '';
  const matchesSearch =
    !search || [row.reference, row.title, ownerName].some((field) => field.toLowerCase().includes(search));

  return (
    matchesSearch &&
    matchesList(query.getAll('status'), row.status) &&
    matchesList(query.getAll('priority'), row.priority) &&
    matchesList(query.getAll('typeId'), row.typeId) &&
    matchesList(query.getAll('sectionId'), row.sectionId) &&
    matchesList(query.getAll('ownerId'), row.ownerId ?? UNASSIGNED_OWNER_ID)
  );
}

function isStalled(row: MockCaseRow) {
  return row.status !== 'closed' && row.updatedAt < isoDateFromToday(-STALLED_AFTER_DAYS);
}

/** The server owns what each quick tab means. */
const TAB_PREDICATES: Record<string, (row: MockCaseRow) => boolean> = {
  needsYou: (row) => NEEDS_YOU_STATUSES.includes(row.status),
  overdue: (row) => isOverdue(row) || isStalled(row),
  all: () => true,
};

const SORT_VALUE: Record<string, (row: MockCaseRow) => string | number> = {
  reference: (row) => row.reference,
  status: (row) => STATUS_ORDER.indexOf(row.status),
  priority: (row) => PRIORITY_ORDER.indexOf(row.priority),
  type: (row) => findReference(MOCK_TYPES, row.typeId)?.name ?? '',
  section: (row) => findReference(MOCK_SECTIONS, row.sectionId)?.name ?? '',
  owner: (row) => findReference(MOCK_OWNERS, row.ownerId)?.name ?? '￿', // unassigned last
  dueDate: (row) => row.dueDate,
  updatedAt: (row) => row.updatedAt,
};

function compareRows(sort: string, direction: number) {
  const getValue = SORT_VALUE[sort] ?? SORT_VALUE.status;
  return (a: MockCaseRow, b: MockCaseRow) => {
    const left = getValue(a);
    const right = getValue(b);
    const order = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right));
    // Tie-break on reference, newest first, so paging is stable.
    return order * direction || b.reference.localeCompare(a.reference);
  };
}

// ---- routes ----------------------------------------------------------------------------

function listCases(query: URLSearchParams): MockResult {
  const matchesTab = TAB_PREDICATES[query.get('tab') ?? 'all'] ?? TAB_PREDICATES.all;
  const direction = query.get('dir') === 'desc' ? -1 : 1;
  const page = Math.max(1, Number(query.get('page')) || 1);
  const pageSize = Math.max(1, Number(query.get('pageSize')) || DEFAULT_PAGE_SIZE);

  const rows = MOCK_CASES.filter((row) => matchesFilters(row, query) && matchesTab(row)).sort(
    compareRows(query.get('sort') ?? 'status', direction),
  );
  const start = (page - 1) * pageSize;

  return {
    status: 200,
    body: { items: rows.slice(start, start + pageSize).map(toApiCase), total: rows.length, page, pageSize },
  };
}

/** All three tab counts in one call, under the same filters as the list. */
function countCases(query: URLSearchParams): MockResult {
  const rows = MOCK_CASES.filter((row) => matchesFilters(row, query));
  return {
    status: 200,
    body: {
      needsYou: rows.filter(TAB_PREDICATES.needsYou).length,
      overdue: rows.filter(TAB_PREDICATES.overdue).length,
      all: rows.length,
    },
  };
}

function listLinkedItems(caseId: string): MockResult {
  const items = MOCK_LINKED_ITEMS[caseId];
  if (!items) return { status: 404, body: { message: `Case ${caseId} not found` } };

  return {
    status: 200,
    body: {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        section: findReference(MOCK_SECTIONS, item.sectionId),
        owner: findReference(MOCK_OWNERS, item.ownerId),
        dueDate: item.dueDate,
        updatedAt: item.updatedAt,
      })),
    },
  };
}

const LINKED_ITEMS_PATH = /^\/cases\/([^/]+)\/linked-items$/;

export function handleCasesRequest(method: string, path: string, query: URLSearchParams): MockResult | null {
  if (method !== 'GET') return null;
  if (path === '/cases') return listCases(query);
  if (path === '/cases/counts') return countCases(query);
  if (path === '/cases/reference-data') {
    return {
      status: 200,
      body: { types: MOCK_TYPES, sections: MOCK_SECTIONS, owners: MOCK_OWNERS, eventTypes: MOCK_EVENT_TYPES, tags: MOCK_TAGS },
    };
  }

  const linkedItemsMatch = LINKED_ITEMS_PATH.exec(path);
  if (linkedItemsMatch) return listLinkedItems(decodeURIComponent(linkedItemsMatch[1]));

  return null;
}
