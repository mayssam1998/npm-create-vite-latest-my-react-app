import { z } from 'zod';
import { createCaseSchema, PRIORITY_DUE_DAYS, type CreateCaseInput } from '@/features/cases';
import { addDaysToIsoDate, todayIsoDate } from '@/shared/lib/isoDate';

/** The incoming correspondence: one image or PDF per case. */
export const CORRESPONDENCE_ACCEPT = 'image/*,application/pdf';
export const CORRESPONDENCE_MAX_BYTES = 25 * 1024 * 1024;

/** Local changes are written to the drafts store this long after typing stops. */
export const AUTOSAVE_DELAY_MS = 500;

/**
 * What the Create Case form edits: the create-case contract plus the attached
 * correspondence, which stays on this device (no upload endpoint exists yet).
 */
export const caseDraftFormSchema = createCaseSchema.extend({
  correspondenceFile: z.instanceof(File).nullable(),
});

export type CaseDraftValues = z.infer<typeof caseDraftFormSchema>;

/** "Save as draft" validates partially: required fields may be missing, but what is there must be valid. */
export const caseDraftPayloadSchema = createCaseSchema.partial();
export type CaseDraftPayload = z.infer<typeof caseDraftPayloadSchema>;

/** What the server returns for a saved draft. The first save reserves the case number. */
export const serverDraftSchema = z.object({
  id: z.string(),
  reference: z.string(),
  savedAt: z.iso.datetime(),
});

export type ServerDraft = z.infer<typeof serverDraftSchema>;

export interface CaseDraft {
  id: string;
  values: CaseDraftValues;
  createdAt: string;
  updatedAt: string;
  /** Bumped on every local change. */
  revision: number;
  /** The revision last saved to the server — equal to `revision` when nothing is unsaved. */
  savedRevision: number;
  serverDraft: ServerDraft | null;
}

export function createEmptyDraftValues(): CaseDraftValues {
  return {
    title: '',
    priority: 'normal',
    dueDate: getDefaultDueDate('normal'),
    typeId: '',
    tags: [],
    description: '',
    event: { date: '', typeId: '', location: '' },
    correspondence: { number: '', date: '' },
    sectionIds: [],
    correspondenceFile: null,
  };
}

export function createDraft(id: string): CaseDraft {
  const now = new Date().toISOString();
  return { id, values: createEmptyDraftValues(), createdAt: now, updatedAt: now, revision: 0, savedRevision: 0, serverDraft: null };
}

export function getDefaultDueDate(priority: CreateCaseInput['priority']) {
  return addDaysToIsoDate(todayIsoDate(), PRIORITY_DUE_DAYS[priority]);
}

/** Never edited and never saved — closing it loses nothing, so it is deleted instead of kept. */
export function isBlankDraft(draft: CaseDraft) {
  return draft.revision === 0 && draft.serverDraft === null;
}

/** Has local changes the server copy does not have yet. */
export function hasUnsavedChanges(draft: CaseDraft) {
  return draft.revision !== draft.savedRevision;
}

/** The create-case body: the form values without the local-only file. */
export function toCreateCaseInput(values: CaseDraftValues): CreateCaseInput {
  return {
    title: values.title,
    priority: values.priority,
    dueDate: values.dueDate,
    typeId: values.typeId,
    tags: values.tags,
    description: values.description,
    event: values.event,
    correspondence: values.correspondence,
    sectionIds: values.sectionIds,
  };
}

/** The draft body before partial validation: empty top-level text is left out rather than sent as ''. */
export function toDraftPayloadInput(values: CaseDraftValues) {
  return Object.fromEntries(Object.entries(toCreateCaseInput(values)).filter(([, value]) => value !== ''));
}
