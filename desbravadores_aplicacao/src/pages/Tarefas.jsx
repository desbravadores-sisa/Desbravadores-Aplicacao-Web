import { useCallback, useEffect, useState } from "react";
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

const lista = (resposta) => (resposta.status === 204 || !Array.isArray(resposta.data) ? [] : resposta.data);
const mensagem = (err, padrao) => err.response?.data?.message || padrao;

function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [cadernos, setCadernos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [modal, setModal] = useState(null);
  const [draft, setDraft] = useState(emptyTask);
  const [filtroCaderno, setFiltroCaderno] = useState("");

  const carregarTarefas = useCallback(async () => {
    try {
      const resposta = await api.get("/tarefas");
      setTasks(lista(resposta));
      setErroCarga(null);
    } catch (err) {
      setErroCarga(err.response?.status === 403
        ? "Acesso restrito à Diretoria."
        : "Não foi possível carregar as tarefas. Verifique se a API está no ar.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
    api.get("/cadernos")
      .then((resposta) => setCadernos(lista(resposta).sort((a, b) => (a.idadeAlvo ?? 0) - (b.idadeAlvo ?? 0))))
      .catch(() => setCadernos([]));
  }, [carregarTarefas]);

  const generalTasks = tasks.filter((t) => t.tipoTarefa !== "CADERNO");
  const notebookTasks = tasks.filter((t) => t.tipoTarefa === "CADERNO");
  const notebookTasksVisiveis = filtroCaderno
    ? notebookTasks.filter((t) => String(t.fkCaderno) === filtroCaderno)
    : notebookTasks;
  const isNotebookDraft = draft.tipoTarefa === "CADERNO";

  function openNewTask() {
    setDraft({ ...emptyTask });
    setErroForm(null);
    setModal("form");
  }

  function openEditTask(task) {
    setDraft({
      id: task.id,
      titulo: task.titulo || "",
      descricao: task.descricao || "",
      tipoTarefa: task.tipoTarefa === "CADERNO" ? "CADERNO" : "CLUBE",
      pontuacao: task.pontuacao ?? "",
      prazoPadrao: task.prazoPadrao ? String(task.prazoPadrao).slice(0, 10) : "",
      fkCaderno: task.fkCaderno ? String(task.fkCaderno) : "",
      unidadesEntregaram: task.unidadesEntregaram ?? 0,
    });
    setErroForm(null);
    setModal("form");
  }

  function openDeleteTask(task) {
    setDraft(task);
    setErroAcao(null);
    setModal("delete");
  }

  function handleChange(event) {
    setDraft({ ...draft, [event.target.name]: event.target.value });
  }

  function handleTypeChange(tipoTarefa) {
    // Tipo e caderno não mudam depois de criada (o back não altera e já pode haver evidências/check-ins).
    if (draft.id) return;
    setDraft({ ...draft, tipoTarefa, fkCaderno: tipoTarefa === "CADERNO" ? draft.fkCaderno : "" });
  }

  async function saveTask(event) {
    event.preventDefault();
    const pontuacao = Number(draft.pontuacao);
    if (!Number.isInteger(pontuacao) || pontuacao < 0) {
      setErroForm("Informe uma pontuação inteira, zero ou maior.");
      return;
    }
    if (isNotebookDraft && !draft.fkCaderno) {
      setErroForm("Selecione o caderno da tarefa.");
      return;
    }

    const payload = {
      titulo: draft.titulo.trim(),
      descricao: draft.descricao.trim(),
      pontuacao,
      prazoPadrao: draft.prazoPadrao || null,
    };

    try {
      setSalvando(true);
      setErroForm(null);
      if (draft.id) {
        await api.put(`/tarefas/${draft.id}`, payload);
      } else {
        // Sem unidade: o back distribui a tarefa para todas as unidades do clube no ciclo ativo.
        await api.post("/tarefas", {
          ...payload,
          tipoTarefa: draft.tipoTarefa,
          fkCaderno: isNotebookDraft ? Number(draft.fkCaderno) : null,
        });
      }
      setModal(null);
      await carregarTarefas();
    } catch (err) {
      setErroForm(mensagem(err, "Não foi possível salvar a tarefa."));
    } finally {
      setSalvando(false);
    }
  }

  async function deleteTask() {
    try {
      setSalvando(true);
      await api.delete(`/tarefas/${draft.id}`);
      setModal(null);
      setErroAcao(null);
      await carregarTarefas();
    } catch (err) {
      setModal(null);
      setErroAcao(mensagem(err, "Não foi possível excluir a tarefa."));
    } finally {
      setSalvando(false);
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

      {carregando && <p className={styles.feedback}>Carregando tarefas...</p>}
      {erroCarga && <p className={styles.feedbackError} role="alert">{erroCarga}</p>}
      {erroAcao && <p className={styles.feedbackError} role="alert">{erroAcao}</p>}

      {!carregando && !erroCarga && (
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
              {generalTasks.length === 0 && (
                <div className={styles.emptyColumn}><i className="bx bx-notepad" /><p>Nenhuma atividade geral</p></div>
              )}
            </div>
          </section>
          <section>
            <div className={`${styles.columnHeader} ${styles.notebookHeader}`}>
              <h2><i className="bx bx-book-open" /> Requisitos de Caderno</h2>
              {cadernos.length > 0 && (
                <select
                  className={styles.notebookFilter}
                  aria-label="Filtrar por caderno"
                  value={filtroCaderno}
                  onChange={(event) => setFiltroCaderno(event.target.value)}
                >
                  <option value="">Todos os cadernos</option>
                  {cadernos.map((caderno) => <option key={caderno.id} value={String(caderno.id)}>{caderno.nome}</option>)}
                </select>
              )}
              <span>{notebookTasksVisiveis.length}</span>
            </div>
            <div className={styles.taskList}>
              {notebookTasksVisiveis.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEditTask} onDelete={openDeleteTask} />
              ))}
              {notebookTasksVisiveis.length === 0 && (
                <div className={styles.emptyColumn}><i className="bx bx-book-open" /><p>Nenhum requisito de caderno</p></div>
              )}
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
          footer={
            <>
              <button type="button" onClick={() => setModal(null)}>Cancelar</button>
              <button className={isNotebookDraft ? styles.saveNotebook : styles.saveButton} type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : draft.id ? "Salvar Alterações" : "Criar Tarefa"}
              </button>
            </>
          }
          onClose={() => setModal(null)}
          onSubmit={saveTask}
        >
          <label>Tipo de atividade</label>
          <div className={styles.activityTypes}>
            <button
              type="button"
              className={!isNotebookDraft ? styles.typeSelected : ""}
              onClick={() => handleTypeChange("CLUBE")}
              disabled={Boolean(draft.id) && isNotebookDraft}
              aria-pressed={!isNotebookDraft}
            >
              <i className="bx bx-notepad" /><span><strong>Geral</strong><small>Entra no Kanban, requer evidência</small></span>
            </button>
            <button
              type="button"
              className={isNotebookDraft ? styles.typeNotebookSelected : ""}
              onClick={() => handleTypeChange("CADERNO")}
              disabled={Boolean(draft.id) && !isNotebookDraft}
              aria-pressed={isNotebookDraft}
            >
              <i className="bx bx-book-open" /><span><strong>Caderno</strong><small>Acompanhamento individual</small></span>
            </button>
          </div>
          {draft.id && <p className={styles.lockedHint}>O tipo e o caderno não mudam depois que a tarefa é criada.</p>}

          {isNotebookDraft && (
            <>
              <label htmlFor="fkCaderno">Caderno vinculado <b>*</b></label>
              <select id="fkCaderno" name="fkCaderno" value={draft.fkCaderno} onChange={handleChange} required disabled={Boolean(draft.id)}>
                <option value="">Selecione o caderno</option>
                {cadernos.map((caderno) => (
                  <option key={caderno.id} value={String(caderno.id)}>
                    {caderno.nome}{caderno.idadeAlvo ? ` · ${caderno.idadeAlvo} anos` : ""}
                  </option>
                ))}
              </select>
              <div className={styles.formHint}>
                <i className="bx bx-book-open" />
                <span>Somente desbravadores vinculados ao caderno selecionado poderão receber check-in. A Diretoria não edita o progresso individual.</span>
              </div>
            </>
          )}

          <label htmlFor="titulo">Título</label>
          <input id="titulo" name="titulo" value={draft.titulo} onChange={handleChange} maxLength={150} required />

          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" value={draft.descricao} onChange={handleChange} rows={3} required />

          <div className={`${styles.formRow} ${styles.formRowTwo}`}>
            <div>
              <label htmlFor="pontuacao">Pontuação</label>
              <input id="pontuacao" name="pontuacao" type="number" min="0" step="1" value={draft.pontuacao} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="prazoPadrao">Data Limite</label>
              <input id="prazoPadrao" name="prazoPadrao" type="date" value={draft.prazoPadrao} onChange={handleChange} />
            </div>
          </div>
          {draft.id && draft.unidadesEntregaram > 0 && (
            <p className={styles.lockedHint}>
              {draft.unidadesEntregaram} unidade(s) já entregaram: mudar a pontuação vale para as próximas aprovações;
              pontos já concedidos não mudam.
            </p>
          )}
          {erroForm && <p className={styles.formError} role="alert">{erroForm}</p>}
        </Modal>
      )}

      {modal === "delete" && (
        <Modal
          className={styles.deleteModal}
          title="Excluir Tarefa"
          labelledBy="delete-task-title"
          bodyClassName={styles.deleteBody}
          footerClassName={styles.deleteActions}
          footer={<><button type="button" onClick={() => setModal(null)}>Cancelar</button><button className={styles.deleteConfirm} type="button" onClick={deleteTask} disabled={salvando}>Excluir</button></>}
          onClose={() => setModal(null)}
        >
          <p>Tem certeza que deseja excluir “{draft.titulo}”? Esta ação não pode ser desfeita.</p>
          {draft.unidadesEntregaram > 0 && (
            <p className={styles.deleteWarning}>
              <i className="bx bx-error" /> {draft.unidadesEntregaram} unidade(s) já entregaram esta tarefa. As evidências
              e check-ins serão apagados e os pontos já concedidos saem do ranking.
            </p>
          )}
        </Modal>
      )}
    </main>
  );
}

export default Tarefas;
