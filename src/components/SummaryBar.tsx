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
        Has vivido <strong>{stats.livedWeeks.toLocaleString()}</strong> semanas
        de <strong>{stats.totalWeeks.toLocaleString()}</strong>{" "}
        (<strong>{stats.percent.toFixed(1)}%</strong>). Te quedan{" "}
        <strong>{stats.remainingWeeks.toLocaleString()}</strong>.
      </div>
      <div className={styles.lineMuted}>
        Edad: {age.years} años, {age.months} meses y {age.days} días.
      </div>
    </section>
  );
}
