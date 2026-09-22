function InviteCard({ invitation, styles, onRemove }) {
  if (!invitation) {
    return <p className={styles.emptyState}>Nenhum convite ativo.</p>;
  }

  const inviteLink = `https://tigre-da-montanha.com/cadastro/convite/${invitation.email.split("@")[0]}`;

  function copyLink() {
    navigator.clipboard?.writeText(inviteLink);
  }

  return (
    <article className={styles.inviteCard}>
      <button className={styles.closeInvite} type="button" aria-label="Excluir convite" onClick={onRemove}>
        
      </button>
      <strong><i className="bx bx-envelope" /> {invitation.email}</strong>
      <span className={styles.inviteMeta}>
        <b>{invitation.role}</b> {invitation.unit}
      </span>
      <div className={styles.linkRow}>
        <i className="bx bx-link" />
        <span>{inviteLink}</span>
        <button type="button" onClick={copyLink}>
          <i className="bx bx-copy" /> Copiar
        </button>
      </div>
    </article>
  );
}

export default InviteCard;
