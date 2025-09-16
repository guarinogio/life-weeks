const KEY = "lifeweeks.v1";

export type Settings = {
  dobISO: string;
  expectancy: number; // years
  locked: true;
};

/** Lee la configuración guardada. Soporta formato legacy (solo DOB). */
export function getSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    // legacy: si era un string con la fecha, migramos
    if (raw.startsWith("{") === false) {
      return {
        dobISO: raw,
        expectancy: 80,
        locked: true,
      };
    }

    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    const dobISO = String(obj.dobISO ?? "");
    const expectancy = Number.isFinite(obj.expectancy) ? obj.expectancy : 80;
    if (!dobISO) return null;

    return {
      dobISO,
      expectancy,
      locked: true,
    };
  } catch {
    return null;
  }
}

/** Guarda/mergea los datos. */
function saveSettings(next: Partial<Settings>) {
  const current = getSettings();
  const merged: Settings = {
    dobISO: next.dobISO ?? current?.dobISO ?? "",
    expectancy:
      typeof next.expectancy === "number"
        ? next.expectancy
        : (current?.expectancy ?? 80),
    locked: true,
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
}

/** Helpers públicos usados por la app */
export function getDOB(): string | null {
  return getSettings()?.dobISO ?? null;
}

export function setDOB(dobISO: string) {
  saveSettings({ dobISO });
}

export function getExpectancy(): number {
  return getSettings()?.expectancy ?? 80;
}

export function setExpectancy(expectancy: number) {
  saveSettings({ expectancy });
}
