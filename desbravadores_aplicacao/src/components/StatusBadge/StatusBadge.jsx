import styles from "./StatusBadge.module.css";

const statusClass = {
  Ativo: styles.active,
  "Concluído antecipadamente": styles.completed,
  Encerrado: styles.closed
};

/**
 * @param {{ status: string, className?: string }} props
 */
function StatusBadge({ status, className = "" }) {
  return (
    <span className={`${styles.badge} ${statusClass[status] ?? styles.closed} ${className}`}>
      <span className={styles.dot} aria-hidden="true" />
      {status}
    </span>
  );
}

export default StatusBadge;
