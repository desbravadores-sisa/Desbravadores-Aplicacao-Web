import { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import TaskCard from "../components/TaskCard/TaskCard";
import styles from "./Tarefas.module.css";
import api from "../service/api";
import { errorMessage, notifyRefresh } from "../service/feedback";

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

const fromApi = (task) => ({
  id: task.id, type: task.tipoTarefa === "CADERNO" ? "notebook" : "general",
  linkedNotebook: task.idCaderno || "", title: task.nome, description: task.descricao || "",
  evidence: task.instrucoesEvidencia || "", points: task.pontuacao || 0,
  startDate: task.dataInicio || "", deadline: task.prazoEntrega?.slice(0, 10) || "",
  delivered: task.entregas || 0, total: task.totalUnidades || 0, unidadeIds: task.unidadeIds || []
});

function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(emptyTask);

  const [options, setOptions] = useState({ unidades: [], ciclos: [], cadernos: [] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  async function reload() {
    const { data } = await api.get("/tarefas");
    setTasks((data || []).map(fromApi));
  }
  useEffect(() => {
    Promise.all([Promise.resolve().then(reload), api.get("/tarefas/opcoes").then(({ data }) => setOptions(data))])
      .catch(err => setError(errorMessage(err)));
  }, []);
  const generalTasks = tasks.filter((task) => task.type === "general");
  const notebookTasks = tasks.filter((task) => task.type === "notebook");

  function openNewTask() {
    setDraft({ ...emptyTask, unidadeIds: [], todasUnidades: true, idCiclo: options.ciclos[0]?.id || "", requestId: crypto.randomUUID() });
    setModal("form");
  }

  function openEditTask(task) {
    setDraft({ ...task, todasUnidades: false });
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

  async function saveTask(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      const payload = {
        nome: draft.title, descricao: draft.description, instrucoesEvidencia: draft.evidence,
        pontuacao: Number(draft.points), prazoEntrega: draft.deadline ? draft.deadline + "T23:59:59" : null,
        dataInicio: draft.startDate || null, tipoTarefa: draft.type === "notebook" ? "CADERNO" : "GERAL",
        idCaderno: draft.type === "notebook" ? Number(draft.linkedNotebook) : null,
        idCiclo: draft.idCiclo ? Number(draft.idCiclo) : null,
        todasUnidades: draft.todasUnidades, unidadeIds: draft.unidadeIds, requestId: draft.requestId
      };
      if (draft.id) await api.put(`/tarefas/${draft.id}`, payload);
      else await api.post("/tarefas", payload);
      await reload(); notifyRefresh(); setModal(null);
    } catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }

  async function deleteTask() {
    if (saving.current) return;
    saving.current = true; setBusy(true);
    try { await api.delete(`/tarefas/${draft.id}`); await reload(); setModal(null); }
    catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }

  return (
    <main className={styles.page}>
      {!modal && error && <p role="alert">{error}</p>}
      <SectionHeader
        title="Gerenciar Tarefas"
        subtitle={<>{tasks.length} tarefas · <b>{generalTasks.length} gerais</b> · <strong>{notebookTasks.length} cadernos</strong></>}
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Nova Tarefa"
        onButtonClick={openNewTask}
      />

      <div className={styles.taskColumns}>
        <section><div className={styles.columnHeader}><h2><i className="bx bx-notepad" /> Atividades Gerais</h2><span>{generalTasks.length}</span></div><div className={styles.taskList}>{generalTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />)}</div></section>
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
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={draft.type === "notebook" ? styles.saveNotebook : styles.saveButton} disabled={busy} type="submit">Salvar {draft.id ? "Alterações" : "Tarefa"}</button></>}
          onClose={() => setModal(null)}
          onSubmit={saveTask}
        >
          {error && <p role="alert">{error}</p>}
          <label>Tipo de atividade</label>
          <div className={styles.activityTypes}>
            <button disabled={Boolean(draft.id)} type="button" className={draft.type === "general" ? styles.typeSelected : ""} onClick={() => handleTypeChange("general")}><i className="bx bx-notepad" /><span><strong>Geral</strong><small>Entra no Kanban, requer evidência</small></span></button>
            <button disabled={Boolean(draft.id)} type="button" className={draft.type === "notebook" ? styles.typeNotebookSelected : ""} onClick={() => handleTypeChange("notebook")}><i className="bx bx-book-open" /><span><strong>Caderno</strong><small>Acompanhamento individual</small></span></button>
          </div>
          {draft.type === "notebook" && <><label htmlFor="linkedNotebook">Caderno vinculado <b>*</b></label><select id="linkedNotebook" name="linkedNotebook" disabled={Boolean(draft.id)} value={draft.linkedNotebook} onChange={handleChange} required><option value="">Selecione o caderno</option>{options.cadernos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select><div className={styles.formHint}><i className="bx bx-book-open" /> Somente desbravadores vinculados ao caderno selecionado poderão receber check-in.</div></>}
          {!draft.id && <><label htmlFor="cycle">Ciclo ativo</label><select id="cycle" value={draft.idCiclo || ""} onChange={e => setDraft({ ...draft, idCiclo: e.target.value })} required><option value="">Selecione um ciclo</option>{options.ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></>}
          <label>Unidades destinatárias</label>
          <label><input type="checkbox" checked={Boolean(draft.todasUnidades)} onChange={e => setDraft({ ...draft, todasUnidades: e.target.checked })} /> Todas as unidades</label>
          {!draft.todasUnidades && options.unidades.map(u => <label key={u.id}><input type="checkbox" checked={draft.unidadeIds?.includes(u.id) || false} onChange={e => setDraft({ ...draft, unidadeIds: e.target.checked ? [...(draft.unidadeIds || []), u.id] : draft.unidadeIds.filter(id => id !== u.id) })} /> {u.nome}</label>)}
          {draft.id && <p>Unidades já atribuídas são mantidas. Selecione unidades adicionais para expandir a atribuição.</p>}
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
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={styles.deleteConfirm} disabled={busy} type="button" onClick={deleteTask}>Excluir</button></>}
          onClose={() => setModal(null)}
        >
          {error && <p role="alert">{error}</p>}
          <p>Tem certeza que deseja excluir “{draft.title}”? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </main>
  );
}

export default Tarefas;
