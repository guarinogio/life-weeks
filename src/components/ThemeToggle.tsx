import { useEffect, useRef, useState } from "react";
import styles from "./ThemeToggle.module.css";
import ThemeTransition from "./ThemeTransition";

const KEY = "lifeweeks.theme"; // 'light' | 'dark'

export default function ThemeToggle() {
  // Leemos el tema efectivo que ya aplicó main.tsx (puede ser el del sistema)
  const initial =
    (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
    "light";

  const [theme, setTheme] = useState<"light" | "dark">(initial);

  // Flag para saber si el usuario realmente interactuó
  const userSet = useRef(false);

  // Solo cuando el usuario cambia el tema, persistimos y aplicamos al DOM
  useEffect(() => {
    if (!userSet.current) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => {
    userSet.current = true;
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  return (
    <>
      <button
        className={styles.btn}
        onClick={toggle}
        aria-label="Toggle theme"
        title={theme === "light" ? "Light → Dark" : "Dark → Light"}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      {/* Crossfade del tema */}
      <ThemeTransition theme={theme} />
    </>
  );
}
