import styles from "./StatCard.module.css";

/**
 * @param {{ icon: string, label: string, value: string }} props
 */
function StatCard({ icon, label, value }) {
  return (
    <article className={styles.card}>
      <span className={styles.label}>
        <i className={`bx ${icon}`} aria-hidden="true" />
        {label}
      </span>
      <strong className={styles.value}>{value}</strong>
    </article>
  );
}

export default StatCard;
