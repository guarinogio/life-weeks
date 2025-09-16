import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./LifeGridSVG.module.css";
import { weeksBetween } from "../../lib/date";

type Props = {
  birthDateISO: string;
  years?: number; // expectativa; default 80
};

type State = "past" | "current" | "future";

export default function LifeGridSVG({ birthDateISO, years = 80 }: Props) {
  // Layout lógico (SVG lo escalará a cualquier ancho)
  const D = 16; // diámetro del punto
  const GAP = 6; // gap entre puntos
  const LABEL_W = 28; // columna de años (izq)
  const HEADER_H = 22; // fila de números de semanas (arriba)

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
      state: State;
      label: string;
    }[] = [];

    for (let y = 0; y < years; y++) {
      for (let w = 0; w < 52; w++) {
        const k = y * 52 + w;

        let state: State = "future";
        if (k < livedWeeks) state = "past";
        else if (k === currentIndex) state = "current";

        const cx = LABEL_W + w * (D + GAP) + D / 2;
        const cy = HEADER_H + y * (D + GAP) + D / 2;

        const label = `Year ${y}, week ${w + 1}, ${state}`;

        arr.push({ cx, cy, k, year: y, week: w + 1, state, label });
      }
    }
    return arr;
  }, [years, livedWeeks, currentIndex]);

  // ---- Tooltips (touch/keyboard) ----
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(
    null
  );
  const hideTip = () => setTip(null);

  // Cerrar tooltip al clicar fuera / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!tip) return;
      const el = e.target as Element;
      if (el.closest?.(`.${styles.tooltip}`)) return;
      hideTip();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideTip();
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [tip]);

  // ---- Navegación por teclado + aria-live ----
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (focusedIdx == null) return;
    const c = circles[focusedIdx];
    if (!c) return;
    if (liveRef.current) liveRef.current.textContent = c.label;
  }, [focusedIdx, circles]);

  const focusIndex = (idx: number) => {
    const el = svgRef.current?.querySelector<SVGCircleElement>(
      `circle[data-idx="${idx}"]`
    );
    if (el) {
      el.focus();
      setFocusedIdx(idx);
    }
  };

  const handleKey = (idx: number, e: React.KeyboardEvent<SVGCircleElement>) => {
    let next = idx;
    const row = Math.floor(idx / 52);

    switch (e.key) {
      case "ArrowLeft":
        next = Math.max(0, idx - 1);
        break;
      case "ArrowRight":
        next = Math.min(total - 1, idx + 1);
        break;
      case "ArrowUp":
        next = Math.max(0, idx - 52);
        break;
      case "ArrowDown":
        next = Math.min(total - 1, idx + 52);
        break;
      case "Home":
        next = row * 52;
        break;
      case "End":
        next = row * 52 + 51;
        break;
      case "PageUp":
        next = Math.max(0, idx - 52 * 5);
        break;
      case "PageDown":
        next = Math.min(total - 1, idx + 52 * 5);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        showTooltipForIndex(idx);
        return;
      default:
        return;
    }
    e.preventDefault();
    focusIndex(next);
  };

  const showTooltipForIndex = (idx: number) => {
    const el = svgRef.current?.querySelector<SVGCircleElement>(
      `circle[data-idx="${idx}"]`
    );
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      text: circles[idx]?.label ?? "",
    });
  };

  // Para accesibilidad
  const titleId = "life-grid-title";
  const descId = "life-grid-desc";

  return (
    <div className={styles.wrap}>
      {/* aria-live para anunciar semana al navegar con teclado */}
      <div ref={liveRef} className={styles.srOnly} aria-live="polite" />

      <motion.svg
        id="life-grid-svg"
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
        preserveAspectRatio="xMidYMin meet"
      >
        <title id={titleId}>Life weeks grid</title>
        <desc id={descId}>
          Rows are years, columns are weeks. Past weeks, current week
          highlighted, and remaining weeks.
        </desc>

        {/* Header: weeks (1..52) */}
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
              className={`${styles.weekNumber} ${
                major ? styles.weekMajor : styles.weekMinor
              }`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          );
        })}

        {/* Years left (0,5,10,...) */}
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

        {/* Dots */}
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
              id={state === "current" ? "current-week-dot" : undefined}
              data-idx={k}
              cx={cx}
              cy={cy}
              r={D / 2}
              className={cls}
              tabIndex={state === "current" ? 0 : -1}
              aria-label={label}
              onFocus={() => setFocusedIdx(k)}
              onKeyDown={(e) => handleKey(k, e)}
              onClick={(e) => {
                e.stopPropagation();
                showTooltipForIndex(k);
              }}
            >
              <title>{label}</title>
            </circle>
          );
        })}
      </motion.svg>

      {/* Tooltip flotante */}
      {tip && (
        <div
          className={styles.tooltip}
          style={{ left: tip.x, top: tip.y }}
          role="status"
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
