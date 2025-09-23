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
  const [marksTick, setMarksTick] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setDob(getDOB());
    setExpectancy(getExpectancy());
    const onMarks = () => {
      setMarks(listMarks());
      setMarksTick((n) => n + 1);
    };
    window.addEventListener("lifeweeks:marks-changed", onMarks as EventListener);
    const onOpen = () => setSettingsOpen(true);
    const onClose = () => setSettingsOpen(false);
    window.addEventListener("settings:open", onOpen as EventListener);
    window.addEventListener("settings:close", onClose as EventListener);
    return () => {
      window.removeEventListener("lifeweeks:marks-changed", onMarks as EventListener);
      window.removeEventListener("settings:open", onOpen as EventListener);
      window.removeEventListener("settings:close", onClose as EventListener);
    };
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

  const fabBase: React.CSSProperties = {
    position: "fixed",
    right: 16,
    width: "clamp(44px, 9vw, 56px)",
    height: "clamp(44px, 9vw, 56px)",
    minWidth: "44px",
    minHeight: "44px",
    borderRadius: "50%",
    border: "1px solid var(--fab-border, var(--c-border))",
    background: "var(--c-bg)",
    color: "var(--c-text)",
    boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    padding: 0,
    lineHeight: 0
  };

  const iconStyle: React.CSSProperties = {
    width: "clamp(18px, 4.2vw, 22px)",
    height: "clamp(18px, 4.2vw, 22px)",
    display: "block",
    stroke: "currentColor",
    fill: "none"
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
              ...fabBase,
              bottom: `calc(var(--fab-bottom, 16px) + (clamp(44px, 9vw, 56px) + var(--fab-gap, 10px)) * 1)`
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" style={iconStyle}>
              <path d="M4 3.5h9.5a2 2 0 0 1 2 2V9H4V3.5Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 9h13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.5 13h6M7.5 16h4" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          {!showSidebar && !settingsOpen && <JumpToCurrent />}

          <InstallPrompt />
          {!showSidebar && <SettingsPanel />}

          <MarksSidebar
            key={marksTick}
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
            weekIndex={sidebarWeek}
          />
        </>
      )}
    </div>
  );
}
