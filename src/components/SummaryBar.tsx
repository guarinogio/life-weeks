import styles from "./SummaryBar.module.css";
import { isoWeek, isoWeeksInYear } from "../lib/date";

type Props = {
  // acepta cualquier forma; lo normal es que contenga semanas vividas/total
  stats: Record<string, unknown>;
  age: { years: number; months: number; days: number };
};

export default function SummaryBar({ stats, age }: Props) {
  // Extrae de forma segura desde stats posibles claves conocidas
  const livedRaw =
    (stats as any).lived ??
    (stats as any).weeksLived ??
    (stats as any).livedWeeks ??
    0;

  const totalRaw =
    (stats as any).total ??
    (stats as any).totalWeeks ??
    ((stats as any).lived ?? (stats as any).weeksLived ?? (stats as any).livedWeeks ?? 0) +
      ((stats as any).remaining ?? (stats as any).weeksRemaining ?? 0);

  const lived = Number.isFinite(livedRaw) ? Number(livedRaw) : 0;
  const total = Number.isFinite(totalRaw) && totalRaw > 0 ? Number(totalRaw) : Math.max(1, lived);

  const pct = Math.round((lived / total) * 1000) / 10;
  const remaining = Math.max(0, total - lived);

  // Semana ISO actual y semanas totales del año en curso
  const now = new Date();
  const weekNow = isoWeek(now); // 1..52/53
  const weeksInThisYear = isoWeeksInYear(now.getFullYear());
  const remainingYear = Math.max(0, weeksInThisYear - weekNow);

  const livedFmt = lived.toLocaleString();
  const totalFmt = total.toLocaleString();
  const remainingFmt = remaining.toLocaleString();

  return (
    <section className={styles.bar}>
      <p className={styles.line}>
        You have lived <strong>{livedFmt}</strong> weeks out of{" "}
        <strong>
          {totalFmt} ({pct}%)
        </strong>
        . Remaining: <strong>{remainingFmt}</strong>.
      </p>
      <p className={styles.sub}>
        Age: {age.years} years, {age.months} months and {age.days} days.
      </p>
      <p className={styles.sub}>
        <span className={styles.yearLabel}>This year:</span> week{" "}
        <strong>{weekNow}</strong> of <strong>{weeksInThisYear}</strong>. Remaining:{" "}
        <strong>{remainingYear}</strong>.
      </p>
    </section>
  );
}
