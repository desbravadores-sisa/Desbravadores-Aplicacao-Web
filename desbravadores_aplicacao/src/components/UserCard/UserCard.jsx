import { useState } from "react";
import styles from "./UserCard.module.css";

function UserCard({ user, onRemove, canDeactivate = true }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(user.fotoUrl && !photoFailed);
  const badgeClass = user.role === "Diretoria" ? `${styles.badge} ${styles.director}` : styles.badge;

  return (
    <article className={styles.userCard}>
      <div className={`${styles.avatar} ${hasPhoto ? styles.avatarWithPhoto : ""}`}>
        {hasPhoto
          ? <img
              className={styles.avatarImage}
              src={user.fotoUrl}
              alt={`Foto de ${user.name}`}
              crossOrigin="use-credentials"
              onError={() => setPhotoFailed(true)}
            />
          : user.initial}
      </div>
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
      {canDeactivate && (
        <button
          className={styles.deleteButton}
          type="button"
          aria-label={`Inativar ${user.name}`}
          onClick={() => onRemove(user)}
        >
          <i className="bx bx-trash" />
        </button>
      )}
    </article>
  );
}

export default UserCard;
