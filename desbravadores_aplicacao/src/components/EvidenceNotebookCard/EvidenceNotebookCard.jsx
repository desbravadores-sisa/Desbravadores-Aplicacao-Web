import styles from "./EvidenceNotebookCard.module.css";

function EvidenceNotebookCard({ notebook, onRecognize, onDismiss }) {
  const title = notebook.title || notebook.titulo || notebook.descricao || `Caderno #${notebook.id}`;
  const points = notebook.points ?? notebook.pontuacaoPrevista ?? notebook.pontuacao ?? 0;
  const unit = notebook.unit || notebook.nomeUnidade || "Unidade não informada";
  const leader = notebook.leader || notebook.nomeConselheiro || "Conselheiro não informado";
  const description = notebook.description || notebook.descricao;
  const feedback = notebook.comentarioFeedback;
  const completedAt = notebook.completedAt || notebook.dataEnvio;
  const formattedDate = completedAt && !Number.isNaN(new Date(completedAt).getTime())
    ? new Date(completedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : completedAt || "Data não informada";

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.badgeRow}>
            <span className={styles.badge}><i className="bx bx-book-open" /> CADERNO</span>
            <span className={styles.pointsBadge}>{points} pts disponíveis</span>
          </div>
          <h2 className={styles.cardTitle}>{title}</h2>
          <div className={styles.metaRow}>
            <span><i className="bx bx-group" /> {unit}</span>
            <span><i className="bx bx-user" /> {leader}</span>
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
      {description && <p className={styles.description}>{description}</p>}
      {feedback && feedback !== description && <p className={styles.description}>{feedback}</p>}
      <small className={styles.completedAt}>Enviado em {formattedDate}</small>
    </article>
  );
}

export default EvidenceNotebookCard;
