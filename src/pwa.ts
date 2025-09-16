import { Workbox } from "workbox-window";

export function setupPWA() {
  if ("serviceWorker" in navigator) {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`; // generado por vite-plugin-pwa
    const wb = new Workbox(swUrl);

    wb.addEventListener("waiting", () => {
      // Hay una nueva versión lista: recargamos para activarla.
      wb.addEventListener("controlling", () => window.location.reload());
      wb.messageSkipWaiting();
    });

    wb.register();
  }
}
