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
