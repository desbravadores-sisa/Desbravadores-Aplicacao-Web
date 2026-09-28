import { useState } from "react";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import TaskCard from "../components/TaskCard/TaskCard";
import styles from "./Tarefas.module.css";

const emptyTask = {
  type: "general",
  linkedNotebook: "",
  title: "",
  description: "",
  evidence: "",
  points: "",
  startDate: "",
  deadline: "",
  delivered: 0,
  total: 4
};

const initialTasks = [
  { id: 1, type: "general", title: "Organizar reunião de pais", description: "Preparar e conduzir reunião com os pais dos desbravadores", evidence: "Enviar lista de presença assinada e fotos do evento", points: 150, startDate: "2026-05-20", deadline: "2026-06-01", delivered: 0, total: 4 },
  { id: 2, type: "general", title: "Atualizar documentação da unidade", description: "Revisar e atualizar todos os documentos oficiais da unidade", evidence: "Upload dos documentos atualizados em PDF", points: 100, startDate: "2026-05-20", deadline: "2026-06-04", delivered: 0, total: 4 },
  { id: 3, type: "general", title: "Campori Regional - Preparação", description: "Preparar equipe para participação no Campori Regional", evidence: "Lista de equipamentos, cronograma e autorizações dos pais", points: 300, startDate: "2026-05-20", deadline: "2026-06-15", delivered: 1, total: 4 },
  { id: 4, type: "general", title: "Treinamento de primeiros socorros", description: "Conduzir treinamento básico de primeiros socorros com a unidade", evidence: "Fotos do treinamento e certificados de participação", points: 200, startDate: "2026-05-20", deadline: "2026-06-25", delivered: 1, total: 4 },
  { id: 5, type: "notebook", linkedNotebook: "Caderno Pioneiro", title: "Caderno Pioneiro - Bloco de Sobrevivência", description: "Acompanhar os desbravadores Pioneiros (13 anos) na conclusão dos requisitos de sobrevivência e acampamento do caderno.", evidence: "", points: 60, startDate: "2026-05-20", deadline: "2026-07-15", delivered: 0, total: 4 },
  { id: 6, type: "notebook", linkedNotebook: "Caderno Amigo", title: "Caderno Amigo - Natureza e Meio Ambiente", description: "Orientar os desbravadores de 10 anos nos requisitos de natureza, fauna e flora do caderno Amigo.", evidence: "", points: 45, startDate: "2026-05-20", deadline: "2026-07-07", delivered: 0, total: 4 }
];

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "";

function Tarefas() {
  const [tasks, setTasks] = useState(initialTasks);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(emptyTask);

  const generalTasks = tasks.filter((task) => task.type === "general");
  const notebookTasks = tasks.filter((task) => task.type === "notebook");

  function openNewTask() {
    setDraft({ ...emptyTask });
    setModal("form");
  }

  function openEditTask(task) {
    setDraft({ ...task });
    setModal("form");
  }

  function openDeleteTask(task) {
    setDraft(task);
    setModal("delete");
  }

  function handleChange(event) {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  }

  function handleTypeChange(type) {
    setDraft({ ...draft, type, linkedNotebook: type === "general" ? "" : draft.linkedNotebook });
  }

  function saveTask(event) {
    event.preventDefault();
    const task = { ...draft, points: Number(draft.points) || 0, deadline: formatDate(draft.deadline), startDate: formatDate(draft.startDate) };
    if (draft.id) {
      setTasks((current) => current.map((item) => item.id === draft.id ? task : item));
    } else {
      setTasks((current) => [...current, { ...task, id: Date.now() }]);
    }
    setModal(null);
  }

  function deleteTask() {
    setTasks((current) => current.filter((task) => task.id !== draft.id));
    setModal(null);
  }

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Gerenciar Tarefas"
        subtitle={<>10 tarefas · <b>{generalTasks.length} gerais</b> · <strong>{notebookTasks.length} cadernos</strong></>}
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Nova Tarefa"
        onButtonClick={openNewTask}
      />

      <div className={styles.taskColumns}>
        <section><div className={styles.columnHeader}><h2><i className="bx bx-notepad" /> Atividades Gerais</h2><span>{generalTasks.length + 4}</span></div><div className={styles.taskList}>{generalTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />)}</div></section>
        <section><div className={`${styles.columnHeader} ${styles.notebookHeader}`}><h2><i className="bx bx-book-open" /> Requisitos de Caderno</h2><span>{notebookTasks.length}</span></div><div className={styles.taskList}>{notebookTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />)}</div></section>
      </div>

      {modal === "form" && (
        <Modal
          className={styles.taskModal}
          title={draft.id ? "Editar Tarefa" : "Nova Tarefa"}
          labelledBy="task-modal-title"
          headerClassName={styles.modalHeader}
          bodyClassName={styles.modalBody}
          footerClassName={styles.modalFooter}
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={draft.type === "notebook" ? styles.saveNotebook : styles.saveButton} type="submit">Salvar {draft.id ? "Alterações" : "Tarefa"}</button></>}
          onClose={() => setModal(null)}
          onSubmit={saveTask}
        >
          <label>Tipo de atividade</label>
          <div className={styles.activityTypes}>
            <button type="button" className={draft.type === "general" ? styles.typeSelected : ""} onClick={() => handleTypeChange("general")}><i className="bx bx-notepad" /><span><strong>Geral</strong><small>Entra no Kanban, requer evidência</small></span></button>
            <button type="button" className={draft.type === "notebook" ? styles.typeNotebookSelected : ""} onClick={() => handleTypeChange("notebook")}><i className="bx bx-book-open" /><span><strong>Caderno</strong><small>Acompanhamento individual</small></span></button>
          </div>
          {draft.type === "notebook" && <><label htmlFor="linkedNotebook">Caderno vinculado <b>*</b></label><select id="linkedNotebook" name="linkedNotebook" value={draft.linkedNotebook} onChange={handleChange} required><option value="">Selecione o caderno</option><option>Amigo</option><option>Companheiro</option><option>Pesquisador</option><option>Pioneiro</option><option>Excursionista</option><option>Guia</option></select><div className={styles.formHint}><i className="bx bx-book-open" /> Somente desbravadores vinculados ao caderno selecionado poderão receber check-in.</div></>}
          <label htmlFor="title">Título</label><input id="title" name="title" value={draft.title} onChange={handleChange} required />
          <label htmlFor="description">Descrição</label><textarea id="description" name="description" value={draft.description} onChange={handleChange} required />
          <label htmlFor="evidence">{draft.type === "general" ? "Instruções de Evidência" : "Orientações ao conselheiro"}</label><textarea id="evidence" name="evidence" value={draft.evidence} onChange={handleChange} required />
          <div className={styles.formRow}><div><label htmlFor="points">Pontuação</label><input id="points" name="points" type="number" min="0" value={draft.points} onChange={handleChange} required /></div><div><label htmlFor="startDate">Data de Início</label><input id="startDate" name="startDate" type="date" value={draft.startDate} onChange={handleChange} required /></div><div><label htmlFor="deadline">Data Limite</label><input id="deadline" name="deadline" type="date" value={draft.deadline} onChange={handleChange} required /></div></div>
        </Modal>
      )}
      {modal === "delete" && (
        <Modal
          className={styles.deleteModal}
          title="Excluir Tarefa"
          labelledBy="delete-task-title"
          bodyClassName={styles.deleteBody}
          footerClassName={styles.deleteActions}
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={deleteTask}>Excluir</button></>}
          onClose={() => setModal(null)}
        >
          <p>Tem certeza que deseja excluir “{draft.title}”? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </main>
  );
}

export default Tarefas;
