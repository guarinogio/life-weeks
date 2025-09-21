import { useEffect, useRef, useState } from "react";
import { exportData, importData, resetAll, getDOB, setDOB } from "../../lib/storage";
import { useI18n } from "../../i18n";
import styles from "./SettingsPanel.module.css";
import dialogStyles from "../Marks/ConfirmDialog.module.css";
import {
  getFirebaseState,
  initFirebaseSync,
  pullAndMerge,
  pushSnapshot,
  resetFromRemote,
  signInFirebase,
  signOutFirebase,
} from "../../lib/firebaseSync";

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

  const [driveSigned, setSigned] = useState(false); // reutilizo el nombre para no tocar i18n/estilos
  const [driveEmail, setEmail] = useState<string | undefined>(undefined);
  const [force, setForce] = useState(false);
  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const current = getDOB() || "";
    setDobISO(current);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    initFirebaseSync().then(() => {
      const st = getFirebaseState();
      setSigned(st.signedIn);
      setEmail(st.email);
    });
  }, []);

  async function refreshAuth() {
    const st = getFirebaseState();
    setSigned(st.signedIn);
    setEmail(st.email);
  }

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

  function openDobModal() {
    setDobModal(true);
  }

  function confirmDob() {
    if (!dobISO || isNaN(new Date(dobISO).getTime())) return;
    setDOB(dobISO);
    localStorage.removeItem("lifeweeks:marks");
    setDobModal(false);
    window.location.reload();
  }

  async function onSignIn() {
    await signInFirebase();
    await refreshAuth();
  }

  async function onSignOut() {
    await signOutFirebase();
    await refreshAuth();
  }

  async function onPull() {
    const r = await pullAndMerge(exportData, (json) => importData(json));
    if (r.ok) window.location.reload();
  }

  async function onResetFromRemote() {
    const r = await resetFromRemote((json) => importData(json));
    if (r.ok) window.location.reload();
  }

  async function onPush(forceFlag: boolean) {
    const r = await pushSnapshot(exportData, { force: forceFlag });
    if (r.ok) setShowPushConfirm(false);
  }

  const advancedDisabled = !driveSigned;

  return (
    <div className={styles.root}>
      <button className={styles.open} aria-label={t("openSettings")} onClick={() => setOpen(true)}>
        ⚙️
      </button>

      {open && (
        <div className={styles.portal} role="dialog" aria-modal="true" aria-label={t("settings")}>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <aside className={styles.panel} role="document">
            <header className={styles.header}>
              <h3>{t("settings")}</h3>
              <button className={styles.close} aria-label={t("close")} onClick={() => setOpen(false)}>
                ×
              </button>
            </header>

            <div className={styles.section}>
              <div className={styles.row}>
                <label>{t("theme")}</label>
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

              <div className={styles.row}>
                <label>{t("language")}</label>
                <select value={lang} onChange={(e) => setLang(e.target.value as any)}>
                  <option value="es">{t("spanish")}</option>
                  <option value="en">{t("english")}</option>
                </select>
              </div>

              <div className={styles.row}>
                <label>{t("dobLabel")}</label>
                <div className={styles.inline}>
                  <input type="date" value={dobISO} readOnly />
                  <button className={styles.primary} onClick={openDobModal}>{t("editDob")}</button>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.row}>
                <label>{t("backup")}</label>
                <div className={styles.inline}>
                  <button className={styles.ghost} onClick={onExport}>{t("export")}</button>
                  <button className={styles.ghost} onClick={onImportClick}>{t("import")}</button>
                  <input ref={fileRef} type="file" accept="application/json" style={{ display: "none" }} onChange={onImportChange} />
                </div>
              </div>
              <button className={styles.danger} onClick={onReset}>
                {t("resetSavedData")}
              </button>
            </div>

            <div className={styles.section}>
              <div className={styles.groupBox}>
                <div className={styles.groupHeader}>
                  <h4 style={{ margin: 0 }}>{t("sync")}</h4>
                  <span className={`${styles.badge} ${driveSigned ? styles.statusOk : styles.statusWarn}`}>
                    {driveSigned ? `${t("configured")} · ${driveEmail || ""}` : t("notConfigured")}
                  </span>
                </div>

                <div className={styles.actionsRow}>
                  {!driveSigned ? (
                    <button className={styles.primary} onClick={onSignIn}>
                      {t("signIn")}
                    </button>
                  ) : (
                    <button className={styles.ghost} onClick={onSignOut}>
                      {t("signOut")}
                    </button>
                  )}
                </div>

                <button
                  className={`${styles.ghost} ${styles.advToggle}`}
                  onClick={() => setShowAdvanced((v) => !v)}
                  disabled={advancedDisabled}
                >
                  <span>Advanced</span>
                  <span>{showAdvanced ? "▴" : "▾"}</span>
                </button>

                {showAdvanced && (
                  <div className={styles.adv}>
                    <div className={styles.actionsRow}>
                      <button className={styles.ghost} onClick={onPull} disabled={!driveSigned}>{t("drivePull")}</button>
                      <button className={styles.ghost} onClick={() => setShowPushConfirm(true)} disabled={!driveSigned}>{t("drivePush")}</button>
                      <button className={styles.danger} onClick={onResetFromRemote} disabled={!driveSigned}>{t("driveResetFromDrive")}</button>
                    </div>
                    <label className={styles.inline}>
                      <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
                      <span>{t("forceOverwrite")}</span>
                    </label>
                  </div>
                )}
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
              <button className={dialogStyles.close} onClick={() => setDobModal(false)} aria-label={t("cancel")}>
                ×
              </button>
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

      {showPushConfirm && (
        <div className={dialogStyles.root} role="dialog" aria-modal="true" aria-label={t("pushConfirmTitle")}>
          <div className={dialogStyles.overlay} onClick={() => setShowPushConfirm(false)} />
          <div className={dialogStyles.panel} role="document" style={{ maxWidth: 420 }}>
            <header className={dialogStyles.header}>
              <h4>{t("pushConfirmTitle")}</h4>
              <button className={dialogStyles.close} onClick={() => setShowPushConfirm(false)} aria-label={t("cancel")}>
                ×
              </button>
            </header>
            <div className={dialogStyles.body}>
              <p>{t("pushConfirmBody")}</p>
            </div>
            <div className={dialogStyles.actions}>
              <button className={styles.ghost} onClick={() => setShowPushConfirm(false)}>{t("cancel")}</button>
              <button className={styles.primary} onClick={() => onPush(force)}>{t("confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
