import { useEffect, useState } from "react";

import { addMark, getDOB, type LifeMark, updateMark } from "../../lib/storage";
import styles from "./MarkModal.module.css";

/** Helpers locales */
function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<LifeMark> & { weekIndex?: number };
};

type Kind = LifeMark["kind"];

export default function MarkModal({ open, onClose, initial }: Props) {
  const dob = getDOB();

  const [id, setId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Kind>("note");
  const [dateISO, setDateISO] = useState("");
  const [tag, setTag] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;

    setId(initial?.id);
    setTitle(initial?.title ?? "");
    setKind((initial?.kind as Kind) ?? "note");

    // Fecha inicial: prioriza dateISO; si no, usa weekIndex -> fecha; si no, hoy.
    let nextDate = initial?.dateISO ?? "";
    if (!nextDate && typeof initial?.weekIndex === "number" && dob) {
      nextDate = isoFromWeekIndex(dob, initial.weekIndex);
    }
    if (!nextDate) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      nextDate = `${y}-${m}-${d}`;
    }
    setDateISO(nextDate);

    setTag(initial?.tag ?? "");
    setNotes(initial?.notes ?? "");
  }, [open, initial, dob]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // weekIndex requerido
    const wk =
      dob && dateISO
        ? weekIndexFromISO(dob, dateISO)
        : (initial?.weekIndex ?? 0);

    const payload: Omit<LifeMark, "id"> = {
      title,
      kind,
      dateISO: dateISO || new Date().toISOString().slice(0, 10),
      tag: tag || undefined,
      notes: notes || undefined,
      weekIndex: wk,
    };

    if (id) {
      updateMark(id, payload);
    } else {
      addMark(payload);
    }
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{id ? "Editar" : "Nueva"}</h3>
        <form onSubmit={onSubmit}>
          <div className={styles.formRow}>
            <label>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Tipo</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
            >
              <option value="milestone">Hito</option>
              <option value="plan">Plan</option>
              <option value="note">Nota</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Fecha</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
            />
          </div>

          <div className={styles.formRow}>
            <label>Etiqueta</label>
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className={styles.formRow}>
            <label>Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles"
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
