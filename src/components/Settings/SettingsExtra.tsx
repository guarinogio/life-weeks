import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n";
import { getDOB, setDOB } from "../../lib/storage";

function getStoredDOB(): string | null {
  return getDOB();
}

export default function SettingsExtra() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [dobISO, setDobISO] = useState<string>("");
  const stored = useMemo(() => getStoredDOB(), []);

  useEffect(() => {
    setDobISO(stored || "");
  }, [stored]);

  function onConfirm() {
    if (!dobISO || isNaN(new Date(dobISO).getTime())) return;
    setDOB(dobISO);
    localStorage.removeItem("lifeweeks:marks");
    window.location.reload();
  }

  return (
    <div style={{ position: "fixed", right: 16, top: 76, zIndex: 90 }}>
      <div style={{ display: "grid", gap: 8, padding: 8, border: "1px solid var(--border, #e5e5e5)", borderRadius: 12, background: "var(--bg, #fff)" }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span>{t("language")}</span>
          <select value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="es">{t("spanish")}</option>
            <option value="en">{t("english")}</option>
          </select>
        </label>
        <button onClick={() => setOpen(true)}>{t("editDob")}</button>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-label={t("editDob")} style={{ position: "fixed", inset: 0 }}>
          <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)" }} />
          <div role="document" style={{ position: "relative", margin: "10vh auto 0", maxWidth: 420, background: "var(--bg,#fff)", color: "var(--fg,#111)", borderRadius: 12, border: "1px solid var(--border,#e5e5e5)", padding: 16, zIndex: 1 }}>
            <h4 style={{ margin: 0 }}>{t("editDob")}</h4>
            <p style={{ marginTop: 8 }}>{t("editDobWarning")}</p>
            <label style={{ display: "grid", gap: 4, marginTop: 12 }}>
              <span>{t("dobLabel")}</span>
              <input type="date" value={dobISO} onChange={(e) => setDobISO(e.target.value)} />
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setOpen(false)}>{t("cancel")}</button>
              <button onClick={onConfirm}>{t("confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
