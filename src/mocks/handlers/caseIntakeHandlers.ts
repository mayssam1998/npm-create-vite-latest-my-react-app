import { MOCK_CASES, MOCK_LINKED_ITEMS, MOCK_SECTIONS, isoDateFromToday, type MockCaseRow, type MockPriority } from '../data/cases';
import { toApiCase, type MockResult } from './casesHandlers';

/** A draft saved to the server: the payload is kept as-is, plus the case number it reserved. */
interface MockDraft {
  reference: string;
  savedAt: string;
  payload: unknown;
}

const MOCK_DRAFTS = new Map<string, MockDraft>();

const PRIORITIES: MockPriority[] = ['urgent', 'high', 'normal', 'low'];
const DEFAULT_SECTION_ID = 'sec-cid';
const REFERENCE_PATTERN = /^CASE-(\d{4})-(\d{4})$/;

/** Next free `CASE-YYYY-NNNN` for the current year, across cases and reserved draft numbers. */
function nextCaseReference() {
  const year = new Date().getFullYear();
  const usedReferences = [...MOCK_CASES.map((row) => row.reference), ...[...MOCK_DRAFTS.values()].map((draft) => draft.reference)];
  const highest = usedReferences.reduce((max, reference) => {
    const match = REFERENCE_PATTERN.exec(reference);
    return match && Number(match[1]) === year ? Math.max(max, Number(match[2])) : max;
  }, 0);
  return `CASE-${year}-${String(highest + 1).padStart(4, '0')}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : '';
}

function readStrings(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** The server re-validates; a 422 carries field errors the form maps back onto its inputs. */
function validateCase(body: Record<string, unknown>) {
  const fieldErrors: Record<string, string> = {};
  if (!readString(body, 'title')) fieldErrors.title = 'validation.required';
  if (!readString(body, 'description')) fieldErrors.description = 'validation.required';
  if (!readString(body, 'typeId')) fieldErrors.typeId = 'validation.required';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(readString(body, 'dueDate'))) fieldErrors.dueDate = 'validation.invalidDate';
  return fieldErrors;
}

function createCase(body: unknown): MockResult {
  if (!isRecord(body)) return { status: 400, body: { message: 'Expected a JSON body' } };

  const fieldErrors = validateCase(body);
  if (Object.keys(fieldErrors).length > 0) return { status: 422, body: { message: 'Validation failed', fieldErrors } };

  const draftId = readString(body, 'draftId');
  const reservedReference = draftId ? MOCK_DRAFTS.get(draftId)?.reference : undefined;
  const priority = PRIORITIES.find((candidate) => candidate === body.priority) ?? 'normal';
  const sectionId = readStrings(body, 'sectionIds').find((id) => MOCK_SECTIONS.some((section) => section.id === id));
  const id = `case-${crypto.randomUUID()}`;

  const row: MockCaseRow = {
    id,
    reference: reservedReference ?? nextCaseReference(),
    title: readString(body, 'title'),
    status: 'new',
    priority,
    typeId: readString(body, 'typeId'),
    sectionId: sectionId ?? DEFAULT_SECTION_ID,
    ownerId: null,
    dueDate: readString(body, 'dueDate'),
    updatedAt: isoDateFromToday(0),
    source: 'intake',
    isProcessed: false,
    tags: readStrings(body, 'tags'),
    tasks: { done: 0, total: 0 },
  };

  MOCK_CASES.unshift(row);
  MOCK_LINKED_ITEMS[id] = [];
  if (draftId) MOCK_DRAFTS.delete(draftId);

  return { status: 201, body: toApiCase(row) };
}

/** PUT is idempotent: the client owns the draft id, and the first save reserves a case number. */
function saveDraft(draftId: string, body: unknown): MockResult {
  if (!isRecord(body)) return { status: 400, body: { message: 'Expected a JSON body' } };

  const reference = MOCK_DRAFTS.get(draftId)?.reference ?? nextCaseReference();
  const draft: MockDraft = { reference, savedAt: new Date().toISOString(), payload: body };
  MOCK_DRAFTS.set(draftId, draft);

  return { status: 200, body: { id: draftId, reference, savedAt: draft.savedAt } };
}

function deleteDraft(draftId: string): MockResult {
  MOCK_DRAFTS.delete(draftId);
  return { status: 204, body: null };
}

const DRAFT_PATH = /^\/case-drafts\/([^/]+)$/;

export function handleCaseIntakeRequest(method: string, path: string, body: unknown): MockResult | null {
  if (method === 'POST' && path === '/cases') return createCase(body);

  const draftMatch = DRAFT_PATH.exec(path);
  if (!draftMatch) return null;
  const draftId = decodeURIComponent(draftMatch[1]);
  if (method === 'PUT') return saveDraft(draftId, body);
  if (method === 'DELETE') return deleteDraft(draftId);
  return null;
}
