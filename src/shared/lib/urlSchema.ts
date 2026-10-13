import { z } from 'zod';

/**
 * A multi-value URL param (`?status=a&status=b`). One value arrives as a string,
 * several as an array, none as undefined — all normalise to an array.
 * An invalid value falls back to an empty list instead of breaking a shared link.
 */
export function urlArray<T extends z.ZodType>(item: T) {
  return z
    .preprocess((value) => {
      if (value === undefined) return [];
      return Array.isArray(value) ? value : [value];
    }, z.array(item))
    .catch([]);
}
