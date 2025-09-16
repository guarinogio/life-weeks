import { useMemo, useState } from "react";
import { getDOB, getExpectancy } from "../lib/storage";
import { computeStats } from "../lib/stats";
import { ageBreakdown } from "../lib/date";

import OnboardingModal from "../components/OnboardingModal/OnboardingModal";
import LifeGridSVG from "../components/LifeGridSVG/LifeGridSVG";
import Legend from "../components/Legend";
import SummaryBar from "../components/SummaryBar";
import ThemeToggle from "../components/ThemeToggle";
import JumpToCurrent from "../components/JumpToCurrent";
import InstallPrompt from "../components/InstallPrompt";

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
      {/* Botón de tema fijo (esquina superior derecha) */}
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

          {/* Resumen superior (vividas / totales / restantes + edad exacta) */}
          <SummaryBar stats={stats!} age={age!} />

          {/* Calendario en SVG, totalmente responsive */}
          <LifeGridSVG birthDateISO={dobISO} years={expectancy} />

          {/* Leyenda e indicación de expectativa configurada */}
          <Legend expectancy={expectancy} />

          {/* Botón flotante para saltar a la semana actual */}
          <JumpToCurrent />

          {/* Prompt PWA primera vez (instalar app) */}
          <InstallPrompt />

          <footer className={styles.footer}>
            <small>
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    window.confirm(
                      "Are you sure you want to clear your saved data?"
                    )
                  ) {
                    localStorage.removeItem("lifeweeks.v1");
                    window.location.reload();
                  }
                }}
                style={{ opacity: 0.5 }}
              >
                Reset (hidden)
              </a>
            </small>
          </footer>
        </>
      )}
    </div>
  );
}
