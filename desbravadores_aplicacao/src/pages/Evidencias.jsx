import { useEffect, useState } from "react";
import EvidenceNotebookCard from "../components/EvidenceNotebookCard/EvidenceNotebookCard";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import api from "../service/api";
import styles from "./Evidencias.module.css";

function Evidencias() {
  const [evidences, setEvidences] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [activeTab, setActiveTab] = useState("activities");
  const [modal, setModal] = useState(null);
  const [points, setPoints] = useState(0);
  const [comment, setComment] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [recognitionPoints, setRecognitionPoints] = useState(0);

  useEffect(() => {
    carregarEvidencias();
  }, []);

  async function carregarEvidencias() {
    try {
      setCarregando(true);
      const { data, status } = await api.get("/evidencias");
      if (status === 204 || !data) {
        setEvidences([]);
      } else {
        setEvidences(data);
      }
      setErro(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setErro("Acesso restrito à diretoria.");
      } else {
        setErro("Não foi possível carregar as evidências. Verifique se a API está no ar.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function openModal(type, evidence) {
    setModal({ type, evidence });
    setPoints(evidence.pontuacao || 0);
    setComment("");
  }

  function closeModal() {
    setModal(null);
  }

  async function approveEvidence(event) {
    event.preventDefault();
    try {
      await api.put(`/evidencias/${modal.evidence.id}`, {
        pontuacao: Number(points) || 0,
        comentarioFeedback: comment || null,
        status: "APROVADA",
      });
      closeModal();
      await carregarEvidencias();
    } catch (err) {
      setErro("Não foi possível aprovar a evidência.");
    }
  }

  async function requestCorrection(event) {
    event.preventDefault();
    try {
      await api.put(`/evidencias/${modal.evidence.id}`, {
        comentarioFeedback: comment,
        status: "CORRECAO_SOLICITADA",
      });
      closeModal();
      await carregarEvidencias();
    } catch (err) {
      setErro("Não foi possível solicitar correção.");
    }
  }

  function openRecognition(notebook) {
    setRecognition(notebook);
    setRecognitionPoints(notebook.pontuacao || 0);
  }

  async function recognizeNotebook(event) {
    event.preventDefault();
    try {
      await api.put(`/evidencias/${recognition.id}`, {
        pontuacao: Number(recognitionPoints) || 0,
        status: "RECONHECIDO",
      });
      setRecognition(null);
      await carregarEvidencias();
    } catch (err) {
      setErro("Não foi possível reconhecer o caderno.");
    }
  }

  async function dismissNotebook(id) {
    try {
      await api.delete(`/evidencias/${id}`);
      await carregarEvidencias();
    } catch (err) {
      setErro("Não foi possível dispensar a evidência.");
    }
  }

  const isNotebook = (e) => e.tipoEvidencia === "CADERNO" || e.fkCaderno;
  const pendingEvidences = evidences.filter((e) => !isNotebook(e) && (!e.status || e.status === "PENDENTE"));
  const notebookEvidences = evidences.filter((e) => isNotebook(e) && e.status !== "RECONHECIDO");

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Evidências e Reconhecimentos"
        subtitle="Revise evidências de atividades e reconheça pontos de cadernos concluídos pelos desbravadores."
      />

      {carregando && <p>Carregando evidências...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className={styles.tabs} role="tablist">
            <button className={activeTab === "activities" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("activities")}>
              Evidências de Atividades <span>{pendingEvidences.length}</span>
            </button>
            <button className={activeTab === "notebooks" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("notebooks")}>
              <i className="bx bx-book-open" /> Reconhecimento de Cadernos <span className={styles.grayCount}>{notebookEvidences.length}</span>
            </button>
          </div>

          {activeTab === "activities" ? (
            pendingEvidences.length > 0 ? (
              pendingEvidences.map((evidence) => (
                <article className={styles.evidenceCard} key={evidence.id}>
                  <div className={styles.evidenceTop}>
                    <div className={styles.evidenceContent}>
                      <div className={styles.labels}>
                        <span className={styles.pending}>PENDENTE</span>
                        <span className={styles.pointsPreview}>{evidence.pontuacao || 0} pontos previstos</span>
                      </div>
                      <h2>{evidence.titulo || evidence.descricao || `Evidência #${evidence.id}`}</h2>
                      <div className={styles.metadata}>
                        <span><i className="bx bx-group" /> {evidence.nomeUnidade || "Unidade não informada"}</span>
                        <span><i className="bx bx-user" /> {evidence.nomeConselheiro || "Conselheiro não informado"}</span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.approveButton} type="button" onClick={() => openModal("approve", evidence)}>
                        <i className="bx bx-check-circle" /> Analisar e aprovar
                      </button>
                      <button className={styles.correctionButton} type="button" onClick={() => openModal("correction", evidence)}>
                        <i className="bx bx-x-circle" /> Solicitar correção
                      </button>
                    </div>
                  </div>

                  <p className={styles.description}>{evidence.comentarioFeedback || evidence.descricao || "Sem descrição disponível."}</p>
                  {evidence.urlS3 && (
                    <>
                      <div className={styles.fileDivider} />
                      <h3>Arquivo enviado</h3>
                      <div className={styles.files}>
                        <div className={styles.file}>
                          <i className="bx bx-file-blank" />
                          <div><strong>{evidence.urlS3.split("/").pop() || "Arquivo"}</strong><span>Clique para visualizar</span></div>
                        </div>
                      </div>
                    </>
                  )}
                </article>
              ))
            ) : (
              <p className={styles.emptyTab}>Nenhuma evidência pendente.</p>
            )
          ) : (
            notebookEvidences.length > 0 ? (
              notebookEvidences.map((notebook) => (
                <EvidenceNotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onRecognize={openRecognition}
                  onDismiss={dismissNotebook}
                />
              ))
            ) : (
              <div className={styles.emptyTab}>Nenhum reconhecimento de caderno pendente.</div>
            )
          )}
        </>
      )}

      {modal?.type === "approve" && (
        <Modal className={styles.modal} title="Aprovar evidência" eyebrow="DECISÃO DA DIRETORIA" labelledBy="approve-evidence-title" headerClassName={styles.modalHeader} bodyClassName={styles.modalBody} footerClassName={styles.modalFooter} footer={<><button type="button" className={styles.cancelAction} onClick={closeModal}>Cancelar</button><button className={styles.submitButton} type="submit"><i className="bx bx-check-circle" /> Conceder {points || 0} pts</button></>} onClose={closeModal} onSubmit={approveEvidence}>
          <EvidenceSummary evidence={modal.evidence} />
          <label htmlFor="points">Pontos a conceder</label>
          <p className={styles.helper}>A Diretoria pode manter ou ajustar a pontuação conforme a qualidade da entrega.</p>
          <div className={styles.pointsInput}><input id="points" type="number" min="0" value={points} onChange={(event) => setPoints(event.target.value)} /><span>pts</span></div>
          <div className={styles.infoBox}><i className="bx bx-edit-alt" /><span>Este valor entra na pontuação líquida da unidade e atualiza o ranking imediatamente.</span></div>
        </Modal>
      )}

      {modal?.type === "correction" && (
        <Modal className={styles.modal} title="Solicitar correção" eyebrow="DECISÃO DA DIRETORIA" labelledBy="correction-evidence-title" headerClassName={styles.modalHeader} bodyClassName={styles.modalBody} footerClassName={styles.modalFooter} footer={<><button type="button" className={styles.cancelAction} onClick={closeModal}>Cancelar</button><button className={`${styles.submitButton} ${styles.submitButtonDanger}`} type="submit" disabled={!comment.trim()}><i className="bx bx-chevron-right" /> Enviar para correção</button></>} onClose={closeModal} onSubmit={requestCorrection}>
          <EvidenceSummary evidence={modal.evidence} />
          <label htmlFor="comment">Motivo da solicitação de correção <b>*</b></label>
          <p className={styles.helper}>Explique com clareza o que o conselheiro precisa complementar.</p>
          <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ex.: incluir lista de presença e foto de todos os participantes." required />
          <div className={styles.warningBox}><i className="bx bx-shield-x" /><span>Se a entrega não for corrigida conforme solicitado, a Diretoria poderá aplicar penalidade à unidade.</span></div>
        </Modal>
      )}

      {recognition && (
        <Modal
          className={`${styles.modal} ${styles.notebookModal}`}
          title={recognition.titulo || `Caderno #${recognition.id}`}
          eyebrow="RECONHECIMENTO DE CADERNO"
          eyebrowClassName={styles.notebookModalEyebrow}
          subtitle={`${recognition.nomeUnidade || "Unidade"} · ${recognition.nomeConselheiro || "Conselheiro"}`}
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
  return <div className={styles.summary}><strong>{evidence.titulo || `Evidência #${evidence.id}`}</strong><span>Unidade {evidence.nomeUnidade || "não informada"} · {evidence.pontuacao || 0} pontos previstos</span></div>;
}

export default Evidencias;
