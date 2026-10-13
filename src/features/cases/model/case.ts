import { z } from 'zod';

/** Workflow order — also the order of the status sort and the board columns. */
export const CASE_STATUSES = [
  'new',
  'open',
  'inProgress',
  'pendingSignatureIn',
  'pendingSignatureOut',
  'closed',
] as const;

/** Most to least urgent — also the ascending priority sort order. */
export const CASE_PRIORITIES = ['urgent', 'high', 'normal', 'low'] as const;

export const CASE_SOURCES = ['bulletin', 'intake', 'interception'] as const;

export const caseStatusSchema = z.enum(CASE_STATUSES);
export const casePrioritySchema = z.enum(CASE_PRIORITIES);
export const caseSourceSchema = z.enum(CASE_SOURCES);

/** A reference-data entry (case type, section, owner) as the server embeds it. */
export const referenceSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const caseSchema = z.object({
  id: z.string(),
  reference: z.string(),
  title: z.string(),
  status: caseStatusSchema,
  priority: casePrioritySchema,
  type: referenceSchema,
  section: referenceSchema,
  owner: referenceSchema.nullable(),
  dueDate: z.iso.date(),
  updatedAt: z.iso.date(),
  /** Computed by the server: past due and not closed. The client never decides "now". */
  isOverdue: z.boolean(),
  source: caseSourceSchema.nullable(),
  isProcessed: z.boolean(),
  tags: z.array(z.string()),
  tasks: z.object({
    done: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
});

export const caseListResponseSchema = z.object({
  items: z.array(caseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

/** Quick-tab counts — one call for all three tabs, never three list queries. */
export const caseCountsSchema = z.object({
  needsYou: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  all: z.number().int().nonnegative(),
});

/** Options for the Type / Section / Owner filters. */
export const caseReferenceDataSchema = z.object({
  types: z.array(referenceSchema),
  sections: z.array(referenceSchema),
  owners: z.array(referenceSchema),
});

/** A report or document linked to a case — shown in the expanded row. */
export const linkedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: caseStatusSchema,
  section: referenceSchema,
  owner: referenceSchema.nullable(),
  dueDate: z.iso.date(),
  updatedAt: z.iso.date(),
});

export const linkedItemsResponseSchema = z.object({
  items: z.array(linkedItemSchema),
});

export type CaseStatus = z.infer<typeof caseStatusSchema>;
export type CasePriority = z.infer<typeof casePrioritySchema>;
export type CaseSource = z.infer<typeof caseSourceSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type Case = z.infer<typeof caseSchema>;
export type CaseListResponse = z.infer<typeof caseListResponseSchema>;
export type CaseCounts = z.infer<typeof caseCountsSchema>;
export type CaseReferenceData = z.infer<typeof caseReferenceDataSchema>;
export type LinkedItem = z.infer<typeof linkedItemSchema>;
