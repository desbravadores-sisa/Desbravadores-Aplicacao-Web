import { useEffect, useRef, useState } from "react";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import UnitCard from "../components/UnitCard/UnitCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import styles from "./Unidades.module.css";
import api from "../service/api";
import { errorMessage } from "../service/feedback";


function Unidades() {
  const [units, setUnits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ unitName: "", leader: "", minimumAge: "" });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  async function reload() {
    const { data } = await api.get("/unidades/diretor");
    setUnits((data || []).sort((a, b) => (b.pontuacao || 0) - (a.pontuacao || 0)).map((u, index) => ({
      id: u.id, name: u.nome, leader: u.nomeConselheiro || "A definir", position: index + 1,
      score: u.pontuacao || 0, completedTasks: u.tarefasConcluidas || 0, totalTasks: u.totalTarefas || 0,
      completionRate: u.totalTarefas ? Math.round(u.tarefasConcluidas / u.totalTarefas * 100) : 0
    })));
  }
  useEffect(() => { Promise.resolve().then(reload).catch(err => setError(errorMessage(err))); }, []);
  function openModal() {
    setForm({ unitName: "", leader: "", minimumAge: "" });
    setIsModalOpen(true);
  }

  async function createUnit(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true; setBusy(true); setError("");
    try {
      await api.post("/unidades", { nome: form.unitName.trim(), idadeMinima: Number(form.minimumAge) });
      await reload(); setIsModalOpen(false);
    } catch (err) { setError(errorMessage(err)); }
    finally { saving.current = false; setBusy(false); }
  }

  return (
    <main className={styles.page}>
      {!isModalOpen && error && <p role="alert">{error}</p>}
      <SectionHeader
        title="Unidades"
        subtitle="Gerencie as unidades do clube e acompanhe o desempenho"
        buttonIcon={<i className="bx bx-plus" />}
        buttonText="Adicionar Unidade"
        onButtonClick={openModal}
      />

      <div className={styles.grid}>
        {units.map((unit) => <UnitCard key={unit.id} {...unit} />)}
      </div>

      {isModalOpen && (
        <Modal
          className={modalStyles.formModal}
          title="Adicionar Unidade"
          labelledBy="add-unit-title"
          headerClassName={modalStyles.formHeader}
          bodyClassName={modalStyles.formBody}
          footerClassName={modalStyles.formFooter}
          footer={<><button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button><button className={modalStyles.primaryAction} disabled={busy} type="submit">Criar Unidade</button></>}
          onClose={() => setIsModalOpen(false)}
          onSubmit={createUnit}
        >
          {error && <p role="alert">{error}</p>}
          <label htmlFor="unitName">Nome da Unidade</label>
          <input id="unitName" name="unitName" placeholder="Ex: Tigres, Águias, Falcões..." value={form.unitName} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} required autoFocus />
          <p>O Conselheiro será vinculado à unidade pelo convite de cadastro.</p>
          <label htmlFor="minimumAge">Idade necessária</label>
          <input id="minimumAge" name="minimumAge" type="number" min="1" max="100" placeholder="Ex: 10" value={form.minimumAge} onChange={(event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))} required />
        </Modal>
      )}
    </main>
  );
}

export default Unidades;
