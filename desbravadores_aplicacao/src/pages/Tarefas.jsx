import { useEffect, useState } from "react";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import TaskCard from "../components/TaskCard/TaskCard";
import api from "../service/api";
import styles from "./Tarefas.module.css";

const emptyTask = {
  titulo: "",
  descricao: "",
  tipoTarefa: "CLUBE",
  pontuacao: "",
  prazoPadrao: "",
  fkCaderno: "",
};

const formatDate = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "");

function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(emptyTask);

  useEffect(() => {
    carregarTarefas();
  }, []);

  async function carregarTarefas() {
    try {
      setCarregando(true);
      const { data, status } = await api.get("/tarefas");
      if (status === 204 || !data) {
        setTasks([]);
      } else {
        setTasks(data);
      }
      setErro(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setErro("Acesso restrito.");
      } else {
        setErro("Não foi possível carregar as tarefas. Verifique se a API está no ar.");
      }
    } finally {
      setCarregando(false);
    }
  }

  const generalTasks = tasks.filter((t) => !t.fkCaderno || t.tipoTarefa === "CLUBE");
  const notebookTasks = tasks.filter((t) => t.fkCaderno || t.tipoTarefa === "CADERNO");

  function openNewTask() {
    setDraft({ ...emptyTask });
    setModal("form");
  }

  function openEditTask(task) {
    setDraft({
      id: task.id,
      titulo: task.titulo || "",
      descricao: task.descricao || "",
      tipoTarefa: task.tipoTarefa || "CLUBE",
      pontuacao: task.pontuacao || "",
      prazoPadrao: task.prazoPadrao || "",
      fkCaderno: task.fkCaderno || "",
    });
    setModal("form");
  }

  function openDeleteTask(task) {
    setDraft(task);
    setModal("delete");
  }

  function handleChange(event) {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  }

  async function saveTask(event) {
    event.preventDefault();

    const payload = {
      titulo: draft.titulo,
      descricao: draft.descricao,
      tipoTarefa: draft.fkCaderno ? "CADERNO" : "CLUBE",
      pontuacao: Number(draft.pontuacao) || 0,
      prazoPadrao: draft.prazoPadrao || null,
      fkCaderno: draft.fkCaderno || null,
    };

    try {
      if (draft.id) {
        await api.put(`/tarefas/${draft.id}`, payload);
      } else {
        await api.post("/tarefas", payload);
      }
      setModal(null);
      await carregarTarefas();
    } catch (err) {
      setErro("Não foi possível salvar a tarefa.");
    }
  }

  async function deleteTask() {
    try {
      await api.delete(`/tarefas/${draft.id}`);
      setModal(null);
      await carregarTarefas();
    } catch (err) {
      setErro("Não foi possível excluir a tarefa.");
    }
  }

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Gerenciar Tarefas"
        subtitle={<>{tasks.length} tarefas · <b>{generalTasks.length} gerais</b> · <strong>{notebookTasks.length} cadernos</strong></>}
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Nova Tarefa"
        onButtonClick={openNewTask}
      />

      {carregando && <p>Carregando tarefas...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        <div className={styles.taskColumns}>
          <section>
            <div className={styles.columnHeader}>
              <h2><i className="bx bx-notepad" /> Atividades Gerais</h2>
              <span>{generalTasks.length}</span>
            </div>
            <div className={styles.taskList}>
              {generalTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />
              ))}
            </div>
          </section>
          <section>
            <div className={`${styles.columnHeader} ${styles.notebookHeader}`}>
              <h2><i className="bx bx-book-open" /> Requisitos de Caderno</h2>
              <span>{notebookTasks.length}</span>
            </div>
            <div className={styles.taskList}>
              {notebookTasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />
              ))}
            </div>
          </section>
        </div>
      )}

      {modal === "form" && (
        <Modal
          className={styles.taskModal}
          title={draft.id ? "Editar Tarefa" : "Nova Tarefa"}
          labelledBy="task-modal-title"
          headerClassName={styles.modalHeader}
          bodyClassName={styles.modalBody}
          footerClassName={styles.modalFooter}
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={draft.fkCaderno ? styles.saveNotebook : styles.saveButton} type="submit">Salvar {draft.id ? "Alterações" : "Tarefa"}</button></>}
          onClose={() => setModal(null)}
          onSubmit={saveTask}
        >
          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" value={draft.titulo} onChange={handleChange} required />

          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" value={draft.descricao} onChange={handleChange} required />

          <label htmlFor="pontuacao">Pontuação</label>
          <input id="pontuacao" name="pontuacao" type="number" min="0" value={draft.pontuacao} onChange={handleChange} required />

          <label htmlFor="prazoPadrao">Prazo Padrão</label>
          <input id="prazoPadrao" name="prazoPadrao" type="date" value={draft.prazoPadrao} onChange={handleChange} />

          <label htmlFor="fkCaderno">ID do Caderno (deixe vazio para tarefa geral)</label>
          <input id="fkCaderno" name="fkCaderno" type="number" min="0" value={draft.fkCaderno} onChange={handleChange} placeholder="Ex: 1, 2, 3..." />
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
          <p>Tem certeza que deseja excluir "{draft.titulo}"? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </main>
  );
}

export default Tarefas;
