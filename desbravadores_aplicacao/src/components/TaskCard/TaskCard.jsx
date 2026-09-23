import styles from "./TaskCard.module.css";

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <article className={`${styles.taskCard} ${task.type === "notebook" ? styles.notebookTask : ""}`}>
      <div className={styles.taskHeading}>
        <div>
          <div className={styles.taskTitleLine}>
            <h3>{task.title}</h3>
            <span className={styles.deliveryCount}>{task.delivered}/{task.total} unidades entregaram</span>
          </div>
          <p className={styles.taskDescription}>{task.description}</p>
        </div>
        <div className={styles.cardActions}>
          <button type="button" aria-label={`Editar ${task.title}`} onClick={() => onEdit(task)}><i className="bx bx-edit-alt" /></button>
          <button type="button" aria-label={`Excluir ${task.title}`} onClick={() => onDelete(task)}><i className="bx bx-trash" /></button>
        </div>
      </div>
      {task.evidence && (
        <div className={styles.evidenceHint}>
          <strong><i className="bx bx-info-circle" /> Evidência</strong>
          <span>{task.evidence}</span>
        </div>
      )}
      <div className={styles.taskFooter}>
        <span className={styles.taskPoints}><i className="bx bx-award" /> {task.points} pts</span>
        <span><i className="bx bx-calendar" /> Prazo: {task.deadline}</span>
      </div>
    </article>
  );
}

export default TaskCard;
