import styles from "./JumpToCurrent.module.css";

export default function JumpToCurrent() {
  const onClick = () => {
    const current =
      (document.getElementById("current-week-dot") as
        | (HTMLElement & { scrollIntoView: (opts?: any) => void })
        | (SVGElement & { scrollIntoView: (opts?: any) => void })
        | null);

    if (current?.scrollIntoView) {
      current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      (current as any).focus?.({ preventScroll: true });
      return;
    }

    const svg = document.getElementById("life-grid-svg");
    svg?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  };

  return (
    <button
      className={styles.fab}
      type="button"
      aria-label="Jump to current week"
      title="Jump to current week"
      onClick={onClick}
    >
      <TargetIcon />
    </button>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 2h2v3.06a7.002 7.002 0 0 1 5.94 5.94H22v2h-3.06a7.002 7.002 0 0 1-5.94 5.94V22h-2v-3.06A7.002 7.002 0 0 1 5.06 13H2v-2h3.06A7.002 7.002 0 0 1 11 5.06V2Zm1 5a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7Zm0 3a2 2 0 1 1-.001 4.001A2 2 0 0 1 12 10Z"
      />
    </svg>
  );
}
