import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANTE: en GitHub Pages el sitio vive en /life-weeks/
const base = "/life-weeks/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",

      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "Life Weeks",
        short_name: "LifeWeeks",
        description:
          "See your life in weeks: 80 rows × 52 columns. Past, current and remaining weeks at a glance.",
        lang: "en",
        start_url: `${base}`,
        scope: `${base}`,
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        // precache de assets del build
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        // navegación SPA en GitHub Pages (subcarpeta base)
        navigateFallback: `${base}index.html`,

        // caché runtime razonable para fuentes e imágenes
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
