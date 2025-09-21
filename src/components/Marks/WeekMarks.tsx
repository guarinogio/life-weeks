import type { LifeMark } from "../../lib/storage";
import styles from "./WeekMarks.module.css";

type Props = {
  open: boolean;
  x: number;
  y: number;
  marks: LifeMark[];
  onClose: () => void;
  onAdd: () => void;
  onEdit: (m: LifeMark) => void;
  onDelete: (m: LifeMark) => void;
};

export default function WeekMarks({
  open,
  x,
  y,
  marks,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  if (!open) return null;
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.pop}
        style={{ left: x, top: y }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <strong>Semana</strong>
          <button className={styles.close} onClick={onClose}>
            ×
          </button>
        </header>
        <ul className={styles.list}>
          {marks.map((m) => (
            <li key={m.id} className={styles.item}>
              <div className={styles.title}>{m.title}</div>
              <div className={styles.meta}>
                <span className={styles.kind}>{m.kind}</span>
                {m.tag ? <span className={styles.tag}>{m.tag}</span> : null}
              </div>
              <div className={styles.actions}>
                <button onClick={() => onEdit(m)}>Editar</button>
                <button onClick={() => onDelete(m)}>Borrar</button>
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <button onClick={onAdd}>Añadir</button>
        </div>
      </div>
    </div>
  );
}
