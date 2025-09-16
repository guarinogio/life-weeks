import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const base = "/life-weeks/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",     // <- el SW se revisa solo
      injectRegister: "auto",
      // manifest {...} tal como lo tienes
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,  // <- borra cachés viejas del build anterior
        skipWaiting: true,            // <- activa el SW nuevo inmediatamente
        clientsClaim: true,           // <- toma control de las pestañas abiertas
      },
    }),
  ],
});
