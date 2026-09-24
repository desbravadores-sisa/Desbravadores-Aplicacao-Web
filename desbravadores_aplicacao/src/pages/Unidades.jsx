import { useState } from "react";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import UnitCard from "../components/UnitCard/UnitCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Unidades.module.css";

const initialUnits = [
  { name: "Tigresas", leader: "Carlos Silva", position: 1, score: 850, completedTasks: 12, totalTasks: 15, completionRate: 80 },
  { name: "Leões", leader: "Pedro Costa", position: 2, score: 720, completedTasks: 10, totalTasks: 15, completionRate: 67 },
  { name: "Onças", leader: "Maria Oliveira", position: 3, score: 680, completedTasks: 9, totalTasks: 15, completionRate: 60 },
  { name: "Panteras", leader: "João Almeida", position: 4, score: 540, completedTasks: 8, totalTasks: 15, completionRate: 53 }
];

function Unidades() {
  const [units, setUnits] = useState(initialUnits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ unitName: "", leader: "" });

  function openModal() {
    setForm({ unitName: "", leader: "" });
    setIsModalOpen(true);
  }

  function createUnit(event) {
    event.preventDefault();
    const name = form.unitName.trim();
    if (!name) return;

    setUnits((current) => [
      ...current,
      {
        name,
        leader: form.leader.trim() || "A definir",
        position: current.length + 1,
        score: 0,
        completedTasks: 0,
        totalTasks: 0,
        completionRate: 0
      }
    ]);
    setIsModalOpen(false);
  }

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Unidades"
        subtitle="Gerencie as unidades do clube e acompanhe o desempenho"
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Adicionar Unidade"
        onButtonClick={openModal}
      />

      <div className={styles.grid}>
        {units.map((unit) => <UnitCard key={unit.name} {...unit} />)}
      </div>

      {isModalOpen && (
        <Modal
          className={modalStyles.formModal}
          title="Adicionar Unidade"
          labelledBy="add-unit-title"
          headerClassName={modalStyles.formHeader}
          bodyClassName={modalStyles.formBody}
          footerClassName={modalStyles.formFooter}
          footer={<><button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className={modalStyles.primaryAction} type="submit">Criar Unidade</button></>}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createUnit}
        >
          <label htmlFor="unitName">Nome da Unidade</label>
          <input id="unitName" name="unitName" placeholder="Ex: Tigres, Águias, Falcões..." value={form.unitName} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} required autoFocus />
          <label htmlFor="leader">Nome do Conselheiro (opcional)</label>
          <input id="leader" name="leader" placeholder="Ex: Carlos Silva" value={form.leader} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} />
        </Modal>
      )}
    </main>
  );
}

export default Unidades;
