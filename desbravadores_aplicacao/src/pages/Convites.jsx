import { useEffect, useRef, useState } from "react";
import InviteCard from "../components/InviteCard/InviteCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import UserCard from "../components/UserCard/UserCard";
import evidenceStyles from "./Evidencias.module.css";
import styles from "./Convites.module.css";
import api from "../service/api";
import { isDiretoria, useSession } from "../service/session";
import { errorMessage } from "../service/feedback";

function Convites() {
  const { user: currentUser } = useSession();
  const [roles, setRoles] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteToDelete, setInviteToDelete] = useState(null);
  const [activeInvites, setActiveInvites] = useState([]);
  const [expiredInvites, setExpiredInvites] = useState([]);
  const [form, setForm] = useState({ email: "", role: "Conselheiro", unit: "" });

  const toInvite = i => ({ id: i.id, email: i.email, role: i.tipoConta, unit: i.nomeUnidade || "Diretoria", link: i.link, expiresInDays: Math.max(0, Math.ceil((new Date(i.dataExpiracao) - Date.now()) / 86400000)) });
  async function reload() {
    const [usersResponse, invitesResponse] = await Promise.all([api.get("/usuarios"), api.get("/convites")]);
    setUsers((usersResponse.data || []).map(u => ({ id: u.id, name: u.nome, email: u.email, role: u.nomePerfil, unit: u.nomeUnidade, initial: u.nome?.[0], active: true })));
    const invites = invitesResponse.data || [];
    setActiveInvites(invites.filter(i => i.statusConvite === "PENDENTE" && new Date(i.dataExpiracao) > new Date()).map(toInvite));
    setExpiredInvites(invites.filter(i => i.statusConvite === "EXPIRADO" || (i.statusConvite === "PENDENTE" && new Date(i.dataExpiracao) <= new Date())).map(toInvite));
  }
  useEffect(() => {
    Promise.all([Promise.resolve().then(reload), api.get("/perfil").then(({ data }) => setRoles((data || []).filter(p => p.nome.toUpperCase() === "CONSELHEIRO" || isDiretoria(p.nome)))),
      api.get("/tarefas/opcoes").then(({ data }) => setUnits(data.unidades))]).catch(err => setError(errorMessage(err)));
  }, []);



  const visibleUsers = users.filter((user) => user.active === true);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving.current) return;
    const role = roles.find(r => r.nome.toUpperCase() === form.role.toUpperCase());
    if (!role) { setError("Selecione uma função disponível."); return; }
    saving.current = true; setBusy(true); setError("");
    try {
      const { data } = await api.post("/convites", { email: form.email, idPerfil: role.id, idUnidade: form.role.toUpperCase() === "CONSELHEIRO" ? Number(form.unit) : null });
      const generatedInvitation = toInvite(data);
      await reload(); setInviteResult(generatedInvitation); setActiveTab("active");
      setIsModalOpen(false); setForm({ email: "", role: "Conselheiro", unit: "" });
    } catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
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

  async function deactivateUser() {
    if (!selectedUser || saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try { await api.delete("/usuarios", { params: { idUsuario: selectedUser.id } }); await reload(); closeDeactivateUserModal(); }
    catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }

  function openDeleteInviteModal(invite, tab) {
    setInviteToDelete({ invite, tab });
  }

  function closeDeleteInviteModal() {
    setInviteToDelete(null);
  }

  async function confirmDeleteInvite() {
    if (!inviteToDelete || saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try { await api.delete("/convites", { params: { idConvite: inviteToDelete.invite.id } }); await reload(); closeDeleteInviteModal(); }
    catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }

  return (
    <main className={styles.page}>
      {!isModalOpen && error && <p role="alert">{error}</p>}
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
            <h2><i className="bx bx-group" /> Usuários Ativos</h2>
            <span className={styles.count}>{visibleUsers.length}</span>
          </div>
          <div className={styles.userList}>
            {/* {visibleUsers.map((user) => (
              <UserCard key={user.name} user={user} onRemove={removeUser} />
            ))} */}
             {visibleUsers.map((user) => {
              const isCurrentUser = user.id === currentUser?.idUsuario;

              return (
                <UserCard
                  key={user.id}
                  user={user}
                  canDeactivate={!isCurrentUser}
                  onRemove={openDeactivateUserModal}
                />
              );
            })}
            {visibleUsers.length === 0 && <p className={styles.emptyState}>Nenhum usuário encontrado.</p>}
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
          footer={<><button type="button" className={styles.cancelButton} onClick={closeDeactivateUserModal}>Cancelar</button><button className={styles.deactivateButton} disabled={busy} type="button" onClick={deactivateUser}>Inativar usuário</button></>}
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
          footer={<><button type="button" className={evidenceStyles.cancelAction} onClick={closeDeleteInviteModal}>Cancelar</button><button className={evidenceStyles.submitButtonDanger} disabled={busy} type="button" onClick={confirmDeleteInvite}>Excluir convite</button></>}
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
            <span>Este link expira em {inviteResult.expiresInDays} dias. O convite será enviado por e-mail.</span>
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
          footer={<><button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className={modalStyles.primaryAction} disabled={busy} type="submit">Gerar Link</button></>}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        >
          {error && <p role="alert">{error}</p>}
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="usuario@email.com" value={form.email} onChange={handleChange} required />
          <label>Função</label>
          <div className={styles.roleOptions}>
            {roles.map(r => [r.nome, r.descricao || (r.nome.toUpperCase() === "CONSELHEIRO" ? "Gerencia uma unidade no Kanban" : "Acesso da Diretoria")]).map(([role, description]) => <button key={role} type="button" className={form.role.toUpperCase() === role.toUpperCase() ? styles.roleSelected : ""} onClick={() => setForm({ ...form, role })}><strong>{role}</strong><small>{description}</small></button>)}
          </div>
          {form.role.toUpperCase() === "CONSELHEIRO" && <><label htmlFor="unit">Unidade vinculada</label><select id="unit" name="unit" value={form.unit} onChange={handleChange} required><option value="">Selecione uma unidade</option>{units.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></>}
          <div className={styles.howItWorks}><i className="bx bx-link" /><div><strong>Como funciona</strong><span>• Um link único de cadastro será gerado<br />• O convite será enviado por e-mail<br />• Cada link pode ser usado apenas uma vez<br />• Você pode excluir um convite a qualquer momento</span></div></div>
        </Modal>
      )}
    </main>
  );
}

export default Convites;
