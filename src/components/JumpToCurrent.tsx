import { useCallback } from "react";

import { weeksBetween } from "../lib/date";
import { getDOB } from "../lib/storage";
import styles from "./JumpToCurrent.module.css";

export default function JumpToCurrent() {
  const onClick = useCallback(() => {
    const dob = getDOB();
    if (!dob) return;
    const idx = weeksBetween(dob);
    const el = document.querySelector<SVGCircleElement>(
      `circle[data-idx="${idx}"]`,
    );
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });

    const svgEl = el as unknown as SVGElement;
    if (typeof svgEl.focus === "function") {
      svgEl.focus({ preventScroll: true });
    }

    el.classList.add(styles.flash);
    window.setTimeout(() => el.classList.remove(styles.flash), 800);
  }, []);

  return (
    <button
      className={styles.fab}
      onClick={onClick}
      aria-label="Ir a la semana actual"
      title="Ir a la semana actual"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" className={styles.iconRing} />
        <circle cx="12" cy="12" r="1.8" className={styles.iconDot} />
        <path d="M12 3v2M21 12h-2M12 19v2M5 12H3" className={styles.iconArms} />
      </svg>
    </button>
  );
}
