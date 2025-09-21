import { motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { weeksBetween } from "../../lib/date";
import type { LifeMark } from "../../lib/storage";
import styles from "./LifeGridSVG.module.css";

type Props = {
  birthDateISO: string;
  years?: number;
  onWeekDoubleClick?: (weekIndex: number) => void;
  // <- ahora acepta un Map con array de marcas por semana
  marksByIndex?: Map<number, LifeMark[]>;
};

type State = "past" | "current" | "future";

export default function LifeGridSVG({
  birthDateISO,
  years = 80,
  onWeekDoubleClick,
  marksByIndex,
}: Props) {
  const cols = 52;
  const rows = years;

  const D = 12;
  const R = D / 2;
  const GAP = 8;
  const PAD = 8;

  const livedWeeks = weeksBetween(birthDateISO);
  const currentIndex = livedWeeks;

  const circles = useMemo(() => {
    const arr: {
      x: number;
      y: number;
      idx: number;
      state: State;
      label: string;
    }[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        let state: State = "future";
        if (idx < livedWeeks) state = "past";
        else if (idx === currentIndex) state = "current";
        const x = PAD + R + col * (D + GAP);
        const y = PAD + R + row * (D + GAP);
        const label = `Year ${row}, week ${col + 1}, ${state}`;
        arr.push({ x, y, idx, state, label });
      }
    }
    return arr;
  }, [rows, cols, livedWeeks, currentIndex, D, GAP, PAD, R]);

  const width = PAD * 2 + cols * D + (cols - 1) * GAP;
  const height = PAD * 2 + rows * D + (rows - 1) * GAP;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
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
      `circle[data-idx="${idx}"]`,
    );
    if (el) el.focus();
    setFocusedIdx(idx);
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const total = rows * cols;
    if (focusedIdx == null) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusIndex(Math.min(total - 1, focusedIdx + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(Math.max(0, focusedIdx - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusIndex(Math.max(0, focusedIdx - cols));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusIndex(Math.min(total - 1, focusedIdx + cols));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onWeekDoubleClick && focusedIdx != null)
        onWeekDoubleClick(focusedIdx);
    }
  };

  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );
  useEffect(() => {
    if (!tip) return;
    const t = window.setTimeout(() => setTip(null), 1600);
    return () => window.clearTimeout(t);
  }, [tip]);

  const lastTapRef = useRef<{ t: number; idx: number } | null>(null);
  const TAP_WINDOW = 300;

  const handleTouchEnd = (idx: number) => {
    const now = Date.now();
    const last = lastTapRef.current;
    if (last && now - last.t < TAP_WINDOW && last.idx === idx) {
      if (onWeekDoubleClick) onWeekDoubleClick(idx);
      lastTapRef.current = null;
      return;
    }
    lastTapRef.current = { t: now, idx };
  };

  const showTipAtGroup = (g: SVGGElement, text: string) => {
    const circle = g.querySelector(
      "circle[data-idx]",
    ) as SVGCircleElement | null;
    const rect = (circle ?? g).getBoundingClientRect();
    const wrap = wrapperRef.current?.getBoundingClientRect();
    if (!wrap) return;
    const cx = rect.left + rect.width / 2 - wrap.left;
    const cy = rect.top + rect.height / 2 - wrap.top;
    setTip({ x: cx, y: cy, text });
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.sr} aria-live="polite" ref={liveRef} />
      <motion.svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        role="grid"
        aria-label="Life weeks grid"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {circles.map(({ x, y, idx, state, label }) => {
          const isCurrent = state === "current";
          const hasMark = Boolean(
            marksByIndex && (marksByIndex.get(idx)?.length ?? 0) > 0,
          );
          return (
            <g
              key={idx}
              onDoubleClick={() => onWeekDoubleClick && onWeekDoubleClick(idx)}
              onTouchEnd={() => handleTouchEnd(idx)}
              onClick={(e) =>
                showTipAtGroup(e.currentTarget as SVGGElement, label)
              }
            >
              <circle
                cx={x}
                cy={y}
                r={R}
                data-idx={idx}
                className={`${styles.dot} ${styles[state]} ${isCurrent ? styles.blink : ""}`}
                tabIndex={isCurrent ? 0 : -1}
                onFocus={() => setFocusedIdx(idx)}
              />
              {hasMark ? (
                <circle
                  cx={x}
                  cy={y}
                  r={R * 0.33}
                  className={styles.markBadge}
                />
              ) : null}
            </g>
          );
        })}
      </motion.svg>

      {tip ? (
        <div
          className={styles.tooltip}
          style={{ left: tip.x, top: tip.y }}
          aria-hidden="true"
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  );
}
