import { useEffect, useState } from "react";
import styles from "./SettingsPanel.module.css";

const THEME_KEY = "lifeweeks.theme"; // 'light' | 'dark'
type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function onReset() {
    const ok = window.confirm(
      "This will clear your saved data (birth date and life expectancy) and reload the app. Continue?"
    );
    if (!ok) return;
    localStorage.removeItem("lifeweeks.v1");
    window.location.reload();
  }

  return (
    <>
      {/* Botón engranaje fijo */}
      <button
        className={styles.gearBtn}
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        title="Settings"
      >
        <GearIcon />
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
          {/* Scrim debajo */}
          <button
            className={styles.scrim}
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          {/* Drawer por encima */}
          <aside className={styles.drawer}>
            <div className={styles.header}>
              <h3 className={styles.title}>Settings</h3>
              <button
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Close settings"
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.section}>
              <h4>Theme</h4>
              <div className={styles.row}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <span>Light</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <span>Dark</span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Data</h4>
              <button className={styles.danger} onClick={onReset}>
                Reset saved data
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function GearIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm9.3 3.2c0-.4-.1-.8-.1-1.2l2.1-1.6-2-3.5-2.5 1a7.8 7.8 0 0 0-2-1.2l-.3-2.7H9.5l-.3 2.7c-.7.3-1.3.7-2 1.1l-2.5-1-2 3.6 2.1 1.6c-.1.4-.1.8-.1 1.2s0 .8.1 1.2L2.6 15l2 3.5 2.5-1c.6.5 1.3.8 2 1.1l.3 2.7h4.9l.3-2.7c.7-.3 1.4-.7 2-1.1l2.5 1 2-3.5-2.1-1.6c0-.4.1-.8.1-1.2ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"
      />
    </svg>
  );
}
