import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { z } from 'zod';
import { ApiError } from './apiClient';

/** A message for one field. `path` is dotted (`event.date`); `message` is a translation key or server text. */
export interface FieldIssue {
  path: string;
  message: string;
}

/**
 * The server's validation error body. The real API shape is still unknown
 * (see .claude/rules/open-questions.md) — this placeholder is what the mock server sends.
 */
const serverFieldErrorsSchema = z.object({
  fieldErrors: z.record(z.string(), z.string()),
});

/** Field issues carried by a failed request, or an empty list when the error is not a validation error. */
export function getServerFieldIssues(error: unknown): FieldIssue[] {
  if (!(error instanceof ApiError)) return [];
  const parsed = serverFieldErrorsSchema.safeParse(error.body);
  if (!parsed.success) return [];
  return Object.entries(parsed.data.fieldErrors).map(([path, message]) => ({ path, message }));
}

export function getZodFieldIssues(error: z.ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
}

/**
 * The one place that puts field-level errors onto a react-hook-form form, so each message
 * lands under its own input. Focuses the first field with an error. Returns whether any
 * issue was applied.
 */
export function applyFieldIssues<TValues extends FieldValues>(
  issues: readonly FieldIssue[],
  setError: UseFormSetError<TValues>,
) {
  issues.forEach((issue, index) => {
    // Paths come from outside the type system (server body, Zod issue): trusted as field paths.
    setError(issue.path as FieldPath<TValues>, { type: 'server', message: issue.message }, { shouldFocus: index === 0 });
  });
  return issues.length > 0;
}
