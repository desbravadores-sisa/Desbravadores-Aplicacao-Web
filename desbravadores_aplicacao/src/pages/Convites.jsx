import { useState } from "react";
import InviteCard from "../components/InviteCard/InviteCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import UserCard from "../components/UserCard/UserCard";
import evidenceStyles from "./Evidencias.module.css";
import styles from "./Convites.module.css";

const currentUser = {
  id: "ana-santos",
  name: "Ana Santos",
  role: "Diretoria"
};

const initialUsers = [
  { id: "carlos-silva", name: "Carlos Silva", email: "conselheiro@tigre.com", role: "Conselheiro", unit: "Tigresas", initial: "C", active: true },
  { id: "ana-santos", name: "Ana Santos", email: "diretoria@tigre.com", role: "Diretoria", unit: "Mín. 2 diretores", initial: "A", active: true },
  { id: "pedro-costa", name: "Pedro Costa", email: "pedro@tigre.com", role: "Conselheiro", unit: "Leões", initial: "P", active: true },
  { id: "maria-oliveira", name: "Maria Oliveira", email: "maria@tigre.com", role: "Conselheiro", unit: "Onças", initial: "M", active: true },
  { id: "joao-almeida", name: "João Almeida", email: "joao@tigre.com", role: "Conselheiro", unit: "Panteras", initial: "J", active: true }
];

const initialActiveInvites = [
  { id: "active-1", email: "conselheiro.leoes@email.com", role: "Conselheiro", unit: "Leões" },
  { id: "active-2", email: "diretoria2@email.com", role: "Diretoria", unit: "Diretoria" }
];

const initialExpiredInvites = [
  { id: "expired-1", email: "novoconselheiro@email.com", role: "Conselheiro", unit: "Tigresas", expired: true },
  { id: "expired-2", email: "diretoria2@email.com", role: "Diretoria", unit: "Diretoria", expired: true }
];

function Convites() {
  const [users, setUsers] = useState(initialUsers);
  const [userTab, setUserTab] = useState("active");
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteToDelete, setInviteToDelete] = useState(null);
  const [activeInvites, setActiveInvites] = useState(initialActiveInvites);
  const [expiredInvites, setExpiredInvites] = useState(initialExpiredInvites);
  const [form, setForm] = useState({ email: "", role: "Conselheiro", unit: "" });
  const [invitation, setInvitation] = useState({ email: "conselheiro.leoes@email.com", role: "Conselheiro", unit: "Leões" });

  const activeUsers = users.filter((user) => user.active === true);
  const inactiveUsers = users.filter((user) => user.active === false);
  const visibleUsers = userTab === "active" ? activeUsers : inactiveUsers;

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || (form.role === "Conselheiro" && !form.unit)) return;

    const generatedInvitation = {
      id: `${Date.now()}`,
      email: form.email,
      role: form.role,
      unit: form.role === "Diretoria" ? "Acesso completo" : form.unit,
      link: "",
      expiresInDays: 7,
      createdAt: new Date().toISOString()
    };

    setActiveInvites((current) => [generatedInvitation, ...current]);
    setInvitation({ email: generatedInvitation.email, role: generatedInvitation.role, unit: generatedInvitation.unit });
    setInviteResult(generatedInvitation);
    setActiveTab("active");
    setIsModalOpen(false);
    setForm({ email: "", role: "Conselheiro", unit: "" });
  }

  function copyInviteLink() {
    if (!inviteResult?.link) return;

    navigator.clipboard?.writeText(inviteResult.link).catch(() => undefined);
  }

  function closeInviteResultModal() {
    setInviteResult(null);
  }

  function openDeactivateUserModal(user) {
    setSelectedUser(user);
  }

  function closeDeactivateUserModal() {
    setSelectedUser(null);
  }

  function deactivateUser() {
    if (!selectedUser) return;

    // function removeUser(name) {
    //   setUsers(users.filter((user) => user.name !== name));
    // }

    setUsers((currentUsers) => currentUsers.map((user) => (
      user.name === selectedUser.name ? { ...user, active: false } : user
    )));
    closeDeactivateUserModal();
  }

  function openDeleteInviteModal(invite, tab) {
    setInviteToDelete({ invite, tab });
  }

  function closeDeleteInviteModal() {
    setInviteToDelete(null);
  }

  function confirmDeleteInvite() {
    if (!inviteToDelete) return;

    if (inviteToDelete.tab === "active") {
      setActiveInvites((current) => current.filter((item) => item.id !== inviteToDelete.invite.id));
    } else {
      setExpiredInvites((current) => current.filter((item) => item.id !== inviteToDelete.invite.id));
    }

    closeDeleteInviteModal();
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
          <div className={styles.invitesHeader}>
            <h2><i className="bx bx-group" /> Usuários</h2>
            <div className={styles.tabs} role="tablist" aria-label="Filtrar usuários">
              <button className={userTab === "active" ? styles.tabActive : ""} type="button" role="tab" aria-selected={userTab === "active"} onClick={() => setUserTab("active")}>Ativos ({activeUsers.length})</button>
              <button className={userTab === "inactive" ? styles.tabActive : ""} type="button" role="tab" aria-selected={userTab === "inactive"} onClick={() => setUserTab("inactive")}>Inativos ({inactiveUsers.length})</button>
            </div>
          </div>
          <div className={styles.userList}>
            {visibleUsers.map((user) => {
              const isCurrentUser = user.id === currentUser.id;

              return (
                <UserCard
                  key={user.id}
                  user={user}
                  canDeactivate={user.active && !isCurrentUser}
                  onRemove={openDeactivateUserModal}
                />
              );
            })}
            {visibleUsers.length === 0 && <p className={styles.emptyState}>{userTab === "active" ? "Nenhum usuário ativo." : "Nenhum usuário inativo."}</p>}
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
          {activeTab === "active" && activeInvites.length > 0 ? activeInvites.map((item) => (
            <InviteCard key={item.id} invitation={item} onRemove={() => openDeleteInviteModal(item, "active")} />
          )) : activeTab === "active" && <p className={styles.emptyState}>Nenhum convite ativo.</p>}
          {activeTab === "expired" && expiredInvites.length > 0 ? expiredInvites.map((item) => (
            <InviteCard key={item.id} invitation={item} onRemove={() => openDeleteInviteModal(item, "expired")} expired />
          )) : activeTab === "expired" && <p className={styles.emptyState}>Nenhum convite expirado.</p>}
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
          footer={<><button type="button" className={styles.cancelButton} onClick={closeDeactivateUserModal}>Cancelar</button><button className={styles.deactivateButton} type="button" onClick={deactivateUser}>Inativar usuário</button></>}
          onClose={closeDeactivateUserModal}
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
          footer={<><button type="button" className={evidenceStyles.cancelAction} onClick={closeDeleteInviteModal}>Cancelar</button><button className={evidenceStyles.submitButtonDanger} type="button" onClick={confirmDeleteInvite}>Excluir convite</button></>}
          onClose={closeDeleteInviteModal}
        >
          <p className={styles.deleteInviteText}>Excluir o convite enviado para <strong>{inviteToDelete.invite.email}</strong>? O link deixará de funcionar.</p>
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
            <div>
              <small>Unidade</small>
              <strong>{inviteResult.unit}</strong>
            </div>
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
          footer={<><button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className={modalStyles.primaryAction} type="submit">Gerar Link</button></>}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        >
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="usuario@email.com" value={form.email} onChange={handleChange} required />
          <label>Função</label>
          <div className={styles.roleOptions}>
            {[["Conselheiro", "Gerencia uma unidade no Kanban"], ["Diretoria", "Acesso completo ao sistema"]].map(([role, description]) => <button key={role} type="button" className={form.role === role ? styles.roleSelected : ""} onClick={() => setForm({ ...form, role })}><strong>{role}</strong><small>{description}</small></button>)}
          </div>
          {form.role === "Conselheiro" && <><label htmlFor="unit">Unidade vinculada</label><select id="unit" name="unit" value={form.unit} onChange={handleChange} required><option value="">Selecione uma unidade</option><option>Leões</option><option>Tigresas</option><option>Onças</option><option>Panteras</option></select></>}
          <div className={styles.howItWorks}><i className="bx bx-link" /><div><strong>Como funciona</strong><span>• Um link único de cadastro será gerado<br />• Compartilhe o link com a pessoa convidada<br />• Cada link pode ser usado apenas uma vez<br />• Você pode excluir um convite a qualquer momento</span></div></div>
        </Modal>
      )}
    </main>
  );
}

export default Convites;