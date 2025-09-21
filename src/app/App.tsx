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
import { getDOB, getExpectancy, listMarks, exportData, importData } from "../lib/storage";
import { useI18n } from "../i18n";
import styles from "./App.module.css";
import dialogStyles from "../components/Marks/ConfirmDialog.module.css";
import { getFirebaseState, initFirebaseSync, pullAndMerge, pushSnapshot } from "../lib/firebaseSync";

export default function App() {
  const { t } = useI18n();
  const [dob, setDob] = useState<string | null>(null);
  const [expectancy, setExpectancy] = useState<number>(80);
  const [marks, setMarks] = useState(() => listMarks());
  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    setDob(getDOB());
    setExpectancy(getExpectancy());
    const onMarks = () => setMarks(listMarks());
    window.addEventListener("lifeweeks:marks-changed", onMarks as EventListener);
    const onStorage = () => setSyncTick((n) => n + 1);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("lifeweeks:marks-changed", onMarks as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    initFirebaseSync().then(() => {
      const st = getFirebaseState();
      if (st.signedIn) {
        pullAndMerge(exportData, (json) => importData(json)).then((r) => {
          if (r && r.ok) {
            setDob(getDOB());
            setExpectancy(getExpectancy());
            setMarks(listMarks());
            setSyncTick((n) => n + 1);
          }
        });
      }
    });
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

  async function doQuickPush() {
    setIsPushing(true);
    try {
      const r = await pushSnapshot(exportData);
      if (r.ok) setShowPushConfirm(false);
    } finally {
      setIsPushing(false);
      setSyncTick((n) => n + 1);
    }
  }

  const fabBase = {
    position: "fixed" as const,
    right: 16,
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
    padding: 0,
  };

  const canSync = (() => {
    void syncTick;
    const st = getFirebaseState();
    return Boolean(st.signedIn);
  })();

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

          {canSync && (
            <button
              aria-label={t("quickPush")}
              title={t("quickPush")}
              onClick={() => setShowPushConfirm(true)}
              style={{
                ...fabBase,
                bottom: `calc(var(--fab-bottom) + (var(--fab-size) + var(--fab-gap)) * 2)`,
              }}
            >
              <span className={isPushing ? "spin" : ""} style={{ lineHeight: 0, display: "inline-flex" }}>
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0114.13-3.36L23 10"></path>
                  <path d="M1 14l5.37 4.36A9 9 0 0020.49 15"></path>
                </svg>
              </span>
            </button>
          )}

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

          <JumpToCurrent />
          <InstallPrompt />
          <SettingsPanel />

          <MarksSidebar
            open={showSidebar}
            onClose={() => setShowSidebar(false)}
            weekIndex={sidebarWeek}
          />

          {canSync && showPushConfirm && (
            <div className={dialogStyles.root} role="dialog" aria-modal="true" aria-label={t("pushConfirmTitle")}>
              <div className={dialogStyles.overlay} onClick={() => setShowPushConfirm(false)} />
              <div className={dialogStyles.panel} role="document" style={{ maxWidth: 420 }}>
                <header className={dialogStyles.header}>
                  <h4>{t("pushConfirmTitle")}</h4>
                  <button className={dialogStyles.close} onClick={() => setShowPushConfirm(false)} aria-label={t("cancel")}>
                    ×
                  </button>
                </header>
                <div className={dialogStyles.body}>
                  <p>{t("pushConfirmBody")}</p>
                </div>
                <div className={dialogStyles.actions}>
                  <button className={styles.ghost} onClick={() => setShowPushConfirm(false)}>{t("cancel")}</button>
                  <button className={styles.primary} onClick={doQuickPush}>{t("confirm")}</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
