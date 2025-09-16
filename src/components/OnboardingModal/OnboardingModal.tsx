import { useRef, useState } from "react";

import { parseDMYToISO } from "../../lib/date";
import styles from "./OnboardingModal.module.css";

type Props = {
  onConfirmed: (iso: string) => void;
};

export default function OnboardingModal({ onConfirmed }: Props) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [expectancy, setExpectancy] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  function clampDigits(v: string, maxLen: number) {
    return v.replace(/\D/g, "").slice(0, maxLen);
  }

  const onDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clampDigits(e.target.value, 2);
    setDay(v);
    if (v.length === 2) {
      monthRef.current?.focus();
      monthRef.current?.select();
    }
  };

  const onMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clampDigits(e.target.value, 2);
    setMonth(v);
    if (v.length === 2) {
      yearRef.current?.focus();
      yearRef.current?.select();
    }
  };

  const onYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = clampDigits(e.target.value, 4);
    setYear(v);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar expectativa (60–110)
    if (!Number.isFinite(expectancy) || expectancy < 60 || expectancy > 110) {
      setError("Life expectancy must be between 60 and 110 years.");
      return;
    }

    // Validar fecha D/M/Y → ISO
    const iso = parseDMYToISO(day, month, year);
    if (!iso) {
      setError("Please enter a valid date (DD / MM / YYYY).");
      return;
    }

    // Guardar en localStorage
    try {
      const payload = { dob: iso, expectancy: Number(expectancy) };
      localStorage.setItem("lifeweeks.v1", JSON.stringify(payload));
    } catch {
      /* noop */
    }

    onConfirmed(iso);
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={onSubmit}>
        <h2 className={styles.title}>Set up your life calendar</h2>
        <p className={styles.desc}>
          Enter your date of birth and (optional) life expectancy. You can
          change the expectancy later in Settings.
        </p>

        <div className={styles.fieldGroup} aria-label="Date of birth">
          <label className={styles.label}>Date of birth</label>
          <div className={styles.dateRow} data-sep="/">
            <input
              ref={dayRef}
              inputMode="numeric"
              pattern="\d{2}"
              placeholder="DD"
              aria-label="Day"
              className={styles.dateBox}
              value={day}
              onChange={onDayChange}
              autoFocus
            />
            <span className={styles.sep}>/</span>
            <input
              ref={monthRef}
              inputMode="numeric"
              pattern="\d{2}"
              placeholder="MM"
              aria-label="Month"
              className={styles.dateBox}
              value={month}
              onChange={onMonthChange}
            />
            <span className={styles.sep}>/</span>
            <input
              ref={yearRef}
              inputMode="numeric"
              pattern="\d{4}"
              placeholder="YYYY"
              aria-label="Year"
              className={styles.dateBoxWide}
              value={year}
              onChange={onYearChange}
            />
          </div>
          <small className={styles.hint}>Format: DD / MM / YYYY</small>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="expectancy">
            Life expectancy (years)
          </label>
          <input
            id="expectancy"
            type="number"
            min={60}
            max={110}
            step={1}
            value={expectancy}
            onChange={(e) => setExpectancy(Number(e.target.value))}
            className={styles.numberInput}
          />
          <small className={styles.hint}>Default: 80. Allowed: 60–110.</small>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
