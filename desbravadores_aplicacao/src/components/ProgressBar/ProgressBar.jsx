import styles from "./ProgressBar.module.css";

/**
 * @param {{ value: number, label?: string, complete?: boolean }} props
 */
function ProgressBar({ value, label = "Progresso", complete = false }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <progress
      className={`${styles.track} ${progress >= 25 ? styles.highlight : ""} ${complete ? styles.complete : ""}`}
      role="progressbar"
      aria-label={label}
      max="100"
      value={progress}
    />
  );
}

export default ProgressBar;
