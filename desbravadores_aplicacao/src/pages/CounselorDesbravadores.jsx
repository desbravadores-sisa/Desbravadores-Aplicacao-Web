import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CounselorDesbravadores.module.css";

const desbravadores = [
  { id: 1, nome: "Marina Costa", initials: "MC", caderno: "Amigo", concluido: 1, total: 6, requisitos: [{ nome: "Identidade do desbravador", descricao: "Conhecer a história e os valores do movimento Desbravadores.", status: "Concluído", observacao: "Apresentou trabalho sobre história dos Desbravadores." }, { nome: "Vida na natureza", descricao: "Realizar trilha orientada e registrar fauna e flora observadas.", status: "Em andamento" }, { nome: "Hábitos saudáveis", descricao: "Participar do desafio de saúde por 30 dias consecutivos.", status: "Não iniciado" }, { nome: "Serviço à comunidade", descricao: "Participar de uma ação de serviço comunitário organizada pela unidade.", status: "Não iniciado" }, { nome: "Habilidade prática", descricao: "Desenvolver uma especialidade básica com orientação do conselheiro.", status: "Não iniciado" }, { nome: "Devocional", descricao: "Conduzir o devocional da unidade por uma semana inteira.", status: "Não iniciado" }] },
  { id: 2, nome: "Ana Clara", initials: "AC", caderno: "Companheiro", concluido: 3, total: 7, requisitos: [] },
  { id: 3, nome: "Sofia Martins", initials: "SM", caderno: "Companheiro", concluido: 2, total: 7, requisitos: [] },
  { id: 4, nome: "Helena Lima", initials: "HL", caderno: "Pesquisador", concluido: 4, total: 6, requisitos: [] },
  { id: 5, nome: "Beatriz Santos", initials: "BS", caderno: "Pesquisador", concluido: 1, total: 6, requisitos: [] },
  { id: 6, nome: "Vitória Ferraz", initials: "VF", caderno: "Guia", concluido: 5, total: 6, requisitos: [] }
];

function CounselorDesbravadores() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("desbravadores.user")) || {}; } catch { return {}; }
  });
  const isMock = import.meta.env.VITE_MOCK_KANBAN === "true";

  if (String(user.tipoConta || "").toLowerCase() !== "conselheiro" && !isMock) {
    navigate("/", { replace: true });
    return null;
  }

  const selected = desbravadores.find((item) => item.id === selectedId);
  if (selected) {
    const percentage = Math.round((selected.concluido / selected.total) * 100);
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <button className={styles.backButton} type="button" onClick={() => setSelectedId(null)}><i className="bx bx-arrow-back" /> Voltar à minha unidade</button>
          <section className={styles.detailCard}>
            <header className={styles.detailHeader}><div className={styles.identity}><span className={styles.avatar}>{selected.initials}</span><div><small>REQUISITOS INDIVIDUAIS</small><h1>{selected.nome} - {selected.caderno}</h1></div></div><button className={styles.closeButton} type="button" onClick={() => setSelectedId(null)}><i className="bx bx-x" /> Fechar</button></header>
            <div className={styles.progressBox}><div><strong>{selected.concluido} de {selected.total} requisitos concluídos</strong><p>Acompanhe o progresso individual; isto não gera penalidade para o conselheiro.</p></div><div className={styles.progressValue}><div><span style={{ width: `${percentage}%` }} /></div><b>{percentage}%</b></div></div>
            <div className={styles.requirements}>{selected.requisitos.map((requirement, index) => <Requirement key={requirement.nome} requirement={requirement} index={index + 1} />)}</div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.heading}><div><small>MINHA UNIDADE</small><h1>Desbravadores</h1><p>Acompanhe os requisitos individuais dos seus desbravadores.</p></div></header>
        <div className={styles.childrenGrid}>{desbravadores.map((child) => <article className={styles.childCard} key={child.id}><div className={styles.childIdentity}><span className={styles.avatar}>{child.initials}</span><div><strong>{child.nome}</strong><span>{child.caderno}</span></div></div><button type="button" onClick={() => setSelectedId(child.id)}>Ver requisitos</button></article>)}</div>
      </div>
    </main>
  );
}

function Requirement({ requirement, index }) {
  const statusClass = requirement.status === "Concluído" ? styles.completed : requirement.status === "Em andamento" ? styles.inProgress : styles.notStarted;
  return <article className={styles.requirement}><span className={styles.requirementNumber}>{index}</span><div className={styles.requirementText}><strong>{requirement.nome}</strong><p>{requirement.descricao}</p>{requirement.observacao && <span className={styles.observation}><i className="bx bx-link" /> Observação: {requirement.observacao}</span>}</div><div className={styles.requirementStatus}><span className={statusClass}>{requirement.status}</span>{requirement.status !== "Concluído" && <button type="button">Atualizar</button>}</div></article>;
}

export default CounselorDesbravadores;
