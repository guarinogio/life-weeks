import { useEffect, useRef, useState } from "react";
import { exportData, importData, resetAll, getDOB, setDOB } from "../../lib/storage";
import { useI18n } from "../../i18n";
import styles from "./SettingsPanel.module.css";
import dialogStyles from "../Marks/ConfirmDialog.module.css";

const THEME_KEY = "lifeweeks.theme";
type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

export default function SettingsPanel() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dobModal, setDobModal] = useState(false);
  const [dobISO, setDobISO] = useState<string>("");

  useEffect(() => {
    const current = getDOB() || "";
    setDobISO(current);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (open) window.dispatchEvent(new CustomEvent("settings:open"));
    else window.dispatchEvent(new CustomEvent("settings:close"));
  }, [open]);

  function onExport() {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lifeweeks-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  function onImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      importData(text);
      window.location.reload();
    };
    reader.readAsText(f);
  }

  function onReset() {
    resetAll();
    window.location.reload();
  }

  function confirmDob() {
    if (!dobISO || isNaN(new Date(dobISO).getTime())) return;
    setDOB(dobISO);
    localStorage.removeItem("lifeweeks:marks");
    setDobModal(false);
    window.location.reload();
  }

  return (
    <div className={styles.root}>
      <button className={styles.open} aria-label={t("openSettings")} onClick={() => setOpen(true)}>
        <svg className={styles.openIcon} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.05 2.5a1 1 0 0 1 1.9 0l.35 1.4a7.5 7.5 0 0 1 2.07.85l1.28-.74a1 1 0 0 1 1.36.37l1 1.73a1 1 0 0 1-.36 1.36l-1.2.69a7.6 7.6 0 0 1 0 2.22l1.2.69a1 1 0 0 1 .36 1.36l-1 1.73a1 1 0 0 1-1.36.37l-1.28-.74a7.5 7.5 0 0 1-2.07.85l-.35 1.4a1 1 0 0 1-1.9 0l-.35-1.4a7.5 7.5 0 0 1-2.07-.85l-1.28.74a1 1 0 0 1-1.36-.37l-1-1.73a1 1 0 0 1 .36-1.36l1.2-.69a7.6 7.6 0 0 1 0-2.22l-1.2-.69a1 1 0 0 1-.36-1.36l1-1.73a1 1 0 0 1 1.36-.37l1.28.74a7.5 7.5 0 0 1 2.07-.85l.35-1.4Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3.25" strokeWidth="1.8"/>
        </svg>
      </button>

      {open && (
        <div className={styles.portal} role="dialog" aria-modal="true" aria-label={t("settings")}>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <aside className={styles.panel} role="document">
            <header className={styles.header}>
              <h3>{t("settings")}</h3>
              <button className={styles.close} aria-label={t("close")} onClick={() => setOpen(false)}>×</button>
            </header>

            <div className={styles.content}>
              <div>
                <div className={styles.sectionTitle}>{t("theme")}</div>
                <div className={styles.groupBox}>
                  <div className={styles.inline}>
                    <label className={styles.radio}>
                      <input type="radio" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} />
                      <span>{t("light")}</span>
                    </label>
                    <label className={styles.radio}>
                      <input type="radio" name="theme" checked={theme === "dark"} onChange={() => setTheme("dark")} />
                      <span>{t("dark")}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>{t("language")}</div>
                <div className={styles.groupBox}>
                  <div className={styles.row}>
                    <select value={lang} onChange={(e) => setLang(e.target.value as any)}>
                      <option value="es">{t("spanish")}</option>
                      <option value="en">{t("english")}</option>
                    </select>
                  </div>
                  <p className={styles.smallNote}>Cálculo basado en 52 semanas/año (modelo póster).</p>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>{t("dobLabel")}</div>
                <div className={styles.groupBox}>
                  <div className={styles.row}>
                    <div className={styles.inline}>
                      <input type="date" value={dobISO} readOnly />
                      <button className={styles.primary} onClick={() => setDobModal(true)}>{t("editDob")}</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className={styles.sectionTitle}>{t("backup")}</div>
                <div className={styles.groupBox}>
                  <div className={styles.actionsRow}>
                    <button className={styles.ghost} onClick={onExport}>{t("export")}</button>
                    <button className={styles.ghost} onClick={onImportClick}>{t("import")}</button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="application/json"
                      style={{ display: "none" }}
                      onChange={onImportChange}
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <button className={styles.danger} onClick={onReset}>
                      {t("resetSavedData")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {dobModal && (
        <div className={dialogStyles.root} role="dialog" aria-modal="true" aria-label={t("editDob")}>
          <div className={dialogStyles.overlay} onClick={() => setDobModal(false)} />
          <div className={dialogStyles.panel} role="document" style={{ maxWidth: 420 }}>
            <header className={dialogStyles.header}>
              <h4>{t("editDob")}</h4>
              <button className={dialogStyles.close} onClick={() => setDobModal(false)} aria-label={t("cancel")}>×</button>
            </header>
            <div className={dialogStyles.body}>
              <p>{t("editDobWarning")}</p>
              <label style={{ display: "grid", gap: 6, marginTop: 8 }}>
                <span>{t("dobLabel")}</span>
                <input type="date" value={dobISO} onChange={(e) => setDobISO(e.target.value)} />
              </label>
            </div>
            <div className={dialogStyles.actions}>
              <button className={styles.ghost} onClick={() => setDobModal(false)}>{t("cancel")}</button>
              <button className={styles.primary} onClick={confirmDob}>{t("confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
