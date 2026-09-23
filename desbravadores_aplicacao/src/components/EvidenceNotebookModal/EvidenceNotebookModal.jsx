import styles from "./EvidenceNotebookModal.module.css";

function EvidenceNotebookModal({ notebook, points, onPointsChange, onSubmit, onClose }) {
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.header}>
          <div>
            <small>RECONHECIMENTO DE CADERNO</small>
            <h2>{notebook.title}</h2>
            <span className={styles.subtitle}>{notebook.unit} · {notebook.leader}</span>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className={styles.body}>
          <div className={styles.infoBox}>
            <i className="bx bx-book-open" />
            <span>Reconhecer este caderno adiciona os pontos à pontuação da unidade. Esta ação é opcional, sem penalidade se não reconhecido.</span>
          </div>
          <label className={styles.label} htmlFor="notebook-points">Pontos a reconhecer</label>
          <div className={styles.pointsInput}>
            <input id="notebook-points" type="number" min="0" value={points} onChange={(event) => onPointsChange(event.target.value)} />
            <span>pts</span>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.secondaryAction} type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primaryAction} type="submit"><i className="bx bx-star" /> Reconhecer {points || 0} pts</button>
        </div>
      </form>
    </div>
  );
}

export default EvidenceNotebookModal;
