import styles from "./LifeGrid.module.css";

export default function WeekHeader() {
  const nums = Array.from({ length: 52 }, (_, i) => i + 1);
  return (
    <div className={styles.weekHeader} aria-hidden>
      {nums.map((n) => (
        <span
          key={n}
          className={n % 5 === 0 ? styles.weekMajor : styles.weekMinor}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
