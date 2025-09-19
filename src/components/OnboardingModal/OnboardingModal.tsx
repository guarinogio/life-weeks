import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { ageBreakdown } from "../../lib/date";
import { setDOB, setExpectancy } from "../../lib/storage";
import styles from "./OnboardingModal.module.css";

type Props = {
  onConfirmed: (dobISO: string) => void;
};

const TODAY_ISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const MIN_ISO = "1900-01-01";

export default function OnboardingModal({ onConfirmed }: Props) {
  const [dateISO, setDateISO] = useState<string>("");
  const [expectancy, setExp] = useState<number>(80);
  const [error, setError] = useState<string | null>(null);

  const ageText = useMemo(() => {
    if (!dateISO) return "";
    try {
      const a = ageBreakdown(dateISO);
      return `${a.years}y ${a.months}m ${a.days}d`;
    } catch {
      return "";
    }
  }, [dateISO]);

  function validate(): string | null {
    if (!dateISO) return "Please pick your date of birth.";
    const dob = new Date(dateISO);
    if (Number.isNaN(dob.getTime())) return "Invalid date.";

    const today = new Date();
    if (dob > today) return "Date of birth cannot be in the future.";

    const years = ageBreakdown(dateISO).years;
    if (years > 110) return "Age must be 110 or less.";

    if (!Number.isFinite(expectancy))
      return "Life expectancy must be a number.";
    if (expectancy < 60 || expectancy > 110) {
      return "Life expectancy must be between 60 and 110 years.";
    }
    if (years >= expectancy) {
      return `Your age (${years}) exceeds or equals the selected life expectancy (${expectancy}). Increase it.`;
    }
    return null;
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    setDOB(dateISO);
    setExpectancy(expectancy);
    onConfirmed(dateISO);
  }

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={submit}>
        <h2 className={styles.title}>Set up your life calendar</h2>
        <p className={styles.subtitle}>
          Enter your date of birth and (optional) life expectancy. You can
          change the expectancy later in Settings.
        </p>

        <label className={styles.label} htmlFor="dob">
          Date of birth
        </label>
        <div className={styles.dateRow}>
          <input
            id="dob"
            name="dob"
            type="date"
            className={styles.dateInput}
            value={dateISO}
            min={MIN_ISO}
            max={TODAY_ISO}
            onChange={(e) => setDateISO(e.target.value)}
            required
          />
          <span className={styles.ageHint}>{ageText}</span>
        </div>

        <p className={styles.hint}>Format: YYYY-MM-DD</p>

        <label className={styles.label} htmlFor="exp">
          Life expectancy (years)
        </label>
        <div className={styles.expRow}>
          <input
            id="exp"
            name="exp"
            type="number"
            inputMode="numeric"
            className={styles.expInput}
            value={expectancy}
            min={60}
            max={110}
            onChange={(e) => setExp(Number(e.target.value || 0))}
          />
          <span className={styles.hintInline}>
            Default: 80. Allowed: 60–110.
          </span>
        </div>

        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.primary} type="submit">
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}
