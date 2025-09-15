import { useRef } from "react";
import { weeksBetween } from "../../lib/date";
import YearLabel from "./YearLabel";
import WeekHeader from "./WeekHeader";
import WeekCell from "./WeekCell";
import styles from "./LifeGrid.module.css";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface Props {
  birthDateISO: string;
  years?: number; // default 80
}

export default function LifeGrid({ birthDateISO, years = 80 }: Props) {
  const livedWeeks = weeksBetween(birthDateISO);
  const total = years * 52;
  const currentIndex = Math.min(livedWeeks, total - 1);

  const rows = Array.from({ length: years }, (_, y) => y);
  const cols = Array.from({ length: 52 }, (_, w) => w);

  const currentRef = useRef<HTMLDivElement | null>(null);

  // Variants tipadas; evitamos declarar "ease" si tu versión no lo tipa como string
  const reduced = useReducedMotion();
  const variants: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      className={styles.wrapper}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const }}
    >
      <div className={styles.scroller}>
        <div className={styles.headerRow}>
          <div className={`${styles.yearLabel} ${styles.headerLabel}`} aria-hidden />
          <WeekHeader />
        </div>

        {rows.map((year) => (
          <div key={year} className={styles.row}>
            <YearLabel value={year} />
            <div className={styles.weeks}>
              {cols.map((w) => {
                const k = year * 52 + w;
                let state: "past" | "current" | "future" = "future";
                if (k < livedWeeks) state = "past";
                else if (k === currentIndex) state = "current";

                const isCurrent = state === "current";
                return (
                  <WeekCell
                    key={w}
                    state={state}
                    title={`Year ${year}, week ${w + 1}`}
                    ref={isCurrent ? currentRef : undefined}
                    data-current={isCurrent ? "true" : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
