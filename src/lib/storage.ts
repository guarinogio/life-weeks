const KEY = "lifeweeks.v1";

export function getDOB(): string | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as { dobISO?: string; locked?: boolean };
    return parsed?.dobISO ?? null;
  } catch {
    return null;
  }
}

export function setDOB(dobISO: string) {
  const payload = { dobISO, locked: true };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearDOB() {
  localStorage.removeItem(KEY);
}
