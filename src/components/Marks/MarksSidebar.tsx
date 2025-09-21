import MarksPanel from "./MarksPanel";
import styles from "./MarksSidebar.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MarksSidebar({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label="Hitos y notas"
    >
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.panel}>
        <header className={styles.header}>
          <h3>Hitos y notas</h3>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        <div className={styles.content}>
          <MarksPanel />
        </div>
      </aside>
    </div>
  );
}
