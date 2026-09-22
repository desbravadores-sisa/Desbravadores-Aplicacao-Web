import { useState } from "react";
import CreateInviteModal from "../components/CreateInviteModal/CreateInviteModal";
import InviteCard from "../components/InviteCard/InviteCard";
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
      <header className={styles.pageHeader}>
        <div>
          <h1>Convites &amp; Usuários</h1>
          <p>Gerencie acessos e convites do sistema</p>
        </div>
        <button className={styles.newButton} type="button" onClick={() => setIsModalOpen(true)}>
          <i className="bx bx-plus" /> Novo Convite
        </button>
      </header>

      <div className={styles.columns}>
        <section className={styles.usersSection}>
          <div className={styles.sectionTitle}>
            <h2><i className="bx bx-group" /> Usuários {activeTab === "active" ? "Ativos" : "Expirados"}</h2>
            <span className={styles.count}>{visibleUsers.length}</span>
          </div>
          <div className={styles.userList}>
            {visibleUsers.map((user) => (
              <UserCard key={user.name} user={user} styles={styles} onRemove={removeUser} />
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
            <InviteCard invitation={invitation} styles={styles} onRemove={() => setInvitation(null)} />
          )}
        </section>
      </div>

      {isModalOpen && (
        <CreateInviteModal
          form={form}
          styles={styles}
          onChange={handleChange}
          onRoleChange={(role) => setForm({ ...form, role })}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}

export default Convites;