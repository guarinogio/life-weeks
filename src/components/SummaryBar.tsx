import { isoWeek, isoWeeksInYear } from "../lib/date";
import { useI18n } from "../i18n";
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

export default function SummaryBar({ stats, age }: Props) {
  const { t } = useI18n();

  const total = stats.total ?? stats.totalWeeks ?? 0;
  const lived = stats.lived ?? stats.weeksLived ?? stats.livedWeeks ?? 0;
  const remaining = stats.remaining ?? stats.weeksRemaining ?? Math.max(0, total - lived);
  const percent = total > 0 ? (lived / total) * 100 : 0;

  const livedFmt = lived.toLocaleString();
  const totalFmt = total.toLocaleString();
  const remainingFmt = remaining.toLocaleString();
  const pct = percent.toFixed(1);

  const weekNow = isoWeek(new Date());
  const weeksInThisYear = isoWeeksInYear(new Date().getUTCFullYear());
  const remainingYear = Math.max(0, weeksInThisYear - weekNow);

  return (
    <section className={styles.bar} aria-live="polite">
      <p className={styles.line}>
        {t("youHaveLived")} <strong>{livedFmt}</strong> {t("weeksOutOf")}{" "}
        <strong>
          {totalFmt} ({pct}%)
        </strong>
        . {t("remainingLabel")}: <strong>{remainingFmt}</strong>.
      </p>
      <p className={styles.sub}>
        {t("ageLabel")}: {age.years} {t("yearsLabel")}, {age.months} {t("monthsLabel")} {t("and")} {age.days} {t("daysLabel")}.
      </p>
      <p className={styles.sub}>
        <span className={styles.yearLabel}>{t("thisYearLabel")}:</span> {t("weekLabel")}{" "}
        <strong>{weekNow}</strong> {t("ofLabel")} <strong>{weeksInThisYear}</strong>. {t("remainingLabel")}: <strong>{remainingYear}</strong>.
      </p>
    </section>
  );
}
