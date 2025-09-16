import React from "react";

import styles from "./WeekCell.module.css";

type Props = {
  state: "past" | "current" | "future";
  title?: string;
};

const WeekCell = React.forwardRef<
  HTMLDivElement,
  Props & React.HTMLAttributes<HTMLDivElement>
>(({ state, title, tabIndex = -1, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={`${styles.cell} ${styles[state]}`}
      title={title}
      role="button"
      tabIndex={tabIndex}
      {...rest}
    />
  );
});

WeekCell.displayName = "WeekCell";
export default WeekCell;
