import type { LifeMark } from "./storage";

/** Agrupa las marcas por índice de semana */
export function groupByWeekIndex(marks: LifeMark[]): Map<number, LifeMark[]> {
  const map = new Map<number, LifeMark[]>();
  for (const m of marks) {
    const bucket = map.get(m.weekIndex) ?? [];
    bucket.push(m);
    map.set(m.weekIndex, bucket);
  }
  return map;
}
