import React, { useEffect, useMemo, useState } from "react";

import {
  getDOB,
  type LifeMark,
  listMarks,
  removeMark,
} from "../../lib/storage";
import ConfirmDialog from "./ConfirmDialog";
import MarkModal from "./MarkModal";
import styles from "./MarksPanel.module.css";

type FilterKind = "all" | LifeMark["kind"];

export type MarksPanelProps = {
  /** Si viene, inicializa el rango de fechas con esa semana del grid */
  weekIndexFilter?: number;
};

/* Helpers de fecha */
function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function isoFromWeekIndex(dobISO: string, weekIndex: number): string {
  return addDays(dobISO, weekIndex * 7);
}
function weekIndexFromISO(dobISO: string, dateISO: string): number {
  const a = new Date(dobISO + "T00:00:00").getTime();
  const b = new Date(dateISO + "T00:00:00").getTime();
  const diffDays = Math.floor((b - a) / (24 * 60 * 60 * 1000));
  return Math.max(0, Math.floor(diffDays / 7));
}

const MarksPanel: React.FC<MarksPanelProps> = ({ weekIndexFilter }) => {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [kind, setKind] = useState<FilterKind>("all");

  // Filtros por fecha
  const [fromISO, setFromISO] = useState<string>("");
  const [toISO, setToISO] = useState<string>("");

  // Si viene weekIndexFilter, lo convertimos a rango de fechas [inicio, fin]
  useEffect(() => {
    const dob = getDOB();
    if (typeof weekIndexFilter === "number" && dob) {
      const start = isoFromWeekIndex(dob, weekIndexFilter);
      const end = addDays(start, 6);
      setFromISO(start);
      setToISO(end);
    }
  }, [weekIndexFilter]);

  const [editOpen, setEditOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<LifeMark> | undefined>(
    undefined,
  );
  const [tick, setTick] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const data = useMemo(() => listMarks(), [tick]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    data.forEach((m) => m.tag && s.add(m.tag));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return data.filter((m) => {
      const byQ =
        !qLower ||
        m.title.toLowerCase().includes(qLower) ||
        (m.notes ? m.notes.toLowerCase().includes(qLower) : false);
      const byTag = tag === "all" || m.tag === tag;
      const byKind = kind === "all" || m.kind === kind;

      // Comparación lexicográfica válida para YYYY-MM-DD
      const byFrom = !fromISO || (m.dateISO && m.dateISO >= fromISO);
      const byTo = !toISO || (m.dateISO && m.dateISO <= toISO);

      return byQ && byTag && byKind && byFrom && byTo;
    });
  }, [data, q, tag, kind, fromISO, toISO]);

  const requestDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = () => {
    if (!deleteId) return;
    removeMark(deleteId);
    setDeleteId(null);
    setConfirmOpen(false);
    setTick((x) => x + 1);
  };

  const clearDates = () => {
    setFromISO("");
    setToISO("");
  };

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>Hitos y notas</h3>
          {/* Ya no mostramos chip de “Semana N”; usamos el rango de fechas */}
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.primary}
            onClick={() => {
              // Si hay un rango activo, inferimos la semana desde el 'fromISO'
              const dob = getDOB();
              const initialWeek =
                dob && fromISO
                  ? { weekIndex: weekIndexFromISO(dob, fromISO) }
                  : {};
              setInitial(initialWeek);
              setEditOpen(true);
            }}
          >
            Nueva
          </button>
        </div>
      </header>

      <div className={styles.filters}>
        <input
          placeholder="Buscar"
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQ(e.target.value)
          }
        />

        <select
          value={tag}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setTag(e.target.value)
          }
        >
          <option value="all">Todas las etiquetas</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={kind}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setKind(e.target.value as FilterKind)
          }
        >
          <option value="all">Todos los tipos</option>
          <option value="milestone">Hitos</option>
          <option value="plan">Planes</option>
          <option value="note">Notas</option>
        </select>

        <div className={styles.dateRange}>
          <label className={styles.rangeLabel}>
            Desde
            <input
              type="date"
              value={fromISO}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFromISO(e.target.value)
              }
            />
          </label>
          <label className={styles.rangeLabel}>
            Hasta
            <input
              type="date"
              value={toISO}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setToISO(e.target.value)
              }
              min={fromISO || undefined}
            />
          </label>
          {(fromISO || toISO) && (
            <button
              type="button"
              className={styles.ghost}
              onClick={clearDates}
              aria-label="Limpiar rango de fechas"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <ul className={styles.list}>
        {filtered.map((m) => (
          <li key={m.id} className={styles.item}>
            <div className={styles.meta}>
              <span>Semana {m.weekIndex ?? "—"}</span>
              <span>{m.kind}</span>
              {m.tag ? <span className={styles.tag}>{m.tag}</span> : null}
            </div>
            <div className={styles.title}>{m.title}</div>
            {m.notes ? <div className={styles.notes}>{m.notes}</div> : null}
            <div className={styles.actions}>
              <button
                className={styles.ghost}
                onClick={() => {
                  setInitial(m);
                  setEditOpen(true);
                }}
              >
                Editar
              </button>
              <button
                className={styles.danger}
                onClick={() => requestDelete(m.id)}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <MarkModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setInitial(undefined);
          setTick((x) => x + 1);
        }}
        initial={initial}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar"
        message="¿Borrar esta entrada?"
        confirmText="Borrar"
        cancelText="Cancelar"
        onConfirm={doDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteId(null);
        }}
      />
    </section>
  );
};

export default MarksPanel;
