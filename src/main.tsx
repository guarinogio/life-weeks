import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";

import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

/**
 * Aplica el tema ANTES de montar React.
 * Prioridad:
 * 1) Preferencia guardada en localStorage ("lifeweeks.theme")
 * 2) Preferencia del sistema (prefers-color-scheme)
 *
 * Si NO hay preferencia guardada, seguimos al sistema en vivo.
 */
(function applyInitialTheme() {
  const KEY = "lifeweeks.theme";
  const stored = localStorage.getItem(KEY) as "light" | "dark" | null;

  const systemTheme =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const initial: "light" | "dark" = stored ?? systemTheme;
  document.documentElement.setAttribute("data-theme", initial);

  // Sin preferencia del usuario → escuchar cambios del sistema
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
      mql.addListener(onChange); // Safari antiguo
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
