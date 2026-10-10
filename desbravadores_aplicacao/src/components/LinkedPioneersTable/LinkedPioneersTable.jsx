import ProgressBar from "../ProgressBar/ProgressBar";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./LinkedPioneersTable.module.css";

/**
 * @param {{
 *   pioneers: Array<{ id: string | number, name: string, unit: string, progress: number, completedRequirements: number, totalRequirements: number, status: string, linkedAt: string }>,
 *   onView?: (pioneer: object) => void,
 *   onUnlink?: (pioneer: object) => void
 * }} props
 */
function LinkedPioneersTable({ pioneers, onView, onUnlink }) {
  function getInitials(name) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>Desbravadores vinculados</h2>
          <p>Abra um desbravador para acompanhar cada requisito individualmente.</p>
        </div>
        <span className={styles.count}>{pioneers.length} no ciclo</span>
      </div>

      {pioneers.length === 0 ? (
        <p className={styles.empty}>Nenhum desbravador vinculado a este ciclo.</p>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Desbravador</th>
                <th scope="col">Unidade</th>
                <th scope="col">Progresso</th>
                <th scope="col">Requisitos</th>
                <th scope="col">Situação</th>
                <th scope="col">Vinculado em</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pioneers.map((pioneer) => (
                <tr key={pioneer.id}>
                  <td data-label="Desbravador">
                    <div className={styles.pioneer}>
                      <span className={styles.avatar} aria-hidden="true">
                        {getInitials(pioneer.name)}
                      </span>
                      <strong>{pioneer.name}</strong>
                    </div>
                  </td>
                  <td data-label="Unidade">{pioneer.unit}</td>
                  <td data-label="Progresso">
                    <div className={styles.progress}>
                      <ProgressBar
                        value={pioneer.progress}
                        label={`Progresso de ${pioneer.name}`}
                        complete={pioneer.status === "Concluído antecipadamente"}
                      />
                      <strong>{pioneer.progress}%</strong>
                    </div>
                  </td>
                  <td data-label="Requisitos">{pioneer.completedRequirements}/{pioneer.totalRequirements}</td>
                  <td data-label="Situação">
                    <StatusBadge className={styles.tableStatus} status={pioneer.status} />
                  </td>
                  <td data-label="Vinculado em">{pioneer.linkedAt}</td>
                  <td data-label="Ações">
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        type="button"
                        aria-label={`Ver requisitos de ${pioneer.name}`}
                        onClick={() => onView?.(pioneer)}
                      >
                        <i className="bx bx-show" aria-hidden="true" />
                        Ver
                      </button>
                      <button
                        className={styles.unlinkButton}
                        type="button"
                        aria-label={`Desvincular ${pioneer.name}`}
                        onClick={() => onUnlink?.(pioneer)}
                      >
                        <i className="bx bx-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LinkedPioneersTable;
