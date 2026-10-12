import StatusBadge from "../StatusBadge/StatusBadge";
import StatCard from "../StatCard/StatCard";
import styles from "./NotebookHeader.module.css";

/**
 * @param {{
 *   notebook: { name: string, age: number, category: string, startDate: string, endDate: string, status: string },
 *   linkedCount: number,
 *   requirementCount: number,
 *   onOpenRequirements?: () => void,
 *   onLinkPioneer?: () => void
 * }} props
 */
function NotebookHeader({
  notebook,
  linkedCount,
  requirementCount,
  onOpenRequirements,
  onLinkPioneer
}) {
  return (
    <header className={styles.header}>
        <div className={styles.topRow}>
          <div className={styles.identity}>
            <span className={styles.bookIcon} aria-hidden="true">
              <i className="bx bx-book-open" />
            </span>
            <div className={styles.titleBlock}>
              <div className={styles.eyebrowRow}>
                <span className={styles.eyebrow}>
                  CICLO ANUAL · {notebook.startDate} — {notebook.endDate}
                </span>
                <StatusBadge status={notebook.status} />
              </div>
              <h1>
                {notebook.name} · {notebook.age} anos · {notebook.category}
              </h1>
              <p>
                {requirementCount} requisitos no ciclo · cada um deve ser concluído individualmente.
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryButton} type="button" onClick={onOpenRequirements}>
              <i className="bx bx-file-blank" aria-hidden="true" />
              Requisitos
            </button>
            <button className={styles.primaryButton} type="button" onClick={onLinkPioneer}>
              <i className="bx bx-user-plus" aria-hidden="true" />
              Vincular Desbravador
            </button>
          </div>
        </div>

        <div className={styles.stats}>
          <StatCard
            icon="bx-group"
            label="Vinculados"
            value={`${linkedCount} desbravadores`}
          />
          <StatCard
            icon="bx-file-blank"
            label="Requisitos"
            value={`${requirementCount} por desbravador`}
          />
          <StatCard
            icon="bx-calendar"
            label="Período"
            value={`${notebook.startDate} → ${notebook.endDate}`}
          />
        </div>
    </header>
  );
}

export default NotebookHeader;
