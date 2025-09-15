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
    // guardamos y notificamos al padre con la misma fecha
    setDOB(iso!);
    onConfirmed(iso!);
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>Fecha de nacimiento</h2>
        <p className={styles.help}>
          Ingresa tu fecha con el formato <strong>dd/mm/aaaa</strong>. Esta
          fecha se guardará y no podrás cambiarla luego.
        </p>
        <form onSubmit={submit} className={styles.form}>
          <label htmlFor="dob" className={styles.label}>
            dd/mm/aaaa
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
            <span>Entiendo que no podré cambiarla</span>
          </label>

          <button
            className={styles.primary}
            type="submit"
            disabled={!isValid || !accepted}
            aria-disabled={!isValid || !accepted}
          >
            Confirmar
          </button>

          {!isValid && value.length > 0 && (
            <p className={styles.error}>Fecha inválida.</p>
          )}
        </form>
      </div>
    </div>
  );
}
