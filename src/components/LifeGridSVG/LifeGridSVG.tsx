import { useMemo } from "react";
import { motion } from "framer-motion";
import styles from "./LifeGridSVG.module.css";
import { weeksBetween } from "../../lib/date";

type Props = {
  birthDateISO: string;
  years?: number; // expectativa; default 80
};

export default function LifeGridSVG({ birthDateISO, years = 80 }: Props) {
  // Layout lógico (SVG lo escalará a cualquier ancho)
  const D = 16;          // diámetro del punto
  const GAP = 6;         // gap entre puntos
  const LABEL_W = 28;    // columna de años (izq)
  const HEADER_H = 22;   // fila de números de semanas (arriba)

  // Tamaño total del viewBox
  const width = LABEL_W + 52 * (D + GAP) - GAP;
  const height = HEADER_H + years * (D + GAP) - GAP;

  const livedWeeks = weeksBetween(birthDateISO);
  const total = years * 52;
  const currentIndex = Math.min(livedWeeks, total - 1);

  // Precalcular coordenadas de cada círculo
  const circles = useMemo(() => {
    const arr: {
      cx: number;
      cy: number;
      k: number;
      year: number;
      week: number;
      state: "past" | "current" | "future";
      label: string;
    }[] = [];

    for (let y = 0; y < years; y++) {
      for (let w = 0; w < 52; w++) {
        const k = y * 52 + w;

        let state: "past" | "current" | "future" = "future";
        if (k < livedWeeks) state = "past";
        else if (k === currentIndex) state = "current";

        const cx = LABEL_W + w * (D + GAP) + D / 2;
        const cy = HEADER_H + y * (D + GAP) + D / 2;

        const label = `Year ${y}, week ${w + 1}`;

        arr.push({ cx, cy, k, year: y, week: w + 1, state, label });
      }
    }
    return arr;
  }, [years, livedWeeks, currentIndex]);

  // Para accesibilidad
  const titleId = "life-grid-title";
  const descId = "life-grid-desc";

  return (
    <div className={styles.wrap}>
      <motion.svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        // ⬇️ Solo fade-in. Sin translateY para que ningún punto “salte”.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        preserveAspectRatio="xMidYMin meet"
      >
        <title id={titleId}>Life weeks grid</title>
        <desc id={descId}>
          Rows are years, columns are weeks. Past weeks, current week highlighted, and remaining weeks.
        </desc>

        {/* ----- Header: weeks (1..52). En mobile se ocultan por CSS ----- */}
        {Array.from({ length: 52 }, (_, i) => {
          const n = i + 1;
          const x = LABEL_W + i * (D + GAP) + D / 2;
          const y = HEADER_H - 8;
          const major = n % 5 === 0;
          return (
            <text
              key={`w-${n}`}
              x={x}
              y={y}
              className={`${styles.weekNumber} ${major ? styles.weekMajor : styles.weekMinor}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          );
        })}

        {/* ----- Left: years (solo múltiplos de 5) ----- */}
        {Array.from({ length: years }, (_, y) => {
          if (y % 5 !== 0) return null;
          const x = LABEL_W - 8;
          const cy = HEADER_H + y * (D + GAP) + D / 2;
          return (
            <text
              key={`y-${y}`}
              x={x}
              y={cy}
              className={styles.yearLabel}
              textAnchor="end"
              dominantBaseline="central"
            >
              {y}
            </text>
          );
        })}

        {/* ----- Dots (past/current/future) ----- */}
        {circles.map(({ cx, cy, k, state, label }) => {
          const cls =
            state === "current"
              ? styles.dotCurrent
              : state === "past"
              ? styles.dotPast
              : styles.dotFuture;

          return (
            <circle
              key={k}
              cx={cx}
              cy={cy}
              r={D / 2}
              className={cls}
              tabIndex={state === "current" ? 0 : -1}
              aria-label={label}
            >
              <title>{label}</title>
            </circle>
          );
        })}
      </motion.svg>
    </div>
  );
}
