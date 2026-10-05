import { useState } from "react";
import NotebookCard from "../components/NotebookCard/NotebookCard";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Cadernos.module.css";

const initialCadernos = [
  {
    category: "LEÕES E TIGRESAS",
    name: "Amigo",
    age: 10,
    linkedMembers: 2,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo"
  },
  {
    category: "LEÕES E TIGRESAS",
    name: "Companheiro",
    age: 11,
    linkedMembers: 4,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo"
  },
  {
    category: "LEÕES E TIGRESAS",
    name: "Pesquisador",
    age: 12,
    linkedMembers: 3,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Concluído antecipadamente"
  },
  {
    category: "ONÇAS E PANTERAS",
    name: "Pioneiro",
    age: 13,
    linkedMembers: 3,
    startDate: "15/02/2026",
    endDate: "15/02/2027",
    status: "Ativo"
  },
  {
    category: "ONÇAS E PANTERAS",
    name: "Excursionista",
    age: 14,
    linkedMembers: 2,
    startDate: "18/02/2026",
    endDate: "18/02/2027",
    status: "Ativo"
  },
  {
    category: "ONÇAS E PANTERAS",
    name: "Guia",
    age: 15,
    linkedMembers: 3,
    startDate: "10/02/2025",
    endDate: "10/02/2026",
    status: "Encerrado"
  }
];

const initialMembers = [
  { id: 1, name: "Marina Costa", age: 10, unit: "Tigresas", joinedAt: "10/02/2026", status: "Em andamento", progress: 33 },
  { id: 2, name: "Gabriel Souza", age: 10, unit: "Leões", joinedAt: "10/02/2026", status: "Em andamento", progress: 33 },
  { id: 3, name: "Ana Clara", age: 11, unit: "Tigresas", joinedAt: "15/03/2026", status: "Em andamento", progress: 33 },
  { id: 4, name: "Pedro Henrique", age: 11, unit: "Leões", joinedAt: "20/02/2026", status: "Em andamento", progress: 33 },
  { id: 5, name: "Lucas Almeida", age: 11, unit: "Leões", joinedAt: "05/01/2026", status: "Concluído antecipadamente", progress: 100 },
  { id: 6, name: "Sofia Martins", age: 11, unit: "Tigresas", joinedAt: "12/02/2026", status: "Em andamento", progress: 33 },
  { id: 7, name: "Helena Lima", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", status: "Concluído antecipadamente", progress: 100 },
  { id: 8, name: "Rafael Torres", age: 12, unit: "Leões", joinedAt: "10/02/2026", status: "Concluído antecipadamente", progress: 100 },
  { id: 9, name: "Beatriz Santos", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", status: "Concluído antecipadamente", progress: 100 },
  { id: 10, name: "Carlos Eduardo", age: 13, unit: "Onças", joinedAt: "15/02/2026", status: "Em andamento", progress: 33 }
];

const emptyMember = { name: "", age: "", unit: "" };
const units = ["Tigresas", "Leões", "Onças", "Panteras"];

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join("/");
}

function parseDateInput(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValidDate = date.getFullYear() === Number(year)
    && date.getMonth() === Number(month) - 1
    && date.getDate() === Number(day);

  return isValidDate ? `${year}-${month}-${day}` : "";
}

function getNotebookForAge(age, cadernos) {
  return cadernos.find((caderno) => caderno.age === Number(age)) || cadernos[0];
}

function getInitials(name) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function Cadernos() {
  const [cadernos, setCadernos] = useState(initialCadernos);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [cycleDates, setCycleDates] = useState({ startDate: "", endDate: "" });
  const [activeTab, setActiveTab] = useState("notebooks");
  const [members, setMembers] = useState(initialMembers);
  const [memberModal, setMemberModal] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMember);

  function handleCycleChange(event) {
    const { name, value } = event.target;
    setCycleDates((current) => ({ ...current, [name]: formatDateInput(value) }));
  }

  function createCycle(event) {
    event.preventDefault();
    const startDate = parseDateInput(cycleDates.startDate);
    const endDate = parseDateInput(cycleDates.endDate);

    if (!startDate || !endDate || endDate < startDate) {
      return;
    }

    setCadernos((current) => current.map((caderno) => ({
      ...caderno,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      status: "Ativo"
    })));
    setCycleDates({ startDate: "", endDate: "" });
    setCycleModalOpen(false);
  }

  function openNewMember() {
    setMemberForm({ ...emptyMember });
    setMemberModal({ type: "new" });
  }

  function openMember(member) {
    setMemberForm({ name: member.name, age: String(member.age), unit: member.unit });
    setMemberModal({ type: "edit", member });
  }

  function saveMember(event) {
    event.preventDefault();
    if (!memberForm.name.trim() || !memberForm.age || !memberForm.unit) return;

    const notebook = getNotebookForAge(memberForm.age, cadernos);
    const memberData = {
      name: memberForm.name.trim(),
      age: Number(memberForm.age),
      unit: memberForm.unit,
      notebook: notebook.name
    };

    if (memberModal.type === "new") {
      setMembers((current) => [...current, {
        id: Date.now(),
        ...memberData,
        joinedAt: notebook.startDate,
        status: "Em andamento",
        progress: 0
      }]);
    } else {
      setMembers((current) => current.map((member) => (
        member.id === memberModal.member.id ? { ...member, ...memberData } : member
      )));
    }

    setMemberModal(null);
  }

  const grupos = [
    {
      name: "Leões e Tigresas",
      subtitle: "Cadernos para 10 a 12 anos",
      items: cadernos.filter((caderno) => caderno.category === "LEÕES E TIGRESAS"),
      color: "orange"
    },
    {
      name: "Onças e Panteras",
      subtitle: "Cadernos para 13 a 15 anos",
      items: cadernos.filter((caderno) => caderno.category === "ONÇAS E PANTERAS"),
      color: "blue"
    }
  ];

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <SectionHeader
          title="Cadernos"
          subtitle="Gerencie os ciclos e os membros do clube."
          buttonIcon={<i className="bx bx-plus" />}
          buttonText="Novo ciclo"
          onButtonClick={() => setCycleModalOpen(true)}
        />

        <div className={styles.tabs} role="tablist" aria-label="Visualização dos cadernos">
          <button type="button" className={`${styles.tab} ${activeTab === "notebooks" ? styles.tabActive : ""}`} role="tab" aria-selected={activeTab === "notebooks"} onClick={() => setActiveTab("notebooks")}>
            Cadernos
          </button>
          <button type="button" className={`${styles.tab} ${activeTab === "members" ? styles.tabActive : ""}`} role="tab" aria-selected={activeTab === "members"} onClick={() => setActiveTab("members")}>
            Membros
          </button>
        </div>

        {activeTab === "notebooks" ? grupos.map((grupo) => (
          <section className={styles.section} key={grupo.name}>
            <div className={`${styles.sectionHeader} ${styles[grupo.color]}`}>
              <div>
                <h2 className={styles.sectionTitle}>{grupo.name}</h2>
                <p className={styles.sectionSubtitle}>{grupo.subtitle}</p>
              </div>
              <span className={styles.sectionCount}>{grupo.items.length} ciclos</span>
            </div>
            <div className={styles.grid}>
              {grupo.items.map((caderno) => (
                <NotebookCard key={caderno.name} {...caderno} />
              ))}
            </div>
          </section>
        )) : (
          <section className={styles.membersSection}>
            <div className={styles.membersHeading}>
              <div>
                <h2>Desbravadores cadastrados</h2>
                <p>{members.length} membros · cada membro deve ser vinculado ao caderno do seu ciclo.</p>
              </div>
              <button type="button" className={styles.registerButton} onClick={openNewMember}>
                <i className="bx bx-plus" /> Cadastrar
              </button>
            </div>

            <div className={styles.memberTableWrap}>
              <table className={styles.memberTable}>
                <thead>
                  <tr>
                    <th>Desbravador</th>
                    <th>Idade</th>
                    <th>Unidade</th>
                    <th>Caderno atual</th>
                    <th>Situação no caderno</th>
                    <th>Ingresso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const notebook = getNotebookForAge(member.age, cadernos);
                    return (
                      <tr key={member.id}>
                        <td><span className={styles.memberAvatar}>{getInitials(member.name)}</span><strong>{member.name}</strong></td>
                        <td>{member.age} anos</td>
                        <td>{member.unit}</td>
                        <td><strong>{notebook.name}</strong></td>
                        <td><span className={`${styles.memberStatus} ${member.progress === 100 ? styles.memberStatusComplete : ""}`}>{member.status}</span></td>
                        <td>{member.joinedAt}</td>
                        <td>
                          <div className={styles.memberActions}>
                            <button type="button" className={styles.historyButton} onClick={() => openMember(member)}><i className="bx bx-history" /> Histórico</button>
                            <button type="button" aria-label={`Editar ${member.name}`} onClick={() => openMember(member)}><i className="bx bx-pencil" /></button>
                            <button type="button" aria-label={`Excluir ${member.name}`} onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}><i className="bx bx-trash" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {memberModal && (
        <Modal
          className={styles.memberModal}
          title={memberModal.type === "new" ? "Cadastrar desbravador" : `Desbravador · ${memberModal.member.name}`}
          labelledBy="member-modal-title"
          headerClassName={styles.memberModalHeader}
          bodyClassName={styles.memberModalBody}
          footerClassName={styles.memberModalFooter}
          footer={<><button type="button" className={styles.memberCancel} onClick={() => setMemberModal(null)}>Cancelar</button><button className={styles.memberSave} type="submit">{memberModal.type === "new" ? "Cadastrar" : "Salvar alterações"}</button></>}
          onClose={() => setMemberModal(null)}
          onSubmit={saveMember}
        >
          <label htmlFor="member-name">Nome completo</label>
          <input id="member-name" name="name" placeholder="Nome do desbravador" value={memberForm.name} onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))} required autoFocus />
          <div className={styles.memberFormRow}>
            <div>
              <label htmlFor="member-age">Idade</label>
              <select id="member-age" value={memberForm.age} onChange={(event) => setMemberForm((current) => ({ ...current, age: event.target.value }))} required>
                <option value="">Selecione</option>
                {[10, 11, 12, 13, 14, 15].map((age) => <option key={age} value={age}>{age} anos</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="member-unit">Unidade</label>
              <select id="member-unit" value={memberForm.unit} onChange={(event) => setMemberForm((current) => ({ ...current, unit: event.target.value }))} required>
                <option value="">Selecione</option>
                {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
          {memberForm.age && (
            <div className={styles.autoNotebookNotice}>
              <strong><i className="bx bx-info-circle" /> Caderno automático</strong>
              <span>Com {memberForm.age} anos, este desbravador pertence ao caderno {getNotebookForAge(memberForm.age, cadernos).name}. Após o cadastro, o vínculo será criado automaticamente.</span>
            </div>
          )}
          {memberModal.type !== "new" && (
            <div className={styles.memberHistory}>
              <h3><i className="bx bx-history" /> Histórico de cadernos</h3>
              <div className={styles.historyItem}>
                <strong>{getNotebookForAge(memberForm.age || memberModal.member.age, cadernos).name}</strong>
                <span>{getNotebookForAge(memberForm.age || memberModal.member.age, cadernos).startDate} — {getNotebookForAge(memberForm.age || memberModal.member.age, cadernos).endDate}</span>
                <b>{memberModal.member.progress}%</b>
              </div>
            </div>
          )}
        </Modal>
      )}

      {cycleModalOpen && (
        <Modal
          className={styles.cycleModal}
          title="Novo ciclo"
          labelledBy="new-cycle-title"
          headerClassName={styles.cycleHeader}
          bodyClassName={styles.cycleBody}
          footerClassName={styles.cycleFooter}
          footer={
            <button className={styles.cycleSubmit} type="submit">
              Criar ciclo
            </button>
          }
          onClose={() => setCycleModalOpen(false)}
          onSubmit={createCycle}
        >
          <p className={styles.cycleNotice}>O período será criado para todos os cadernos do clube.</p>
          <div className={styles.cycleFields}>
            <div>
              <label htmlFor="cycle-start-date">Data inicial</label>
              <input
                id="cycle-start-date"
                name="startDate"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="dd/mm/aaaa"
                value={cycleDates.startDate}
                onChange={handleCycleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cycle-end-date">Data final</label>
              <input
                id="cycle-end-date"
                name="endDate"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="dd/mm/aaaa"
                value={cycleDates.endDate}
                onChange={handleCycleChange}
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default Cadernos;