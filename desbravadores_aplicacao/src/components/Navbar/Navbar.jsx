import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const notifications = [
  { icon: "bx-check-circle", statusClass: "approved", title: "Tarefa aprovada", message: 'Sua evidência para "Treinamento de primeiros socorros" foi aprovada! +200 pontos', date: "09/04/2026", unread: true },
  { icon: "bx-info-circle", statusClass: "available", title: "Nova tarefa disponível", message: 'A tarefa "Organizar reunião de pais" foi adicionada ao seu quadro', date: "01/04/2026", unread: true },
  { icon: "bx-error-circle", statusClass: "rejected", title: "Evidência reprovada", message: "A evidência enviada precisa de ajustes. Verifique os comentários.", date: "28/03/2026", unread: false }
];

function Navbar() {
  const [openPopover, setOpenPopover] = useState(null);
  const profileAreaRef = useRef(null);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  useEffect(() => {
    function closePopover(event) {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) {
        setOpenPopover(null);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpenPopover(null);
    }

    document.addEventListener("mousedown", closePopover);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePopover);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <nav className={styles.navbar}>

      <div className={styles.logoArea}>
        <div className={styles.logo}>
          <i className='bx bx-landscape'></i>
        </div>
        <span className={styles.title}>Tigre da Montanha</span>
      </div>

      <div className={styles.menu}>
        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/unidades">
          <i className='bx bx-group'></i> Unidades
        </NavLink>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/tarefas">
          <i className='bx bx-check-square'></i> Tarefas
        </NavLink>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/evidencias">
          <i className='bx bx-list-check'></i> Evidências
        </NavLink>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/cadernos">
          <i className='bx bx-book'></i> Cadernos
        </NavLink>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/convites">
          <i className='bx bx-envelope'></i> Convites
        </NavLink>
      </div>

      <div className={styles.profile} ref={profileAreaRef}>
        <button
          className={styles.notificationButton}
          type="button"
          aria-label="Notificações"
          aria-expanded={openPopover === "notifications"}
          onClick={() => setOpenPopover((current) => current === "notifications" ? null : "notifications")}
        >
          <i className="bx bx-bell" />
          {unreadCount > 0 && <span className={styles.notificationDot} />}
        </button>

        <button
          className={styles.profileButton}
          type="button"
          aria-expanded={openPopover === "profile"}
          onClick={() => setOpenPopover((current) => current === "profile" ? null : "profile")}
        >
          <span className={styles.avatar}>A</span>
          <span className={styles.profileInfo}>
            <strong>Ana Santos</strong>
            <small>Diretoria</small>
          </span>
          <i className="bx bx-chevron-down" />
        </button>

        {openPopover === "profile" && (
          <div className={`${styles.popover} ${styles.profilePopover}`}>
            <div className={styles.popoverIdentity}><strong>Ana Santos</strong><span>Diretoria</span></div>
            <button type="button" onClick={() => { setOpenPopover(null); navigate("/perfil"); }}><i className="bx bx-user" /> Meu Perfil</button>
            <button className={styles.logoutButton} type="button"><i className="bx bx-log-out" /> Sair</button>
          </div>
        )}

        {openPopover === "notifications" && (
          <div className={`${styles.popover} ${styles.notificationsPopover}`}>
            <div className={styles.notificationsHeader}><strong>Notificações</strong><span>{unreadCount} não lidas</span></div>
            {notifications.map((notification) => <Notification key={notification.title} icon={notification.icon} className={styles[notification.statusClass]} title={notification.title} message={notification.message} date={notification.date} />)}
          </div>
        )}
      </div>

    </nav>
  );
}

function Notification({ icon, className, title, message, date }) {
  return (
    <article className={styles.notificationItem}>
      <i className={`bx ${icon} ${className}`} />
      <div><strong>{title}</strong><p>{message}</p><time>{date}</time></div>
    </article>
  );
}

export default Navbar;
