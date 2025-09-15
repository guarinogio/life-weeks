export default function WeekHeader() {
  const nums = Array.from({ length: 52 }, (_, i) => i + 1);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(52, 1fr)",
        gap: "var(--cell-gap)",
        color: "var(--c-text-muted)",
        fontSize: "11px",
        fontVariantNumeric: "tabular-nums",
        marginBottom: "6px",
      }}
      aria-hidden
    >
      {nums.map((n) => (
        <span key={n} style={{ textAlign: "center" }}>
          {n % 2 === 1 ? n : ""}
        </span>
      ))}
    </div>
  );
}
