import { isoWeek, isoWeeksInYear } from "../lib/date";
import styles from "./SummaryBar.module.css";

type StatsLike = Partial<{
  lived: number;
  weeksLived: number;
  livedWeeks: number;
  total: number;
  totalWeeks: number;
  remaining: number;
  weeksRemaining: number;
}>;

type Props = {
  stats: StatsLike;
  age: { years: number; months: number; days: number };
};

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export default function SummaryBar({ stats, age }: Props) {
  const lived =
    num(stats.lived) ?? num(stats.weeksLived) ?? num(stats.livedWeeks) ?? 0;

  const totalDirect = num(stats.total) ?? num(stats.totalWeeks);
  const remaining = num(stats.remaining) ?? num(stats.weeksRemaining);

  const total = totalDirect ?? (lived + (remaining ?? 0) || Math.max(1, lived)); // fallback seguro ≥ 1

  const pct = Math.round((lived / total) * 1000) / 10;

  // Semana ISO actual y semanas totales del año en curso
  const now = new Date();
  const weekNow = isoWeek(now); // 1..52/53
  const weeksInThisYear = isoWeeksInYear(now.getFullYear());
  const remainingYear = Math.max(0, weeksInThisYear - weekNow);

  const livedFmt = lived.toLocaleString();
  const totalFmt = total.toLocaleString();
  const remainingFmt = (total - lived).toLocaleString();

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
        <strong>{weekNow}</strong> of <strong>{weeksInThisYear}</strong>.
        Remaining: <strong>{remainingYear}</strong>.
      </p>
    </section>
  );
}
