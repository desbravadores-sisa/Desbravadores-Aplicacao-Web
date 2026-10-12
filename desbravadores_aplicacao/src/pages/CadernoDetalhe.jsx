import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LinkPioneerModal from "../components/LinkPioneerModal/LinkPioneerModal";
import IndividualRequirements from "../components/IndividualRequirements/IndividualRequirements";
import LinkedPioneersTable from "../components/LinkedPioneersTable/LinkedPioneersTable";
import Modal from "../components/Modal/Modal";
import NotebookHeader from "../components/NotebookHeader/NotebookHeader";
import RequirementsModal from "../components/RequirementsModal/RequirementsModal";
import api from "../service/api";
import {
  formatDate,
  getAgeFromBirthDate,
  listaDaResposta,
  mapearGruposCadernos
} from "../service/cadernos";
import styles from "./CadernoDetalhe.module.css";

// Leituras auxiliares (progresso individual): se falharem, a tela continua sem o progresso.
function listaOpcional(promessa) {
  return promessa.then(listaDaResposta).catch(() => []);
}

function CadernoDetalhe() {
  const navigate = useNavigate();
  const { cadernoId } = useParams();
  const [detail, setDetail] = useState(null);
  const [erro, setErro] = useState(null);
  const [members, setMembers] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [progressByMember, setProgressByMember] = useState({});
  const [unlinkedIds, setUnlinkedIds] = useState([]);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedPioneerId, setSelectedPioneerId] = useState(null);

  const carregarRequisitos = useCallback(async (idCaderno) => {
    const tarefas = listaDaResposta(await api.get("/tarefas"));
    const vistos = new Set();
    const lista = tarefas
      .filter((tarefa) => tarefa.tipoTarefa === "CADERNO" && Number(tarefa.fkCaderno) === idCaderno)
      .filter((tarefa) => (vistos.has(tarefa.id) ? false : vistos.add(tarefa.id)))
      .map((tarefa) => ({
        id: tarefa.id,
        title: tarefa.titulo ?? "",
        description: tarefa.descricao ?? "",
        pontuacao: tarefa.pontuacao,
        prazoPadrao: tarefa.prazoPadrao
      }));
    setRequirements(lista);
    return lista;
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const idCaderno = Number(cadernoId);

    async function carregar() {
      try {
        const [perfil, resumo, unidades] = await Promise.all([
          api.get("/usuarios/perfil"),
          api.get("/cadernos/resumo"),
          api.get("/unidades/diretor").then(listaDaResposta).catch(() => [])
        ]);
        const notebook = mapearGruposCadernos(listaDaResposta(resumo))
          .flatMap((grupo) => grupo.items)
          .find((item) => item.id === idCaderno) ?? null;

        if (!isCurrent) return;
        if (!notebook) {
          setDetail({ cadernoId, notebook: null });
          return;
        }

        const [lista, desbravadores, execucoes, checklists] = await Promise.all([
          carregarRequisitos(idCaderno),
          api.get("/desbravadores", { params: { idClube: perfil.data?.idClube } }).then(listaDaResposta),
          listaOpcional(api.get("/execucoes-caderno")),
          listaOpcional(api.get("/checklists-caderno"))
        ]);
        if (!isCurrent) return;

        // Vínculo calculado por idade, como na view vw_resumo_cadernos (desbravadores ativos com a idade do caderno)
        const nomePorUnidade = Object.fromEntries(unidades.map((unidade) => [unidade.id, unidade.nome]));
        setMembers(desbravadores
          .filter((d) => d.ativo !== false && d.dataNascimento && getAgeFromBirthDate(d.dataNascimento) === notebook.age)
          .map((d) => ({
            id: d.id,
            name: d.nome,
            unit: nomePorUnidade[d.idUnidade] ?? "—",
            joinedAt: formatDate(d.dataAdmissao)
          })));

        // Progresso individual: checklist (desbravador concluiu a tarefa) → execução → tarefa (requisito)
        const idsRequisitos = new Set(lista.map((requisito) => requisito.id));
        const tarefaPorExecucao = Object.fromEntries(
          execucoes.filter((e) => idsRequisitos.has(e.idTarefa)).map((e) => [e.id, e.idTarefa])
        );
        const progresso = {};
        checklists.forEach((item) => {
          const idTarefa = tarefaPorExecucao[item.idExecucaoCaderno];
          if (!idTarefa || !item.concluiuTarefa) return;
          progresso[item.idDesbravador] = progresso[item.idDesbravador] || new Set();
          progresso[item.idDesbravador].add(idTarefa);
        });
        setProgressByMember(Object.fromEntries(
          Object.entries(progresso).map(([id, ids]) => [id, [...ids]])
        ));
        setDetail({ cadernoId, notebook });
      } catch (err) {
        if (!isCurrent) return;
        const status = err.response?.status;
        setErro(status === 403 ? "Acesso restrito à diretoria." : "Não foi possível carregar o caderno. Verifique se a API está no ar.");
        setDetail({ cadernoId, notebook: null });
      }
    }

    carregar();
    return () => {
      isCurrent = false;
    };
  }, [cadernoId, carregarRequisitos]);

  const loading = !detail || detail.cadernoId !== cadernoId;
  const notebook = loading ? null : detail.notebook;
  const requirementCount = notebook ? requirements.length : 0;
  const pioneers = notebook
    ? members.filter((member) => !unlinkedIds.includes(member.id)).map((member) => {
      const totalRequirements = requirementCount;
      const completedRequirementIds = (progressByMember[member.id] || [])
        .filter((id) => requirements.some((item) => item.id === id));
      const completedRequirements = Math.min(completedRequirementIds.length, totalRequirements);

      return {
        id: member.id,
        name: member.name,
        unit: member.unit,
        completedRequirementIds,
        inProgressRequirementIds: [],
        requirementObservations: {},
        progress: totalRequirements
          ? Math.round((completedRequirements / totalRequirements) * 100)
          : 0,
        completedRequirements,
        totalRequirements,
        status: totalRequirements > 0 && completedRequirements === totalRequirements
          ? "Concluído antecipadamente"
          : notebook.status === "Encerrado"
            ? "Encerrado"
            : "Ativo",
        linkedAt: member.joinedAt
      };
    })
    : [];
  const selectedPioneer = pioneers.find((pioneer) => pioneer.id === selectedPioneerId);
  // O vínculo é calculado pela idade: quem tem a idade do caderno já aparece vinculado.
  // Só voltam a ser elegíveis os desvinculados nesta tela (vínculo explícito ainda não existe na API).
  const eligiblePioneers = notebook
    ? members.filter((member) => unlinkedIds.includes(member.id))
    : [];

  async function saveRequirements(nextRequirements) {
    const idCaderno = Number(cadernoId);
    const originais = new Map(requirements.map((item) => [item.id, item]));
    const proximosIds = new Set(nextRequirements.map((item) => item.id));

    if (nextRequirements.some((item) => !item.title.trim())) {
      setErro("Todo requisito precisa de um título.");
      return;
    }

    try {
      const operacoes = [];
      requirements
        .filter((item) => !proximosIds.has(item.id))
        .forEach((item) => operacoes.push(api.delete(`/tarefas/${item.id}`)));
      nextRequirements.forEach((item) => {
        const original = originais.get(item.id);
        if (!original) {
          operacoes.push(api.post("/tarefas", {
            titulo: item.title.trim(),
            descricao: item.description,
            tipoTarefa: "CADERNO",
            fkCaderno: idCaderno,
            pontuacao: 0
          }));
        } else if (original.title !== item.title || original.description !== item.description) {
          operacoes.push(api.put(`/tarefas/${item.id}`, {
            titulo: item.title.trim(),
            descricao: item.description,
            pontuacao: original.pontuacao ?? 0,
            prazoPadrao: original.prazoPadrao ?? null
          }));
        }
      });
      await Promise.all(operacoes);
      setErro(null);
    } catch (err) {
      const status = err.response?.status;
      setErro(status === 403 ? "Acesso restrito à diretoria." : "Não foi possível salvar todos os requisitos. A lista foi recarregada.");
    }
    await carregarRequisitos(idCaderno).catch(() => {});
    setIsRequirementsModalOpen(false);
  }

  function linkPioneer(pioneer) {
    setUnlinkedIds((current) => current.filter((id) => id !== pioneer.id));
  }

  function confirmAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.type === "unlink") {
      setUnlinkedIds((current) => [...current, confirmation.pioneer.id]);
    } else if (confirmation.type === "requirement") {
      confirmation.onConfirm();
    }

    setConfirmation(null);
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <button
          className={styles.backLink}
          type="button"
          onClick={() => {
            if (selectedPioneer) {
              setSelectedPioneerId(null);
            } else {
              navigate("/cadernos");
            }
          }}
        >
          <i className="bx bx-arrow-back" aria-hidden="true" />
          {selectedPioneer ? "Voltar ao caderno" : "Voltar aos cadernos"}
        </button>

        {erro && <p className={styles.message} role="alert">{erro}</p>}

        {loading ? (
          <p className={styles.message} role="status">Carregando caderno...</p>
        ) : notebook ? (
          selectedPioneer ? (
            <IndividualRequirements
              pioneer={selectedPioneer}
              notebookName={notebook.name}
              requirements={requirements}
              onClose={() => setSelectedPioneerId(null)}
            />
          ) : (
            <div className={styles.detailSurface}>
              <NotebookHeader
                notebook={notebook}
                linkedCount={pioneers.length}
                requirementCount={requirementCount}
                onOpenRequirements={() => setIsRequirementsModalOpen(true)}
                onLinkPioneer={() => setIsLinkModalOpen(true)}
              />
              <LinkedPioneersTable
                pioneers={pioneers}
                onView={(pioneer) => setSelectedPioneerId(pioneer.id)}
                onUnlink={(pioneer) => setConfirmation({ type: "unlink", pioneer })}
              />
            </div>
          )
        ) : !erro && (
          <section className={styles.message} role="alert">
            <h1>Caderno não encontrado</h1>
            <p>O caderno solicitado não existe ou não está disponível.</p>
          </section>
        )}
      </div>

      {notebook && isLinkModalOpen && (
        <LinkPioneerModal
          age={notebook.age}
          pioneers={eligiblePioneers}
          onLinkPioneer={linkPioneer}
          onClose={() => setIsLinkModalOpen(false)}
        />
      )}

      {notebook && isRequirementsModalOpen && (
        <RequirementsModal
          notebookName={notebook.name}
          requirements={requirements}
          onSave={saveRequirements}
          onDeleteRequest={(requirement, onConfirm) => {
            setConfirmation({ type: "requirement", requirement, onConfirm });
          }}
          onClose={() => setIsRequirementsModalOpen(false)}
        />
      )}

      {confirmation && notebook && (
        <Modal
          stacked
          className={styles.confirmModal}
          title={confirmation.type === "unlink" ? "Desvincular desbravador" : "Excluir requisito"}
          labelledBy="detail-confirmation-title"
          headerClassName={styles.confirmHeader}
          bodyClassName={styles.confirmBody}
          footerClassName={styles.confirmFooter}
          footer={
            <>
              <button type="button" onClick={() => setConfirmation(null)}>Cancelar</button>
              <button className={styles.confirmDanger} type="button" onClick={confirmAction}>
                {confirmation.type === "unlink" ? "Desvincular" : "Excluir"}
              </button>
            </>
          }
          onClose={() => setConfirmation(null)}
        >
          {confirmation.type === "unlink" ? (
            <p>
              Deseja remover este desbravador do ciclo <strong>{notebook.name}</strong>?
            </p>
          ) : (
            <p>
              Deseja excluir o requisito <strong>{confirmation.requirement.title || "sem título"}</strong>?
            </p>
          )}
        </Modal>
      )}
    </main>
  );
}

export default CadernoDetalhe;
