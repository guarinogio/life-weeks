import { weeksBetween } from "./date";

export function computeStats(dobISO: string, expectancyYears = 80) {
  const totalWeeks = expectancyYears * 52; // modelo sencillo tipo póster
  const livedWeeks = Math.min(weeksBetween(dobISO), totalWeeks);
  const remainingWeeks = Math.max(totalWeeks - livedWeeks - 1, 0); // -1: semana actual
  const percent = Math.min(100, (livedWeeks / totalWeeks) * 100);
  return { livedWeeks, remainingWeeks, totalWeeks, percent };
}
