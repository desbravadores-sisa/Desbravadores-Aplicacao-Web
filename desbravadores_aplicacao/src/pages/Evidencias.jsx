import { useState } from "react";
import styles from "./Evidencias.module.css";

const initialEvidences = [
  {
    id: 1,
    title: "Campori Regional - Preparação",
    unit: "Tigresas",
    leader: "Carlos Silva",
    points: 300,
    description: "Todos os documentos e autorizações foram coletados e organizados",
    files: [
      { name: "autorizacoes_pais.pdf", size: "239.3 KB", type: "pdf" },
      { name: "lista_equipamentos.xlsx", size: "86.9 KB", type: "sheet" }
    ]
  },
  {
    id: 2,
    title: "Noite de Talentos",
    unit: "Leões",
    leader: "Pedro Costa",
    points: 120,
    description: "Evento realizado com sucesso. Tivemos 15 apresentações e excelente presença dos pais.",
    files: [
      { name: "fotos_noite_talentos.jpg", size: "2050.8 KB", type: "image" },
      { name: "lista_participantes.pdf", size: "92.8 KB", type: "pdf" }
    ]
  }
];

function Evidencias() {
  const [evidences, setEvidences] = useState(initialEvidences);
  const [activeTab, setActiveTab] = useState("activities");
  const [modal, setModal] = useState(null);
  const [points, setPoints] = useState(300);
  const [comment, setComment] = useState("");

  function openModal(type, evidence) {
    setModal({ type, evidence });
    setPoints(evidence.points);
    setComment("");
  }

  function closeModal() {
    setModal(null);
  }

  function approveEvidence(event) {
    event.preventDefault();
    setEvidences((current) => current.map((item) => (
      item.id === modal.evidence.id ? { ...item, points: Number(points) || 0 } : item
    )));
    closeModal();
  }

  function requestCorrection(event) {
    event.preventDefault();
    closeModal();
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <h1>Evidências e Reconhecimentos</h1>
        <p>Revise evidências de atividades e reconheça pontos de cadernos concluídos pelos desbravadores.</p>
      </header>

      <div className={styles.tabs} role="tablist">
        <button className={activeTab === "activities" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("activities")}>
          Evidências de Atividades <span>4</span>
        </button>
        <button className={activeTab === "notebooks" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("notebooks")}>
          <i className="bx bx-book-open" /> Reconhecimento de Cadernos <span className={styles.grayCount}>3</span>
        </button>
      </div>

      {activeTab === "activities" ? evidences.map((evidence) => (
        <article className={styles.evidenceCard} key={evidence.id}>
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
              <button className={styles.approveButton} type="button" onClick={() => openModal("approve", evidence)}><i className="bx bx-check-circle" /> Analisar e aprovar</button>
              <button className={styles.correctionButton} type="button" onClick={() => openModal("correction", evidence)}><i className="bx bx-x-circle" /> Solicitar correção</button>
            </div>
          </div>

          <p className={styles.description}>{evidence.description}</p>
          <div className={styles.fileDivider} />
          <h3>Arquivos enviados ({evidence.files.length})</h3>
          <div className={styles.files}>
            {evidence.files.map((file) => (
              <div className={styles.file} key={file.name}>
                <i className={`bx ${file.type === "image" ? "bx-image" : file.type === "sheet" ? "bx-spreadsheet" : "bx-file-blank"}`} />
                <div><strong>{file.name}</strong><span>{file.size}</span></div>
              </div>
            ))}
          </div>
        </article>
      )) : (
        <div className={styles.emptyTab}>Nenhum reconhecimento de caderno pendente.</div>
      )}

      {modal?.type === "approve" && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <form className={styles.modal} onSubmit={approveEvidence}>
            <div className={styles.modalHeader}><div><small>DECISÃO DA DIRETORIA</small><h2>Aprovar evidência</h2></div><button type="button" aria-label="Fechar" onClick={closeModal}>×</button></div>
            <div className={styles.modalBody}>
              <EvidenceSummary evidence={modal.evidence} styles={styles} />
              <label htmlFor="points">Pontos a conceder</label>
              <p className={styles.helper}>A Diretoria pode manter ou ajustar a pontuação conforme a qualidade da entrega.</p>
              <div className={styles.pointsInput}><input id="points" type="number" min="0" value={points} onChange={(event) => setPoints(event.target.value)} /><span>pts</span></div>
              <div className={styles.infoBox}><i className="bx bx-edit-alt" /><span>Este valor entra na pontuação líquida da unidade e atualiza o ranking imediatamente.</span></div>
            </div>
            <div className={styles.modalFooter}><button type="button" onClick={closeModal}>Cancelar</button><button className={styles.approveButton} type="submit"><i className="bx bx-check-circle" /> Conceder {points || 0} pts</button></div>
          </form>
        </div>
      )}

      {modal?.type === "correction" && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <form className={styles.modal} onSubmit={requestCorrection}>
            <div className={styles.modalHeader}><div><small>DECISÃO DA DIRETORIA</small><h2>Solicitar correção</h2></div><button type="button" aria-label="Fechar" onClick={closeModal}>×</button></div>
            <div className={styles.modalBody}>
              <EvidenceSummary evidence={modal.evidence} styles={styles} />
              <label htmlFor="comment">Motivo da solicitação de correção <b>*</b></label>
              <p className={styles.helper}>Explique com clareza o que o conselheiro precisa complementar.</p>
              <textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ex.: incluir lista de presença e foto de todos os participantes." required />
              <div className={styles.warningBox}><i className="bx bx-shield-x" /><span>Se a entrega não for corrigida conforme solicitado, a Diretoria poderá aplicar penalidade à unidade.</span></div>
            </div>
            <div className={styles.modalFooter}><button type="button" onClick={closeModal}>Cancelar</button><button className={styles.correctionButton} type="submit" disabled={!comment.trim()}><i className="bx bx-chevron-right" /> Enviar para correção</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

function EvidenceSummary({ evidence, styles }) {
  return <div className={styles.summary}><strong>{evidence.title}</strong><span>Unidade {evidence.unit} · {evidence.points} pontos previstos</span></div>;
}

export default Evidencias;