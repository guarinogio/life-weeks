import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";

// estilos globales
import "./styles/reset.css";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/print.css";

/** Aplica tema inicial (localStorage -> prefers-color-scheme) antes de montar React */
(function applyInitialTheme() {
  const KEY = "lifeweeks.theme";
  const stored = (localStorage.getItem(KEY) as "light" | "dark" | null) ?? null;
  let theme: "light" | "dark";
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
