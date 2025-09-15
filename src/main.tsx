import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";

import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

/**
 * Apply initial theme BEFORE mounting React.
 * Priority:
 *   1) user choice in localStorage ("lifeweeks.theme")
 *   2) system preference (prefers-color-scheme)
 *
 * If no user choice is stored, the app follows system changes in real time
 * until the user explicitly toggles a theme (which persists to localStorage).
 */
(function applyInitialTheme() {
  const KEY = "lifeweeks.theme";
  const stored = localStorage.getItem(KEY) as "light" | "dark" | null;

  const getSystemTheme = () =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const initial: "light" | "dark" = stored ?? getSystemTheme();
  document.documentElement.setAttribute("data-theme", initial);

  // If there is no stored preference, keep syncing with system
  if (!stored && window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stillNoChoice = !localStorage.getItem(KEY);
      if (stillNoChoice) {
        document.documentElement.setAttribute(
          "data-theme",
          mql.matches ? "dark" : "light"
        );
      }
    };
    try {
      mql.addEventListener("change", onChange);
    } catch {
      // Safari <14
      mql.addListener(onChange);
    }
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
