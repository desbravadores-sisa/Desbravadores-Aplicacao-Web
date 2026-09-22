function UserCard({ user, styles, onRemove }) {
  const badgeClass = user.role === "Diretoria" ? `${styles.badge} ${styles.director}` : styles.badge;

  return (
    <article className={styles.userCard}>
      <div className={styles.avatar}>{user.initial}</div>
      <div className={styles.userInfo}>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
      <div className={styles.userRole}>
        <span className={badgeClass}>
          <i className="bx bx-shield-quarter" /> {user.role}
        </span>
        <small>{user.unit}</small>
      </div>
      <button
        className={styles.deleteButton}
        type="button"
        aria-label={`Remover ${user.name}`}
        onClick={() => onRemove(user.name)}
      >
        <i className="bx bx-trash" />
      </button>
    </article>
  );
}

export default UserCard;
