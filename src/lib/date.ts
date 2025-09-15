import {
  differenceInCalendarDays,
  differenceInYears,
  format,
  isValid,
  parse,
  startOfDay,
} from "date-fns";

/**
 * Parses "dd/mm/yyyy" to ISO ("yyyy-MM-dd").
 * Returns null when:
 *  - format is invalid
 *  - date is in the future
 *  - (optional) age exceeds maxAgeYears
 */
export function parseDMYToISO(
  dmy: string,
  maxAgeYears?: number
): string | null {
  const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m = dmy.trim().match(re);
  if (!m) return null;

  const d = parse(`${m[1]}/${m[2]}/${m[3]}`, "d/M/yyyy", new Date());
  if (!isValid(d)) return null;

  const today = startOfDay(new Date());
  const dob = startOfDay(d);

  // future date not allowed
  if (dob > today) return null;

  // reject if older than maxAgeYears (allow exactly == max)
  if (typeof maxAgeYears === "number") {
    const years = differenceInYears(today, dob); // full years
    if (years > maxAgeYears) return null;
  }

  return format(dob, "yyyy-MM-dd");
}

export function weeksBetween(dobISO: string, date = new Date()): number {
  // full weeks elapsed
  const dob = startOfDay(new Date(dobISO));
  const today = startOfDay(date);
  const days = differenceInCalendarDays(today, dob);
  const lived = Math.floor(Math.max(0, days) / 7);
  return lived;
}

export function ageBreakdown(dobISO: string) {
  const dob = startOfDay(new Date(dobISO));
  const today = startOfDay(new Date());
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  if (years < 0) years = 0;

  return { years, months, days };
}

export function nextBirthday(dobISO: string): Date {
  const dob = new Date(dobISO);
  const today = new Date();
  const year =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
      ? today.getFullYear() + 1
      : today.getFullYear();
  return new Date(year, dob.getMonth(), dob.getDate());
}
