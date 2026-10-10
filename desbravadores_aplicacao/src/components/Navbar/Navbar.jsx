import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import api from "../../service/api";

const notifications = [
  { icon: "bx-check-circle", statusClass: "approved", title: "Tarefa aprovada", message: 'Sua evidência para "Treinamento de primeiros socorros" foi aprovada! +200 pontos', date: "09/04/2026", unread: true },
  { icon: "bx-info-circle", statusClass: "available", title: "Nova tarefa disponível", message: 'A tarefa "Organizar reunião de pais" foi adicionada ao seu quadro', date: "01/04/2026", unread: true },
  { icon: "bx-error-circle", statusClass: "rejected", title: "Evidência reprovada", message: "A evidência enviada precisa de ajustes. Verifique os comentários.", date: "28/03/2026", unread: false }
];

function Navbar() {
  const [openPopover, setOpenPopover] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileAreaRef = useRef(null);
  const menuToggleRef = useRef(null);
  const drawerRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const navigate = useNavigate();
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const [nomeUsuario,setNomeUsuario] = useState("Usuario")
  const [cargo,setCargo] = useState("")

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const menuToggle = menuToggleRef.current;
    document.body.style.overflow = "hidden";
    drawerCloseRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      menuToggle?.focus();
    };
  }, [mobileMenuOpen]);

  function trapDrawerFocus(event) {
    if (event.key !== "Tab" || !drawerRef.current) return;

    const focusableItems = drawerRef.current.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }

  function logout() {
    api.post("/usuarios/logoff")
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.log(err.response);
      });
  }

  api.get("/usuarios/buscarUsuario")
    .then((res) => {
      let resposta = res.data
      setNomeUsuario(resposta.nome)
      setCargo(resposta.tipoConta)
      console.log(nomeUsuario)
    }).catch((err) => {
      console.log(err.response)
    })

  useEffect(() => {
    function closePopover(event) {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) {
        setOpenPopover(null);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setOpenPopover(null);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closePopover);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closePopover);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <nav className={`${styles.navbar} ${mobileMenuOpen ? styles.menuActive : ""}`}>

      <div className={styles.logoArea}>
        <div className={styles.logo}>
          <i className='bx bx-landscape'></i>
        </div>
        <span className={styles.title}>Tigre da Montanha</span>
      </div>

      <button
        className={styles.menuToggle}
        ref={menuToggleRef}
        type="button"
        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
      >
        <i className={`bx ${mobileMenuOpen ? "bx-x" : "bx-menu"}`} aria-hidden="true" />
      </button>

      <div
        className={`${styles.drawer} ${mobileMenuOpen ? styles.drawerOpen : ""}`}
        ref={drawerRef}
        id="primary-navigation"
        role={mobileMenuOpen ? "dialog" : undefined}
        aria-modal={mobileMenuOpen ? "true" : undefined}
        aria-label={mobileMenuOpen ? "Navegação principal" : undefined}
        onKeyDown={trapDrawerFocus}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.logoArea}>
            <div className={styles.logo}>
              <i className='bx bx-landscape' aria-hidden="true"></i>
            </div>
            <span className={styles.title}>Tigre da Montanha</span>
          </div>
          <button
            className={styles.drawerClose}
            ref={drawerCloseRef}
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="bx bx-x" aria-hidden="true" />
          </button>
        </div>
        <nav className={styles.menu} aria-label="Navegação principal">
          <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/unidades" onClick={() => setMobileMenuOpen(false)}>
            <i className='bx bx-group'></i> Unidades
          </NavLink>

          <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/tarefas" onClick={() => setMobileMenuOpen(false)}>
            <i className='bx bx-check-square'></i> Tarefas
          </NavLink>

          <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/evidencias" onClick={() => setMobileMenuOpen(false)}>
            <i className='bx bx-list-check'></i> Evidências
          </NavLink>

          <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/cadernos" onClick={() => setMobileMenuOpen(false)}>
            <i className='bx bx-book'></i> Cadernos
          </NavLink>

          <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/convites" onClick={() => setMobileMenuOpen(false)}>
            <i className='bx bx-envelope'></i> Convites
          </NavLink>
        </nav>
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
          <span className={styles.avatar}>{nomeUsuario != undefined ? nomeUsuario.trim()[0] : "" }</span>
          <span className={styles.profileInfo}>
            <strong>{nomeUsuario}</strong>
            <small>{cargo}</small>
          </span>
          <i className="bx bx-chevron-down" />
        </button>

        {openPopover === "profile" && (
          <div className={`${styles.popover} ${styles.profilePopover}`}>
            <div className={styles.popoverIdentity}><strong>{nomeUsuario}</strong><span>{cargo}</span></div>
            <button type="button" onClick={() => { setOpenPopover(null); navigate("/perfil"); }}><i className="bx bx-user" /> Meu Perfil</button>
            <button className={styles.logoutButton} type="button" onClick={logout}><i className="bx bx-log-out" /> Sair</button>
          </div>
        )}

        {openPopover === "notifications" && (
          <div className={`${styles.popover} ${styles.notificationsPopover}`}>
            <div className={styles.notificationsHeader}><strong>Notificações</strong><span>{unreadCount} não lidas</span></div>
            {notifications.map((notification) => <Notification key={notification.title} icon={notification.icon} className={styles[notification.statusClass]} title={notification.title} message={notification.message} date={notification.date} />)}
          </div>
        )}
      </div>

      {mobileMenuOpen && (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
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
