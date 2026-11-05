import { useEffect, useMemo, useRef, useState } from "react";
import { closestCorners, DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import { enviarCheckinParaRevisao, enviarEvidencia, getCheckin, getKanbanBoard, marcarCheckin, updateTaskStatus } from "../service/api";
import styles from "./CounselorTasks.module.css";

// Tela original de Nathan (feature/nathan, a2dbf60), ligada ao contrato real da API:
// GET /tarefas/kanban devolve as colunas pelas chaves do back e o PATCH envia o status do back.
const COLUMNS = [
  { key: "A FAZER", label: "A fazer", className: styles.todo },
  { key: "EM ANDAMENTO", label: "Em andamento", className: styles.doing },
  { key: "EM REVISAO", label: "Em revisão", className: styles.review },
  { key: "CONCLUIDA", label: "Concluído", className: styles.done }
];
// "Concluído" só acontece quando a Diretoria aprova a evidência; o back também bloqueia.
const LOCKED = "CONCLUIDA";
// "Em revisão" só por envio de evidência (clube) ou check-in completo (caderno); não se arrasta.
const REVIEW = "EM REVISAO";
const isLockedColumn = (key) => key === LOCKED || key === REVIEW;

const emptyBoard = () => COLUMNS.reduce((board, column) => ({ ...board, [column.key]: [] }), {});
const normalizeBoard = (data) =>
  COLUMNS.reduce((board, column) => ({ ...board, [column.key]: Array.isArray(data?.[column.key]) ? data[column.key] : [] }), {});
const taskId = (task) => task.id;
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
};

function TaskCard({ task, overlay = false, locked = false, onOpen }) {
  const sortable = useSortable({ id: taskId(task), data: { type: "card", task }, disabled: locked });
  const cardStyle = overlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  const isNotebook = task.tipoTarefa === "CADERNO";
  return (
    <article
      ref={overlay ? undefined : sortable.setNodeRef}
      style={cardStyle}
      className={`${styles.card} ${sortable.isDragging && !overlay ? styles.dragging : ""} ${overlay ? styles.overlay : ""} ${locked ? styles.locked : ""}`}
      {...(overlay || locked ? {} : sortable.attributes)}
      {...(overlay || locked ? {} : sortable.listeners)}
      onClick={overlay ? undefined : () => onOpen?.(task)}
      onKeyDown={overlay ? undefined : (event) => { if (event.key === "Enter") onOpen?.(task); }}
      role={overlay ? undefined : "button"}
      tabIndex={overlay ? undefined : 0}
    >
      <div className={styles.cardTopline}>
        <h3>{task.titulo || "Tarefa sem título"}</h3>
        {typeof task.pontuacao === "number" && (
          <span className={styles.points}><i className="bx bx-award" /> {task.pontuacao}</span>
        )}
      </div>
      <span className={`${styles.tag} ${isNotebook ? styles.notebookTag : ""}`}>
        <i className={`bx ${isNotebook ? "bx-book" : "bx-notepad"}`} /> {isNotebook ? "Caderno" : "Atividade geral"}
      </span>
      {task.descricao && <p>{task.descricao}</p>}
      <div className={styles.cardFooter}>
        {task.prazoEntrega && <span><i className="bx bx-time-five" /> {formatDate(task.prazoEntrega)}</span>}
        {task.possuiEvidencia ? <strong><i className="bx bx-check-circle" /> Com evidência</strong> : null}
      </div>
    </article>
  );
}

function KanbanColumn({ column, tasks, blocked, onOpen }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.key, data: { type: "column" } });
  const locked = isLockedColumn(column.key);
  return (
    <section
      ref={setNodeRef}
      data-column={column.key}
      className={`${styles.column} ${column.className} ${isOver ? (blocked ? styles.columnOverBlocked : styles.columnOver) : ""}`}
    >
      <header className={styles.columnHeader}><h2>{column.label}</h2><span>{tasks.length}</span></header>
      {column.key === LOCKED && <p className={styles.lockedHint}>Concluída quando a Diretoria aprova a evidência</p>}
      {column.key === REVIEW && <p className={styles.lockedHint}>Aguardando a Diretoria · envie evidência ou faça o check-in</p>}
      <SortableContext items={tasks.map(taskId)} strategy={verticalListSortingStrategy}>
        <div className={styles.columnContent}>
          {tasks.map((task) => <TaskCard key={taskId(task)} task={task} locked={locked} onOpen={onOpen} />)}
        </div>
      </SortableContext>
    </section>
  );
}

function CounselorTasks() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(emptyBoard);
  const [activeTask, setActiveTask] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [openTask, setOpenTask] = useState(null);
  // Depois de arrastar, o navegador ainda dispara um clique: não abre o modal nesse caso.
  const ultimoArraste = useRef(0);
  const abrirTarefa = (task) => {
    if (Date.now() - ultimoArraste.current > 300) setOpenTask(task);
  };
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const allTasks = useMemo(() => Object.values(board).flat(), [board]);

  const recarregar = () => getKanbanBoard().then((data) => setBoard(normalizeBoard(data))).catch(() => {});

  useEffect(() => {
    let cancelled = false;
    getKanbanBoard()
      .then((data) => {
        if (cancelled) return;
        setBoard(normalizeBoard(data));
        setState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err.response?.status;
        if (status === 401) {
          navigate("/", { replace: true });
          return;
        }
        setError(status === 403
          ? "Esta tela é exclusiva do conselheiro."
          : status === 404
            ? "Sua conta ainda não está vinculada a uma unidade."
            : "Não foi possível carregar as tarefas da sua unidade.");
        setState("error");
      });
    return () => { cancelled = true; };
  }, [navigate]);

  const findColumn = (id) => COLUMNS.map((c) => c.key).find((key) => board[key].some((task) => taskId(task) === id));
  const destinationOf = (over) => (over?.data.current?.type === "column" ? over.id : findColumn(over?.id));

  function handleDragStart({ active }) {
    setError("");
    setActiveTask(allTasks.find((task) => taskId(task) === active.id) || null);
  }

  async function handleDragEnd({ active, over }) {
    ultimoArraste.current = Date.now();
    setActiveTask(null);
    setOverColumn(null);
    if (!over) return;
    const source = findColumn(active.id);
    const destination = destinationOf(over);
    if (!source || !destination) return;

    const sourceTasks = board[source];
    const sourceIndex = sourceTasks.findIndex((task) => taskId(task) === active.id);
    if (sourceIndex < 0) return;

    if (source === destination) {
      // Reordenar dentro da coluna é só visual (o back não guarda ordem).
      const targetIndex = over.data.current?.type === "column"
        ? sourceTasks.length - 1
        : sourceTasks.findIndex((task) => taskId(task) === over.id);
      if (targetIndex >= 0 && targetIndex !== sourceIndex) {
        setBoard((current) => ({ ...current, [source]: arrayMove(current[source], sourceIndex, targetIndex) }));
      }
      return;
    }

    if (destination === LOCKED || source === LOCKED) {
      setError("Só a Diretoria conclui tarefas, ao aprovar a evidência enviada.");
      return;
    }
    if (destination === REVIEW) {
      setError("Para mandar à revisão, clique no card: envie a evidência (tarefa de clube) ou faça o check-in (tarefa de caderno).");
      return;
    }

    const previous = board;
    const moved = { ...sourceTasks[sourceIndex], statusKanban: destination };
    const nextDestination = [...board[destination]];
    const targetIndex = over.data.current?.type === "column"
      ? nextDestination.length
      : nextDestination.findIndex((task) => taskId(task) === over.id);
    nextDestination.splice(targetIndex >= 0 ? targetIndex : nextDestination.length, 0, moved);
    setBoard((current) => ({
      ...current,
      [source]: current[source].filter((task) => taskId(task) !== active.id),
      [destination]: nextDestination
    }));

    try {
      await updateTaskStatus(active.id, destination);
    } catch (err) {
      setBoard(previous);
      setError(err.response?.data?.message || "Não foi possível salvar o novo status. A tarefa voltou para a coluna anterior.");
    }
  }

  if (state === "loading") return <main className={styles.page}><div className={styles.feedback}>Carregando suas tarefas...</div></main>;
  if (state === "error") return <main className={styles.page}><div className={styles.feedback}>{error}</div></main>;

  const completed = board[LOCKED].length;
  const points = board[LOCKED].reduce((total, task) => total + (task.pontuacao || 0), 0);
  const blocked = activeTask && isLockedColumn(overColumn);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Minhas Tarefas</h1>
        <div className={styles.summary}>
          <span><i className="bx bx-award" /> {points} pontos conquistados</span>
          <span><i className="bx bx-check-circle" /> {completed} tarefas concluídas</span>
        </div>
      </header>
      <p className={styles.hint}>Arraste os cards entre “A fazer” e “Em andamento”. Clique num card para enviar a evidência ou fazer o check-in das crianças: aí ele vai para “Em revisão”.</p>
      {error && <p className={styles.warning} role="alert">{error}</p>}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={({ over }) => setOverColumn(destinationOf(over) || null)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setActiveTask(null); setOverColumn(null); }}
      >
        <div className={styles.board}>
          {COLUMNS.map((column) => (
            <KanbanColumn key={column.key} column={column} tasks={board[column.key]} blocked={blocked} onOpen={abrirTarefa} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
      </DndContext>
      {openTask && (
        <TaskActionModal
          task={openTask}
          onClose={() => setOpenTask(null)}
          onChanged={recarregar}
        />
      )}
    </main>
  );
}

/** Ações do card: envio de evidência (tarefa de clube) ou check-in das crianças (tarefa de caderno). */
function TaskActionModal({ task, onClose, onChanged }) {
  const isNotebook = task.tipoTarefa === "CADERNO";
  const status = task.statusKanban;
  const [checkin, setCheckin] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!isNotebook) return;
    getCheckin(task.id)
      .then(setCheckin)
      .catch((err) => setErro(err.response?.data?.message || "Não foi possível carregar o check-in."));
  }, [isNotebook, task.id]);

  async function alternar(item) {
    try {
      setErro("");
      const atualizado = await marcarCheckin(task.id, item.idDesbravador, !item.concluiu);
      setCheckin(atualizado);
      onChanged();
    } catch (err) {
      setErro(err.response?.data?.message || "Não foi possível salvar o check-in.");
    }
  }

  async function enviarCheckin() {
    try {
      setEnviando(true);
      setErro("");
      setCheckin(await enviarCheckinParaRevisao(task.id));
      onChanged();
    } catch (err) {
      setErro(err.response?.data?.message || "Não foi possível enviar para revisão.");
    } finally {
      setEnviando(false);
    }
  }

  async function enviar(event) {
    event.preventDefault();
    if (!arquivo) {
      setErro("Escolha a foto ou o PDF da evidência.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErro("O arquivo precisa ter até 5 MB.");
      return;
    }
    try {
      setEnviando(true);
      setErro("");
      await enviarEvidencia(task.id, arquivo, comentario.trim());
      onChanged();
      onClose();
    } catch (err) {
      setErro(err.response?.data?.message || "Não foi possível enviar a evidência.");
    } finally {
      setEnviando(false);
    }
  }

  const concluida = status === LOCKED;
  const emRevisao = status === REVIEW;
  const podeEnviar = !isNotebook && !concluida && !emRevisao;
  const statusCheckin = checkin?.statusKanban ?? status;
  // Check-in parcial: o conselheiro pode mandar para a Diretoria com parte das crianças.
  const podeEnviarCheckin = isNotebook && checkin && checkin.marcados > 0
    && statusCheckin !== REVIEW && statusCheckin !== LOCKED;

  return (
    <Modal
      className={modalStyles.formModal}
      title={task.titulo}
      subtitle={isNotebook ? "Check-in das crianças vinculadas ao caderno" : "Evidência da tarefa"}
      labelledBy="task-action-title"
      headerClassName={modalStyles.formHeader}
      bodyClassName={modalStyles.formBody}
      footerClassName={modalStyles.formFooter}
      footer={podeEnviar ? (
        <>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={modalStyles.primaryAction} type="submit" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar evidência"}
          </button>
        </>
      ) : podeEnviarCheckin ? (
        <>
          <button type="button" onClick={onClose}>Fechar</button>
          <button className={modalStyles.primaryAction} type="button" onClick={enviarCheckin} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar para revisão"}
          </button>
        </>
      ) : (
        <button type="button" onClick={onClose}>Fechar</button>
      )}
      onClose={onClose}
      onSubmit={podeEnviar ? enviar : undefined}
    >
      {isNotebook ? (
        checkin ? (
          <>
            <p className={styles.checkinSummary}>
              {checkin.marcados} de {checkin.total} crianças cumpriram · caderno {checkin.nomeCaderno}
            </p>
            {checkin.total === 0 && <p className={styles.hint}>Nenhuma criança da sua unidade está vinculada a este caderno.</p>}
            <ul className={styles.checkinList}>
              {checkin.desbravadores.map((item) => (
                <li key={item.idDesbravador}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.concluiu}
                      disabled={concluida}
                      onChange={() => alternar(item)}
                    />
                    <span>{item.nome}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className={styles.hint}>
              {statusCheckin === LOCKED
                ? "Tarefa reconhecida pela Diretoria."
                : statusCheckin === REVIEW
                  ? "Em revisão pela Diretoria. Você ainda pode ajustar quem cumpriu."
                  : "Com todas marcadas, a tarefa vai sozinha para “Em revisão”. Também dá para enviar só com parte das crianças."}
            </p>
          </>
        ) : !erro && <p className={styles.hint}>Carregando check-in...</p>
      ) : concluida ? (
        <p className={styles.hint}>Tarefa concluída e aprovada pela Diretoria.</p>
      ) : emRevisao ? (
        <p className={styles.hint}>Evidência enviada. Aguardando a Diretoria aprovar ou pedir correção.</p>
      ) : (
        <>
          <label htmlFor="evidencia-arquivo">Foto ou PDF (até 5 MB)</label>
          <input
            id="evidencia-arquivo"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => setArquivo(event.target.files?.[0] ?? null)}
          />
          <label htmlFor="evidencia-comentario">Comentário (opcional)</label>
          <textarea
            id="evidencia-comentario"
            rows={3}
            maxLength={500}
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
          />
        </>
      )}
      {erro && <p className={styles.warning} role="alert">{erro}</p>}
    </Modal>
  );
}

export default CounselorTasks;
