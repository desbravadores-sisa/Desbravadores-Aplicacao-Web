import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LinkPioneerModal from "../components/LinkPioneerModal/LinkPioneerModal";
import IndividualRequirements from "../components/IndividualRequirements/IndividualRequirements";
import LinkedPioneersTable from "../components/LinkedPioneersTable/LinkedPioneersTable";
import Modal from "../components/Modal/Modal";
import NotebookHeader from "../components/NotebookHeader/NotebookHeader";
import RequirementsModal from "../components/RequirementsModal/RequirementsModal";
import {
  getMembersForNotebook,
  getRequirementsForNotebook,
  initialCadernos,
  initialMembers
} from "../data/cadernos";
import styles from "./CadernoDetalhe.module.css";

function CadernoDetalhe() {
  const navigate = useNavigate();
  const { cadernoId } = useParams();
  const [detail, setDetail] = useState(null);
  const [members, setMembers] = useState(initialMembers);
  const [requirementsByNotebook, setRequirementsByNotebook] = useState(() => (
    Object.fromEntries(initialCadernos.map((notebook) => [
      notebook.id,
      getRequirementsForNotebook(notebook.id)
    ]))
  ));
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [selectedPioneerId, setSelectedPioneerId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    Promise.resolve().then(() => {
      const notebook = initialCadernos.find((item) => item.id === cadernoId);

      if (!isCurrent) {
        return;
      }

      if (!notebook) {
        setDetail({ cadernoId, notebook: null });
        return;
      }

      setDetail({ cadernoId, notebook });
    });

    return () => {
      isCurrent = false;
    };
  }, [cadernoId]);
  const loading = !detail || detail.cadernoId !== cadernoId;
  const notebook = loading ? null : detail.notebook;
  const requirements = requirementsByNotebook[cadernoId] || [];
  const requirementCount = notebook ? requirements.length : 0;
  const pioneers = notebook
    ? getMembersForNotebook(notebook, members).map((member) => {
      const totalRequirements = requirementCount;
      const completedRequirementIds = member.completedRequirementIds
        ? member.completedRequirementIds.filter((id) => requirements.some((item) => item.id === id))
        : requirements
          .slice(0, Math.max(0, member.completedRequirements ?? 0))
          .map((requirement) => requirement.id);
      const completedRequirements = Math.min(
        completedRequirementIds.length,
        totalRequirements
      );
      const inProgressRequirementIds = (member.inProgressRequirementIds || [])
        .filter((id) => requirements.some((item) => item.id === id)
          && !completedRequirementIds.includes(id));

      return {
        id: member.id,
        name: member.name,
        unit: member.unit,
        completedRequirementIds,
        inProgressRequirementIds,
        requirementObservations: member.requirementObservations || {},
        progress: totalRequirements
          ? Math.round((completedRequirements / totalRequirements) * 100)
          : 0,
        completedRequirements,
        totalRequirements,
        status: completedRequirements === totalRequirements
          && member.completedNotebooks?.includes(notebook.id)
          ? "Concluído antecipadamente"
          : notebook.status === "Encerrado"
            ? "Encerrado"
            : "Ativo",
        linkedAt: member.joinedAt
      };
    })
    : [];
  const selectedPioneer = pioneers.find((pioneer) => pioneer.id === selectedPioneerId);
  const eligiblePioneers = notebook
    ? members.filter((member) => member.age === notebook.age && !member.cadernoId)
    : [];

  function saveRequirements(nextRequirements) {
    setRequirementsByNotebook((current) => ({
      ...current,
      [cadernoId]: nextRequirements
    }));
    setIsRequirementsModalOpen(false);
  }

  function linkPioneer(pioneer) {
    setMembers((current) => current.map((member) => (
      member.id === pioneer.id
        ? {
          ...member,
          cadernoId,
          joinedAt: new Intl.DateTimeFormat("pt-BR").format(new Date()),
          completedRequirements: 0
        }
        : member
    )));
  }

  function confirmAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.type === "unlink") {
      setMembers((current) => current.map((member) => (
        member.id === confirmation.pioneer.id
          ? { ...member, cadernoId: null }
          : member
      )));
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
        ) : (
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
