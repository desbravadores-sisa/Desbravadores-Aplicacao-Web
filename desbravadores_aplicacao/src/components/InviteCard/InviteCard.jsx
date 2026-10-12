import styles from "./InviteCard.module.css";

function InviteCard({ invitation, onRemove }) {
  if (!invitation) {
    return <p className={styles.emptyState}>Nenhum convite ativo.</p>;
  }

  // Link real de cadastro: o token vem da API (GET/POST /convites)
  const inviteLink = invitation.token ? `${window.location.origin}/cadastro?token=${invitation.token}` : null;
  const role = invitation.role ?? invitation.tipoConta;
  const unit = invitation.unit ?? invitation.nomeUnidade ?? "";

  function copyLink() {
    if (inviteLink) navigator.clipboard?.writeText(inviteLink);
  }

  return (
    <article className={styles.inviteCard}>
      <button className={styles.closeInvite} type="button" aria-label="Excluir convite" onClick={onRemove}>
        ×
      </button>
      <strong><i className="bx bx-envelope" /> {invitation.email}</strong>
      <span className={styles.inviteMeta}>
        <b>{role}</b> {unit}
      </span>
      {inviteLink && (
        <div className={styles.linkRow}>
          <i className="bx bx-link" />
          <span>{inviteLink}</span>
          <button type="button" onClick={copyLink}>
            <i className="bx bx-copy" /> Copiar
          </button>
        </div>
      )}
    </article>
  );
}

export default InviteCard;
