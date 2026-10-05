import { useEffect, useRef, useState } from "react";
import InviteCard from "../components/InviteCard/InviteCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import UserCard from "../components/UserCard/UserCard";
import evidenceStyles from "./Evidencias.module.css";
import styles from "./Convites.module.css";
import api from "../service/api";

const profileIds = { Diretoria: 1, Conselheiro: 2 };

function getResponseItems(responseData, collectionName) {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.[collectionName])) return responseData[collectionName];
  return Array.isArray(responseData?.data) ? responseData.data : [];
}

function mapApiUsers(responseData) {
  return getResponseItems(responseData, "usuarios").map((usuario) => {
    const name = usuario.nome?.trim() ?? "Usuário";

    return {
      id: usuario.id,
      name,
      email: usuario.email ?? "",
      role: usuario.nomePerfil ?? "",
      unit: usuario.nomeUnidade ?? "",
      initial: name.charAt(0).toUpperCase(),
      active: true
    };
  });
}

function mapApiInvites(responseData) {
  return getResponseItems(responseData, "convites").map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.tipoConta,
    unit: invite.tipoConta === "Diretoria" ? "" : invite.nomeUnidade ?? "",
    status: invite.statusConvite,
    expiresAt: invite.dataExpiracao
  }));
}

function isInviteExpired(expiresAt, currentTime) {
  const expirationTime = Date.parse(expiresAt);
  return Number.isFinite(expirationTime) && expirationTime <= currentTime;
}

function Convites() {
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [units, setUnits] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvitesLoading, setIsInvitesLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [invitesError, setInvitesError] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [isUnitsLoading, setIsUnitsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [userDeleteError, setUserDeleteError] = useState("");
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteToDelete, setInviteToDelete] = useState(null);
  const [isDeletingInvite, setIsDeletingInvite] = useState(false);
  const [inviteDeleteError, setInviteDeleteError] = useState("");
  const [form, setForm] = useState({ email: "", role: "Conselheiro", unit: "" });
  const submitLock = useRef(false);
  const userDeleteLock = useRef(false);
  const inviteDeleteLock = useRef(false);

  useEffect(() => {
    function updateCurrentTime() {
      setCurrentTime(Date.now());
    }

    updateCurrentTime();
    const intervalId = window.setInterval(updateCurrentTime, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);
      setUsersError("");

      const [usersResult, currentUserResult, invitesResult, unitsResult] = await Promise.allSettled([
        api.get("/usuarios"),
        api.get("/usuarios/buscarUsuario"),
        api.get("/convites"),
        api.get("/unidades/diretor")
      ]);

      if (!isMounted) return;

      if (usersResult.status === "fulfilled") {
        setUsers(mapApiUsers(usersResult.value.data));
      } else {
        setUsersError("Não foi possível carregar os usuários.");
        console.error("Erro ao buscar usuários:", usersResult.reason);
      }

      if (currentUserResult.status === "fulfilled") {
        setCurrentUser(currentUserResult.value.data?.usuario ?? currentUserResult.value.data);
      } else {
        console.error("Erro ao identificar o usuário logado:", currentUserResult.reason);
      }

      if (invitesResult.status === "fulfilled") {
        setInvites(mapApiInvites(invitesResult.value.data));
      } else {
        setInvitesError("Não foi possível carregar os convites.");
        console.error("Erro ao buscar convites:", invitesResult.reason);
      }

      if (unitsResult.status === "fulfilled") {
        const unitList = getResponseItems(unitsResult.value.data, "unidades");
        setUnits(unitList.map((unit) => ({
          id: unit.idUnidade ?? unit.id,
          name: unit.nomeUnidade ?? unit.nome
        })).filter((unit) => unit.id != null && unit.name));
      } else {
        setUnitsError("Não foi possível carregar as unidades.");
        console.error("Erro ao buscar unidades:", unitsResult.reason);
      }

      setIsLoading(false);
      setIsInvitesLoading(false);
      setIsUnitsLoading(false);
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleUsers = users.filter((user) => user.active);
  const activeInvites = invites.filter((invite) => (
    invite.status !== "ACEITO" && !isInviteExpired(invite.expiresAt, currentTime)
  ));
  const expiredInvites = invites.filter((invite) => (
    invite.status !== "ACEITO" && isInviteExpired(invite.expiresAt, currentTime)
  ));

  function isCurrentUser(user) {
    if (!currentUser) return true;

    if (currentUser.id != null && user.id != null) {
      return String(currentUser.id) === String(user.id);
    }

    if (currentUser.email && user.email) {
      return currentUser.email.trim().toLowerCase() === user.email.trim().toLowerCase();
    }

    const currentUserName = currentUser.nome ?? currentUser.name;
    return Boolean(currentUserName && user.name && currentUserName.trim().toLowerCase() === user.name.trim().toLowerCase());
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitLock.current) return;

    const selectedUnit = units.find((unit) => String(unit.id) === form.unit);
    if (!form.email || !profileIds[form.role] || (form.role === "Conselheiro" && !selectedUnit)) {
      setSubmitError("Preencha os dados do convite antes de continuar.");
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);
    setSubmitError("");

    const requestBody = {
      email: form.email.trim(),
      idPerfil: profileIds[form.role],
      idUnidade: form.role === "Diretoria" ? null : Number(selectedUnit.id)
    };

    try {
      const response = await api.post("/convites", requestBody);
      const createdInvite = response.data?.convite ?? response.data ?? {};
      const invitation = {
        id: createdInvite.id ?? `pending-${Date.now()}`,
        email: createdInvite.email ?? requestBody.email,
        role: createdInvite.tipoConta ?? form.role,
        unit: form.role === "Diretoria" ? "" : selectedUnit?.name ?? "",
        status: createdInvite.statusConvite ?? "PENDENTE",
        expiresAt: createdInvite.dataExpiracao ?? ""
      };

      setInvites((current) => [invitation, ...current]);
      setInviteResult({
        email: invitation.email,
        role: invitation.role,
        unit: invitation.unit,
        link: createdInvite.link ?? createdInvite.url ?? "",
        expiresInDays: createdInvite.expiresInDays ?? 7
      });
      setActiveTab("active");
      setIsModalOpen(false);
      setForm({ email: "", role: "Conselheiro", unit: "" });

      const [invitesRefresh, usersRefresh] = await Promise.allSettled([
        api.get("/convites"),
        api.get("/usuarios")
      ]);

      if (invitesRefresh.status === "fulfilled") {
        setInvites(mapApiInvites(invitesRefresh.value.data));
        setInvitesError("");
      }
      if (usersRefresh.status === "fulfilled") {
        setUsers(mapApiUsers(usersRefresh.value.data));
        setUsersError("");
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      setSubmitError(typeof serverMessage === "string" ? serverMessage : "Não foi possível criar o convite. Tente novamente.");
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  }

  function copyInviteLink() {
    if (!inviteResult?.link) return;

    navigator.clipboard?.writeText(inviteResult.link).catch(() => undefined);
  }

  function closeInviteResultModal() {
    setInviteResult(null);
  }

  function openDeactivateUserModal(user) {
    setUserDeleteError("");
    setSelectedUser(user);
  }

  function closeDeactivateUserModal() {
    if (userDeleteLock.current) return;
    setSelectedUser(null);
    setUserDeleteError("");
  }

  async function deactivateUser() {
    if (!selectedUser || selectedUser.id == null || userDeleteLock.current) return;

    userDeleteLock.current = true;
    setIsDeletingUser(true);
    setUserDeleteError("");

    try {
      await api.delete(`/usuarios?idUsuario=${encodeURIComponent(selectedUser.id)}`);
      setUsers((currentUsers) => currentUsers.filter((user) => String(user.id) !== String(selectedUser.id)));
      setSelectedUser(null);
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      setUserDeleteError(typeof serverMessage === "string" ? serverMessage : "Não foi possível inativar o usuário. Tente novamente.");
    } finally {
      userDeleteLock.current = false;
      setIsDeletingUser(false);
    }
  }

  function openDeleteInviteModal(invite) {
    setInviteDeleteError("");
    setInviteToDelete(invite);
  }

  function closeDeleteInviteModal() {
    if (inviteDeleteLock.current) return;
    setInviteToDelete(null);
    setInviteDeleteError("");
  }

  async function confirmDeleteInvite() {
    if (!inviteToDelete || inviteToDelete.id == null || inviteDeleteLock.current) return;

    inviteDeleteLock.current = true;
    setIsDeletingInvite(true);
    setInviteDeleteError("");

    try {
      await api.delete(`/convites?idConvite=${encodeURIComponent(inviteToDelete.id)}`);
      setInvites((current) => current.filter((item) => String(item.id) !== String(inviteToDelete.id)));
      setInviteToDelete(null);
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      setInviteDeleteError(typeof serverMessage === "string" ? serverMessage : "Não foi possível excluir o convite. Tente novamente.");
    } finally {
      inviteDeleteLock.current = false;
      setIsDeletingInvite(false);
    }
  }

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Convites & Usuários"
        subtitle="Gerencie acessos e convites do sistema"
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Novo Convite"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <div className={styles.columns}>
        <section className={styles.usersSection}>
          <div className={styles.sectionTitle}>
            <h2>
              <i className="bx bx-group" /> Usuários Ativos
              <span className={styles.count}>{visibleUsers.length}</span>
            </h2>
          </div>
          <div className={styles.userList}>
            {isLoading && <p className={styles.emptyState}>Carregando usuários...</p>}
            {!isLoading && usersError && <p className={styles.emptyState}>{usersError}</p>}
            {!isLoading && !usersError && visibleUsers.map((user) => (
              <UserCard
                key={user.id ?? user.email}
                user={user}
                canDeactivate={!isCurrentUser(user)}
                onRemove={openDeactivateUserModal}
              />
            ))}
            {!isLoading && !usersError && visibleUsers.length === 0 && <p className={styles.emptyState}>Nenhum usuário encontrado.</p>}
          </div>
        </section>

        <section className={styles.invitesSection}>
          <div className={styles.invitesHeader}>
            <h2><i className="bx bx-envelope" /> Convites</h2>
            <div className={styles.tabs}>
              <button className={activeTab === "active" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("active")}>Ativos ({activeInvites.length})</button>
              <button className={activeTab === "expired" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("expired")}>Expirados ({expiredInvites.length})</button>
            </div>
          </div>
          <div className={styles.inviteList}>
            {isInvitesLoading && <p className={styles.emptyState}>Carregando convites...</p>}
            {!isInvitesLoading && invitesError && <p className={styles.emptyState}>{invitesError}</p>}
            {!isInvitesLoading && !invitesError && activeTab === "active" && activeInvites.map((item) => (
              <InviteCard key={item.id} invitation={item} currentTime={currentTime} onRemove={() => openDeleteInviteModal(item)} />
            ))}
            {!isInvitesLoading && !invitesError && activeTab === "active" && activeInvites.length === 0 && <p className={styles.emptyState}>Nenhum convite ativo.</p>}
            {!isInvitesLoading && !invitesError && activeTab === "expired" && expiredInvites.map((item) => (
              <InviteCard key={item.id} invitation={item} currentTime={currentTime} onRemove={() => openDeleteInviteModal(item)} />
            ))}
            {!isInvitesLoading && !invitesError && activeTab === "expired" && expiredInvites.length === 0 && <p className={styles.emptyState}>Nenhum convite expirado.</p>}
          </div>
        </section>
      </div>

      {selectedUser && (
        <Modal
          className={styles.deactivationModal}
          title="Inativar usuário"
          eyebrow="GESTÃO DE ACESSO"
          labelledBy="deactivate-user-title"
          headerClassName={styles.deactivationHeader}
          bodyClassName={styles.deactivationBody}
          footerClassName={styles.deactivationFooter}
          footer={<><button type="button" className={styles.cancelButton} onClick={closeDeactivateUserModal} disabled={isDeletingUser}>Cancelar</button><button className={styles.deactivateButton} type="button" onClick={deactivateUser} disabled={isDeletingUser}>{isDeletingUser ? "Inativando..." : "Inativar usuário"}</button></>}
          onClose={() => { if (!isDeletingUser) closeDeactivateUserModal(); }}
        >
          <div className={styles.userSummaryCard}>
            <div className={styles.userSummaryHeader}>
              <span className={styles.avatarSmall}>{selectedUser.initial}</span>
              <div>
                <strong>{selectedUser.name}</strong>
                <span>{selectedUser.email}</span>
              </div>
            </div>
            <div className={styles.userSummaryMeta}>
              <div>
                <small>Perfil/Função</small>
                <strong>{selectedUser.role}</strong>
              </div>
              {selectedUser.unit && (
                <div>
                  <small>Unidade</small>
                  <strong>{selectedUser.unit}</strong>
                </div>
              )}
            </div>
          </div>

          <p className={styles.confirmationText}>Tem certeza que deseja inativar este usuário?</p>
          {userDeleteError && <p className={styles.actionError} role="alert">{userDeleteError}</p>}
          <div className={styles.warningBox}>
            <i className="bx bx-shield-x" />
            <span>O usuário perderá o acesso ao sistema e deixará de aparecer entre os usuários ativos. O cadastro não deverá ser excluído permanentemente.</span>
          </div>
        </Modal>
      )}

      {inviteToDelete && (
        <Modal
          className={styles.deleteInviteModal}
          title="Excluir convite"
          labelledBy="delete-invite-title"
          headerClassName={styles.deleteInviteHeader}
          bodyClassName={styles.deleteInviteBody}
          footerClassName={styles.deleteInviteFooter}
          footer={<><button type="button" className={evidenceStyles.cancelAction} onClick={closeDeleteInviteModal} disabled={isDeletingInvite}>Cancelar</button><button className={evidenceStyles.submitButtonDanger} type="button" onClick={confirmDeleteInvite} disabled={isDeletingInvite}>{isDeletingInvite ? "Excluindo..." : "Excluir convite"}</button></>}
          onClose={() => { if (!isDeletingInvite) closeDeleteInviteModal(); }}
        >
          <p className={styles.deleteInviteText}>Excluir o convite enviado para <strong>{inviteToDelete.email}</strong>?</p>
          {inviteDeleteError && <p className={styles.actionError} role="alert">{inviteDeleteError}</p>}
        </Modal>
      )}

      {inviteResult && (
        <Modal
          className={styles.inviteSuccessModal}
          title="Convite criado!"
          labelledBy="invite-success-title"
          headerClassName={styles.inviteSuccessHeader}
          bodyClassName={styles.inviteSuccessBody}
          footerClassName={styles.inviteSuccessFooter}
          footer={<button type="button" className={styles.primaryAction} onClick={closeInviteResultModal}>Entendido</button>}
          onClose={closeInviteResultModal}
        >
          <div className={styles.successHeaderRow}>
            <span className={styles.successBadge}><i className="bx bx-check" /></span>
            <div>
              <strong>Para: {inviteResult.email}</strong>
            </div>
            <button type="button" className={styles.closeInviteSuccess} aria-label="Fechar" onClick={closeInviteResultModal}>×</button>
          </div>

          <div className={styles.inviteMetadataRow}>
            <div>
              <small>Função</small>
              <strong>{inviteResult.role}</strong>
            </div>
            {inviteResult.role !== "Diretoria" && (
              <div>
                <small>Unidade</small>
                <strong>{inviteResult.unit}</strong>
              </div>
            )}
          </div>

          <div className={styles.linkFieldWrap}>
            <label htmlFor="generated-invite-link">Link do cadastro</label>
            <div className={styles.linkField}>
              <span id="generated-invite-link">{inviteResult.link || "Aguardando geração do link pelo backend"}</span>
              <button type="button" className={styles.copyButton} onClick={copyInviteLink} disabled={!inviteResult.link}>
                <i className="bx bx-copy" /> Copiar
              </button>
            </div>
          </div>

          <div className={styles.helperCard}>
            <i className="bx bx-time-five" />
            <span>Este link expira em {inviteResult.expiresInDays} dias. O backend pode retornar a URL definitiva quando a geração estiver disponível.</span>
          </div>
        </Modal>
      )}

      {isModalOpen && (
        <Modal
          className={modalStyles.formModal}
          title="Criar Convite"
          labelledBy="create-invite-title"
          headerClassName={modalStyles.formHeader}
          bodyClassName={modalStyles.formBody}
          footerClassName={modalStyles.formFooter}
          footer={<><button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</button><button className={modalStyles.primaryAction} type="submit" disabled={isSubmitting || (form.role === "Conselheiro" && (isUnitsLoading || units.length === 0))}>{isSubmitting ? "Enviando..." : "Gerar Convite"}</button></>}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="usuario@email.com" value={form.email} onChange={handleChange} required />
          <label>Função</label>
          <div className={styles.roleOptions}>
            {[["Conselheiro", "Gerencia uma unidade no Kanban"], ["Diretoria", "Acesso completo ao sistema"]].map(([role, description]) => <button key={role} type="button" className={form.role === role ? styles.roleSelected : ""} onClick={() => setForm({ ...form, role })}><strong>{role}</strong><small>{description}</small></button>)}
          </div>
          {form.role === "Conselheiro" && <><label htmlFor="unit">Unidade vinculada</label><select id="unit" name="unit" value={form.unit} onChange={handleChange} required disabled={isUnitsLoading || units.length === 0}><option value="">{isUnitsLoading ? "Carregando unidades..." : "Selecione uma unidade"}</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select>{unitsError && <p className={styles.formError} role="alert">{unitsError}</p>}</>}
          {submitError && <p className={styles.formError} role="alert">{submitError}</p>}
          <div className={styles.howItWorks}><i className="bx bx-link" /><div><strong>Como funciona</strong><span>• Um link único de cadastro será gerado<br />• Compartilhe o link com a pessoa convidada<br />• Cada link pode ser usado apenas uma vez<br />• Você pode excluir um convite a qualquer momento</span></div></div>
        </Modal>
      )}
    </main>
  );
}

export default Convites;