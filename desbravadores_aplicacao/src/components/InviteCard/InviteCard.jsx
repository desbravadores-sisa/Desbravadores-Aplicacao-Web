import styles from "./InviteCard.module.css";

function InviteCard({ invitation, currentTime, onRemove }) {
  if (!invitation) {
    return <p className={styles.emptyState}>Nenhum convite ativo.</p>;
  }

  const expirationDate = new Date(invitation.expiresAt);
  const hasExpirationDate = Number.isFinite(expirationDate.getTime());
  const isExpired = hasExpirationDate && expirationDate.getTime() <= currentTime;
  const roleClass = invitation.role === "Diretoria" ? styles.directorBadge : styles.counselorBadge;
  const formattedExpirationDate = hasExpirationDate
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(expirationDate)
    : "Data não informada";

  return (
    <article className={`${styles.inviteCard} ${isExpired ? styles.expiredCard : ""}`}>
      <button className={styles.closeInvite} type="button" aria-label={`Excluir convite de ${invitation.email}`} onClick={onRemove}>
        ×
      </button>
      <strong><i className="bx bx-envelope" /> {invitation.email}</strong>
      <div className={styles.inviteMeta}>
        <span className={`${styles.roleBadge} ${roleClass}`}>{invitation.role}</span>
        {invitation.role !== "Diretoria" && invitation.unit && <span className={styles.unitLabel}>{invitation.unit}</span>}
      </div>
      <time className={styles.inviteExpiration} dateTime={hasExpirationDate ? expirationDate.toISOString() : undefined}>
        {isExpired ? "Expirou em" : "Expira em"} {formattedExpirationDate}
      </time>
    </article>
  );
}

export default InviteCard;
