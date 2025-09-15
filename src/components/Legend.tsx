import styles from "./Legend.module.css";

export default function Legend() {
  return (
    <div className={styles.legend} aria-hidden>
      <span className={`${styles.dot} ${styles.past}`} />
      <span>Vivido</span>
      <span className={`${styles.dot} ${styles.current}`} />
      <span>Actual</span>
      <span className={`${styles.dot} ${styles.future}`} />
      <span>Restante</span>
    </div>
  );
}
