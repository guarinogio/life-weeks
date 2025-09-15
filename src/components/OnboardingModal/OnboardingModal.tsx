import { useEffect, useMemo, useRef, useState } from "react";
import { parseDMYToISO } from "../../lib/date";
import { setDOB, setExpectancy } from "../../lib/storage";
import styles from "./OnboardingModal.module.css";

interface Props {
  onConfirmed: (iso: string) => void;
}

// Helpers
const onlyDigits = (s: string) => s.replace(/\D/g, "");

function splitClipboardToDMY(text: string) {
  const digits = onlyDigits(text).slice(0, 8);
  if (digits.length < 4) return null;
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4);
  return { d, m, y };
}

function pad2(s: string) {
  if (!s) return s;
  return s.length === 1 ? `0${s}` : s.slice(0, 2);
}

export default function OnboardingModal({ onConfirmed }: Props) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [expectancy, setExpectancyState] = useState<string>("80"); // as string for input
  const [accepted, setAccepted] = useState(false);

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);

  const dmy = `${pad2(day)}/${pad2(month)}/${year}`;
  const isComplete = day.length === 2 && month.length === 2 && year.length === 4;

  // validate date with 80-year cap (already required)
  const iso = useMemo(
    () => (isComplete ? parseDMYToISO(dmy, 80) : null),
    [dmy, isComplete]
  );
  const isValidDOB = !!iso;

  // expectancy validation 60–110 (integer)
  const expNum = Number(expectancy);
  const isValidExp =
    /^\d+$/.test(expectancy) && expNum >= 60 && expNum <= 110;

  const canSubmit = isValidDOB && isValidExp && accepted;

  useEffect(() => {
    dayRef.current?.focus();
  }, []);

  // Date handlers
  const onDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 2);
    setDay(v);
    if (v.length === 2) monthRef.current?.focus();
  };
  const onMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 2);
    setMonth(v);
    if (v.length === 2) yearRef.current?.focus();
  };
  const onYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = onlyDigits(e.target.value).slice(0, 4);
    setYear(v);
    if (v.length === 4) expRef.current?.focus();
  };

  const onDayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && day.length === 0) e.preventDefault();
  };
  const onMonthKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && month.length === 0) {
      e.preventDefault();
      dayRef.current?.focus();
      setDay((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
    }
  };
  const onYearKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && year.length === 0) {
      e.preventDefault();
      monthRef.current?.focus();
      setMonth((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
    }
  };

  const onDayPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const parts = splitClipboardToDMY(text);
    if (!parts) return;
    e.preventDefault();
    setDay(parts.d);
    setMonth(parts.m);
    setYear(parts.y);
    if (parts.y.length === 4) expRef.current?.focus();
    else if (parts.m.length === 2) yearRef.current?.focus();
    else monthRef.current?.focus();
  };

  const onDayBlur = () => setDay((v) => pad2(v));
  const onMonthBlur = () => setMonth((v) => pad2(v));

  // expectancy handlers
  const onExpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = onlyDigits(e.target.value).slice(0, 3);
    setExpectancyState(digits);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // persist settings
    setDOB(iso!);
    setExpectancy(Number(expectancy) || 80);

    onConfirmed(iso!);
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h2>Date of birth</h2>
        <p className={styles.help}>
          Enter your date. It will be saved and you won’t be able to change it later.
        </p>

        <form onSubmit={submit} className={styles.form}>
          <label className={styles.label}>dd/mm/yyyy</label>

          <div className={styles.dateRow} role="group" aria-label="Date of birth">
            <input
              ref={dayRef}
              className={styles.segment}
              aria-label="Day"
              placeholder="dd"
              inputMode="numeric"
              autoComplete="bday-day"
              value={day}
              onChange={onDayChange}
              onKeyDown={onDayKeyDown}
              onPaste={onDayPaste}
              onBlur={onDayBlur}
              maxLength={2}
            />
            <span className={styles.sep}>/</span>
            <input
              ref={monthRef}
              className={styles.segment}
              aria-label="Month"
              placeholder="mm"
              inputMode="numeric"
              autoComplete="bday-month"
              value={month}
              onChange={onMonthChange}
              onKeyDown={onMonthKeyDown}
              onBlur={onMonthBlur}
              maxLength={2}
            />
            <span className={styles.sep}>/</span>
            <input
              ref={yearRef}
              className={styles.segmentYear}
              aria-label="Year"
              placeholder="yyyy"
              inputMode="numeric"
              autoComplete="bday-year"
              value={year}
              onChange={onYearChange}
              onKeyDown={onYearKeyDown}
              maxLength={4}
            />
          </div>

          <div className={styles.expRow}>
            <label htmlFor="expectancy">Life expectancy (years)</label>
            <input
              id="expectancy"
              ref={expRef}
              className={styles.inputExp}
              inputMode="numeric"
              placeholder="80"
              value={expectancy}
              onChange={onExpChange}
              maxLength={3}
              aria-invalid={!isValidExp}
            />
            <small className={styles.hint}>Allowed range: 60–110</small>
            {!isValidExp && (
              <p className={styles.error}>Enter a value between 60 and 110.</p>
            )}
          </div>

          <label className={styles.check}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
            />
            <span>I understand I won’t be able to change it</span>
          </label>

          <button
            className={styles.primary}
            type="submit"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
          >
            Confirm
          </button>

          {!isValidDOB && isComplete && (
            <p className={styles.error}>
              Invalid date. Users must be 80 years old or younger.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
