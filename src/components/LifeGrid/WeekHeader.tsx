import styles from "./LifeGrid.module.css";

export default function WeekHeader() {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  return (
    <div className={styles.weekHeader} aria-hidden="true">
      {weeks.map((n) => {
        const major = n % 5 === 0;
        return (
          <span key={n} className={major ? styles.weekMajor : styles.weekMinor}>
            {n}
          </span>
        );
      })}
    </div>
  );
}
