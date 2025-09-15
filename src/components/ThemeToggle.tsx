import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";
import ThemeTransition from "./ThemeTransition";

const KEY = "lifeweeks.theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(
    (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <>
      <button className={styles.btn} onClick={toggle} aria-label="Toggle theme">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <ThemeTransition theme={theme} />
    </>
  );
}
