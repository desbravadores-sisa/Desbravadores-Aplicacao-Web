import { useEffect, useMemo, useState } from "react";
import { closestCorners, DndContext, DragOverlay, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { getKanbanBoard, updateTaskStatus } from "../service/api";
import styles from "./CounselorTasks.module.css";

const columns = ["A fazer", "Em andamento", "Em revisão", "Concluído"];
const columnClass = { "A fazer": styles.todo, "Em andamento": styles.doing, "Em revisão": styles.review, "Concluído": styles.done };
const emptyBoard = () => columns.reduce((board, column) => ({ ...board, [column]: [] }), {});
const mockBoard = {
  "A fazer": [
    { id: "mock-1", nome: "Organizar reunião de pais", descricao: "Preparar e conduzir reunião com os pais dos desbravadores", pontuacao: 150, prazoEntrega: "2026-10-01" },
    { id: "mock-2", nome: "Inventário de materiais", descricao: "Fazer inventário completo dos materiais da unidade", pontuacao: 80, prazoEntrega: "2026-10-06" }
  ],
  "Em andamento": [
    { id: "mock-3", nome: "Atualizar documentação da unidade", descricao: "Revisar os documentos oficiais da unidade", pontuacao: 100, prazoEntrega: "2026-10-03" }
  ],
  "Em revisão": [
    { id: "mock-4", nome: "Campori Regional - Preparação", descricao: "Preparar a equipe para participação no Campori Regional", pontuacao: 300, prazoEntrega: "2026-10-14", evidencia: true }
  ],
  "Concluído": [
    { id: "mock-5", nome: "Treinamento de primeiros socorros", descricao: "Conduzir treinamento básico com a unidade", pontuacao: 200, prazoEntrega: "2026-09-24", evidencia: true }
  ]
};
const normalizeBoard = (data) => columns.reduce((board, column) => ({ ...board, [column]: Array.isArray(data?.[column]) ? data[column] : [] }), {});
const taskId = (task) => task.id ?? task.idTarefa;
const formatDate = (value) => { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR"); };

function TaskCard({ task, overlay = false }) {
  const sortable = useSortable({ id: taskId(task), data: { type: "card", task } });
  const cardStyle = overlay ? undefined : { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition };
  return <article ref={overlay ? undefined : sortable.setNodeRef} style={cardStyle} className={`${styles.card} ${sortable.isDragging && !overlay ? styles.dragging : ""} ${overlay ? styles.overlay : ""}`} {...(overlay ? {} : sortable.attributes)} {...(overlay ? {} : sortable.listeners)}>
    <div className={styles.cardTopline}><h3>{task.nome || task.title || "Tarefa sem título"}</h3>{typeof task.pontuacao === "number" || typeof task.points === "number" ? <span className={styles.points}><i className="bx bx-award" /> {task.pontuacao ?? task.points}</span> : null}</div>
    <span className={`${styles.tag} ${task.tipo ? styles.notebookTag : ""}`}><i className={`bx ${task.tipo ? "bx-book" : "bx-notepad"}`} /> {task.tipo || "Atividade geral"}</span>
    {(task.descricao || task.description) && <p>{task.descricao || task.description}</p>}
    <div className={styles.cardFooter}>{(task.prazoEntrega || task.deadline) && <span><i className="bx bx-time-five" /> {formatDate(task.prazoEntrega || task.deadline)}</span>}{task.evidencia || task.evidence ? <strong><i className="bx bx-check-circle" /> Com evidência</strong> : null}</div>
  </article>;
}

function KanbanColumn({ title, tasks }) {
  const { isOver, setNodeRef } = useDroppable({ id: title, data: { type: "column" } });
  return <section ref={setNodeRef} className={`${styles.column} ${columnClass[title]} ${isOver ? styles.columnOver : ""}`}><header className={styles.columnHeader}><h2>{title}</h2><span>{tasks.length}</span></header><SortableContext items={tasks.map(taskId)} strategy={verticalListSortingStrategy}><div className={styles.columnContent}>{tasks.map((task) => <TaskCard key={taskId(task)} task={task} />)}</div></SortableContext></section>;
}

function CounselorTasks() {
  const navigate = useNavigate();
  const [board, setBoard] = useState(emptyBoard);
  const [activeTask, setActiveTask] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const allTasks = useMemo(() => Object.values(board).flat(), [board]);

  useEffect(() => {
    let cancelled = false;
    let user;
    try { user = JSON.parse(sessionStorage.getItem("desbravadores.user")); } catch { user = null; }
    if (import.meta.env.VITE_MOCK_KANBAN === "true" && !user) {
      user = { nome: "Conselheiro de teste", tipoConta: "Conselheiro" };
      sessionStorage.setItem("desbravadores.user", JSON.stringify(user));
    }
    if (String(user?.tipoConta || "").toLowerCase() !== "conselheiro") { navigate("/", { replace: true }); return undefined; }
    if (import.meta.env.VITE_MOCK_KANBAN === "true") {
      setBoard(mockBoard);
      setState("ready");
      return undefined;
    }
    getKanbanBoard().then((data) => { if (!cancelled) { setBoard(normalizeBoard(data)); setState("ready"); } }).catch(() => { if (!cancelled) { setError("Não foi possível carregar as tarefas da sua unidade."); setState("error"); } });
    return () => { cancelled = true; };
  }, [navigate]);

  const findColumn = (id) => columns.find((column) => board[column].some((task) => taskId(task) === id));
  function handleDragStart({ active }) { setActiveTask(allTasks.find((task) => taskId(task) === active.id) || null); }
  async function handleDragEnd({ active, over }) {
    setActiveTask(null); if (!over) return;
    const source = findColumn(active.id); const destination = over.data.current?.type === "column" ? over.id : findColumn(over.id);
    if (!source || !destination) return;
    const sourceTasks = board[source]; const destinationTasks = board[destination]; const sourceIndex = sourceTasks.findIndex((task) => taskId(task) === active.id);
    if (sourceIndex < 0) return;
    if (source === destination) { const targetIndex = over.data.current?.type === "column" ? sourceTasks.length - 1 : sourceTasks.findIndex((task) => taskId(task) === over.id); if (targetIndex >= 0 && targetIndex !== sourceIndex) setBoard((current) => ({ ...current, [source]: arrayMove(current[source], sourceIndex, targetIndex) })); return; }
    const nextSource = sourceTasks.filter((task) => taskId(task) !== active.id); const nextDestination = [...destinationTasks]; const targetIndex = over.data.current?.type === "column" ? nextDestination.length : nextDestination.findIndex((task) => taskId(task) === over.id); nextDestination.splice(targetIndex >= 0 ? targetIndex : nextDestination.length, 0, sourceTasks[sourceIndex]);
    setBoard((current) => ({ ...current, [source]: nextSource, [destination]: nextDestination }));
    if (import.meta.env.VITE_MOCK_KANBAN !== "true") {
      try { await updateTaskStatus(active.id, destination); } catch { setError("A tarefa foi movida localmente, mas não foi possível salvar o novo status."); }
    }
  }

  if (state === "loading") return <main className={styles.page}><div className={styles.feedback}>Carregando suas tarefas...</div></main>;
  if (state === "error") return <main className={styles.page}><div className={styles.feedback}>{error}</div></main>;
  const completed = board["Concluído"].length; const points = board["Concluído"].reduce((total, task) => total + (task.pontuacao || task.points || 0), 0);
  return <main className={styles.page}><header className={styles.pageHeader}><h1>Minhas Tarefas</h1><div className={styles.summary}><span><i className="bx bx-award" /> {points} pontos conquistados</span><span><i className="bx bx-check-circle" /> {completed} tarefas concluídas</span></div></header>{error && <p className={styles.warning}>{error}</p>}<DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveTask(null)}><div className={styles.board}>{columns.map((column) => <KanbanColumn key={column} title={column} tasks={board[column]} />)}</div><DragOverlay>{activeTask ? <TaskCard task={activeTask} overlay /> : null}</DragOverlay></DndContext></main>;
}

export default CounselorTasks;
