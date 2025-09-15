import { weeksBetween } from "../../lib/date";
import YearLabel from "./YearLabel";
import WeekHeader from "./WeekHeader";
import WeekCell from "./WeekCell";
import styles from "./LifeGrid.module.css";

interface Props {
  birthDateISO: string;
  years?: number; // default 80
}

export default function LifeGrid({ birthDateISO, years = 80 }: Props) {
  const livedWeeks = weeksBetween(birthDateISO);
  const total = years * 52;
  const currentIndex = Math.min(livedWeeks, total - 1);

  const rows = Array.from({ length: years }, (_, y) => y);
  const cols = Array.from({ length: 52 }, (_, w) => w);

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div className={styles.labelSpacer} />
        <WeekHeader />
      </div>

      {rows.map((year) => (
        <div key={year} className={styles.row}>
          <YearLabel value={year} />
          <div className={styles.weeks}>
            {cols.map((w) => {
              const k = year * 52 + w;
              let state: "past" | "current" | "future" = "future";
              if (k < livedWeeks) state = "past";
              else if (k === currentIndex) state = "current";
              return (
                <WeekCell
                  key={w}
                  state={state}
                  title={`Año ${year}, semana ${w + 1}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
