import { useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import RequirementItem from "../RequirementItem/RequirementItem";
import styles from "./RequirementsModal.module.css";

/**
 * @param {{
 *   notebookName: string,
 *   requirements: Array<{ id: string, title: string, description: string }>,
 *   onSave: (requirements: Array<{ id: string, title: string, description: string }>) => void,
 *   onDeleteRequest: (requirement: { id: string, title: string, description: string }, onConfirm: () => void) => void,
 *   onClose: () => void
 * }} props
 */
function RequirementsModal({
  notebookName,
  requirements,
  onSave,
  onDeleteRequest,
  onClose
}) {
  const [draftRequirements, setDraftRequirements] = useState(requirements);
  const listRef = useRef(null);
  const previousCount = useRef(draftRequirements.length);

  useEffect(() => {
    if (draftRequirements.length > previousCount.current) {
      listRef.current?.lastElementChild?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
    previousCount.current = draftRequirements.length;
  }, [draftRequirements.length]);

  function changeRequirement(id, field, value) {
    setDraftRequirements((current) => current.map((requirement) => (
      requirement.id === id ? { ...requirement, [field]: value } : requirement
    )));
  }

  function addRequirement() {
    setDraftRequirements((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        title: "Novo requisito",
        description: ""
      }
    ]);
  }

  function requestDelete(requirement) {
    onDeleteRequest(requirement, () => {
      setDraftRequirements((current) => current.filter((item) => item.id !== requirement.id));
    });
  }

  function saveRequirements(event) {
    event.preventDefault();
    onSave(draftRequirements);
  }

  return (
    <Modal
      className={styles.modal}
      title={`Requisitos · ${notebookName}`}
      subtitle={`Estes requisitos pertencem somente ao caderno ${notebookName}.`}
      labelledBy="requirements-modal-title"
      headerClassName={styles.header}
      subtitleClassName={styles.subtitle}
      bodyClassName={styles.body}
      footerClassName={styles.footer}
      footer={
        <button className={styles.saveButton} type="button" onClick={saveRequirements}>
          Concluir alterações
        </button>
      }
      onClose={onClose}
    >
      <div className={styles.list} ref={listRef}>
        {draftRequirements.map((requirement) => (
          <RequirementItem
            key={requirement.id}
            requirement={requirement}
            onChange={changeRequirement}
            onDelete={requestDelete}
          />
        ))}
      </div>
      <button className={styles.addButton} type="button" onClick={addRequirement}>
        <i className="bx bx-plus" aria-hidden="true" />
        Adicionar requisito
      </button>
    </Modal>
  );
}

export default RequirementsModal;
