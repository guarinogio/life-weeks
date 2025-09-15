import clsx from "clsx";
import styles from "./WeekCell.module.css";

export default function WeekCell({
  state,
  title,
}: {
  state: "past" | "current" | "future";
  title?: string;
}) {
  return (
    <span
      className={clsx(styles.cell, styles[state])}
      title={title}
      aria-label={title}
      tabIndex={0}
    />
  );
}
