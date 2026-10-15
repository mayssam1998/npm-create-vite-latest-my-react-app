import { z } from 'zod';
import { casePrioritySchema, type CasePriority } from './case';

// Validation messages are translation keys in the `common` namespace.
const REQUIRED = 'validation.required';
const TOO_LONG = 'validation.tooLong';
const INVALID_DATE = 'validation.invalidDate';

export const CASE_TITLE_MAX_LENGTH = 200;
export const CASE_DESCRIPTION_MAX_LENGTH = 5_000;
const SHORT_TEXT_MAX_LENGTH = 300;
const TAG_MAX_LENGTH = 40;
const MAX_TAGS = 20;

/**
 * Days a case may stay open by priority — the due date a new case starts with.
 * Assumed values: the real service levels have not been specified yet.
 */
export const PRIORITY_DUE_DAYS: Record<CasePriority, number> = {
  urgent: 1,
  high: 3,
  normal: 5,
  low: 10,
};

/** An optional calendar date: `YYYY-MM-DD`, or '' when not set. */
const optionalIsoDate = z.union([z.literal(''), z.iso.date(INVALID_DATE)]);

/**
 * The contract for creating a case — client validation and the POST body are this one
 * schema. Optional text is '' rather than absent, matching what the inputs hold.
 */
export const createCaseSchema = z.object({
  title: z.string().trim().min(1, REQUIRED).max(CASE_TITLE_MAX_LENGTH, TOO_LONG),
  priority: casePrioritySchema,
  dueDate: z.iso.date(INVALID_DATE),
  typeId: z.string().min(1, REQUIRED),
  tags: z.array(z.string().trim().min(1).max(TAG_MAX_LENGTH, TOO_LONG)).max(MAX_TAGS, TOO_LONG),
  description: z.string().trim().min(1, REQUIRED).max(CASE_DESCRIPTION_MAX_LENGTH, TOO_LONG),
  event: z.object({
    date: optionalIsoDate,
    typeId: z.string(),
    location: z.string().trim().max(SHORT_TEXT_MAX_LENGTH, TOO_LONG),
  }),
  correspondence: z.object({
    number: z.string().trim().max(SHORT_TEXT_MAX_LENGTH, TOO_LONG),
    date: optionalIsoDate,
  }),
  sectionIds: z.array(z.string()),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
