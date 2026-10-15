/**
 * Every date and number shown to a user goes through these Intl helpers.
 * Never hand-format a date or a number in a component.
 */

const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

/** Format a calendar date (`YYYY-MM-DD`). Read as UTC so it never shifts a day across time zones. */
export function formatDate(isoDate: string, locale: string) {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });
    dateFormatters.set(locale, formatter);
  }
  return formatter.format(new Date(isoDate));
}

export function formatNumber(value: number, locale: string) {
  let formatter = numberFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatters.set(locale, formatter);
  }
  return formatter.format(value);
}

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

/** Format an instant (an ISO timestamp) as a short date and time in the user's time zone. */
export function formatDateTime(isoDateTime: string, locale: string) {
  let formatter = dateTimeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });
    dateTimeFormatters.set(locale, formatter);
  }
  return formatter.format(new Date(isoDateTime));
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
const BYTES_PER_UNIT = 1024;

/** A file size such as "2.4 MB", with the unit localised by Intl. */
export function formatFileSize(bytes: number, locale: string) {
  let value = bytes;
  let unitIndex = 0;
  while (value >= BYTES_PER_UNIT && unitIndex < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: BYTE_UNITS[unitIndex],
    unitDisplay: 'short',
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(value);
}
