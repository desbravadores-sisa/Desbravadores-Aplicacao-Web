import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import api from "../../service/api";
import { isDiretoria, useSession } from "../../service/session";

function Navbar() {
  const [openPopover, setOpenPopover] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const profileAreaRef = useRef(null);
  const navigate = useNavigate();
  const { user, clear } = useSession();

  async function load(pageNumber = 0) {
    try {
      const [list, count] = await Promise.all([
        api.get("/api/notifications", { params: { page: pageNumber, size: 20 } }),
        api.get("/api/notifications/unread-count")
      ]);
      setNotifications(current => pageNumber ? [...current, ...list.data.content] : list.data.content);
      setPage(pageNumber); setHasMore(!list.data.last); setUnreadCount(count.data.count); setError("");
    } catch { setError("Não foi possível carregar as notificações."); }
  }
  useEffect(() => {
    let active = true;
    const count = async () => {
      try {
        const { data } = await api.get("/api/notifications/unread-count");
        if (active) setUnreadCount(data.count);
      } catch { /* A abertura do painel apresenta o erro e permite tentar novamente. */ }
    };
    count();
    const interval = setInterval(count, 30000);
    window.addEventListener("notifications:refresh", count);
    return () => { active = false; clearInterval(interval); window.removeEventListener("notifications:refresh", count); };
  }, [user?.idUsuario]);

  useEffect(() => {
    function closePopover(event) {
      if (profileAreaRef.current && !profileAreaRef.current.contains(event.target)) setOpenPopover(null);
    }
    function closeOnEscape(event) { if (event.key === "Escape") setOpenPopover(null); }
    document.addEventListener("mousedown", closePopover); document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("mousedown", closePopover); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  async function read(notification, navigateToTask = false) {
    if (busy) return;
    setBusy(true);
    try {
      if (!notification.lida) await api.patch(`/api/notifications/${notification.id}/read`);
      await load();
      if (navigateToTask && /^\/(evidencias|minhas-tarefas)(\?|$)/.test(notification.urlDestino || "")) {
        setOpenPopover(null); navigate(notification.urlDestino);
      }
    } catch { setError("Não foi possível marcar a notificação como lida."); }
    finally { setBusy(false); }
  }
  async function readAll() {
    if (busy) return;
    setBusy(true);
    try { await api.patch("/api/notifications/read-all"); await load(); }
    catch { setError("Não foi possível marcar todas como lidas."); }
    finally { setBusy(false); }
  }
  async function logout() {
    try { await api.post("/usuarios/logoff"); clear(); navigate("/"); }
    catch { setError("Não foi possível sair. Tente novamente."); }
  }
  const links = isDiretoria(user?.tipoConta)
    ? [["/unidades", "bx-group", "Unidades"], ["/tarefas", "bx-check-square", "Tarefas"], ["/evidencias", "bx-list-check", "Evidências"], ["/cadernos", "bx-book", "Cadernos"], ["/convites", "bx-envelope", "Convites"]]
    : [["/minhas-tarefas", "bx-check-square", "Minhas Tarefas"]];
  return <nav className={styles.navbar}>
    <div className={styles.logoArea}><div className={styles.logo}><i className="bx bx-landscape" /></div><span className={styles.title}>Tigre da Montanha</span></div>
    <div className={styles.menu}>{links.map(([to, icon, label]) => <NavLink key={to} className={({ isActive }) => isActive ? styles.active : ""} to={to}><i className={`bx ${icon}`} /> {label}</NavLink>)}</div>
    <div className={styles.profile} ref={profileAreaRef}>
      <button className={styles.notificationButton} type="button" aria-label={`Notificações: ${unreadCount} não lidas`} aria-expanded={openPopover === "notifications"}
        onClick={() => { if (openPopover !== "notifications") load(); setOpenPopover(current => current === "notifications" ? null : "notifications"); }}>
        <i className="bx bx-bell" />{unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      <button className={styles.profileButton} type="button" aria-expanded={openPopover === "profile"} onClick={() => setOpenPopover(current => current === "profile" ? null : "profile")}>
        <span className={styles.avatar}>{user?.nome?.trim()[0]}</span><span className={styles.profileInfo}><strong>{user?.nome}</strong><small>{user?.tipoConta}</small></span><i className="bx bx-chevron-down" />
      </button>
      {openPopover === "profile" && <div className={`${styles.popover} ${styles.profilePopover}`}>
        <div className={styles.popoverIdentity}><strong>{user?.nome}</strong><span>{user?.tipoConta}</span></div>
        <button type="button" onClick={() => { setOpenPopover(null); navigate("/perfil"); }}><i className="bx bx-user" /> Meu Perfil</button>
        <button className={styles.logoutButton} type="button" onClick={logout}><i className="bx bx-log-out" /> Sair</button>
        {error && <p role="alert">{error}</p>}
      </div>}
      {openPopover === "notifications" && <section className={`${styles.popover} ${styles.notificationsPopover}`} aria-label="Notificações">
        <div className={styles.notificationsHeader}><strong>Notificações</strong><span>{unreadCount} não lidas</span></div>
        <button className={styles.notificationAction} disabled={busy || !unreadCount} onClick={readAll}>Marcar todas como lidas</button>
        {error && <p role="alert">{error} <button onClick={() => load()}>Tentar novamente</button></p>}
        {!error && notifications.length === 0 && <p className={styles.notificationEmpty}>Nenhuma notificação.</p>}
        <div className={styles.notificationList}>{notifications.map(n => <article key={n.id} className={`${styles.notificationItem} ${!n.lida ? styles.unread : ""}`}>
          <i className={`bx ${n.tipo === "EVIDENCIA_APROVADA" ? "bx-check-circle" : n.tipo === "CORRECAO_SOLICITADA" ? "bx-error-circle" : "bx-info-circle"}`} />
          <div><strong>{n.titulo}</strong><p>{n.mensagem}</p><time>{n.dataCriacao ? new Date(n.dataCriacao).toLocaleString("pt-BR") : ""}</time>
            <div className={styles.notificationActions}>{!n.lida && <button disabled={busy} onClick={() => read(n)}>Marcar como lida</button>}
              {n.urlDestino && <button disabled={busy} onClick={() => read(n, true)}>Ver tarefa</button>}</div>
          </div>
        </article>)}</div>
        {hasMore && <button disabled={busy} className={styles.notificationAction} onClick={() => load(page + 1)}>Carregar mais</button>}
      </section>}
    </div>
  </nav>;
}
export default Navbar;
