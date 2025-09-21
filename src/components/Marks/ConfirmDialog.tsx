import styles from "./ConfirmDialog.module.css";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Confirmar",
  message,
  confirmText = "Borrar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={styles.overlay} onClick={onCancel} />
      <div className={styles.panel} role="document">
        <header className={styles.header}>
          <h4>{title}</h4>
          <button
            className={styles.close}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        <div className={styles.body}>{message}</div>
        <div className={styles.actions}>
          <button className={styles.ghost} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={styles.danger} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
