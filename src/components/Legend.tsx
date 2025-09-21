import { useI18n } from "../i18n";
import styles from "./Legend.module.css";

export default function Legend({ expectancy }: { expectancy: number }) {
  const { t } = useI18n();
  return (
    <div className={styles.wrap}>
      <div className={styles.legend} aria-hidden>
        <span className={`${styles.dot} ${styles.past}`} />
        <span>{t("past")}</span>
        <span className={`${styles.dot} ${styles.current}`} />
        <span>{t("current")}</span>
        <span className={`${styles.dot} ${styles.future}`} />
        <span>{t("remaining")}</span>
      </div>

      <div className={styles.meta}>
        {t("lifeExpectancy")}: <strong>{expectancy}</strong> {t("years")}
      </div>
      <div className={styles.meta}>{t("basedOn52")}</div>
    </div>
  );
}
