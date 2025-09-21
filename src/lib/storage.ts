export type LifeMarkKind = "milestone" | "plan" | "note";

export type LifeMark = {
  id: string;
  title: string;
  kind: LifeMarkKind;
  dateISO: string;
  weekIndex: number;
  tag?: string;
  notes?: string;
};

const KEY_DOB = "lifeweeks:dob";
const KEY_EXPECTANCY = "lifeweeks:expectancy";
const KEY_MARKS = "lifeweeks:marks";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function emitMarksChanged(): void {
  window.dispatchEvent(new Event("lifeweeks:marks-changed"));
}

export function getDOB(): string | null {
  return localStorage.getItem(KEY_DOB);
}
export function setDOB(iso: string): void {
  localStorage.setItem(KEY_DOB, iso);
}
export function getExpectancy(): number {
  const raw = localStorage.getItem(KEY_EXPECTANCY);
  const n = raw ? parseInt(raw, 10) : 80;
  return Number.isFinite(n) ? n : 80;
}
export function setExpectancy(years: number): void {
  localStorage.setItem(KEY_EXPECTANCY, String(years));
}

export function listMarks(): LifeMark[] {
  const arr = safeParse<LifeMark[]>(localStorage.getItem(KEY_MARKS), []);
  return Array.isArray(arr) ? arr : [];
}
export function addMark(payload: Omit<LifeMark, "id">): string {
  const id = crypto.randomUUID();
  const next: LifeMark = { id, ...payload };
  const arr = listMarks();
  arr.push(next);
  localStorage.setItem(KEY_MARKS, JSON.stringify(arr));
  emitMarksChanged();
  return id;
}
export function updateMark(id: string, payload: Omit<LifeMark, "id">): void {
  const arr = listMarks();
  const idx = arr.findIndex((m) => m.id === id);
  if (idx >= 0) {
    arr[idx] = { id, ...payload };
    localStorage.setItem(KEY_MARKS, JSON.stringify(arr));
    emitMarksChanged();
  }
}
export function removeMark(id: string): void {
  const arr = listMarks().filter((m) => m.id !== id);
  localStorage.setItem(KEY_MARKS, JSON.stringify(arr));
  emitMarksChanged();
}

type ExportShapeV1 = {
  version: 1;
  dob: string | null;
  expectancy: number;
  marks: LifeMark[];
};

export function exportData(): string {
  const payload: ExportShapeV1 = {
    version: 1,
    dob: getDOB(),
    expectancy: getExpectancy(),
    marks: listMarks(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importData(json: string): void {
  const raw: unknown = JSON.parse(json);
  if (typeof raw !== "object" || raw === null) throw new Error("Invalid JSON");
  const data = raw as Partial<ExportShapeV1> & { version?: number };

  const version = data.version ?? 1;
  if (version !== 1) throw new Error("Unsupported export version");

  if (typeof data.dob === "string") setDOB(data.dob);
  if (typeof data.expectancy === "number") setExpectancy(data.expectancy);

  const marks = Array.isArray(data.marks) ? data.marks : [];
  const sanitized: LifeMark[] = marks
    .filter(Boolean)
    .map((m) => {
      const id = m.id || crypto.randomUUID();
      const title = String(m.title ?? "").trim();
      const kind = (m.kind ?? "note") as LifeMarkKind;
      const dateISO = String(m.dateISO ?? "").slice(0, 10);
      const weekIndex = Number.isFinite(m.weekIndex) ? m.weekIndex : 0;
      const tag = m.tag ? String(m.tag) : undefined;
      const notes = m.notes ? String(m.notes) : undefined;
      return { id, title, kind, dateISO, weekIndex, tag, notes };
    })
    .filter((m) => m.title.length > 0);

  localStorage.setItem(KEY_MARKS, JSON.stringify(sanitized));
  emitMarksChanged();
}

export function resetAll(): void {
  localStorage.removeItem(KEY_DOB);
  localStorage.removeItem(KEY_EXPECTANCY);
  localStorage.removeItem(KEY_MARKS);
  emitMarksChanged();
}

export function groupByWeekIndex(marks: LifeMark[]): Map<number, LifeMark[]> {
  const map = new Map<number, LifeMark[]>();
  for (const m of marks) {
    const list = map.get(m.weekIndex) ?? [];
    list.push(m);
    map.set(m.weekIndex, list);
  }
  return map;
}
