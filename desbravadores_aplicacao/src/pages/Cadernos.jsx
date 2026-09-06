import NotebookCard from "../components/NotebookCard/NotebookCard";
import styles from "./Cadernos.module.css";

function Cadernos() {
  const cadernos = [
    {
      category: "LEÕES E TIGRESAS",
      name: "Amigo",
      age: 10,
      linkedMembers: 2,
      requirements: 6,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Ativo"
    },

    {
      category: "LEÕES E TIGRESAS",
      name: "Companheiro",
      age: 11,
      linkedMembers: 4,
      requirements: 7,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Ativo"
    },

    {
      category: "LEÕES E TIGRESAS",
      name: "Pesquisador",
      age: 12,
      linkedMembers: 3,
      requirements: 6,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Concluído antecipadamente"
    },
    {
      category: "ONÇAS E PANTERAS",
      name: "Pioneiro",
      age: 13,
      linkedMembers: 3,
      requirements: 6,
      startDate: "15/02/2026",
      endDate: "15/02/2027",
      status: "Ativo"
    },
    {
      category: "ONÇAS E PANTERAS",
      name: "Excursionista",
      age: 14,
      linkedMembers: 2,
      requirements: 5,
      startDate: "18/02/2026",
      endDate: "18/02/2027",
      status: "Ativo"
    },
    {
      category: "ONÇAS E PANTERAS",
      name: "Guia",
      age: 15,
      linkedMembers: 3,
      requirements: 6,
      startDate: "10/02/2025",
      endDate: "10/02/2026",
      status: "Encerrado"
    }
  ];

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
        <header className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>DESENVOLVIMENTO ANUAL</p>
            <h1>Cadernos</h1>
            <p>Gerencie ciclos, membros e requisitos de cada caderno.</p>
          </div>
          <button type="button" className={styles.primaryButton}>+&nbsp; Novo ciclo</button>
          <button type="button" className={styles.secondaryButton}>▣&nbsp; Requisitos</button>
        </header>

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
    </main>
  );
}

export default Cadernos;