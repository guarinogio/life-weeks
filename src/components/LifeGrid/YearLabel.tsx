import styles from "./LifeGrid.module.css";

export default function YearLabel({ value }: { value: number }) {
  const label = value % 5 === 0 ? String(value) : "";
  return (
    <div className={styles.yearLabel} aria-hidden>
      {label}
    </div>
  );
}
