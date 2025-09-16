import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";

import { weeksBetween } from "../../lib/date";
import styles from "./LifeGrid.module.css";
import WeekCell from "./WeekCell";

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
      transition={{ duration: 0.45 }}
    >
      <div className={styles.scroller}>
        {/* Cabecera de semanas (1..52) */}
        <div className={styles.weekHeader} aria-hidden="true">
          {Array.from({ length: 52 }, (_, i) => {
            const n = i + 1;
            const major = n % 5 === 0;
            return (
              <span
                key={n}
                className={major ? styles.weekMajor : styles.weekMinor}
              >
                {n}
              </span>
            );
          })}
        </div>

        {/* Filas por año */}
        {rows.map((year) => {
          const showYear = year % 5 === 0; // solo múltiplos de 5
          return (
            <div key={year} className={styles.row}>
              <div
                className={styles.yearLabel}
                aria-hidden={!showYear ? "true" : undefined}
                style={!showYear ? { color: "transparent" } : undefined}
              >
                {
                  showYear
                    ? year
                    : year /* mantiene layout; color transparente */
                }
              </div>

              <div className={styles.weeks}>
                {cols.map((w) => {
                  const k = year * 52 + w;
                  let state: "past" | "current" | "future" = "future";
                  if (k < livedWeeks) state = "past";
                  else if (k === currentIndex) state = "current";

                  const label = `Year ${year}, week ${w + 1}`;
                  const isCurrent = state === "current";

                  return (
                    <WeekCell
                      key={w}
                      state={state}
                      title={label}
                      aria-label={label}
                      ref={isCurrent ? currentRef : undefined}
                      data-current={isCurrent ? "true" : undefined}
                      tabIndex={isCurrent ? 0 : -1}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
