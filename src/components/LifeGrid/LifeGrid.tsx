import { useRef } from "react";
import { weeksBetween } from "../../lib/date";
import YearLabel from "./YearLabel";
import WeekHeader from "./WeekHeader";
import WeekCell from "./WeekCell";
import styles from "./LifeGrid.module.css";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface Props {
  birthDateISO: string;
  years?: number;
  compact?: boolean; // new: reduce density on mobile
}

export default function LifeGrid({ birthDateISO, years = 80, compact = false }: Props) {
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

  // helper para rango de fechas por semana
  function getWeekRange(startISO: string, weekIndex: number): string {
    const start = new Date(startISO);
    start.setDate(start.getDate() + weekIndex * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  }

  return (
    <motion.section
      className={`${styles.wrapper} ${compact ? styles.compact : ""}`}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.45 }}
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
                const label = `Year ${year}, week ${w + 1}. ${getWeekRange(birthDateISO, k)}`;

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
        ))}
      </div>
    </motion.section>
  );
}
