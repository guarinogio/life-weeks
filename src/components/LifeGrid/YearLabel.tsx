export default function YearLabel({ value }: { value: number }) {
  // Marcamos cada 5 años; otros quedan vacíos para limpieza visual
  const label = value % 5 === 0 ? String(value) : "";
  return (
    <div
      style={{
        width: "var(--label-w)",
        color: "var(--c-text-muted)",
        fontSize: "12px",
      }}
      aria-hidden
    >
      {label}
    </div>
  );
}
