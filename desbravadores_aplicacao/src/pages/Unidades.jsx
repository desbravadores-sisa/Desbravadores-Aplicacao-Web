import { useState } from "react";
import AddUnitModal from "../components/AddUnitModal/AddUnitModal";
import UnitCard from "../components/UnitCard/UnitCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Unidades.module.css";

const initialUnits = [
  {
    id: 1,
    name: "Tigresas",
    leader: "Carlos Silva",
    position: 1,
    score: 850,
    completedTasks: 12,
    totalTasks: 15,
    completionRate: 80
  },
  {
    id: 2,
    name: "Leões",
    leader: "Pedro Costa",
    position: 2,
    score: 720,
    completedTasks: 10,
    totalTasks: 15,
    completionRate: 67
  },
  {
    id: 3,
    name: "Onças",
    leader: "Maria Oliveira",
    position: 3,
    score: 680,
    completedTasks: 9,
    totalTasks: 15,
    completionRate: 60
  },
  {
    id: 4,
    name: "Panteras",
    leader: "João Almeida",
    position: 4,
    score: 540,
    completedTasks: 8,
    totalTasks: 15,
    completionRate: 53
  }
];

function Unidades() {
  const [units, setUnits] = useState(initialUnits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", leader: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) return;

    setUnits((current) => [
      {
        id: Date.now(),
        name: form.name.trim(),
        leader: form.leader.trim() || "Conselheiro a definir",
        position: current.length + 1,
        score: 0,
        completedTasks: 0,
        totalTasks: 15,
        completionRate: 0
      },
      ...current
    ]);

    setForm({ name: "", leader: "" });
    setIsModalOpen(false);
  }

  return (
    <main className={styles.page}>
      <SectionHeader
        title="Unidades"
        subtitle="Gerencie as unidades do clube e acompanhe o desempenho"
        buttonText="+ Adicionar Unidade"
        onButtonClick={() => setIsModalOpen(true)}
      />

      <div className={styles.grid}>
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            leader={unit.leader}
            position={unit.position}
            score={unit.score}
            completedTasks={unit.completedTasks}
            totalTasks={unit.totalTasks}
            completionRate={unit.completionRate}
          />
        ))}
      </div>

      {isModalOpen && (
        <AddUnitModal
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </main>
  );
}

export default Unidades;
