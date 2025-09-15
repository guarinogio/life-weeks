import styles from "./SummaryBar.module.css";

interface Stats {
  livedWeeks: number;
  remainingWeeks: number;
  totalWeeks: number;
  percent: number;
}
interface Age {
  years: number;
  months: number;
  days: number;
}

export default function SummaryBar({
  stats,
  age,
}: {
  stats: Stats;
  age: Age;
}) {
  return (
    <section className={styles.wrap}>
      <div className={styles.line}>
        You have lived <strong>{stats.livedWeeks.toLocaleString()}</strong>{" "}
        weeks out of <strong>{stats.totalWeeks.toLocaleString()}</strong>{" "}
        (<strong>{stats.percent.toFixed(1)}%</strong>). Remaining:{" "}
        <strong>{stats.remainingWeeks.toLocaleString()}</strong>.
      </div>
      <div className={styles.lineMuted}>
        Age: {age.years} years, {age.months} months and {age.days} days.
      </div>
    </section>
  );
}
