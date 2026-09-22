function EvidenceNotebookCard({ notebook, styles, onRecognize, onDismiss }) {
  return (
    <article className={`${styles.evidenceCard} ${styles.notebookCard}`}>
      <div className={styles.evidenceTop}>
        <div className={styles.evidenceContent}>
          <div className={styles.labels}>
            <span className={styles.notebookLabel}><i className="bx bx-book-open" /> CADERNO</span>
            <span className={styles.notebookPoints}>{notebook.points} pts disponíveis</span>
          </div>
          <h2>{notebook.title}</h2>
          <div className={styles.metadata}>
            <span><i className="bx bx-group" /> {notebook.unit}</span>
            <span><i className="bx bx-user" /> {notebook.leader}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.recognizeButton} type="button" onClick={() => onRecognize(notebook)}>
            <i className="bx bx-star" /> Reconhecer pontos
          </button>
          <button className={styles.dismissButton} type="button" onClick={() => onDismiss(notebook.id)}>
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
