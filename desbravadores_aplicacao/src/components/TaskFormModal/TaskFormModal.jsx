function TaskFormModal({ task, isNew, styles, onChange, onTypeChange, onSubmit, onClose }) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className={styles.taskModal} onSubmit={onSubmit}>
        <div className={styles.modalHeader}>
          <h2>{isNew ? "Nova Tarefa" : "Editar Tarefa"}</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <label>Tipo de atividade</label>
          <div className={styles.activityTypes}>
            <button type="button" className={task.type === "general" ? styles.typeSelected : ""} onClick={() => onTypeChange("general")}>
              <i className="bx bx-notepad" /><span><strong>Geral</strong><small>Entra no Kanban, requer evidência</small></span>
            </button>
            <button type="button" className={task.type === "notebook" ? styles.typeNotebookSelected : ""} onClick={() => onTypeChange("notebook")}>
              <i className="bx bx-book-open" /><span><strong>Caderno</strong><small>Acompanhamento individual</small></span>
            </button>
          </div>
          {task.type === "notebook" && <>
            <label htmlFor="linkedNotebook">Caderno vinculado <b>*</b></label>
            <select id="linkedNotebook" name="linkedNotebook" value={task.linkedNotebook} onChange={onChange} required>
              <option value="">Selecione o caderno</option>
              <option>Amigo</option>
              <option>Companheiro</option>
              <option>Pesquisador</option>
              <option>Pioneiro</option>
              <option>Excursionista</option>
              <option>Guia</option>
            </select>
            <div className={styles.formHint}><i className="bx bx-book-open" /> Somente desbravadores vinculados ao caderno selecionado poderão receber check-in.</div>
          </>}
          <label htmlFor="title">Título</label>
          <input id="title" name="title" value={task.title} onChange={onChange} required />
          <label htmlFor="description">Descrição</label>
          <textarea id="description" name="description" value={task.description} onChange={onChange} required />
          <label htmlFor="evidence">{task.type === "general" ? "Instruções de Evidência" : "Orientações ao conselheiro"}</label>
          <textarea id="evidence" name="evidence" value={task.evidence} onChange={onChange} required />
          <div className={styles.formRow}>
            <div><label htmlFor="points">Pontuação</label><input id="points" name="points" type="number" min="0" value={task.points} onChange={onChange} required /></div>
            <div><label htmlFor="startDate">Data de Início</label><input id="startDate" name="startDate" type="date" value={task.startDate} onChange={onChange} required /></div>
            <div><label htmlFor="deadline">Data Limite</label><input id="deadline" name="deadline" type="date" value={task.deadline} onChange={onChange} required /></div>
          </div>
        </div>
        <div className={styles.modalFooter}><button type="button" onClick={onClose}>Cancelar</button><button className={task.type === "notebook" ? styles.saveNotebook : styles.saveButton} type="submit">Salvar {isNew ? "Tarefa" : "Alterações"}</button></div>
      </form>
    </div>
  );
}

export default TaskFormModal;
