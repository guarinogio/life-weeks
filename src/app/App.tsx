import { useEffect, useMemo, useState } from "react";

import InstallPrompt from "../components/InstallPrompt";
import JumpToCurrent from "../components/JumpToCurrent";
import Legend from "../components/Legend";
import LifeGridSVG from "../components/LifeGridSVG/LifeGridSVG";
import MarkModal from "../components/Marks/MarkModal";
import MarksSidebar from "../components/Marks/MarksSidebar";
import OnboardingModal from "../components/OnboardingModal/OnboardingModal";
import SettingsPanel from "../components/Settings/SettingsPanel";
import SummaryBar from "../components/SummaryBar";
import { ageBreakdown } from "../lib/date";
import { groupByWeekIndex } from "../lib/marks";
import { computeStats } from "../lib/stats";
import { getDOB, getExpectancy, listMarks } from "../lib/storage";
import styles from "./App.module.css";

export default function App() {
  const dob = getDOB();
  const expectancy = getExpectancy();

  const stats = useMemo(() => {
    if (!dob) return {};
    return computeStats(dob, expectancy);
  }, [dob, expectancy]);

  const age = useMemo(() => {
    if (!dob) return { years: 0, months: 0, days: 0 };
    return ageBreakdown(dob);
  }, [dob]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const [marksVersion, setMarksVersion] = useState(0);
  useEffect(() => {
    const onChange: EventListener = () => setMarksVersion((v) => v + 1);
    window.addEventListener("lifeweeks:marks-changed", onChange);
    return () =>
      window.removeEventListener("lifeweeks:marks-changed", onChange);
  }, []);
  const marksByIndex = useMemo(() => {
    return groupByWeekIndex(listMarks());
  }, [marksVersion]);

  const openModalForWeek = (idx: number) => {
    setSelectedWeek(idx);
    setModalOpen(true);
  };

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className={styles.app}>
      {!dob ? (
        <OnboardingModal
          onConfirmed={() => {
            location.reload();
          }}
        />
      ) : (
        <>
          <SummaryBar stats={{ ...stats }} age={age} />

          <LifeGridSVG
            birthDateISO={dob}
            years={expectancy}
            onWeekDoubleClick={openModalForWeek}
            marksByIndex={marksByIndex}
          />

          <button
            aria-label="Abrir notas e hitos"
            onClick={() => setShowSidebar(true)}
            style={{
              position: "fixed",
              right: 16,
              bottom: 96,
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid var(--fab-border, var(--border, #e5e5e5))",
              background: "var(--fab-bg, var(--bg, #fff))",
              color: "var(--fab-fg, var(--fg, #111))",
              boxShadow: "0 10px 30px rgba(0,0,0,.18)",
              display: "grid",
              placeItems: "center",
              zIndex: 80,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 4h14a1 1 0 0 1 1 1v14l-4-3H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M8 8h8M8 12h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <Legend expectancy={expectancy} />
          <JumpToCurrent />
          <InstallPrompt />
          <SettingsPanel />
          <MarksSidebar
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </>
      )}

      <MarkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={selectedWeek != null ? { weekIndex: selectedWeek } : undefined}
      />
    </div>
  );
}
