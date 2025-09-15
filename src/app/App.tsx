import { useMemo, useState } from "react";
import { getDOB, getExpectancy } from "../lib/storage";
import { computeStats } from "../lib/stats";
import { ageBreakdown } from "../lib/date";
import OnboardingModal from "../components/OnboardingModal/OnboardingModal";
import LifeGrid from "../components/LifeGrid/LifeGrid";
import Legend from "../components/Legend";
import SummaryBar from "../components/SummaryBar";
import ThemeToggle from "../components/ThemeToggle";
import JumpToCurrent from "../components/JumpToCurrent";
import styles from "./App.module.css";

export default function App() {
  const [dobISO, setDobISO] = useState<string | null>(getDOB());
  const [expectancy, setExpectancy] = useState<number>(getExpectancy());

  const stats = useMemo(
    () => (dobISO ? computeStats(dobISO, expectancy) : null),
    [dobISO, expectancy]
  );
  const age = useMemo(() => (dobISO ? ageBreakdown(dobISO) : null), [dobISO]);

  return (
    <div className={styles.app}>
      <ThemeToggle />

      {!dobISO ? (
        <OnboardingModal
          onConfirmed={(iso) => {
            setDobISO(iso);
            setExpectancy(getExpectancy());
          }}
        />
      ) : (
        <>
          <header className={styles.header}>
            <h1>LIFE WEEKS</h1>
            <p>Each circle is a week. Years run in rows, weeks in columns.</p>
          </header>

          <SummaryBar stats={stats!} age={age!} />
          <LifeGrid birthDateISO={dobISO} years={expectancy} />

          {/* Legend now shows life expectancy */}
          <Legend expectancy={expectancy} />

          <JumpToCurrent />

          <footer className={styles.footer}>
            <small>
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm("Are you sure you want to clear your saved data?")) {
                    localStorage.removeItem("lifeweeks.v1");
                    window.location.reload();
                  }
                }}
                style={{ opacity: 0.5 }}
              >
                Reset
              </a>
            </small>
          </footer>
        </>
      )}
    </div>
  );
}
