import { useEffect, useRef, useState } from "react";
import styles from "./ThemeToggle.module.css";
import ThemeTransition from "./ThemeTransition";

const KEY = "lifeweeks.theme"; // 'light' | 'dark'

export default function ThemeToggle() {
  // Lee el tema efectivo que ya aplicó main.tsx (puede venir del sistema)
  const initial =
    (document.documentElement.getAttribute("data-theme") as "light" | "dark") ||
    "light";

  const [theme, setTheme] = useState<"light" | "dark">(initial);

  // Sólo persistimos cuando el usuario interactúa
  const userSet = useRef(false);

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
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </button>
      <ThemeTransition theme={theme} />
    </>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v3" />
        <path d="M12 18.5v3" />
        <path d="M2.5 12h3" />
        <path d="M18.5 12h3" />
        <path d="M5 5l2.1 2.1" />
        <path d="M16.9 16.9L19 19" />
        <path d="M5 19l2.1-2.1" />
        <path d="M16.9 7.1L19 5" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  // Luna simple (media luna) usando currentColor
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
        d="M21 12.7c-1.2.6-2.6.9-4 .9A8.6 8.6 0 0 1 8.4 5c0-1.4.3-2.8.9-4A10 10 0 1 0 21 12.7z"
      />
    </svg>
  );
}
