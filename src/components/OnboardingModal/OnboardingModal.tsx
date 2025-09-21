import { useCallback, useEffect, useMemo, useState } from "react";

import { ageBreakdown } from "../../lib/date";
import {
  getDOB,
  getExpectancy,
  setDOB,
  setExpectancy,
} from "../../lib/storage";
import styles from "./OnboardingModal.module.css";

type Props = {
  onConfirmed: () => void;
};

export default function OnboardingModal({ onConfirmed }: Props) {
  const storedDob = getDOB();
  const storedExp = getExpectancy();

  const [dobISO, setDobISO] = useState<string>(
    storedDob || new Date().toISOString().slice(0, 10),
  );
  const [expYears, setExpYears] = useState<number>(storedExp || 80);

  const age = useMemo(() => ageBreakdown(dobISO), [dobISO]);

  const expValid = expYears >= 60 && expYears <= 110;
  const dobValid =
    !!dobISO && !Number.isNaN(new Date(dobISO + "T00:00:00").getTime());

  const confirm = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!dobValid || !expValid) return;
      setDOB(dobISO);
      setExpectancy(expYears);
      setTimeout(() => onConfirmed(), 0);
    },
    [dobISO, expYears, dobValid, expValid, onConfirmed],
  );

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        confirm();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirm]);

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Set up your life calendar"
      >
        <h2>Set up your life calendar</h2>
        <p>
          Enter your date of birth and (optional) life expectancy. You can
          change the expectancy later in Settings.
        </p>

        <form onSubmit={confirm}>
          <div className={styles.row}>
            <label>Date of birth</label>
            <div className={styles.inline}>
              <input
                type="date"
                value={dobISO}
                onChange={(e) => setDobISO(e.target.value)}
                required
              />
              <span className={styles.sub}>
                {age.years}y {age.months}m {age.days}d
              </span>
            </div>
            <small className={styles.hint}>Format: YYYY-MM-DD</small>
          </div>

          <div className={styles.row}>
            <label>Life expectancy (years)</label>
            <input
              type="number"
              min={60}
              max={110}
              step={1}
              value={expYears}
              onChange={(e) => setExpYears(parseInt(e.target.value || "0", 10))}
              required
            />
            {!expValid ? (
              <small className={styles.err}>Allowed: 60–110.</small>
            ) : null}
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={!dobValid || !expValid}
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
