import { useState } from "react";
import NotebookCard from "../components/NotebookCard/NotebookCard";
import Modal from "../components/Modal/Modal";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Cadernos.module.css";

const initialCadernos = [
  {
    id: "amigo",
    category: "LEÕES E TIGRESAS",
    name: "Amigo",
    age: 10,
    linkedMembers: 2,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo"
  },
  {
    id: "companheiro",
    category: "LEÕES E TIGRESAS",
    name: "Companheiro",
    age: 11,
    linkedMembers: 4,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo"
  },
  {
    id: "pesquisador",
    category: "LEÕES E TIGRESAS",
    name: "Pesquisador",
    age: 12,
    linkedMembers: 3,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Concluído antecipadamente"
  },
  {
    id: "pioneiro",
    category: "ONÇAS E PANTERAS",
    name: "Pioneiro",
    age: 13,
    linkedMembers: 3,
    startDate: "15/02/2026",
    endDate: "15/02/2027",
    status: "Ativo"
  },
  {
    id: "excursionista",
    category: "ONÇAS E PANTERAS",
    name: "Excursionista",
    age: 14,
    linkedMembers: 2,
    startDate: "18/02/2026",
    endDate: "18/02/2027",
    status: "Ativo"
  },
  {
    id: "guia",
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
  { id: 1, name: "Marina Costa", age: 10, unit: "Tigresas", joinedAt: "10/02/2026", completedNotebooks: ["amigo", "companheiro", "pesquisador", "pioneiro", "excursionista", "guia"] },
  { id: 2, name: "Gabriel Souza", age: 10, unit: "Leões", joinedAt: "10/02/2026", completedNotebooks: [] },
  { id: 3, name: "Ana Clara", age: 11, unit: "Tigresas", joinedAt: "15/03/2026", completedNotebooks: [] },
  { id: 4, name: "Pedro Henrique", age: 11, unit: "Leões", joinedAt: "20/02/2026", completedNotebooks: [] },
  { id: 5, name: "Lucas Almeida", age: 11, unit: "Leões", joinedAt: "05/01/2026", completedNotebooks: ["companheiro"] },
  { id: 6, name: "Sofia Martins", age: 11, unit: "Tigresas", joinedAt: "12/02/2026", completedNotebooks: [] },
  { id: 7, name: "Helena Lima", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", completedNotebooks: ["pesquisador"] },
  { id: 8, name: "Rafael Torres", age: 12, unit: "Leões", joinedAt: "10/02/2026", completedNotebooks: ["pesquisador"] },
  { id: 9, name: "Beatriz Santos", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", completedNotebooks: ["pesquisador"] },
  { id: 10, name: "Carlos Eduardo", age: 13, unit: "Onças", joinedAt: "15/02/2026", completedNotebooks: [] }
];

const notebookVisuals = {
  amigo: { name: "Amigo", abbreviation: "AM", color: "var(--notebook-amigo)", textColor: "#fff" },
  companheiro: { name: "Companheiro", abbreviation: "CO", color: "var(--notebook-companheiro)", textColor: "#fff" },
  pesquisador: { name: "Pesquisador", abbreviation: "PE", color: "var(--notebook-pesquisador)", textColor: "#fff" },
  pioneiro: { name: "Pioneiro", abbreviation: "PI", color: "var(--notebook-pioneiro)", textColor: "#172033" },
  excursionista: { name: "Excursionista", abbreviation: "EX", color: "var(--notebook-excursionista)", textColor: "#fff" },
  guia: { name: "Guia", abbreviation: "GU", color: "var(--notebook-guia)", textColor: "#172033" }
};

const emptyMember = { name: "", birthDate: "", unit: "" };
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

function getAgeFromBirthDate(birthDate) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month
    || (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }

  return age;
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
  const memberBirthDate = parseDateInput(memberForm.birthDate);
  const memberAge = memberBirthDate ? getAgeFromBirthDate(memberBirthDate) : null;
  const memberAgeOutOfRange = memberAge !== null && (memberAge < 10 || memberAge > 15);

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
    setMemberForm({
      name: member.name,
      birthDate: member.birthDate ? formatDate(member.birthDate) : "",
      unit: member.unit
    });
    setMemberModal({ type: "edit", member });
  }

  function saveMember(event) {
    event.preventDefault();
    const isNewMember = memberModal.type === "new";
    const age = memberAge ?? (isNewMember ? null : memberModal.member.age);

    if (
      !memberForm.name.trim()
      || !age
      || !memberForm.unit
      || (isNewMember && !memberBirthDate)
      || (memberForm.birthDate && !memberBirthDate)
      || memberAgeOutOfRange
    ) return;

    const notebook = getNotebookForAge(age, cadernos);
    const memberData = {
      name: memberForm.name.trim(),
      age,
      unit: memberForm.unit,
      notebook: notebook.name,
      ...(memberBirthDate ? { birthDate: memberBirthDate } : {})
    };

    if (memberModal.type === "new") {
      setMembers((current) => [...current, {
        id: Date.now(),
        ...memberData,
        joinedAt: notebook.startDate,
        completedNotebooks: []
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
          buttonIcon={activeTab === "notebooks" ? <i className="bx bx-plus" /> : null}
          buttonText={activeTab === "notebooks" ? "Novo ciclo" : null}
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
                <colgroup>
                  <col className={styles.memberColumnName} />
                  <col className={styles.memberColumnAge} />
                  <col className={styles.memberColumnUnit} />
                  <col className={styles.memberColumnCurrentNotebook} />
                  <col className={styles.memberColumnCompletedNotebooks} />
                  <col className={styles.memberColumnJoinedAt} />
                  <col className={styles.memberColumnActions} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Desbravador</th>
                    <th>Idade</th>
                    <th>Unidade</th>
                    <th>Caderno atual</th>
                    <th>Cadernos concluídos</th>
                    <th>Ingresso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const notebook = getNotebookForAge(member.age, cadernos);
                    const completedNotebooks = member.completedNotebooks
                      .map((notebookId) => notebookVisuals[notebookId])
                      .filter(Boolean);
                    return (
                      <tr key={member.id}>
                        <td data-label="Desbravador"><span className={styles.memberAvatar}>{getInitials(member.name)}</span><strong>{member.name}</strong></td>
                        <td data-label="Idade">{member.age} anos</td>
                        <td data-label="Unidade">{member.unit}</td>
                        <td data-label="Caderno atual"><strong>{notebook.name}</strong></td>
                        <td data-label="Cadernos concluídos">
                          {completedNotebooks.length === 0 ? (
                            <span className={styles.noCompletedNotebooks}>Nenhum</span>
                          ) : (
                            <ul className={styles.completedNotebooks} aria-label="Cadernos concluídos">
                              {completedNotebooks.map((completedNotebook) => (
                                <li key={completedNotebook.name}>
                                  <span
                                    className={styles.completedNotebookBadge}
                                    style={{
                                      backgroundColor: completedNotebook.color,
                                      color: completedNotebook.textColor
                                    }}
                                    role="img"
                                    title={`${completedNotebook.name} concluído`}
                                    aria-label={`${completedNotebook.name} concluído`}
                                  >
                                    {completedNotebook.abbreviation}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td data-label="Ingresso">{member.joinedAt}</td>
                        <td data-label="Ações">
                          <div className={styles.memberActions}>
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
              <label htmlFor="member-birth-date">Data de aniversário</label>
              <input
                id="member-birth-date"
                name="birthDate"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="dd/mm/aaaa"
                value={memberForm.birthDate}
                onChange={(event) => setMemberForm((current) => ({
                  ...current,
                  birthDate: formatDateInput(event.target.value)
                }))}
                required={memberModal.type === "new" || Boolean(memberModal.member.birthDate)}
              />
            </div>
            <div>
              <label htmlFor="member-unit">Unidade</label>
              <select id="member-unit" value={memberForm.unit} onChange={(event) => setMemberForm((current) => ({ ...current, unit: event.target.value }))} required>
                <option value="">Selecione</option>
                {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>
          {memberForm.birthDate && !memberBirthDate && (
            <span className={styles.memberFormError} role="alert">Informe uma data válida no formato dd/mm/aaaa.</span>
          )}
          {memberAgeOutOfRange && (
            <span className={styles.memberFormError} role="alert">A idade calculada precisa estar entre 10 e 15 anos para vincular um caderno.</span>
          )}
          {memberBirthDate && !memberAgeOutOfRange && (
            <div className={styles.autoNotebookNotice}>
              <strong><i className="bx bx-info-circle" /> Caderno automático</strong>
              <span>Com {memberAge} anos, este desbravador pertence ao caderno {getNotebookForAge(memberAge, cadernos).name}. Após o cadastro, o vínculo será criado automaticamente.</span>
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