import {
  differenceInCalendarDays,
  format,
  isValid,
  parse,
  startOfDay,
} from "date-fns";

export function parseDMYToISO(dmy: string): string | null {
  // admite "dd/mm/aaaa" con o sin ceros
  const re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m = dmy.trim().match(re);
  if (!m) return null;
  const d = parse(`${m[1]}/${m[2]}/${m[3]}`, "d/M/yyyy", new Date());
  if (!isValid(d)) return null;
  // evitar fechas futuras
  const today = startOfDay(new Date());
  if (d > today) return null;
  return format(d, "yyyy-MM-dd");
}

export function weeksBetween(dobISO: string, date = new Date()): number {
  // semanas COMPLETAS transcurridas
  const dob = startOfDay(new Date(dobISO));
  const today = startOfDay(date);
  const days = differenceInCalendarDays(today, dob);
  const lived = Math.floor(Math.max(0, days) / 7);
  return lived;
}

export function ageBreakdown(dobISO: string) {
  const dob = startOfDay(new Date(dobISO));
  const today = startOfDay(new Date());
  // cálculo simple: años/meses/días aproximados para mostrar (sin libs pesadas)
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    // pedir días del mes anterior
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
