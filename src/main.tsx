import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";

import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

/** Initial theme (default: light) */
(function applyInitialTheme() {
  const KEY = "lifeweeks.theme";
  const stored = (localStorage.getItem(KEY) as "light" | "dark" | null) ?? null;
  const theme: "light" | "dark" =
    stored === "light" || stored === "dark" ? stored : "light";
  document.documentElement.setAttribute("data-theme", theme);
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
