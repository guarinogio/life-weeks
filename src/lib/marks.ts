import { weeksBetween } from "./date";
import type { LifeMark } from "./storage";

export function computeWeekIndex(dobISO: string, dateISO: string): number {
  return weeksBetween(dobISO, dateISO);
}

export function groupByWeekIndex(marks: LifeMark[]): Map<number, LifeMark[]> {
  const m = new Map<number, LifeMark[]>();
  for (const mk of marks) {
    const arr = m.get(mk.weekIndex) ?? [];
    arr.push(mk);
    m.set(mk.weekIndex, arr);
  }
  return m;
}
