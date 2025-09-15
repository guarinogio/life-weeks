import { useMemo, useState } from "react";
import { parseDMYToISO } from "../../lib/date";
import { setDOB } from "../../lib/storage";
import styles from "./OnboardingModal.module.css";

interface Props {
  onConfirmed: (iso: string) => void;
}

export default function OnboardingModal({ onConfirmed }: Props) {
  const [value, setValue] = useState("");
  const [accepted, setAccepted] = useState(false);
  const iso = useMemo(() => parseDMYToISO(value), [value]);
  const isValid = !!iso;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !accepted) return;
    setDOB(iso!);
    onConfirmed(iso!);
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>Date of birth</h2>
        <p className={styles.help}>
          Enter your date in the format <strong>dd/mm/yyyy</strong>. It will be
          saved and you won’t be able to change it later.
        </p>
        <form onSubmit={submit} className={styles.form}>
          <label htmlFor="dob" className={styles.label}>
            dd/mm/yyyy
          </label>
          <input
            id="dob"
            inputMode="numeric"
            placeholder="31/12/1990"
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            pattern="^\d{1,2}/\d{1,2}/\d{4}$"
            required
          />

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>I understand I won’t be able to change it</span>
          </label>

          <button
            className={styles.primary}
            type="submit"
            disabled={!isValid || !accepted}
            aria-disabled={!isValid || !accepted}
          >
            Confirm
          </button>

          {!isValid && value.length > 0 && (
            <p className={styles.error}>Invalid date.</p>
          )}
        </form>
      </div>
    </div>
  );
}
