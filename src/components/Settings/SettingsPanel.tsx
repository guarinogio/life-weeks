import { useEffect, useState } from "react";

import { exportData, importData, resetAll } from "../../lib/storage";
import styles from "./SettingsPanel.module.css";

const THEME_KEY = "lifeweeks.theme";
type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getCurrentTheme());

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const onReset = () => {
    if (!confirm("This will erase saved data. Continue?")) return;
    resetAll();
    location.reload();
  };

  return (
    <div className={styles.root}>
      {/* FAB de engrane (arriba-derecha, z alto) */}
      <button
        className={styles.open}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Open settings"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.94 4a6.97 6.97 0 01-.14 1.4l2.02 1.58-2 3.46-2.42-1a7.17 7.17 0 01-2.02 1.17l-.36 2.56h-4l-.36-2.56a7.17 7.17 0 01-2.02-1.17l-2.42 1-2-3.46 2.02-1.58A6.97 6.97 0 013.06 12c0-.48.05-.96.14-1.4L1.18 9.02l2-3.46 2.42 1A7.17 7.17 0 017.62 5l.36-2.56h4L12.34 5c.72.25 1.4.61 2.02 1.02l2.42-1 2 3.46-2.02 1.58c.09.45.14.92.14 1.4z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </button>

      {open && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
        >
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <aside className={styles.panel}>
            <header className={styles.header}>
              <h3>Settings</h3>
              <button
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <div className={styles.section}>
              <h4>Theme</h4>
              <div className={styles.themeRow}>
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
              <div className={styles.row}>
                <button
                  onClick={() => {
                    const blob = new Blob([exportData()], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "lifeweeks-data.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export JSON
                </button>
                <label className={styles.upload}>
                  Import JSON
                  <input
                    type="file"
                    accept="application/json"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => {
                        try {
                          importData(String(r.result));
                          alert("Import ok");
                        } catch {
                          alert("Invalid JSON");
                        }
                      };
                      r.readAsText(f);
                    }}
                  />
                </label>
              </div>
              <button className={styles.danger} onClick={onReset}>
                Reset saved data
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
