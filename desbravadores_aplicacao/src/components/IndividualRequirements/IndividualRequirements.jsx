import ProgressBar from "../ProgressBar/ProgressBar";
import styles from "./IndividualRequirements.module.css";

/**
 * @param {{
 *   pioneer: { id: number, name: string, completedRequirementIds?: string[], inProgressRequirementIds?: string[], requirementObservations?: Record<string, string> },
 *   notebookName: string,
 *   requirements: Array<{ id: string, title: string, description: string }>,
 *   onClose: () => void
 * }} props
 */
function IndividualRequirements({ pioneer, notebookName, requirements, onClose }) {
  const completedIds = new Set(pioneer.completedRequirementIds || []);
  const inProgressIds = new Set(pioneer.inProgressRequirementIds || []);
  const completedCount = requirements.filter((requirement) => completedIds.has(requirement.id)).length;
  const progress = requirements.length
    ? Math.round((completedCount / requirements.length) * 100)
    : 0;
  const isComplete = requirements.length > 0 && completedCount === requirements.length;

  function getRequirementStatus(requirement) {
    if (completedIds.has(requirement.id)) {
      return "Concluído";
    }
    if (inProgressIds.has(requirement.id)) {
      return "Em andamento";
    }
    return "Não iniciado";
  }

  return (
    <section className={styles.panel} aria-labelledby="individual-requirements-title">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.avatar} aria-hidden="true">
            {pioneer.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
          </span>
          <div>
            <span className={styles.eyebrow}>REQUISITOS INDIVIDUAIS</span>
            <h1 id="individual-requirements-title">{pioneer.name} – {notebookName}</h1>
          </div>
        </div>
        <button className={styles.closeButton} type="button" onClick={onClose}>
          <i className="bx bx-x" aria-hidden="true" />
          Fechar
        </button>
      </header>

      <div className={styles.content}>
        <div className={`${styles.progressSummary} ${isComplete ? styles.completeSummary : ""}`}>
          <div>
            <strong>{completedCount} de {requirements.length} requisitos concluídos</strong>
            <p>Somente o conselheiro pode atualizar o progresso individual.</p>
          </div>
          <div className={styles.progressValue}>
            <ProgressBar
              value={progress}
              label={`Progresso de ${pioneer.name}`}
              complete={isComplete}
            />
            <strong>{progress}%</strong>
          </div>
        </div>

        {isComplete && (
          <p className={styles.completionNotice} role="status">
            <i className="bx bx-check-circle" aria-hidden="true" />
            Todos os requisitos foram concluídos antes do encerramento do ciclo.
          </p>
        )}

        <div className={styles.requirementList}>
          {requirements.map((requirement, index) => {
            const status = getRequirementStatus(requirement);
            const observation = pioneer.requirementObservations?.[requirement.id];

            return (
              <article className={styles.requirement} key={requirement.id}>
                <span className={styles.number} aria-hidden="true">{index + 1}</span>
                <div className={styles.requirementContent}>
                  <h2>{requirement.title}</h2>
                  <p>{requirement.description}</p>
                  {status === "Concluído" && observation && (
                    <p className={styles.observation}>
                      <i className="bx bx-link" aria-hidden="true" />
                      Observação: {observation}
                    </p>
                  )}
                </div>
                <span className={`${styles.status} ${
                  status === "Concluído"
                    ? styles.completed
                    : status === "Em andamento"
                      ? styles.inProgress
                      : styles.notStarted
                }`}>
                  {status}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default IndividualRequirements;
