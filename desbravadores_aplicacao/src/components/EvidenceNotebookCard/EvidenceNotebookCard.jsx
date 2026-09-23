import styles from "./EvidenceNotebookCard.module.css";

function EvidenceNotebookCard({ notebook, onRecognize, onDismiss }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.badgeRow}>
            <span className={styles.badge}><i className="bx bx-book-open" /> CADERNO</span>
            <span className={styles.pointsBadge}>{notebook.points} pts disponíveis</span>
          </div>
          <h2 className={styles.cardTitle}>{notebook.title}</h2>
          <div className={styles.metaRow}>
            <span><i className="bx bx-group" /> {notebook.unit}</span>
            <span><i className="bx bx-user" /> {notebook.leader}</span>
          </div>
        </div>
        <div className={styles.actionColumn}>
          <button className={styles.primaryAction} type="button" onClick={() => onRecognize(notebook)}>
            <i className="bx bx-star" /> Reconhecer pontos
          </button>
          <button className={styles.secondaryAction} type="button" onClick={() => onDismiss(notebook.id)}>
            Não reconhecer
          </button>
        </div>
      </div>
      <p className={styles.description}>{notebook.description}</p>
      <small className={styles.completedAt}>Concluído em {notebook.completedAt}</small>
    </article>
  );
}

export default EvidenceNotebookCard;
