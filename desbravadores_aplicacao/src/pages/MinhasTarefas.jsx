import { useEffect, useRef, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { useSearchParams } from "react-router-dom";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import api, { getKanbanBoard, updateTaskStatus } from "../service/api";
import { errorMessage, notifyRefresh } from "../service/feedback";
import styles from "./MinhasTarefas.module.css";

const columns = [["A FAZER", "A Fazer"], ["EM ANDAMENTO", "Em Andamento"], ["EM REVISAO", "Em Revisão"], ["CONCLUIDA", "Concluído"]];
function Column({ status, label, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`${styles.column} ${isOver ? styles.over : ""}`}><h2>{label}</h2>{children}</section>;
}
function Card({ task, busy, onMove, onEvidence, highlighted }) {
  const locked = ["EM REVISAO", "CONCLUIDA"].includes(task.statusKanban);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id, disabled: locked || busy });
  return <article id={`task-${task.id}`} ref={setNodeRef} className={`${styles.card} ${highlighted ? styles.highlight : ""}`}
    style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 5 } : undefined}>
    <button className={styles.dragHandle} disabled={locked || busy} {...listeners} {...attributes} aria-label={`Mover ${task.nome}`}>⠿</button>
    <h3>{task.nome}</h3><p>{task.descricao}</p>
    {task.instrucoesEvidencia && <p><strong>Evidência: </strong>{task.instrucoesEvidencia}</p>}
    {task.comentarioFeedback && <p className={styles.feedback}><strong>Correção: </strong>{task.comentarioFeedback}</p>}
    <small>{task.nomeUnidade} · {task.pontuacaoConcedida ?? task.pontuacao ?? 0} pontos</small>
    {task.prazoEntrega && <small>Prazo: {new Date(task.prazoEntrega).toLocaleDateString("pt-BR")}</small>}
    <button disabled={busy} onClick={() => onEvidence(task)}>{locked ? "Ver evidências" : "Anexar / editar evidências"}</button>
    {!locked && <label>Status<select value={task.statusKanban} disabled={busy} onChange={e => onMove(task.id, e.target.value)}>
      {columns.filter(([s]) => s !== "CONCLUIDA").map(([s, label]) => <option key={s} value={s}>{label}</option>)}
    </select></label>}
  </article>;
}
function MinhasTarefas() {
  const [board, setBoard] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const [draft, setDraft] = useState({ nome: "", urlAnexo: "" });
  const [params] = useSearchParams();
  const saving = useRef(false);
  const target = params.get("tarefa");
  async function reload() { setBoard(await getKanbanBoard() || {}); }
  useEffect(() => { Promise.resolve().then(reload).catch(err => setError(errorMessage(err))); }, []);
  useEffect(() => { if (target) document.getElementById(`task-${target}`)?.scrollIntoView({ block: "center" }); }, [target, board]);
  async function move(id, nextStatus) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try { await updateTaskStatus(id, nextStatus); await reload(); notifyRefresh(); }
    catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }
  async function openEvidence(task) {
    setModal(task); setDraft({ nome: "", urlAnexo: "" }); setError(""); setEvidences([]);
    try { const { data } = await api.get("/evidencias/unidade"); setEvidences((data || []).filter(e => e.idTarefa === task.id)); }
    catch (err) { setError(errorMessage(err)); }
  }
  async function saveEvidence(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      if (draft.id) await api.put(`/evidencias/${draft.id}`, { nome: draft.nome, urlAnexo: draft.urlAnexo });
      else await api.post("/evidencias", { idTarefa: modal.id, nome: draft.nome, urlAnexo: draft.urlAnexo });
      await openEvidence(modal);
    } catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }
  async function removeEvidence(id) {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try { await api.delete(`/evidencias/${id}`); await openEvidence(modal); }
    catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }
  const editable = modal && !["EM REVISAO", "CONCLUIDA"].includes(modal.statusKanban);
  return <main className={styles.page}>
    <SectionHeader title="Minhas Tarefas" subtitle="Acompanhe sua unidade e envie as entregas para a Diretoria." />
    {!modal && error && <p role="alert">{error}</p>}
    <DndContext onDragEnd={({ active, over }) => { if (over && over.id !== "CONCLUIDA") move(active.id, over.id); }}>
      <div className={styles.board}>{columns.map(([status, label]) => <Column key={status} status={status} label={label}>
        {(board[status] || []).map(task => <Card key={task.idTarefaUnidade} task={task} busy={busy} onMove={move} onEvidence={openEvidence} highlighted={String(task.id) === target} />)}
        {!(board[status]?.length) && <p className={styles.empty}>Nenhuma tarefa.</p>}
      </Column>)}</div>
    </DndContext>
    {modal && <Modal title={`Evidências — ${modal.nome}`} labelledBy="task-evidence-title" onClose={() => setModal(null)} onSubmit={saveEvidence}
      footer={editable ? <button disabled={busy} type="submit">{draft.id ? "Salvar alterações" : "Anexar evidência"}</button> : <button type="button" onClick={() => setModal(null)}>Fechar</button>}>
      {error && <p role="alert">{error}</p>}
      {evidences.map(e => <div key={e.id} className={styles.evidence}>
        <a href={/^https?:\/\//.test(e.urlAnexo) ? e.urlAnexo : undefined} target="_blank" rel="noreferrer">{e.nome}</a>
        {e.comentarioFeedback && <p>{e.comentarioFeedback}</p>}
        {editable && <><button type="button" disabled={busy} onClick={() => setDraft({ id: e.id, nome: e.nome, urlAnexo: e.urlAnexo })}>Editar</button>
          <button type="button" disabled={busy} onClick={() => removeEvidence(e.id)}>Remover</button></>}
      </div>)}
      {editable && <div className={styles.form}><label htmlFor="evidence-name">Nome da evidência</label><input id="evidence-name" required value={draft.nome} onChange={e => setDraft({ ...draft, nome: e.target.value })} />
        <label htmlFor="evidence-url">Link do arquivo</label><input id="evidence-url" type="url" pattern="https?://.*" required placeholder="https://..." value={draft.urlAnexo} onChange={e => setDraft({ ...draft, urlAnexo: e.target.value })} /></div>}
    </Modal>}
  </main>;
}
export default MinhasTarefas;
