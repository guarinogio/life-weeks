import { useEffect, useMemo, useState } from "react";
import { ageBreakdown } from "../../lib/date";
import { getDOB, getExpectancy, setDOB, setExpectancy } from "../../lib/storage";
import { useI18n } from "../../i18n";
import styles from "./OnboardingModal.module.css";

type Props = {
  onConfirmed: () => void;
};

export default function OnboardingModal({ onConfirmed }: Props) {
  const { t, lang, setLang } = useI18n();

  const initialDOB = useMemo(() => {
    const stored = getDOB();
    if (stored) return stored;
    const d = new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const [dobISO, setDobISO] = useState<string>(initialDOB);
  const [expectancy, setExp] = useState<number>(() => getExpectancy());
  const age = useMemo(() => ageBreakdown(dobISO), [dobISO]);

  const dobValid = useMemo(() => !isNaN(new Date(dobISO).getTime()), [dobISO]);
  const expValid = useMemo(() => Number.isFinite(expectancy) && expectancy >= 1 && expectancy <= 120, [expectancy]);

  useEffect(() => {
    const stored = getExpectancy();
    if (stored && stored !== expectancy) setExp(stored);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dobValid || !expValid) return;
    setDOB(dobISO);
    setExpectancy(expectancy);
    onConfirmed();
  }

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={t("setupTitle")}>
      <div className={styles.overlay} />
      <div className={styles.panel} role="document">
        <header className={styles.header}>
          <h3 className={styles.title}>{t("setupTitle")}</h3>
          <label className={styles.lang}>
            <span>{t("language")}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as any)}>
              <option value="es">{t("spanish")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </label>
        </header>

        <p className={styles.lead}>{t("setupIntro")}</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>{t("dobLabel")}</label>
            <div className={styles.inline}>
              <input
                className={styles.input}
                type="date"
                value={dobISO}
                onChange={(e) => setDobISO(e.target.value)}
                required
              />
              <span className={styles.age}>
                {age.years}y {age.months}m {age.days}d
              </span>
            </div>
            <small className={styles.hint}>
              {t("formatLabel")}: {t("dateFormatYMD")}
            </small>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>{t("lifeExpectancyYearsLabel")}</label>
            <input
              className={styles.input}
              type="number"
              min={1}
              max={120}
              step={1}
              value={expectancy}
              onChange={(e) => setExp(parseInt(e.target.value || "0", 10))}
              required
            />
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={!dobValid || !expValid}
            >
              {t("confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
