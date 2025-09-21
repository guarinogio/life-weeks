import { I18nProvider } from "./i18n";
import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";
import { setupPWA } from "./pwa";

(function applyThemeEarly() {
  try {
    const KEY = "lifeweeks.theme";
    const ls = localStorage.getItem(KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = ls === "light" || ls === "dark" ? ls : prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    function onChange(e: MediaQueryListEvent) {
      const hasManual = localStorage.getItem(KEY);
      if (!hasManual) {
        document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
      }
    }
    if (!ls && window.matchMedia) {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.addEventListener) {
        mql.addEventListener("change", onChange);
      } else {
        mql.addListener(onChange);
      }
    }
  } catch {}
})();

setupPWA();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
