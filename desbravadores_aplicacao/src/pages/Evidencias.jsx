import { useEffect, useRef, useState } from "react";
import EvidenceNotebookCard from "../components/EvidenceNotebookCard/EvidenceNotebookCard";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Evidencias.module.css";
import api from "../service/api";
import { useSearchParams } from "react-router-dom";
import { errorMessage, notifyRefresh } from "../service/feedback";

function Evidencias() {
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  async function reload() {
    const { data } = await api.get("/evidencias");
    const groups = new Map();
    for (const e of data || []) {
      if (!groups.has(e.idTarefaUnidade)) groups.set(e.idTarefaUnidade, { id: e.id, idTarefaUnidade: e.idTarefaUnidade, title: e.nomeTarefa, unit: e.nomeUnidade, leader: "Conselheiro da unidade", points: e.pontuacao, description: e.nome, files: [] });
      groups.get(e.idTarefaUnidade).files.push({ name: e.nome, url: e.urlAnexo, size: "", type: "file" });
    }
    setEvidences([...groups.values()]);
  }
  useEffect(() => { Promise.resolve().then(reload).catch(err => setError(errorMessage(err))); }, []);
  useEffect(() => {
    const id = params.get("tarefaUnidade");
    if (id) document.getElementById(`evidence-${id}`)?.scrollIntoView({ block: "center" });
  }, [params, evidences]);

  const [evidences, setEvidences] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [activeTab, setActiveTab] = useState("activities");
  const [modal, setModal] = useState(null);
  const [points, setPoints] = useState(300);
  const [comment, setComment] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [recognitionPoints, setRecognitionPoints] = useState(0);

  function openModal(type, evidence) {
    setModal({ type, evidence });
    setPoints(evidence.points);
    setComment("");
  }

  function closeModal() {
    setModal(null);
  }

  async function decide(event, approved) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      await api.patch(`/evidencias/${modal.evidence.id}/${approved ? "approve" : "correction"}`, approved ? { pontuacao: Number(points) } : { justificativa: comment });
      await reload(); notifyRefresh(); closeModal();
    } catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }
  const approveEvidence = event => decide(event, true);
  const requestCorrection = event => decide(event, false);

  function openRecognition(notebook) {
    setRecognition(notebook);
    setRecognitionPoints(notebook.points);
  }

  function recognizeNotebook(event) {
    event.preventDefault();
    setNotebooks((current) => current.filter((notebook) => notebook.id !== recognition.id));
    setRecognition(null);
  }

  function dismissNotebook(id) {
    setNotebooks((current) => current.filter((notebook) => notebook.id !== id));
  }

  return (
    <main className={styles.page}>
      {!modal && error && <p role="alert">{error}</p>}
      <SectionHeader
        title="Evidências e Reconhecimentos"
        subtitle="Revise evidências de atividades e reconheça pontos de cadernos concluídos pelos desbravadores."
      />

      <div className={styles.tabs} role="tablist">
        <button className={activeTab === "activities" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("activities")}>
          Evidências de Atividades <span>{evidences.length}</span>
        </button>
        <button className={activeTab === "notebooks" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("notebooks")}>
          <i className="bx bx-book-open" /> Reconhecimento de Cadernos <span className={styles.grayCount}>{notebooks.length}</span>
        </button>
      </div>

      {activeTab === "activities" ? evidences.map((evidence) => (
        <article id={`evidence-${evidence.idTarefaUnidade}`} className={styles.evidenceCard} key={evidence.id}>
          <div className={styles.evidenceTop}>
            <div className={styles.evidenceContent}>
              <div className={styles.labels}>
                <span className={styles.pending}>PENDENTE</span>
                <span className={styles.pointsPreview}>{evidence.points} pontos previstos</span>
              </div>
              <h2>{evidence.title}</h2>
              <div className={styles.metadata}>
                <span><i className="bx bx-group" /> {evidence.unit}</span>
                <span><i className="bx bx-user" /> {evidence.leader}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.approveButton} type="button" disabled={busy} onClick={() => openModal("approve", evidence)}><i className="bx bx-check-circle" /> Analisar e aprovar</button>
              <button className={styles.correctionButton} type="button" disabled={busy} onClick={() => openModal("correction", evidence)}><i className="bx bx-x-circle" /> Solicitar correção</button>
            </div>
          </div>

          <p className={styles.description}>{evidence.description}</p>
          <div className={styles.fileDivider} />
          <h3>Arquivos enviados ({evidence.files.length})</h3>
          <div className={styles.files}>
            {evidence.files.map((file) => (
              <div className={styles.file} key={file.name}>
                <i className={`bx ${file.type === "image" ? "bx-image" : file.type === "sheet" ? "bx-spreadsheet" : "bx-file-blank"}`} />
                <div><strong><a href={/^https?:\/\//.test(file.url) ? file.url : undefined} target="_blank" rel="noreferrer">{file.name}</a></strong><span>{file.size}</span></div>
              </div>
            ))}
          </div>
        </article>
      )) : notebooks.length > 0 ? notebooks.map((notebook) => (
        // <EvidenceNotebookCard notebook={notebook} styles={styles} onRecognize={openRecognition} onDismiss={dismissNotebook} />
        // Removemos esse prop porque a página não deve injetar sua folha de estilos em um filho; o componente deve importar e controlar seu próprio módulo para manter o CSS isolado, reutilizável e previsível.
        <EvidenceNotebookCard
          key={notebook.id}
          notebook={notebook}
          onRecognize={openRecognition}
          onDismiss={dismissNotebook}
        />
      )) : (
        <div className={styles.emptyTab}>Nenhum reconhecimento de caderno pendente.</div>
      )}

      {modal?.type === "approve" && (
        <Modal className={styles.modal} title="Aprovar evidência" eyebrow="DECISÃO DA DIRETORIA" labelledBy="approve-evidence-title" headerClassName={styles.modalHeader} bodyClassName={styles.modalBody} footerClassName={styles.modalFooter} footer={<><button type="button" className={styles.cancelAction} onClick={closeModal}>Cancelar</button><button className={styles.submitButton} disabled={busy} type="submit"><i className="bx bx-check-circle" /> Conceder {points || 0} pts</button></>} onClose={closeModal} onSubmit={approveEvidence}>
          {error && <p role="alert">{error}</p>}<EvidenceSummary evidence={modal.evidence} />
          <label htmlFor="points">Pontos a conceder</label>
          <p className={styles.helper}>A Diretoria pode manter ou ajustar a pontuação conforme a qualidade da entrega.</p>
          <div className={styles.pointsInput}><input id="points" type="number" min="0" value={points} onChange={(event) => setPoints(event.target.value)} /><span>pts</span></div>
          <div className={styles.infoBox}><i className="bx bx-edit-alt" /><span>Este valor entra na pontuação líquida da unidade e atualiza o ranking imediatamente.</span></div>
        </Modal>
      )}

      {modal?.type === "correction" && (
        <Modal className={styles.modal} title="Solicitar correção" eyebrow="DECISÃO DA DIRETORIA" labelledBy="correction-evidence-title" headerClassName={styles.modalHeader} bodyClassName={styles.modalBody} footerClassName={styles.modalFooter} footer={<><button type="button" className={styles.cancelAction} onClick={closeModal}>Cancelar</button><button className={`${styles.submitButton} ${styles.submitButtonDanger}`} type="submit" disabled={busy || !comment.trim()}><i className="bx bx-chevron-right" /> Enviar para correção</button></>} onClose={closeModal} onSubmit={requestCorrection}>
          {error && <p role="alert">{error}</p>}<EvidenceSummary evidence={modal.evidence} />
          <label htmlFor="comment">Motivo da solicitação de correção <b>*</b></label>
          <p className={styles.helper}>Explique com clareza o que o conselheiro precisa complementar.</p>
          <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ex.: incluir lista de presença e foto de todos os participantes." required />
          <div className={styles.warningBox}><i className="bx bx-shield-x" /><span>Se a entrega não for corrigida conforme solicitado, a Diretoria poderá aplicar penalidade à unidade.</span></div>
        </Modal>
      )}

      {recognition && (
        <Modal
          className={`${styles.modal} ${styles.notebookModal}`}
          title={recognition.title}
          eyebrow="RECONHECIMENTO DE CADERNO"
          eyebrowClassName={styles.notebookModalEyebrow}
          subtitle={`${recognition.unit} · ${recognition.leader}`}
          subtitleClassName={styles.modalSubtitle}
          labelledBy="recognize-notebook-title"
          headerClassName={styles.modalHeader}
          bodyClassName={styles.modalBody}
          footerClassName={styles.modalFooter}
          footer={<><button className={styles.cancelAction} type="button" onClick={() => setRecognition(null)}>Cancelar</button><button className={styles.recognizeButton} type="submit"><i className="bx bx-star" /> Reconhecer {recognitionPoints || 0} pts</button></>}
          onSubmit={recognizeNotebook}
          onClose={() => setRecognition(null)}
        >
          <div className={styles.notebookInfoBox}><i className="bx bx-book-open" /><span>Reconhecer este caderno adiciona os pontos à pontuação da unidade. Esta ação é opcional, sem penalidade se não reconhecido.</span></div>
          <label htmlFor="notebook-points">Pontos a reconhecer</label>
          <div className={styles.notebookPointsInput}><input id="notebook-points" type="number" min="0" value={recognitionPoints} onChange={(event) => setRecognitionPoints(event.target.value)} /><span>pts</span></div>
        </Modal>
      )}
    </main>
  );
}

function EvidenceSummary({ evidence }) {
  return <div className={styles.summary}><strong>{evidence.title}</strong><span>Unidade {evidence.unit} · {evidence.points} pontos previstos</span></div>;
}

export default Evidencias;
