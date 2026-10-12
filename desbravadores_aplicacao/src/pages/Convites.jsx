import { useEffect, useState } from "react";
import InviteCard from "../components/InviteCard/InviteCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import UserCard from "../components/UserCard/UserCard";
import api from "../service/api";
import evidenceStyles from "./Evidencias.module.css";
import styles from "./Convites.module.css";

function Convites() {
  const [users, setUsers] = useState([]);
  const [activeInvites, setActiveInvites] = useState([]);
  const [expiredInvites, setExpiredInvites] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [inviteToDelete, setInviteToDelete] = useState(null);
  const [form, setForm] = useState({ email: "", tipoConta: "Conselheiro", idUnidade: "" });

  const visibleUsers = users.filter((user) => user.active === true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);
      const [convitesRes, unidadesRes] = await Promise.all([
        api.get("/convites").catch(() => ({ data: [], status: 204 })),
        api.get("/unidades/diretor").catch(() => ({ data: [], status: 204 })),
      ]);

      const convites = convitesRes.data || [];
      const unis = unidadesRes.data || [];

      const ativos = convites.filter((c) => c.statusConvite === "PENDENTE");
      const expirados = convites.filter((c) => c.statusConvite !== "PENDENTE");

      setActiveInvites(ativos);
      setExpiredInvites(expirados);
      setUnidades(unis);

      const usuariosAtivos = unis.flatMap((u) =>
        u.nomeConselheiro
          ? [{ id: `cons-${u.id}`, name: u.nomeConselheiro, email: "", role: "Conselheiro", unit: u.nome, active: true }]
          : []
      );
      setUsers(usuariosAtivos);
      setErro(null);
    } catch (err) {
      setErro("Não foi possível carregar os dados. Verifique se a API está no ar.");
    } finally {
      setCarregando(false);
    }
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.email) return;

    try {
      const { data } = await api.post("/convites", {
        email: form.email,
        tipoConta: form.tipoConta,
        idUnidade: form.tipoConta === "Conselheiro" ? Number(form.idUnidade) : null,
      });

      setInviteResult({
        email: form.email,
        role: form.tipoConta,
        unit: unidades.find((u) => u.id === Number(form.idUnidade))?.nome || "Diretoria",
        link: data?.token ? `${window.location.origin}/cadastro?token=${data.token}` : null,
        expiresInDays: 7,
      });

      setIsModalOpen(false);
      setForm({ email: "", tipoConta: "Conselheiro", idUnidade: "" });
      await carregarDados();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setErro("Já existe um convite pendente para este e-mail.");
      } else if (status === 404) {
        setErro("Perfil ou unidade não encontrados. Atualize a página e tente novamente.");
      } else if (status === 403) {
        setErro("Apenas a Diretoria pode enviar convites.");
      } else {
        setErro("Não foi possível criar o convite. Tente novamente.");
      }
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
    setSelectedUser(user);
  }

  function closeDeactivateUserModal() {
    setSelectedUser(null);
  }

  async function deactivateUser() {
    if (!selectedUser) return;
    closeDeactivateUserModal();
  }

  function openDeleteInviteModal(invite, tab) {
    setInviteToDelete({ invite, tab });
  }

  function closeDeleteInviteModal() {
    setInviteToDelete(null);
  }

  async function confirmDeleteInvite() {
    if (!inviteToDelete) return;
    try {
      await api.delete(`/convites/${inviteToDelete.invite.id}`);
      closeDeleteInviteModal();
      await carregarDados();
    } catch (err) {
      setErro("Não foi possível excluir o convite.");
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

      {carregando && <p>Carregando...</p>}
      {erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && (
        <div className={styles.columns}>
          <section className={styles.usersSection}>
            <div className={styles.sectionTitle}>
              <h2><i className="bx bx-group" /> Usuários Ativos</h2>
              <span className={styles.count}>{visibleUsers.length}</span>
            </div>
            <div className={styles.userList}>
              {visibleUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  canDeactivate={false}
                  onRemove={openDeactivateUserModal}
                />
              ))}
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
          {activeTab === "active" && (activeInvites.length > 0 ? activeInvites.map((item) => (
            <InviteCard key={item.id} invitation={item} onRemove={() => openDeleteInviteModal(item, "active")} />
          )) : <p className={styles.emptyState}>Nenhum convite ativo.</p>)}
          {activeTab === "expired" && (expiredInvites.length > 0 ? expiredInvites.map((item) => (
            <InviteCard key={item.id} invitation={item} onRemove={() => openDeleteInviteModal(item, "expired")} expired />
          )) : <p className={styles.emptyState}>Nenhum convite expirado.</p>)}
        </section>
      </div>
      )}

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
            {[["Conselheiro", "Gerencia uma unidade no Kanban"], ["Diretoria", "Acesso completo ao sistema"]].map(([tipo, description]) => <button key={tipo} type="button" className={form.tipoConta === tipo ? styles.roleSelected : ""} onClick={() => setForm({ ...form, tipoConta: tipo })}><strong>{tipo}</strong><small>{description}</small></button>)}
          </div>
          {form.tipoConta === "Conselheiro" && <><label htmlFor="idUnidade">Unidade vinculada</label><select id="idUnidade" name="idUnidade" value={form.idUnidade} onChange={handleChange} required><option value="">Selecione uma unidade</option>{unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></>}
          <div className={styles.howItWorks}><i className="bx bx-link" /><div><strong>Como funciona</strong><span>• Um link único de cadastro será gerado<br />• Compartilhe o link com a pessoa convidada<br />• Cada link pode ser usado apenas uma vez<br />• Você pode excluir um convite a qualquer momento</span></div></div>
        </Modal>
      )}
    </main>
  );
}

export default Convites;