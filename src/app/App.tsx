import { useEffect, useMemo, useState } from "react";

import InstallPrompt from "../components/InstallPrompt";
import JumpToCurrent from "../components/JumpToCurrent";
import Legend from "../components/Legend";
import LifeGridSVG from "../components/LifeGridSVG/LifeGridSVG";
import MarksSidebar from "../components/Marks/MarksSidebar";
import OnboardingModal from "../components/OnboardingModal/OnboardingModal";
import SettingsPanel from "../components/Settings/SettingsPanel";
import SummaryBar from "../components/SummaryBar";
import { ageBreakdown } from "../lib/date";
import { groupByWeekIndex } from "../lib/marks";
import { computeStats } from "../lib/stats";
import { getDOB, getExpectancy, listMarks } from "../lib/storage";
import { useI18n } from "../i18n";
import styles from "./App.module.css";

export default function App() {
  const { t } = useI18n();
  const [dob, setDob] = useState<string | null>(null);
  const [expectancy, setExpectancy] = useState<number>(80);
  const [marks, setMarks] = useState(() => listMarks());

  useEffect(() => {
    setDob(getDOB());
    setExpectancy(getExpectancy());
    const onMarks = () => setMarks(listMarks());
    window.addEventListener("lifeweeks:marks-changed", onMarks as EventListener);
    return () => window.removeEventListener("lifeweeks:marks-changed", onMarks as EventListener);
  }, []);

  const stats = useMemo(() => {
    if (!dob) return {};
    return computeStats(dob, expectancy);
  }, [dob, expectancy]);

  const age = useMemo(() => {
    if (!dob) return { years: 0, months: 0, days: 0 };
    return ageBreakdown(dob);
  }, [dob]);

  const marksByIndex = useMemo(() => groupByWeekIndex(marks), [marks]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarWeek, setSidebarWeek] = useState<number | null>(null);

  const onWeekDouble = (idx: number) => {
    setSidebarWeek(idx);
    setShowSidebar(true);
  };

  return (
    <div className={styles.app}>
      {!dob ? (
        <OnboardingModal
          onConfirmed={() => {
            setDob(getDOB());
            setExpectancy(getExpectancy());
          }}
        />
      ) : (
        <>
          <header className={styles.header}>
            <h1>{t("appTitle")}</h1>
          </header>

          <SummaryBar stats={{ ...stats }} age={age} />

          <LifeGridSVG
            birthDateISO={dob}
            years={expectancy}
            onWeekDoubleClick={onWeekDouble}
            marksByIndex={marksByIndex}
          />

          <Legend expectancy={expectancy} />

          <button
            aria-label="Notas e hitos"
            title="Notas e hitos"
            onClick={() => {
              setSidebarWeek(null);
              setShowSidebar(true);
            }}
            style={{
              position: "fixed",
              right: 16,
              bottom: "var(--fab-bottom)",
              width: "var(--fab-size)",
              height: "var(--fab-size)",
              minWidth: "var(--fab-size)",
              minHeight: "var(--fab-size)",
              borderRadius: "50%",
              border: "1px solid var(--fab-border, var(--c-border))",
              background: "var(--fab-bg, var(--c-bg))",
              color: "var(--fab-fg, var(--c-text))",
              boxShadow: "0 10px 30px rgba(0,0,0,.18)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              padding: 0
            }}
            className="notes-fab"
          >
            📝
          </button>

          <JumpToCurrent />
          <InstallPrompt />
          <SettingsPanel />

          <MarksSidebar
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
            weekIndex={sidebarWeek}
          />
        </>
      )}
    </div>
  );
}
