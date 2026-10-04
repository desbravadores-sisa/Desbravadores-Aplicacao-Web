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

function Cadernos() {
  const [cadernos, setCadernos] = useState(initialCadernos);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [cycleDates, setCycleDates] = useState({ startDate: "", endDate: "" });

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
          subtitle="Gerencie ciclos, membros e requisitos de cada caderno."
          buttonIcon={<i className="bx bx-plus" />}
          buttonText="Novo ciclo"
          onButtonClick={() => setCycleModalOpen(true)}
        />

        <div className={styles.tabs} role="tablist" aria-label="Visualização dos cadernos">
          <button type="button" className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
            Cadernos
          </button>
          <button type="button" className={styles.tab} role="tab" aria-selected="false">
            Membros
          </button>
        </div>

        {grupos.map((grupo) => (
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
        ))}
      </div>

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