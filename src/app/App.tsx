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

  // Para forzar refresco del Sidebar de notas tras guardar/editar/borrar
  const [marksTick, setMarksTick] = useState(0);

  // Para ocultar el botón "Current" cuando Ajustes está abierto
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

  const fabBase = {
    position: "fixed" as const,
    right: 16,
    width: "var(--fab-size)",
    height: "var(--fab-size)",
    minWidth: "var(--fab-size)",
    minHeight: "var(--fab-size)",
    borderRadius: "50%",
    border: "1px solid var(--fab-border, var(--c-border))",
    background: "var(--c-bg)",
    color: "var(--c-text)",
    boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    padding: 0,
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
              bottom: `calc(var(--fab-bottom) + (var(--fab-size) + var(--fab-gap)) * 1)`,
            }}
          >
            📝
          </button>

          {/* Oculta "Current" si el panel de notas o el de ajustes están abiertos */}
          {!showSidebar && !settingsOpen && <JumpToCurrent />}

          <InstallPrompt />

          {/* Oculta el botón/portal de Ajustes cuando el sidebar de notas está visible */}
          {!showSidebar && <SettingsPanel />}

          {/* Remontar el sidebar cuando cambian las notas: key=marksTick */}
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
