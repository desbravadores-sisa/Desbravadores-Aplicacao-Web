function EvidenceNotebookModal({ notebook, points, styles, onPointsChange, onSubmit, onClose }) {
  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={`${styles.modal} ${styles.notebookModal}`} onSubmit={onSubmit}>
        <div className={styles.modalHeader}>
          <div>
            <small className={styles.notebookModalEyebrow}>RECONHECIMENTO DE CADERNO</small>
            <h2>{notebook.title}</h2>
            <span className={styles.modalSubtitle}>{notebook.unit} · {notebook.leader}</span>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.notebookInfoBox}>
            <i className="bx bx-book-open" />
            <span>Reconhecer este caderno adiciona os pontos à pontuação da unidade. Esta ação é opcional, sem penalidade se não reconhecido.</span>
          </div>
          <label htmlFor="notebook-points">Pontos a reconhecer</label>
          <p className={styles.helper}>Valor base: {notebook.points} pts. Ajuste se necessário.</p>
          <div className={styles.notebookPointsInput}>
            <input id="notebook-points" type="number" min="0" value={points} onChange={(event) => onPointsChange(event.target.value)} />
            <span>pts</span>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.recognizeButton} type="submit"><i className="bx bx-star" /> Reconhecer {points || 0} pts</button>
        </div>
      </form>
    </div>
  );
}

export default EvidenceNotebookModal;
