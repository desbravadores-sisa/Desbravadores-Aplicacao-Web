import styles from "./AddUnitModal.module.css";

function AddUnitModal({ form, onChange, onSubmit, onClose }) {
  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.modalHeader}>
          <h2>Adicionar Unidade</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <label htmlFor="unit-name">
            Nome da Unidade <span>*</span>
          </label>
          <input
            id="unit-name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            placeholder="Ex: Tigres, Águias, Falcões..."
            required
          />

          <label htmlFor="leader-name">Nome do Conselheiro (opcional)</label>
          <input
            id="leader-name"
            name="leader"
            type="text"
            value={form.leader}
            onChange={onChange}
            placeholder="Será definido ao aceitar o convite"
          />

          <div className={styles.infoBox}>
            Vinculação a cadernos: Os cadernos são globais — basta cadastrar os desbravadores da unidade e vinculá-los aos ciclos ativos de acordo com a faixa etária.
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton}>
            Criar Unidade
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUnitModal;
