import styles from "./JumpToCurrent.module.css";

export default function JumpToCurrent() {
  function jump() {
    const el = document.querySelector<HTMLElement>('[data-current="true"]');
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }

  return (
    <button
      className={styles.btn}
      onClick={jump}
      aria-label="Jump to current week"
      title="Jump to current week"
    >
      <TargetIcon />
    </button>
  );
}

function TargetIcon() {
  // Crosshair / target icon. Uses currentColor for stroke/fill.
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
