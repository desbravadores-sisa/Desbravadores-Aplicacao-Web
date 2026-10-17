import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import api, { urlArquivo } from "../../service/api";

// Aparência de cada notificação conforme o tipo de referência gravado pela API
const NOTIFICATION_STYLE = {
  EVIDENCIA_APROVADA: { icon: "bx-check-circle", statusClass: "approved" },
  EVIDENCIA_CORRECAO: { icon: "bx-error-circle", statusClass: "rejected" },
};
const DEFAULT_STYLE = { icon: "bx-info-circle", statusClass: "available" };

function formatarData(iso) {
  if (!iso) return "";
  const [data] = String(iso).split("T");
  const [ano, mes, dia] = data.split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : "";
}

function Navbar() {
  const [openPopover, setOpenPopover] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileAreaRef = useRef(null);
  const menuToggleRef = useRef(null);
  const drawerRef = useRef(null);
  const drawerCloseRef = useRef(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [usuario, setUsuario] = useState({ nome: "", tipoConta: "", fotoUrl: null });
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const isConselheiro = usuario.tipoConta.toLowerCase() === "conselheiro";

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

  useEffect(() => {
    let ativo = true;
    api.get("/usuarios/perfil")
      .then(({ data }) => { if (ativo && data) setUsuario({ nome: data.nome || "", tipoConta: data.tipoConta || "", fotoUrl: data.fotoUrl || null }); })
      .catch(() => {});
      console.log("Oii")
      console.log(usuario)
    api.get("/notificacoes")
      .then(({ data, status }) => {
        if (!ativo) return;
        const lista = status === 204 || !Array.isArray(data) ? [] : data;
        setNotifications(lista.map((n) => ({
          id: n.id,
          ...(NOTIFICATION_STYLE[n.tipoReferencia] || DEFAULT_STYLE),
          title: n.titulo,
          message: n.mensagem,
          date: formatarData(n.dataCriacao),
          unread: !n.lida,
        })));
      })
      .catch(() => { if (ativo) setNotifications([]); });
    return () => { ativo = false; };
  }, []);

  function markAllAsRead() {
    if (unreadCount === 0) return;
    api.patch("/notificacoes/lidas")
      .then(() => setNotifications((atual) => atual.map((n) => ({ ...n, unread: false }))))
      .catch(() => {});
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
          {isConselheiro ? (
            <>
              <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/minhas-tarefas" onClick={() => setMobileMenuOpen(false)}>
                <i className='bx bx-check-square'></i> Minhas Tarefas
              </NavLink>
              <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/desbravadores" onClick={() => setMobileMenuOpen(false)}>
                <i className='bx bx-group'></i> Desbravadores
              </NavLink>
            </>
          ) : (
            <>
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
            </>
          )}
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
          <span className={styles.avatar}>
            {usuario.fotoUrl
              ? <img className={styles.avatarImage} src={urlArquivo(usuario.fotoUrl)} alt="" />
              : (usuario.nome || "?").charAt(0).toUpperCase()}
          </span>
          <span className={styles.profileInfo}>
            <strong>{usuario.nome}</strong>
            <small>{usuario.tipoConta}</small>
          </span>
          <i className="bx bx-chevron-down" />
        </button>

        {openPopover === "profile" && (
          <div className={`${styles.popover} ${styles.profilePopover}`}>
            <div className={styles.popoverIdentity}><strong>{usuario.nome}</strong><span>{usuario.tipoConta}</span></div>
            <button type="button" onClick={() => { setOpenPopover(null); navigate("/perfil"); }}><i className="bx bx-user" /> Meu Perfil</button>
            <button className={styles.logoutButton} type="button" onClick={logout}><i className="bx bx-log-out" /> Sair</button>
          </div>
        )}

        {openPopover === "notifications" && (
          <div className={`${styles.popover} ${styles.notificationsPopover}`}>
            <div className={styles.notificationsHeader}><strong>Notificações</strong><span>{unreadCount} não lidas</span>{unreadCount > 0 && <button type="button" onClick={markAllAsRead}>Marcar como lidas</button>}</div>
            {notifications.length === 0 && <p className={styles.notificationItem}>Nenhuma notificação.</p>}
            {notifications.map((notification) => <Notification key={notification.id} icon={notification.icon} className={styles[notification.statusClass]} title={notification.title} message={notification.message} date={notification.date} />)}
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
