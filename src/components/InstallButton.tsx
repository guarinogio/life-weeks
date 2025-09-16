import { useEffect, useMemo, useState } from "react";
import styles from "./InstallButton.module.css";

const DISMISS_KEY = "lifeweeks.pwaDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isInStandalone(): boolean {
  // Chrome/Edge
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  // iOS Safari
  // @ts-expect-error non-standard
  if (window.navigator.standalone) return true;
  return false;
}

export default function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const installed = useMemo(() => isInStandalone(), []);

  useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault(); // evitamos el mini-infobar
      setDeferred(e as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setDeferred(null);
      localStorage.removeItem(DISMISS_KEY);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed || dismissed || !deferred) return null;

  const iconSrc = `${import.meta.env.BASE_URL}favicon.svg`;

  async function install() {
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "dismissed") {
        // si lo rechazó explícitamente, no molestamos más
        localStorage.setItem(DISMISS_KEY, "1");
        setDismissed(true);
      } else {
        setDeferred(null);
      }
    } catch {
      // algo falló; ocultamos por esta sesión
      setDeferred(null);
    }
  }

  function close() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={install}
        aria-label="Install app"
        title="Install app"
      >
        <img src={iconSrc} alt="" aria-hidden="true" className={styles.icon} />
      </button>

      <button
        className={styles.close}
        onClick={close}
        aria-label="Hide install button"
        title="Hide"
      >
        ×
      </button>
    </div>
  );
}
