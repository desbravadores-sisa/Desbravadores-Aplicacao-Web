import styles from "./RequirementItem.module.css";

/**
 * @param {{
 *   requirement: { id: string, title: string, description: string },
 *   onChange: (id: string, field: "title" | "description", value: string) => void,
 *   onDelete: (requirement: { id: string, title: string, description: string }) => void
 * }} props
 */
function RequirementItem({ requirement, onChange, onDelete }) {
  const titleId = `requirement-title-${requirement.id}`;
  const descriptionId = `requirement-description-${requirement.id}`;

  return (
    <article className={styles.card} data-requirement-id={requirement.id}>
      <div className={styles.heading}>
        <label className={styles.visuallyHidden} htmlFor={titleId}>Título do requisito</label>
        <input
          id={titleId}
          className={styles.title}
          value={requirement.title}
          onChange={(event) => onChange(requirement.id, "title", event.target.value)}
          placeholder="Título do requisito"
        />
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
