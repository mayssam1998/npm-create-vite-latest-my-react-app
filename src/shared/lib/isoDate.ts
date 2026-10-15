/**
 * Calendar-date arithmetic on `YYYY-MM-DD` strings, in UTC so a date never shifts a day
 * across time zones. Display formatting lives in `format.ts`, never here.
 */

const DAY_MS = 86_400_000;

/** Today's calendar date in the user's time zone, as `YYYY-MM-DD`. */
export function todayIsoDate() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
}

export function addDaysToIsoDate(isoDate: string, days: number) {
  return new Date(Date.parse(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}
