import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal/Modal";
import modalStyles from "../components/Modal/Modal.module.css";
import api from "../service/api";
import styles from "./UnidadeDashboard.module.css";

const STATUS_LABEL = {
  "A FAZER": "A fazer",
  "EM ANDAMENTO": "Em andamento",
  "EM REVISAO": "Em revisão"
};

function formatarData(iso) {
  if (!iso) return "Sem prazo";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");
}

function faixaEtaria(min, max) {
  if (min == null && max == null) return "Faixa etária não definida";
  if (max == null || min === max) return `${min ?? max} anos`;
  if (min == null) return `Até ${max} anos`;
  return `${min} a ${max} anos`;
}

function Legenda({ cor, texto }) {
  return (
    <span className={styles.legendItem}>
      <i className={styles.legendSwatch} style={{ background: cor }} />
      {texto}
    </span>
  );
}

function BarrasSemanais({ semanas }) {
  const maximo = Math.max(1, ...semanas.map((s) => s.ganhos + s.descontos));
  return (
    <div className={styles.bars}>
      {semanas.map((s) => (
        <div key={s.rotulo} className={styles.barColumn}>
          <div
            className={styles.barTrack}
            title={`${s.rotulo} (${formatarData(s.inicio)} a ${formatarData(s.fim)}): ${s.ganhos} ganhos e ${s.descontos} descontos`}
            aria-label={`${s.rotulo}: ${s.ganhos} ganhos e ${s.descontos} descontos`}
          >
            <div className={styles.barLoss} style={{ height: `${(s.descontos / maximo) * 100}%` }} />
            <div className={styles.barGain} style={{ height: `${(s.ganhos / maximo) * 100}%` }} />
          </div>
          <span className={styles.axisLabel}>{s.rotulo}</span>
        </div>
      ))}
    </div>
  );
}

function CurvaSaldo({ historico }) {
  const maximo = Math.max(1, ...historico.flatMap((h) => [h.potencial, h.real]));
  const pontos = (campo) =>
    historico.map((h, i) => ({
      x: historico.length === 1 ? 50 : 6 + (i * 88) / (historico.length - 1),
      y: 90 - (h[campo] / maximo) * 76
    }));
  const caminho = (pts) =>
    pts.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const anterior = pts[i - 1];
      const meio = (anterior.x + p.x) / 2;
      return `${acc} C ${meio} ${anterior.y}, ${meio} ${p.y}, ${p.x} ${p.y}`;
    }, "");
  const real = pontos("real");
  const potencial = pontos("potencial");

  return (
    <div className={styles.curveBox}>
      <div className={styles.curvePlot}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.curveSvg} role="img" aria-label="Curva da evolução da pontuação">
          <path d="M 6 90 H 94" stroke="#e2e8f0" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
          <path d={caminho(potencial)} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" fill="none" vectorEffect="non-scaling-stroke" />
          <path d={caminho(real)} stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        {real.map((p, i) => (
          <span
            key={historico[i].rotulo}
            className={styles.curveDot}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            title={`${historico[i].rotulo}: ${historico[i].real} de ${historico[i].potencial} pts possíveis`}
          />
        ))}
      </div>
      <div className={styles.curveAxis}>
        {historico.map((h, i) => (
          <span key={h.rotulo} style={{ left: `${real[i].x}%` }}>{h.rotulo}</span>
        ))}
      </div>
    </div>
  );
}

function UnidadeDashboard() {
  const { unidadeId } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nome: "", idadeMinima: "", idadeMaxima: "" });
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const { data } = await api.get(`/unidades/${unidadeId}/dashboard`);
      setDados(data);
    } catch (error) {
      setErro(
        error.response?.status === 404
          ? "Unidade não encontrada no seu clube."
          : "Não foi possível carregar o painel da unidade. Verifique se a API está no ar."
      );
    } finally {
      setCarregando(false);
    }
  }, [unidadeId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const historico = useMemo(() => {
    if (!dados) return [];
    let potencial = 0;
    let real = 0;
    return dados.semanas.map((s) => {
      potencial += s.ganhos + s.descontos;
      real += s.ganhos;
      return { rotulo: s.rotulo, potencial, real };
    });
  }, [dados]);

  function abrirEdicao() {
    setForm({
      nome: dados.unidade.nome ?? "",
      idadeMinima: dados.unidade.idadeMinima ?? "",
      idadeMaxima: dados.unidade.idadeMaxima ?? ""
    });
    setErroForm(null);
    setEditando(true);
  }

  async function salvar(event) {
    event.preventDefault();
    const nome = form.nome.trim();
    const min = form.idadeMinima === "" ? null : Number(form.idadeMinima);
    const max = form.idadeMaxima === "" ? null : Number(form.idadeMaxima);
    if (!nome) return;
    if (min != null && max != null && min > max) {
      setErroForm("A idade final deve ser maior ou igual à inicial.");
      return;
    }
    try {
      setSalvando(true);
      await api.put("/unidades", {
        idUnidade: dados.unidade.id,
        nome,
        genero: dados.unidade.genero,
        idadeMinima: min,
        idadeMaxima: max
      });
      setEditando(false);
      await carregar();
    } catch (error) {
      setErroForm(
        error.response?.status === 409
          ? "Já existe uma unidade com este nome."
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando && !dados) {
    return <main className={styles.page}><p>Carregando painel da unidade...</p></main>;
  }

  if (erro) {
    return (
      <main className={styles.page}>
        <button type="button" className={styles.backLink} onClick={() => navigate("/unidades")}>
          <i className="bx bx-arrow-back" /> Voltar para Unidades
        </button>
        <p className={styles.error}>{erro}</p>
      </main>
    );
  }

  const { unidade, semanaAtual } = dados;
  const atividades = dados.atividades.filter((a) => filtro === "todas" || a.status === filtro);
  const cards = [
    { titulo: "Pontuação total", valor: dados.pontuacaoTotal, unidade: "pts", ajuda: "Saldo acumulado da unidade no ciclo", icone: "bx-trophy", tom: "orange" },
    { titulo: "Pontos de caderno", valor: dados.pontosCaderno, unidade: "pts", ajuda: "Conquistas de caderno já reconhecidas", icone: "bx-book-bookmark", tom: "purple" },
    { titulo: "Saldo da semana", valor: semanaAtual.ganhos - semanaAtual.descontos, unidade: "pts", ajuda: `${semanaAtual.ganhos} ganhos · ${semanaAtual.descontos} descontos`, icone: "bx-trending-up", tom: "green" },
    { titulo: "Evidências pendentes", valor: dados.evidenciasPendentes, unidade: "envios", ajuda: "Decisão necessária da Diretoria", icone: "bx-time-five", tom: "yellow" }
  ];

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div>
          <button type="button" className={styles.backLink} onClick={() => navigate("/unidades")}>
            <i className="bx bx-arrow-back" /> Voltar para Unidades
          </button>
          <h1 className={styles.title}>{unidade.nome}</h1>
          <p className={styles.subtitle}>Visão consolidada de pontos, atividades e evidências da unidade.</p>
        </div>

        <div className={styles.ownerCard}>
          <div>
            <p className={styles.ownerLabel}>Responsável pela unidade</p>
            <p className={styles.ownerName}>{unidade.nomeConselheiro || "A definir"}</p>
            <p className={styles.ownerAge}>
              <i className="bx bx-group" /> {faixaEtaria(unidade.idadeMinima, unidade.idadeMaxima)}
            </p>
          </div>
          <button type="button" className={styles.editButton} onClick={abrirEdicao} title="Editar dados da unidade">
            <i className="bx bx-pencil" /> Editar
          </button>
        </div>
      </div>

      <section className={styles.cards}>
        {cards.map((c) => (
          <div key={c.titulo} className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <p className={styles.cardTitle}>{c.titulo}</p>
                <p className={`${styles.cardValue} ${styles[`text_${c.tom}`]}`}>
                  {c.valor}
                  <span className={styles.cardUnit}>{c.unidade}</span>
                </p>
              </div>
              <span className={`${styles.cardIcon} ${styles[`bg_${c.tom}`]}`}>
                <i className={`bx ${c.icone}`} />
              </span>
            </div>
            <p className={styles.cardHelper}>{c.ajuda}</p>
          </div>
        ))}
      </section>

      <section className={styles.charts}>
        <div className={styles.panel}>
          <h2>Ganhos e descontos por semana</h2>
          <p className={styles.panelText}>Compare o que a unidade ganhou e perdeu em cada semana.</p>
          <div className={styles.legend}>
            <Legenda cor="#22c55e" texto="Ganhos" />
            <Legenda cor="#f87171" texto="Descontos" />
          </div>
          <BarrasSemanais semanas={dados.semanas} />
        </div>

        <div className={styles.panel}>
          <h2>Evolução do saldo acumulado</h2>
          <p className={styles.panelText}>Curva de crescimento da pontuação ao longo das últimas 6 semanas.</p>
          <div className={styles.legend}>
            <Legenda cor="#94a3b8" texto="Pontos possíveis" />
            <Legenda cor="#f97316" texto="Pontos ganhos" />
          </div>
          <CurvaSaldo historico={historico} />
        </div>
      </section>

      <section className={`${styles.panel} ${styles.activities}`}>
        <div className={styles.activitiesHead}>
          <div>
            <h2>Atividades disponíveis para {unidade.nome}</h2>
            <p className={styles.panelText}>Atividades abertas da unidade, com prazo e pontuação previstos.</p>
          </div>
          <span className={styles.openBadge}>
            <i className="bx bx-list-check" /> {dados.atividades.length} abertas
          </span>
        </div>

        <div className={styles.filter}>
          <i className="bx bx-search" />
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por status">
            <option value="todas">Todos os status</option>
            <option value="A FAZER">A fazer</option>
            <option value="EM ANDAMENTO">Em andamento</option>
            <option value="EM REVISAO">Em revisão</option>
          </select>
        </div>

        <div className={styles.activityList}>
          {atividades.map((a) => (
            <div key={a.idTarefaUnidade} className={styles.activity}>
              <div>
                <div className={styles.activityTitleRow}>
                  <p className={styles.activityTitle}>{a.titulo}</p>
                  <span className={a.tipo === "CADERNO" ? styles.tagCaderno : styles.tagGeral}>
                    {a.tipo === "CADERNO" ? "Caderno" : "Atividade geral"}
                  </span>
                </div>
                <p className={styles.activityDue}>Prazo: {formatarData(a.prazo)}</p>
              </div>
              <div className={styles.activityMeta}>
                <span className={styles.points}>{a.pontos} pts</span>
                <span className={styles.status}>{STATUS_LABEL[a.status] ?? a.status}</span>
              </div>
            </div>
          ))}
          {dados.atividades.length === 0 && (
            <p className={styles.empty}>Todas as atividades desta unidade estão concluídas.</p>
          )}
          {dados.atividades.length > 0 && atividades.length === 0 && (
            <p className={styles.empty}>Nenhuma atividade com este status.</p>
          )}
        </div>
      </section>

      {editando && (
        <Modal
          className={modalStyles.formModal}
          title="Editar unidade"
          subtitle="Atualize o nome e a faixa etária da unidade."
          labelledBy="edit-unit-title"
          headerClassName={modalStyles.formHeader}
          bodyClassName={modalStyles.formBody}
          footerClassName={modalStyles.formFooter}
          footer={
            <>
              <button type="button" onClick={() => setEditando(false)}>Cancelar</button>
              <button className={modalStyles.primaryAction} type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </>
          }
          onClose={() => setEditando(false)}
          onSubmit={salvar}
        >
          <label htmlFor="edit-nome">Nome da unidade</label>
          <input
            id="edit-nome"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
          />
          <label htmlFor="edit-min">Idade inicial</label>
          <input
            id="edit-min"
            type="number"
            min="1"
            max="100"
            value={form.idadeMinima}
            onChange={(e) => setForm((f) => ({ ...f, idadeMinima: e.target.value }))}
          />
          <label htmlFor="edit-max">Idade final</label>
          <input
            id="edit-max"
            type="number"
            min="1"
            max="100"
            value={form.idadeMaxima}
            onChange={(e) => setForm((f) => ({ ...f, idadeMaxima: e.target.value }))}
          />
          {erroForm && <p className={styles.formError}>{erroForm}</p>}
        </Modal>
      )}
    </main>
  );
}

export default UnidadeDashboard;
