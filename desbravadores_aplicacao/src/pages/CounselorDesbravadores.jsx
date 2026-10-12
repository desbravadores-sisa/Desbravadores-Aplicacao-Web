import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { marcarCheckin } from "../service/api";
import styles from "./CounselorDesbravadores.module.css";

// Tela original de Nathan (feature/nathan, ecf0bec), ligada à API:
// GET /desbravadores/minha-unidade e GET /desbravadores/{id}/requisitos; "Marcar como cumprido"
// usa o mesmo check-in do Kanban (PUT /tarefas/{idTarefa}/checkin/{idDesbravador}).

const iniciais = (nome) => nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

function cadernoPrincipal(cadernos) {
  return cadernos.find((c) => !c.dataConclusao) ?? cadernos[cadernos.length - 1] ?? null;
}

function CounselorDesbravadores() {
  const navigate = useNavigate();
  const [lista, setLista] = useState([]);
  const [estado, setEstado] = useState("loading");
  const [erro, setErro] = useState("");
  const [detalhe, setDetalhe] = useState(null);
  const [salvando, setSalvando] = useState(null);

  const carregarLista = useCallback(async () => {
    try {
      const { data, status } = await api.get("/desbravadores/minha-unidade");
      setLista(status === 204 || !Array.isArray(data) ? [] : data);
      setEstado("ready");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        navigate("/", { replace: true });
        return;
      }
      setErro(status === 403 ? "Esta tela é exclusiva do conselheiro."
        : status === 404 ? "Sua conta ainda não está vinculada a uma unidade."
          : "Não foi possível carregar os desbravadores da sua unidade.");
      setEstado("error");
    }
  }, [navigate]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  async function abrir(id) {
    try {
      setErro("");
      const { data } = await api.get(`/desbravadores/${id}/requisitos`);
      setDetalhe(data);
    } catch (err) {
      setErro(err.response?.data?.message || "Não foi possível carregar os requisitos.");
    }
  }

  async function alternar(requisito) {
    try {
      setSalvando(requisito.idTarefa);
      setErro("");
      await marcarCheckin(requisito.idTarefa, detalhe.idDesbravador, !requisito.concluido);
      await abrir(detalhe.idDesbravador);
      carregarLista();
    } catch (err) {
      setErro(err.response?.data?.message || "Não foi possível atualizar o requisito.");
    } finally {
      setSalvando(null);
    }
  }

  if (estado === "loading") return <main className={styles.page}><p className={styles.feedback}>Carregando desbravadores...</p></main>;
  if (estado === "error") return <main className={styles.page}><p className={styles.feedback}>{erro}</p></main>;

  if (detalhe) {
    return (
      <main className={styles.page}>
        <div className={styles.content}>
          <button className={styles.backButton} type="button" onClick={() => setDetalhe(null)}>
            <i className="bx bx-arrow-back" /> Voltar à minha unidade
          </button>
          {erro && <p className={styles.warning} role="alert">{erro}</p>}
          <section className={styles.detailCard}>
            <header className={styles.detailHeader}>
              <div className={styles.identity}>
                <span className={styles.avatar}>{iniciais(detalhe.nome)}</span>
                <div><small>REQUISITOS INDIVIDUAIS</small><h1>{detalhe.nome}</h1></div>
              </div>
              <button className={styles.closeButton} type="button" onClick={() => setDetalhe(null)}>
                <i className="bx bx-x" /> Fechar
              </button>
            </header>
            {detalhe.cadernos.length === 0 && (
              <p className={styles.feedback}>Este desbravador ainda não foi vinculado a um caderno pela Diretoria.</p>
            )}
            {detalhe.cadernos.map((caderno) => {
              const feitos = caderno.requisitos.filter((r) => r.concluido).length;
              const total = caderno.requisitos.length;
              const pct = total ? Math.round((feitos / total) * 100) : 0;
              return (
                <div key={caderno.idCaderno} className={styles.cadernoBlock}>
                  <div className={styles.cadernoTitle}>
                    <h2>Caderno {caderno.nome}</h2>
                    {caderno.dataConclusao && <span className={styles.concludedTag}>Concluído</span>}
                  </div>
                  <div className={styles.progressBox}>
                    <div>
                      <strong>{feitos} de {total} requisitos concluídos</strong>
                      <p>Acompanhe o progresso individual; isto não gera penalidade para o conselheiro.</p>
                    </div>
                    <div className={styles.progressValue}>
                      <div><span className={pct === 100 ? styles.full : ""} style={{ width: `${pct}%` }} /></div>
                      <b>{pct}%</b>
                    </div>
                  </div>
                  <div className={styles.requirements}>
                    {caderno.requisitos.map((r, i) => (
                      <article className={styles.requirement} key={r.idTarefa}>
                        <span className={styles.requirementNumber}>{i + 1}</span>
                        <div className={styles.requirementText}>
                          <strong>{r.titulo}</strong>
                          {r.descricao && <p>{r.descricao}</p>}
                        </div>
                        <div className={styles.requirementStatus}>
                          <span className={r.concluido ? styles.completed : styles.notStarted}>
                            {r.concluido ? "Concluído" : "Não iniciado"}
                          </span>
                          {r.checkinDisponivel ? (
                            <button type="button" disabled={salvando === r.idTarefa} onClick={() => alternar(r)}>
                              {r.concluido ? "Desmarcar" : "Marcar cumprido"}
                            </button>
                          ) : (
                            <span className={styles.muted}>{r.concluido ? "" : "Ainda não está no quadro"}</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <header className={styles.heading}>
          <div>
            <small>MINHA UNIDADE</small>
            <h1>Desbravadores</h1>
            <p>Acompanhe os requisitos individuais dos seus desbravadores.</p>
          </div>
        </header>
        {erro && <p className={styles.warning} role="alert">{erro}</p>}
        {lista.length === 0 && <p className={styles.feedback}>Nenhum desbravador ativo na sua unidade.</p>}
        <div className={styles.childrenGrid}>
          {lista.map((crianca) => {
            const caderno = cadernoPrincipal(crianca.cadernos);
            const pct = caderno && caderno.totalRequisitos
              ? Math.round((caderno.requisitosConcluidos / caderno.totalRequisitos) * 100) : 0;
            return (
              <article className={styles.childCard} key={crianca.id}>
                <div className={styles.childIdentity}>
                  <span className={styles.avatar}>{iniciais(crianca.nome)}</span>
                  <div>
                    <strong>{crianca.nome}</strong>
                    <span>{caderno ? `${caderno.nome}${caderno.dataConclusao ? " · concluído" : ""}` : "Sem caderno vinculado"}</span>
                  </div>
                </div>
                {caderno && (
                  <div className={styles.childProgress}>
                    <div><span style={{ width: `${pct}%` }} /></div>
                    {caderno.requisitosConcluidos}/{caderno.totalRequisitos}
                  </div>
                )}
                <button type="button" onClick={() => abrir(crianca.id)}>Ver requisitos</button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default CounselorDesbravadores;
