import styles from "./LifeGrid.module.css";

/**
 * Week header: 52 columnas.
 * - En desktop sólo se muestran los múltiplos de 5 (los demás quedan ocultos con visibility:hidden para mantener el ancho).
 * - En mobile mantenemos el mismo layout y sticky definido en el CSS del grid.
 */
export default function WeekHeader() {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  return (
    <div className={styles.weekHeader} aria-hidden="true">
      {weeks.map((n) => {
        const major = n % 5 === 0; // visibles: 5, 10, 15, ...
        return (
          <span
            key={n}
            className={major ? styles.weekMajor : styles.weekMinor}
          >
            {n}
          </span>
        );
      })}
    </div>
  );
}
