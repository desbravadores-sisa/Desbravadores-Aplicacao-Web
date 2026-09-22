function DeleteTaskModal({ task, styles, onConfirm, onClose }) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={styles.deleteModal} role="dialog" aria-modal="true" aria-labelledby="delete-task-title">
        <h2 id="delete-task-title">Excluir Tarefa</h2>
        <p>Tem certeza que deseja excluir “{task.title}”? Esta ação não pode ser desfeita.</p>
        <div className={styles.deleteActions}><button type="button" onClick={onClose}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={onConfirm}>Excluir</button></div>
      </div>
    </div>
  );
}

export default DeleteTaskModal;
