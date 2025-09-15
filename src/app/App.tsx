
import ThemeToggle from "../components/ThemeToggle";
import { useMemo, useState } from "react";
import { getDOB } from "../lib/storage";
import { computeStats } from "../lib/stats";
import { ageBreakdown } from "../lib/date";
import OnboardingModal from "../components/OnboardingModal/OnboardingModal";
import LifeGrid from "../components/LifeGrid/LifeGrid";
import Legend from "../components/Legend";
import SummaryBar from "../components/SummaryBar";
import styles from "./App.module.css";

export default function App() {
  // 1) siempre el mismo orden de hooks
  const [dobISO, setDobISO] = useState<string | null>(getDOB());

  // 2) estos hooks SIEMPRE se llaman; si no hay DOB devuelven null
  const stats = useMemo(
    () => (dobISO ? computeStats(dobISO, 80) : null),
    [dobISO]
  );
  const age = useMemo(() => (dobISO ? ageBreakdown(dobISO) : null), [dobISO]);

  // 3) ramificamos SOLO el JSX
  return (
    <div className={styles.app}>
      <ThemeToggle />   {/* ← icono sol/luna fijo arriba a la derecha */}
      {!dobISO ? (
        <OnboardingModal onConfirmed={(iso) => setDobISO(iso)} />
      ) : (
        <>
          <header className={styles.header}>
            <h1>SEMANAS DE MI VIDA</h1>
            <p>
              Cada círculo es una semana. Años en filas, semanas en columnas.
            </p>
          </header>

          {/* stats y age existen porque dobISO no es null */}
          <SummaryBar stats={stats!} age={age!} />
          <LifeGrid birthDateISO={dobISO} years={80} />
          <Legend />

          <footer className={styles.footer}>
            <small>
              <a
                href="#reset"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    window.confirm("¿Seguro que quieres borrar tu fecha salvada?")
                  ) {
                    localStorage.removeItem("lifeweeks.v1");
                    window.location.reload();
                  }
                }}
                style={{ opacity: 0.5 }}
              >
                Reset (oculto)
              </a>
            </small>
          </footer>
         </>
      )}
    </div>
  );
}
