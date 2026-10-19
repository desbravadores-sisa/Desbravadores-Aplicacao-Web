import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import UnitCard from "../components/UnitCard/UnitCard";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import api from "../service/api";
import styles from "./Unidades.module.css";

function Unidades() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [form, setForm] = useState({ nome: "", genero: "", idadeMinima: "", idadeMaxima: "" });

  useEffect(() => {
    carregarUnidades();
  }, []);

  async function carregarUnidades() {
    try {
      setCarregando(true);
      const { data } = await api.get("/unidades/diretor");
      setUnits(data || []);
      setErro(null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        setErro("Acesso restrito à diretoria.");
      } else if (status === 204 || status === 404) {
        setUnits([]);
        setErro(null);
      } else {
        setErro("Não foi possível carregar as unidades. Verifique se a API está no ar.");
      }
    } finally {
      setCarregando(false);
    }
  }

  function openModal() {
    setForm({ nome: "", genero: "", idadeMinima: "", idadeMaxima: "" });
    setIsModalOpen(true);
  }

  async function createUnit(event) {
    event.preventDefault();
    const nome = form.nome.trim();
    if (!nome || !form.idadeMinima) return;

    try {
      await api.post("/unidades", {
        nome: nome,
        genero: form.genero || null,
        idadeMinima: form.idadeMinima ? Number(form.idadeMinima) : null,
        idadeMaxima: form.idadeMaxima ? Number(form.idadeMaxima) : null
      });
      setIsModalOpen(false);
      await carregarUnidades();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setErro("Já existe uma unidade com este nome.");
      } else {
        setErro("Não foi possível criar a unidade. Tente novamente.");
      }
    }
  }

  async function deleteUnit() {
    const unit = unitToDelete;
    if (!unit) return;
    setUnitToDelete(null);
    try {
      await api.delete(`/unidades/${unit.id}`);
      await carregarUnidades();
    } catch (err) {
      setErro("Não foi possível excluir a unidade.");
    }
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

      {carregando && <p>Carregando unidades...</p>}
      {erro && <p role="alert">{erro}</p>}
      {!carregando && !erro && units.length === 0 && (
        <p>Nenhuma unidade cadastrada para o clube.</p>
      )}

      <div className={styles.grid}>
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.nome}
            leader={unit.nomeConselheiro || "A definir"}
            minimumAge={unit.idadeMinima}
            score={unit.pontuacao || 0}
            completedTasks={unit.tarefasConcluidas || 0}
            totalTasks={unit.totalTarefas || 0}
            completionRate={unit.totalTarefas > 0 ? Math.round((unit.tarefasConcluidas / unit.totalTarefas) * 100) : 0}
            onDelete={() => setUnitToDelete(unit)}
            onDetails={() => navigate(`/unidades/${unit.id}`)}
          />
        ))}
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
          <label htmlFor="nome">Nome da Unidade</label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex: Tigres, Águias, Falcões..."
            value={form.nome}
            onChange={(e) => setForm((c) => ({ ...c, nome: e.target.value }))}
            required
            autoFocus
          />
          <label htmlFor="genero">Gênero (opcional)</label>
          <input
            id="genero"
            name="genero"
            placeholder="Ex: Masculino, Feminino, Misto"
            value={form.genero}
            onChange={(e) => setForm((c) => ({ ...c, genero: e.target.value }))}
          />
          <label htmlFor="idadeMinima">Idade necessária (mínima)</label>
          <input
            id="idadeMinima"
            name="idadeMinima"
            type="number"
            min="1"
            max="100"
            placeholder="Ex: 10"
            value={form.idadeMinima}
            onChange={(e) => setForm((c) => ({ ...c, idadeMinima: e.target.value }))}
            required
          />
          <label htmlFor="idadeMaxima">Idade Máxima (opcional)</label>
          <input
            id="idadeMaxima"
            name="idadeMaxima"
            type="number"
            min="0"
            value={form.idadeMaxima}
            onChange={(e) => setForm((c) => ({ ...c, idadeMaxima: e.target.value }))}
          />
        </Modal>
      )}
      {unitToDelete && (
        <Modal
          className={modalStyles.confirmModal}
          title="Excluir Unidade"
          labelledBy="delete-unit-title"
          headerClassName={modalStyles.confirmHeader}
          footerClassName={modalStyles.confirmActions}
          footer={<><button type="button" onClick={() => setUnitToDelete(null)}>Cancelar</button><button className={modalStyles.confirmDanger} type="button" onClick={deleteUnit}>Excluir</button></>}
          onClose={() => setUnitToDelete(null)}
        >
          <p>Tem certeza que deseja excluir “{unitToDelete.nome}”? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </main>
  );
}

export default Unidades;
