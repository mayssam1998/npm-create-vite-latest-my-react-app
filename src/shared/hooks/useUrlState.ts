import { useSearchParams } from 'react-router';
import type { z } from 'zod';

interface SetUrlStateOptions {
  /** Replace the history entry instead of pushing one — use for keystrokes. */
  replace?: boolean;
}

type RawParams = Record<string, string | string[]>;

function readParams(searchParams: URLSearchParams, keys: readonly string[]): RawParams {
  const raw: RawParams = {};
  for (const key of keys) {
    const values = searchParams.getAll(key);
    if (values.length === 1) raw[key] = values[0];
    else if (values.length > 1) raw[key] = values;
  }
  return raw;
}

function isSameValue(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Typed state in the URL search params, described by a Zod object schema.
 *
 * - Every field must have a `.catch()` (or `.default()`), so a hand-edited or stale link
 *   degrades to defaults instead of throwing, and `schema.parse({})` yields the defaults.
 * - Default values are never written: resetting a field removes its param.
 * - Arrays are written as repeated params (`?status=a&status=b`); read them with `urlArray`.
 * - Only the schema's own keys are read or written, so several hooks can share one URL.
 */
export function useUrlState<TSchema extends z.ZodObject>(schema: TSchema) {
  const [searchParams, setSearchParams] = useSearchParams();
  const keys = Object.keys(schema.shape);
  const values: z.output<TSchema> = schema.parse(readParams(searchParams, keys));
  const defaults: Record<string, unknown> = schema.parse({});

  function setValues(patch: Partial<z.output<TSchema>>, { replace = false }: SetUrlStateOptions = {}) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          next.delete(key);
          if (value === undefined || isSameValue(value, defaults[key])) continue;
          if (Array.isArray(value)) {
            for (const item of value) next.append(key, String(item));
          } else {
            next.set(key, String(value));
          }
        }
        return next;
      },
      { replace },
    );
  }

  /** Remove the given keys (all of the schema's keys by default) from the URL. */
  function resetValues(keysToReset: readonly (keyof z.output<TSchema> & string)[] = keys) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const key of keysToReset) next.delete(key);
      return next;
    });
  }

  return { values, setValues, resetValues };
}
