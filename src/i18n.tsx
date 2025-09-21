import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export const messages = {
  en: {
    past: "Past",
    current: "Current",
    remaining: "Remaining",
    lifeExpectancy: "Life expectancy",
    years: "years",
    settings: "Settings",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    backup: "Backup",
    export: "Export",
    import: "Import",
    resetSavedData: "Reset saved data",
    openSettings: "Open settings",
    close: "Close",
    editDob: "Edit birth date",
    dobLabel: "Birth date",
    confirm: "Confirm",
    cancel: "Cancel",
    editDobWarning: "Changing your birth date will recalculate and clear all week marks.",
    basedOn52: "Calculation based on 52 weeks/year (poster model)",
    appTitle: "Life Weeks",
    youHaveLived: "You have lived",
    weeksOutOf: "weeks out of",
    remainingLabel: "Remaining",
    ageLabel: "Age",
    yearsLabel: "years",
    monthsLabel: "months",
    daysLabel: "days",
    thisYearLabel: "This year",
    weekLabel: "week",
    ofLabel: "of",
    and: "and",
    setupTitle: "Set up your life calendar",
    setupIntro: "Enter your date of birth and (optional) life expectancy. You can change the expectancy later in Settings.",
    lifeExpectancyYearsLabel: "Life expectancy (years)",
    formatLabel: "Format",
    dateFormatYMD: "YYYY-MM-DD",
    sync: "Sync",
    syncEnable: "Enable Google Drive sync",
    signIn: "Sign in with Google",
    signOut: "Sign out",
    statusSignedInAs: "Signed in as",
    advanced: "Advanced",
    drivePull: "Pull from Drive",
    drivePush: "Push to Drive",
    driveResetFromDrive: "Reset with Drive data",
    forceOverwrite: "Force overwrite",
    quickPush: "Sync push",
    pushConfirmTitle: "Confirm push",
    pushConfirmBody: "Do you want to upload your local data to Google Drive?",
    notConfigured: "Not configured",
    configured: "Configured",
    driveClientId: "Google Client ID",
    driveApiKey: "Google API Key",
    driveConfigSaved: "Drive config saved"
  },
  es: {
    past: "Pasadas",
    current: "Actual",
    remaining: "Restantes",
    lifeExpectancy: "Esperanza de vida",
    years: "años",
    settings: "Ajustes",
    language: "Idioma",
    spanish: "Español",
    english: "Inglés",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    backup: "Respaldo",
    export: "Exportar",
    import: "Importar",
    resetSavedData: "Borrar datos guardados",
    openSettings: "Abrir ajustes",
    close: "Cerrar",
    editDob: "Editar fecha de nacimiento",
    dobLabel: "Fecha de nacimiento",
    confirm: "Confirmar",
    cancel: "Cancelar",
    editDobWarning: "Cambiar tu fecha de nacimiento recalculará y borrará todas las marcas de semanas.",
    basedOn52: "Cálculo basado en 52 semanas/año (modelo póster)",
    appTitle: "Life Weeks",
    youHaveLived: "Has vivido",
    weeksOutOf: "semanas de",
    remainingLabel: "Restantes",
    ageLabel: "Edad",
    yearsLabel: "años",
    monthsLabel: "meses",
    daysLabel: "días",
    thisYearLabel: "Este año",
    weekLabel: "semana",
    ofLabel: "de",
    and: "y",
    setupTitle: "Configura tu calendario de vida",
    setupIntro: "Ingresa tu fecha de nacimiento y la esperanza de vida (opcional). Luego puedes cambiar la esperanza en Ajustes.",
    lifeExpectancyYearsLabel: "Esperanza de vida (años)",
    formatLabel: "Formato",
    dateFormatYMD: "AAAA-MM-DD",
    sync: "Sincronización",
    syncEnable: "Activar sincronización con Google Drive",
    signIn: "Iniciar sesión con Google",
    signOut: "Cerrar sesión",
    statusSignedInAs: "Conectado como",
    advanced: "Avanzados",
    drivePull: "Pull desde Drive",
    drivePush: "Push a Drive",
    driveResetFromDrive: "Reset con datos de Drive",
    forceOverwrite: "Forzar sobrescritura",
    quickPush: "Push rápido",
    pushConfirmTitle: "Confirmar push",
    pushConfirmBody: "¿Quieres subir tus datos locales a Google Drive?",
    notConfigured: "No configurado",
    configured: "Configurado",
    driveClientId: "Google Client ID",
    driveApiKey: "Google API Key",
    driveConfigSaved: "Configuración de Drive guardada"
  }
} as const;

export type Lang = keyof typeof messages;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof typeof messages["en"]) => string;
};

const I18nContext = createContext<Ctx | null>(null);

const storageKey = "lifeweeks:lang";

function getInitialLang(): Lang {
  const fromStorage = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
  if (fromStorage === "en" || fromStorage === "es") return fromStorage as Lang;
  return "es";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang());
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(storageKey, l);
  }, []);
  const t = useCallback((k: keyof typeof messages["en"]) => messages[lang][k], [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("I18nProvider missing");
  return ctx;
}
