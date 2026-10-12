import { useEffect, useMemo, useState } from "react";
import { closestCorners, DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { getKanbanBoard, updateTaskStatus } from "../service/api";
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

const emptyBoard = () => COLUMNS.reduce((board, column) => ({ ...board, [column.key]: [] }), {});
const normalizeBoard = (data) =>
  COLUMNS.reduce((board, column) => ({ ...board, [column.key]: Array.isArray(data?.[column.key]) ? data[column.key] : [] }), {});
const taskId = (task) => task.id;
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
};

function TaskCard({ task, overlay = false, locked = false }) {
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

function KanbanColumn({ column, tasks, blocked }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.key, data: { type: "column" } });
  const locked = column.key === LOCKED;
  return (
    <section
      ref={setNodeRef}
      data-column={column.key}
      className={`${styles.column} ${column.className} ${isOver ? (blocked ? styles.columnOverBlocked : styles.columnOver) : ""}`}
    >
      <header className={styles.columnHeader}><h2>{column.label}</h2><span>{tasks.length}</span></header>
      {locked && <p className={styles.lockedHint}>Concluída quando a Diretoria aprova a evidência</p>}
      <SortableContext items={tasks.map(taskId)} strategy={verticalListSortingStrategy}>
        <div className={styles.columnContent}>
          {tasks.map((task) => <TaskCard key={taskId(task)} task={task} locked={locked} />)}
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const allTasks = useMemo(() => Object.values(board).flat(), [board]);

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
  const blocked = activeTask && overColumn === LOCKED;

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Minhas Tarefas</h1>
        <div className={styles.summary}>
          <span><i className="bx bx-award" /> {points} pontos conquistados</span>
          <span><i className="bx bx-check-circle" /> {completed} tarefas concluídas</span>
        </div>
      </header>
      <p className={styles.hint}>Arraste os cards para atualizar o andamento. Leve para “Em revisão” quando a evidência estiver pronta para a Diretoria.</p>
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
            <KanbanColumn key={column.key} column={column} tasks={board[column.key]} blocked={blocked} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay>
      </DndContext>
    </main>
  );
}

export default CounselorTasks;
