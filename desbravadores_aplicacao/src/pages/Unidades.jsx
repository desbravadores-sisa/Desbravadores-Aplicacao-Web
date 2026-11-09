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
  const [erroEnvio, setErroEnvio] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [form, setForm] = useState({ nome: "", genero: "", idadeMinima: "", idadeMaxima: "" });
  const [errosFormulario, setErrosFormulario] = useState({});
  const [tentouEnviar, setTentouEnviar] = useState(false);

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
    setErrosFormulario({});
    setErroEnvio("");
    setTentouEnviar(false);
    setIsModalOpen(true);
  }

  function validarFormulario(valores) {
    const erros = {};
    const nome = valores.nome.trim();
    const idadeMinima = valores.idadeMinima === "" ? null : Number(valores.idadeMinima);
    const idadeMaxima = valores.idadeMaxima === "" ? null : Number(valores.idadeMaxima);

    if (!nome) {
      erros.nome = "Informe o nome da unidade.";
    } else if (nome.length > 100) {
      erros.nome = "O nome da unidade deve ter no máximo 100 caracteres.";
    }

    if (!["Masculino", "Feminino", "Misto"].includes(valores.genero)) {
      erros.genero = "Selecione uma opção.";
    }

    if (idadeMinima === null) {
      erros.idadeMinima = "Informe a idade mínima necessária.";
    } else if (!Number.isInteger(idadeMinima) || idadeMinima < 1 || idadeMinima > 100) {
      erros.idadeMinima = "A idade mínima deve ser um número inteiro entre 1 e 100.";
    }

    if (idadeMaxima !== null) {
      if (!Number.isInteger(idadeMaxima) || idadeMaxima < 0) {
        erros.idadeMaxima = "A idade máxima deve ser um número inteiro igual ou maior que zero.";
      } else if (
        idadeMinima === null ||
        !Number.isInteger(idadeMinima) ||
        idadeMinima < 1 ||
        idadeMinima > 100
      ) {
        erros.idadeMaxima = "Para definir a idade máxima, preencha a mínima antes.";
      } else if (idadeMinima > idadeMaxima) {
        erros.idadeMaxima = "A idade máxima deve ser maior que a idade mínima necessária.";
      }
    }

    return erros;
  }

  function alterarCampo(event) {
    const { name, value } = event.target;
    const valoresAtualizados = { ...form, [name]: value };
    setForm(valoresAtualizados);
    setErroEnvio("");
    if (tentouEnviar) {
      setErrosFormulario((atuais) => {
        const novosErros = validarFormulario(valoresAtualizados);
        if (name !== "nome" && atuais.nome === "Já existe uma unidade com este nome.") {
          novosErros.nome = atuais.nome;
        }
        return novosErros;
      });
    }
  }

  async function createUnit(event) {
    event.preventDefault();
    const nome = form.nome.trim();
    setTentouEnviar(true);
    setErroEnvio("");
    const erros = validarFormulario(form);
    setErrosFormulario(erros);
    if (Object.keys(erros).length > 0) return;

    try {
      await api.post("/unidades", {
        nome: nome,
        genero: form.genero,
        idadeMinima: Number(form.idadeMinima),
        idadeMaxima: form.idadeMaxima ? Number(form.idadeMaxima) : null
      });
      setIsModalOpen(false);
      await carregarUnidades();
    } catch (err) {
      const status = err.response?.status;
      console.log(err.response)
      if (status === 409) {
        setErrosFormulario((atuais) => ({ ...atuais, nome: "Já existe uma unidade com este nome." }));
      } else if (status === 400 && err.response?.data?.campos) {
        const errosServidor = err.response.data.campos;
        setErrosFormulario((atuais) => ({
          ...atuais,
          ...Object.fromEntries(Object.entries(errosServidor).map(([campo, mensagem]) => [
            campo === "idadeMaximaValida" ? "idadeMaxima" : campo,
            mensagem
          ]))
        }));
      } else if (
        status === 400 &&
        err.response?.data?.message === "A idade máxima deve ser menor que a idade mínima necessária."
      ) {
        setErrosFormulario((atuais) => ({
          ...atuais,
          idadeMaxima: err.response.data.message
        }));
      } else {
        setErroEnvio("Não foi possível criar a unidade. Tente novamente.");
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
          noValidate
        >
          <label htmlFor="nome">Nome da Unidade</label>
          <input
            id="nome"
            name="nome"
            placeholder="Ex: Tigres, Águias, Falcões..."
            maxLength={100}
            value={form.nome}
            onChange={alterarCampo}
            required
            aria-invalid={Boolean(errosFormulario.nome)}
            aria-describedby={errosFormulario.nome ? "erro-nome-unidade" : undefined}
            autoFocus
          />
          {errosFormulario.nome && <p id="erro-nome-unidade" className={modalStyles.fieldError} role="alert">{errosFormulario.nome}</p>}
          <label htmlFor="genero">Gênero</label>
          <select
            id="genero"
            name="genero"
            value={form.genero}
            onChange={alterarCampo}
            required
            aria-invalid={Boolean(errosFormulario.genero)}
            aria-describedby={errosFormulario.genero ? "erro-genero-unidade" : undefined}
          >
            <option value="">Selecione uma opção</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Misto">Misto</option>
          </select>
          {errosFormulario.genero && <p id="erro-genero-unidade" className={modalStyles.fieldError} role="alert">{errosFormulario.genero}</p>}
          <label htmlFor="idadeMinima">Idade necessária (mínima)</label>
          <input
            id="idadeMinima"
            name="idadeMinima"
            type="number"
            min="1"
            max="100"
            placeholder="Ex: 10"
            value={form.idadeMinima}
            onChange={alterarCampo}
            required
            aria-invalid={Boolean(errosFormulario.idadeMinima)}
            aria-describedby={errosFormulario.idadeMinima ? "erro-idade-minima-unidade" : undefined}
          />
          {errosFormulario.idadeMinima && <p id="erro-idade-minima-unidade" className={modalStyles.fieldError} role="alert">{errosFormulario.idadeMinima}</p>}
          <label htmlFor="idadeMaxima">Idade Máxima (opcional)</label>
          <input
            id="idadeMaxima"
            name="idadeMaxima"
            type="number"
            min="0"
            value={form.idadeMaxima}
            onChange={alterarCampo}
            aria-invalid={Boolean(errosFormulario.idadeMaxima)}
            aria-describedby={errosFormulario.idadeMaxima ? "erro-idade-maxima-unidade" : undefined}
          />
          {errosFormulario.idadeMaxima && <p id="erro-idade-maxima-unidade" className={modalStyles.fieldError} role="alert">{errosFormulario.idadeMaxima}</p>}
          {erroEnvio && <p className={modalStyles.formError} role="alert">{erroEnvio}</p>}
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
