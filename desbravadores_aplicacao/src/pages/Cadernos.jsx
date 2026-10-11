import { useEffect, useState } from "react";
import NotebookCard from "../components/NotebookCard/NotebookCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import api from "../service/api";
import styles from "./Cadernos.module.css";

const CORES_GRUPO = ["orange", "blue", "green", "purple"];

function formatarData(dataIso) {
  if (!dataIso) return "—";
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function Cadernos() {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    async function carregarCadernos() {
      try {
        const { data, status } = await api.get("/cadernos/resumo");
        if (!ativo) return;

        const gruposMapeados = (status === 204 || !data ? [] : data).map((grupo, indice) => ({
          name: grupo.nomeGrupo ?? "Outros",
          subtitle: "",
          color: CORES_GRUPO[indice % CORES_GRUPO.length],
          items: (grupo.cadernos ?? []).map((caderno) => ({
            id: caderno.idCaderno,
            category: (grupo.nomeGrupo ?? "").toUpperCase(),
            name: caderno.nome,
            age: caderno.idadeAlvo,
            linkedMembers: caderno.totalVinculados,
            requirements: caderno.totalRequisitos,
            startDate: formatarData(caderno.dataInicio),
            endDate: formatarData(caderno.dataFim),
            status: caderno.status
          }))
        }));

        setGrupos(gruposMapeados);
      } catch (err) {
        if (!ativo) return;
        const status = err.response?.status;
        setErro(
          status === 403
            ? "Acesso restrito à diretoria."
            : "Não foi possível carregar os cadernos. Verifique se a API está no ar."
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarCadernos();
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <SectionHeader
          title="Cadernos"
          subtitle="Gerencie ciclos, membros e requisitos de cada caderno."
          buttonIcon={<i className="bx bx-plus" />}
          buttonText="Novo ciclo"
        />

        <div className={styles.tabs} role="tablist" aria-label="Visualização dos cadernos">
          <button type="button" className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
            Cadernos
          </button>
          <button type="button" className={styles.tab} role="tab" aria-selected="false">
            Membros
          </button>
        </div>

        {carregando && <p>Carregando cadernos...</p>}
        {erro && <p role="alert">{erro}</p>}
        {!carregando && !erro && grupos.length === 0 && (
          <p>Nenhum caderno cadastrado para o clube.</p>
        )}

        {!carregando && !erro && grupos.map((grupo) => (
          <section className={styles.section} key={grupo.name}>
            <div className={`${styles.sectionHeader} ${styles[grupo.color]}`}>
              <div>
                <h2 className={styles.sectionTitle}>{grupo.name}</h2>
                <p className={styles.sectionSubtitle}>{grupo.subtitle}</p>
              </div>
              <span className={styles.sectionCount}>{grupo.items.length} ciclos</span>
            </div>
            <div className={styles.grid}>
              {grupo.items.map((caderno) => (
                <NotebookCard key={caderno.id} {...caderno} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Cadernos;
