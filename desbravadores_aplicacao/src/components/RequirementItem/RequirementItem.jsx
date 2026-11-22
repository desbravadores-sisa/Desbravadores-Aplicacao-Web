import styles from "./RequirementItem.module.css";
import modalStyles from "../Modal/Modal.module.css";

/**
 * @param {{
 *   requirement: { id: string, title: string, description: string },
 *   titleError?: string,
 *   onChange: (id: string, field: "title" | "description", value: string) => void,
 *   onDelete: (requirement: { id: string, title: string, description: string }) => void
 * }} props
 */
function RequirementItem({ requirement, titleError, onChange, onDelete }) {
  const titleId = `requirement-title-${requirement.id}`;
  const descriptionId = `requirement-description-${requirement.id}`;

  return (
    <article className={styles.card} data-requirement-id={requirement.id}>
      <div className={styles.heading}>
        <label className={styles.visuallyHidden} htmlFor={titleId}>Título do requisito</label>
        <div className={styles.titleField}>
          <input
            id={titleId}
            className={styles.title}
            value={requirement.title}
            onChange={(event) => onChange(requirement.id, "title", event.target.value)}
            placeholder="Título do requisito"
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? `${titleId}-error` : undefined}
          />
          {titleError && <span id={`${titleId}-error`} className={modalStyles.fieldError} role="alert">{titleError}</span>}
        </div>
        <button
          className={styles.deleteButton}
          type="button"
          aria-label={`Excluir requisito ${requirement.title || "sem título"}`}
          onClick={() => onDelete(requirement)}
        >
          <i className="bx bx-trash" aria-hidden="true" />
        </button>
      </div>
      <label className={styles.visuallyHidden} htmlFor={descriptionId}>Descrição do requisito</label>
      <textarea
        id={descriptionId}
        className={styles.description}
        value={requirement.description}
        onChange={(event) => onChange(requirement.id, "description", event.target.value)}
        placeholder="Descreva este requisito."
        rows={2}
      />
    </article>
  );
}

export default RequirementItem;
