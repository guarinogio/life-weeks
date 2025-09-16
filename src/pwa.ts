import { Workbox } from "workbox-window";

export function setupPWA() {
  if (!("serviceWorker" in navigator)) return;

  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  const wb = new Workbox(swUrl);

  // Si hay un SW nuevo esperando, activarlo y recargar
  wb.addEventListener("waiting", () => {
    wb.addEventListener("controlling", () => window.location.reload());
    wb.messageSkipWaiting();
  });

  wb.register()
    .then((reg) => {
      if (!reg) return; // <- guard para TS

      // 1) comprobar updates al cargar
      try {
        reg.update();
      } catch {
        /* noop */
      }

      // 2) al volver a la pestaña, volver a chequear
      const onVisible = () => {
        try {
          reg.update();
        } catch {
          /* noop */
        }
      };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") onVisible();
      });

      // 3) chequeo periódico (cada 30 minutos)
      const interval = window.setInterval(() => {
        try {
          reg.update();
        } catch {
          /* noop */
        }
      }, 30 * 60 * 1000);

      // limpiar si la página se descarga
      window.addEventListener("beforeunload", () => clearInterval(interval));
    })
    .catch(() => {
      /* si falla el registro, no rompemos la app */
    });
}
