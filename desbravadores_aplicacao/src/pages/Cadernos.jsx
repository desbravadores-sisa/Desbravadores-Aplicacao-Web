import { useCallback, useEffect, useState } from "react";
import NotebookCard from "../components/NotebookCard/NotebookCard";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import SectionHeader from "../components/SectionHeader/SectionHeader";
import api from "../service/api";
import {
  formatDate,
  formatDateInput,
  getAgeFromBirthDate,
  listaDaResposta,
  mapearGruposCadernos,
  parseDateInput
} from "../service/cadernos";
import styles from "./Cadernos.module.css";

const notebookVisuals = {
  amigo: { name: "Amigo", abbreviation: "AM", color: "var(--notebook-amigo)", textColor: "#fff" },
  companheiro: { name: "Companheiro", abbreviation: "CO", color: "var(--notebook-companheiro)", textColor: "#fff" },
  pesquisador: { name: "Pesquisador", abbreviation: "PE", color: "var(--notebook-pesquisador)", textColor: "#fff" },
  pioneiro: { name: "Pioneiro", abbreviation: "PI", color: "var(--notebook-pioneiro)", textColor: "#172033" },
  excursionista: { name: "Excursionista", abbreviation: "EX", color: "var(--notebook-excursionista)", textColor: "#fff" },
  guia: { name: "Guia", abbreviation: "GU", color: "var(--notebook-guia)", textColor: "#172033" }
};

const emptyMember = { name: "", birthDate: "", unit: "" };

function getInitials(name) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function mensagemDeErro(err, padrao) {
  const status = err.response?.status;
  if (status === 403) return "Acesso restrito à diretoria.";
  if (status === 401) return "Sua sessão expirou. Faça login novamente.";
  return padrao;
}

// "Excursionista" -> "excursionista" (chave de notebookVisuals), ignorando acentos.
function chaveDoCaderno(nome) {
  return String(nome ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function Cadernos() {
  const [grupos, setGrupos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [idClube, setIdClube] = useState(null);
  const [units, setUnits] = useState([]);
  const [cycleModalOpen, setCycleModalOpen] = useState(false);
  const [cycleDates, setCycleDates] = useState({ startDate: "", endDate: "" });
  const [activeTab, setActiveTab] = useState("notebooks");
  const [members, setMembers] = useState([]);
  const [memberModal, setMemberModal] = useState(null);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const memberBirthDate = parseDateInput(memberForm.birthDate);
  const memberAge = memberBirthDate ? getAgeFromBirthDate(memberBirthDate) : null;
  const memberAgeOutOfRange = memberAge !== null && (memberAge < 10 || memberAge > 15);
  const cadernos = grupos.flatMap((grupo) => grupo.items);

  const carregarCadernos = useCallback(async () => {
    const resposta = await api.get("/cadernos/resumo");
    setGrupos(mapearGruposCadernos(listaDaResposta(resposta)));
  }, []);

  const carregarMembros = useCallback(async (clube, listaUnidades) => {
    const resposta = await api.get("/desbravadores", { params: { idClube: clube } });
    const nomePorUnidade = Object.fromEntries(listaUnidades.map((unidade) => [unidade.id, unidade.nome]));
    setMembers(listaDaResposta(resposta).map((desbravador) => ({
      id: desbravador.id,
      name: desbravador.nome,
      birthDate: desbravador.dataNascimento,
      age: desbravador.dataNascimento ? getAgeFromBirthDate(desbravador.dataNascimento) : null,
      unitId: desbravador.idUnidade,
      unit: nomePorUnidade[desbravador.idUnidade] ?? "—",
      genero: desbravador.genero,
      ativo: desbravador.ativo,
      joinedAt: desbravador.dataAdmissao ? formatDate(String(desbravador.dataAdmissao).split("T")[0]) : "—",
      // Histórico vindo do vínculo explícito (Desbravador_Caderno): concluídos = dataConclusao preenchida.
      linkedNotebooks: desbravador.cadernos ?? [],
      completedNotebooks: (desbravador.cadernos ?? [])
        .filter((caderno) => caderno.dataConclusao)
        .map((caderno) => chaveDoCaderno(caderno.nome))
    })));
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarTudo() {
      try {
        const [perfil, respostaUnidades] = await Promise.all([
          api.get("/usuarios/perfil"),
          api.get("/unidades/diretor").catch((err) => {
            if (err.response?.status === 404) return { status: 204, data: [] };
            throw err;
          })
        ]);
        if (!ativo) return;
        const listaUnidades = listaDaResposta(respostaUnidades);
        const clube = perfil.data?.idClube ?? null;
        setIdClube(clube);
        setUnits(listaUnidades);
        await Promise.all([carregarCadernos(), carregarMembros(clube, listaUnidades)]);
      } catch (err) {
        if (ativo) {
          setErro(mensagemDeErro(err, "Não foi possível carregar os cadernos. Verifique se a API está no ar."));
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarTudo();
    return () => {
      ativo = false;
    };
  }, [carregarCadernos, carregarMembros]);

  function getNotebookForAge(age) {
    return cadernos.find((caderno) => caderno.age === Number(age)) || null;
  }

  function handleCycleChange(event) {
    const { name, value } = event.target;
    setCycleDates((current) => ({ ...current, [name]: formatDateInput(value) }));
  }

  async function createCycle(event) {
    event.preventDefault();
    const startDate = parseDateInput(cycleDates.startDate);
    const endDate = parseDateInput(cycleDates.endDate);

    if (!startDate || !endDate || endDate < startDate) {
      return;
    }

    try {
      // O back encerra o ciclo ativo e aplica o novo período a todos os cadernos do clube.
      // A pontuação do ranking (por ciclo) recomeça do zero; as tarefas são atribuídas de novo no ciclo novo.
      await api.post("/ciclos", {
        nome: `Ciclo ${formatDate(startDate)} a ${formatDate(endDate)}`,
        dataInicio: startDate,
        dataFim: endDate,
        ativo: true
      });
      setErro(null);
      setAviso("Novo ciclo iniciado e aplicado a todos os cadernos. A pontuação das unidades recomeça neste ciclo.");
      await carregarCadernos();
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível criar o ciclo. Tente novamente."));
    }
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
      unit: member.unitId ? String(member.unitId) : ""
    });
    setMemberModal({ type: "edit", member });
  }

  async function saveMember(event) {
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

    const payload = {
      nome: memberForm.name.trim(),
      idClube,
      idUnidade: Number(memberForm.unit),
      dataNascimento: memberBirthDate || memberModal.member?.birthDate || null,
      genero: isNewMember ? null : memberModal.member.genero ?? null,
      ativo: isNewMember ? true : memberModal.member.ativo ?? true
    };

    try {
      if (isNewMember) {
        await api.post("/desbravadores", payload);
      } else {
        await api.put(`/desbravadores/${memberModal.member.id}`, payload);
      }
      setErro(null);
      setMemberModal(null);
      await Promise.all([carregarMembros(idClube, units), carregarCadernos()]);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível salvar o desbravador. Verifique os dados e tente novamente."));
    }
  }

  async function deleteMember() {
    const member = memberToDelete;
    if (!member) return;
    setMemberToDelete(null);
    try {
      await api.delete(`/desbravadores/${member.id}`);
      setErro(null);
      await Promise.all([carregarMembros(idClube, units), carregarCadernos()]);
    } catch (err) {
      setErro(mensagemDeErro(err, "Não foi possível excluir o desbravador."));
    }
  }

  const memberNotebook = memberBirthDate && !memberAgeOutOfRange ? getNotebookForAge(memberAge) : null;

  return (
    <main className={styles.page}>
      <div className={`${styles.content} ${activeTab === "notebooks" ? styles.notebooksContent : ""}`}>
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

        {carregando && <p>Carregando cadernos...</p>}
        {erro && <p role="alert">{erro}</p>}
        {aviso && <p role="status">{aviso}</p>}

        {!carregando && activeTab === "notebooks" && grupos.length === 0 && !erro && (
          <p>Nenhum caderno cadastrado para o clube.</p>
        )}

        {!carregando && (activeTab === "notebooks" ? grupos.map((grupo) => (
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
                <NotebookCard key={caderno.id} {...caderno} />
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
                  {members.length === 0 && (
                    <tr><td colSpan={7}>Nenhum desbravador cadastrado.</td></tr>
                  )}
                  {members.map((member) => {
                    // Caderno atual = vínculo em andamento; sem vínculo, sugere o da idade.
                    const linked = member.linkedNotebooks.find((caderno) => !caderno.dataConclusao);
                    const notebook = linked
                      ? { name: linked.nome }
                      : member.age !== null ? getNotebookForAge(member.age) : null;
                    const completedNotebooks = member.completedNotebooks
                      .map((notebookId) => notebookVisuals[notebookId])
                      .filter(Boolean);
                    return (
                      <tr key={member.id}>
                        <td data-label="Desbravador"><span className={styles.memberAvatar}>{getInitials(member.name)}</span><strong>{member.name}</strong></td>
                        <td data-label="Idade">{member.age !== null ? `${member.age} anos` : "—"}</td>
                        <td data-label="Unidade">{member.unit}</td>
                        <td data-label="Caderno atual">
                          <strong>{notebook ? notebook.name : "—"}</strong>
                          {notebook && !linked && <small className={styles.notLinked}> (não vinculado)</small>}
                        </td>
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
                            <button type="button" aria-label={`Excluir ${member.name}`} onClick={() => setMemberToDelete(member)}><i className="bx bx-trash" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
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
                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.nome}</option>)}
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
              <span>
                {memberNotebook
                  ? `Com ${memberAge} anos, este desbravador pertence ao caderno ${memberNotebook.name}. Após o cadastro, o vínculo será criado automaticamente.`
                  : `Com ${memberAge} anos, ainda não há caderno cadastrado para esta idade.`}
              </span>
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
          <p className={styles.cycleNotice}>
            O período será aplicado a todos os cadernos do clube. O ciclo atual será encerrado e a pontuação
            das unidades recomeça do zero no novo ciclo (o histórico continua salvo).
          </p>
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
      {memberToDelete && (
        <Modal
          className={modalStyles.confirmModal}
          title="Excluir Desbravador"
          labelledBy="delete-member-title"
          headerClassName={modalStyles.confirmHeader}
          footerClassName={modalStyles.confirmActions}
          footer={<><button type="button" onClick={() => setMemberToDelete(null)}>Cancelar</button><button className={modalStyles.confirmDanger} type="button" onClick={deleteMember}>Excluir</button></>}
          onClose={() => setMemberToDelete(null)}
        >
          <p>Tem certeza que deseja excluir “{memberToDelete.name}”? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </main>
  );
}

export default Cadernos;
