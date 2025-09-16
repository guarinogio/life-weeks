/**
 * Utilidades de fecha para Life Weeks.
 * Todas las funciones usan fechas en UTC para evitar desfases por timezone.
 */

/** Crea un Date en UTC a partir de un YYYY, MM (1-12), DD (1-31). */
function utcDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

/** Valida componentes de fecha (en rangos básicos y fecha real del calendario). */
function isValidDateParts(d: number, m: number, y: number): boolean {
  if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return false;
  if (y < 1900 || y > 9999) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const test = utcDate(y, m, d);
  return (
    test.getUTCFullYear() === y &&
    test.getUTCMonth() === m - 1 &&
    test.getUTCDate() === d
  );
}

/**
 * Parsea tres campos (día, mes, año) y devuelve un ISO `YYYY-MM-DD` en UTC.
 * Retorna `null` si la fecha no es válida.
 */
export function parseDMYToISO(
  day: string,
  month: string,
  year: string
): string | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!isValidDateParts(d, m, y)) return null;

  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const yyyy = String(y).padStart(4, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Semanas completas entre DOB e “ahora” (UTC). */
export function weeksBetween(birthDateISO: string): number {
  const birth = new Date(birthDateISO);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff = now.getTime() - birth.getTime();
  return Math.max(0, Math.floor(diff / msPerWeek));
}

/** Desglose de edad aproximado (años/meses/días) en calendario gregoriano. */
export function ageBreakdown(birthDateISO: string) {
  const birth = new Date(birthDateISO);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

/**
 * Semana ISO (1..52/53) para una fecha dada.
 * Algoritmo: mover al jueves de su semana y contar desde el 1 de enero ISO.
 */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // 1..7 (lunes=1)
  d.setUTCDate(d.getUTCDate() + 4 - day); // ir al jueves de la misma semana
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((d.getTime() - yearStart.getTime()) / 86400000) + 1;
  return Math.ceil(diffDays / 7);
}

/**
 * Número de semanas ISO en un año (52 o 53).
 * Se deriva consultando la semana ISO del 31 de diciembre.
 */
export function isoWeeksInYear(year: number): number {
  const dec31 = new Date(Date.UTC(year, 11, 31));
  const wk = isoWeek(dec31);
  return wk === 1 ? 52 : wk;
}
