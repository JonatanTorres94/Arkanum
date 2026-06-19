// new Date() silently normalizes impossible calendar dates (e.g. 2026-02-31
// rolls over to March) instead of rejecting them, so validate the parsed
// parts round-trip back to the same date instead of trusting Date parsing.
export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year  = Number(yearRaw);
  const month = Number(monthRaw);
  const day   = Number(dayRaw);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
