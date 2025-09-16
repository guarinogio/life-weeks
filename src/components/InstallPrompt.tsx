import { useEffect, useMemo, useState } from "react";

import styles from "./InstallPrompt.module.css";

const DISMISS_KEY = "lifeweeks.pwaDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isInStandalone(): boolean {
  // Chrome/Edge
  if (
    window.matchMedia &&
    window.matchMedia("(display-mode: standalone)").matches
  )
    return true;
  // iOS Safari
  // @ts-expect-error non-standard
  if (window.navigator.standalone) return true;
  return false;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const dismissed = useMemo(
    () => localStorage.getItem(DISMISS_KEY) === "1",
    [],
  );
  const installed = useMemo(() => isInStandalone(), []);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      if (dismissed || installed) return; // no molestar
      e.preventDefault(); // evita el mini-infobar
      setDeferred(e as BeforeInstallPromptEvent);
      setOpen(true); // mostramos modal
    }

    function onAppInstalled() {
      setDeferred(null);
      setOpen(false);
      localStorage.setItem(DISMISS_KEY, "1"); // no volver a mostrar
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [dismissed, installed]);

  if (!open || !deferred) return null;

  const iconSrc = `${import.meta.env.BASE_URL}favicon.svg`;

  async function onInstall() {
    const ev = deferred;
    if (!ev) return;
    try {
      await ev.prompt();
      await ev.userChoice; // accepted o dismissed
      localStorage.setItem(DISMISS_KEY, "1"); // no reaparecer
    } finally {
      setOpen(false);
      setDeferred(null);
    }
  }

  function onCancel() {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
    setDeferred(null);
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <img src={iconSrc} alt="" className={styles.icon} />
          <h3 id="pwa-title">Install Life Weeks?</h3>
        </div>
        <p className={styles.body}>
          Install this app on your device for a faster, full-screen experience
          and offline access.
        </p>
        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onCancel} autoFocus>
            Not now
          </button>
          <button className={styles.primary} onClick={onInstall}>
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
