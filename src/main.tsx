import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

// global styles
import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

/**
 * Apply initial theme BEFORE mounting React.
 * Priority: localStorage -> default "light"
 * (We no longer read prefers-color-scheme; light is the default.)
 */
(function applyInitialTheme() {
  const KEY = "lifeweeks.theme";
  const stored = (localStorage.getItem(KEY) as "light" | "dark" | null) ?? null;
  const theme: "light" | "dark" =
    stored === "light" || stored === "dark" ? stored : "light";
  document.documentElement.setAttribute("data-theme", theme);
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
