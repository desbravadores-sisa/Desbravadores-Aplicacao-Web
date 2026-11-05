import styles from "./TaskCard.module.css";

const formatDate = (value) => (value ? new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : null);

// Card da tela "Gerenciar Tarefas" (protótipo: TasksManagement). Recebe a tarefa como vem de GET /tarefas.
function TaskCard({ task, onEdit, onDelete }) {
  const isNotebook = task.tipoTarefa === "CADERNO";
  const prazo = formatDate(task.prazoPadrao);
  const total = task.unidadesTotal ?? 0;

  return (
    <article className={`${styles.taskCard} ${isNotebook ? styles.notebookTask : ""}`}>
      <div className={styles.taskHeading}>
        <div className={styles.taskMain}>
          <div className={styles.taskTitleLine}>
            <h3>{task.titulo}</h3>
            <span className={styles.deliveryCount} title="Unidades que enviaram evidência ou concluíram, no ciclo atual">
              {total > 0 ? `${task.unidadesEntregaram ?? 0}/${total} unidades entregaram` : "Não distribuída no ciclo atual"}
            </span>
            {isNotebook && task.nomeCaderno && <span className={styles.notebookBadge}>{task.nomeCaderno}</span>}
          </div>
          {task.descricao && <p className={styles.taskDescription}>{task.descricao}</p>}
        </div>
        <div className={styles.cardActions}>
          <button type="button" aria-label={`Editar ${task.titulo}`} title="Editar" onClick={() => onEdit(task)}><i className="bx bx-edit-alt" /></button>
          <button type="button" aria-label={`Excluir ${task.titulo}`} title="Excluir" onClick={() => onDelete(task)}><i className="bx bx-trash" /></button>
        </div>
      </div>
      <div className={styles.taskFooter}>
        <span className={styles.taskPoints}><i className="bx bx-award" /> {task.pontuacao ?? 0} pts</span>
        <span><i className="bx bx-calendar" /> {prazo ? `Prazo: ${prazo}` : "Sem prazo"}</span>
      </div>
    </article>
  );
}

export default TaskCard;
