import { useState } from "react";
import InviteCard from "../components/InviteCard/InviteCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import UserCard from "../components/UserCard/UserCard";
import styles from "./Convites.module.css";

const initialUsers = [
  { name: "Carlos Silva", email: "conselheiro@tigre.com", role: "Conselheiro", unit: "Tigresas", initial: "C", active: true },
  { name: "Ana Santos", email: "diretoria@tigre.com", role: "Diretoria", unit: "Mín. 2 diretores", initial: "A", active: true },
  { name: "Pedro Costa", email: "pedro@tigre.com", role: "Conselheiro", unit: "Leões", initial: "P", active: true },
  { name: "Maria Oliveira", email: "maria@tigre.com", role: "Conselheiro", unit: "Onças", initial: "M", active: true },
  { name: "João Almeida", email: "joao@tigre.com", role: "Conselheiro", unit: "Panteras", initial: "J", active: true }
];

function Convites() {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ email: "", role: "Conselheiro", unit: "" });
  const [invitation, setInvitation] = useState({ email: "conselheiro.leoes@email.com", role: "Conselheiro", unit: "Leões" });

  const visibleUsers = users.filter((user) => user.active === (activeTab === "active"));

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.email || (form.role === "Conselheiro" && !form.unit)) return;

    setInvitation({ email: form.email, role: form.role, unit: form.role === "Diretoria" ? "Acesso completo" : form.unit });
    setIsModalOpen(false);
    setForm({ email: "", role: "Conselheiro", unit: "" });
  }

  function removeUser(name) {
    setUsers(users.filter((user) => user.name !== name));
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
            <h2><i className="bx bx-group" /> Usuários {activeTab === "active" ? "Ativos" : "Expirados"}</h2>
            <span className={styles.count}>{visibleUsers.length}</span>
          </div>
          <div className={styles.userList}>
            {visibleUsers.map((user) => (
              <UserCard key={user.name} user={user} onRemove={removeUser} />
            ))}
            {visibleUsers.length === 0 && <p className={styles.emptyState}>Nenhum usuário encontrado.</p>}
          </div>
        </section>

        <section className={styles.invitesSection}>
          <div className={styles.invitesHeader}>
            <h2><i className="bx bx-envelope" /> Convites</h2>
            <div className={styles.tabs}>
              <button className={activeTab === "active" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("active")}>Ativos (1)</button>
              <button className={activeTab === "expired" ? styles.tabActive : ""} type="button" onClick={() => setActiveTab("expired")}>Expirados (2)</button>
            </div>
          </div>
          {activeTab === "active" && (
            <InviteCard invitation={invitation} onRemove={() => setInvitation(null)} />
          )}
        </section>
      </div>

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