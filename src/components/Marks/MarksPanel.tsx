import { useMemo, useState } from "react";

import { type LifeMark, listMarks, removeMark } from "../../lib/storage";
import ConfirmDialog from "./ConfirmDialog";
import MarkModal from "./MarkModal";
import styles from "./MarksPanel.module.css";

type FilterKind = "all" | LifeMark["kind"];

export default function MarksPanel() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [kind, setKind] = useState<FilterKind>("all");

  const [editOpen, setEditOpen] = useState(false);
  const [initial, setInitial] = useState<Partial<LifeMark> | undefined>(
    undefined,
  );
  const [tick, setTick] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const data = useMemo(() => {
    const _ = tick; // referencia explícita para que el linter acepte la dependencia
    return listMarks();
  }, [tick]);

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
      return byQ && byTag && byKind;
    });
  }, [data, q, tag, kind]);

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

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <h3>Hitos y notas</h3>
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
        </div>
      </header>

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
}
