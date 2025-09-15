import styles from "./Legend.module.css";

export default function Legend({ expectancy }: { expectancy: number }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.legend} aria-hidden>
        <span className={`${styles.dot} ${styles.past}`} />
        <span>Past</span>
        <span className={`${styles.dot} ${styles.current}`} />
        <span>Current</span>
        <span className={`${styles.dot} ${styles.future}`} />
        <span>Remaining</span>
      </div>

      <div className={styles.meta}>
        Life expectancy: <strong>{expectancy}</strong> years
      </div>
    </div>
  );
}
