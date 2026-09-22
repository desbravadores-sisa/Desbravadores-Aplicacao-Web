function CreateInviteModal({ form, styles, onChange, onRoleChange, onSubmit, onClose }) {
  const roles = [
    ["Conselheiro", "Gerencia uma unidade no Kanban"],
    ["Diretoria", "Acesso completo ao sistema"]
  ];

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={styles.modal} onSubmit={onSubmit}>
        <div className={styles.modalHeader}>
          <h2>Criar Convite</h2>
          <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="usuario@email.com"
            value={form.email}
            onChange={onChange}
            required
          />

          <label>Função</label>
          <div className={styles.roleOptions}>
            {roles.map(([role, description]) => (
              <button
                key={role}
                type="button"
                className={form.role === role ? styles.roleSelected : ""}
                onClick={() => onRoleChange(role)}
              >
                <strong>{role}</strong>
                <small>{description}</small>
              </button>
            ))}
          </div>

          {form.role === "Conselheiro" && (
            <>
              <label htmlFor="unit">Unidade vinculada</label>
              <select id="unit" name="unit" value={form.unit} onChange={onChange} required>
                <option value="">Selecione uma unidade</option>
                <option>Leões</option>
                <option>Tigresas</option>
                <option>Onças</option>
                <option>Panteras</option>
              </select>
            </>
          )}

          <div className={styles.howItWorks}>
            <i className="bx bx-link" />
            <div>
              <strong>Como funciona</strong>
              <span>
                • Um link único de cadastro será gerado<br />
                • Compartilhe o link com a pessoa convidada<br />
                • Cada link pode ser usado apenas uma vez<br />
                • Você pode excluir um convite a qualquer momento
              </span>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.generateButton} type="submit">Gerar Link</button>
        </div>
      </form>
    </div>
  );
}

export default CreateInviteModal;
