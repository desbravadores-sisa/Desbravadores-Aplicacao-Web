import UnitCard from "../components/UnitCard/UnitCard";
import styles from "./Unidades.module.css";

function Unidades() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1>Unidades</h1>
          <p>Gerencie as unidades do clube e acompanhe o desempenho</p>
        </div>
        <button type="button" className={styles.addButton}>
          +&nbsp; Adicionar Unidade
        </button>
      </header>

      <div className={styles.grid}>

        <UnitCard
          name="Tigresas"
          leader="Carlos Silva"
          position={1}
          score={850}
          completedTasks={12}
          totalTasks={15}
          completionRate={80}
        />


        <UnitCard
          name="Leões"
          leader="Pedro Costa"
          position={2}
          score={720}
          completedTasks={10}
          totalTasks={15}
          completionRate={67}
        />


        <UnitCard
          name="Onças"
          leader="Maria Oliveira"
          position={3}
          score={680}
          completedTasks={9}
          totalTasks={15}
          completionRate={60}
        />


        <UnitCard
          name="Panteras"
          leader="João Almeida"
          position={4}
          score={540}
          completedTasks={8}
          totalTasks={15}
          completionRate={53}
        />

      </div>
    </main>
  );
}

export default Unidades;