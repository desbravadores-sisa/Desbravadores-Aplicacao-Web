// Funções compartilhadas pelas telas de Cadernos ("Cadernos", aba "Membros" e "Ver Caderno").
// Concentram o mapeamento das respostas da API para o formato usado pelos componentes visuais.

const CORES_GRUPO = ["orange", "blue", "green", "purple"];

/** Respostas 204 (ou corpo vazio) significam lista vazia. */
export function listaDaResposta(resposta) {
  if (!resposta || resposta.status === 204 || !Array.isArray(resposta.data)) return [];
  return resposta.data;
}

/** "2026-02-10" → "10/02/2026"; vazio → "—". */
export function formatDate(date) {
  if (!date) return "—";
  const [year, month, day] = String(date).split("T")[0].split("-");
  return day && month && year ? `${day}/${month}/${year}` : "—";
}

/** Máscara dd/mm/aaaa enquanto o usuário digita. */
export function formatDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join("/");
}

/** "dd/mm/aaaa" válido → "aaaa-mm-dd"; inválido → "". */
export function parseDateInput(value) {
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

/** Idade em anos completos (mesma regra do TIMESTAMPDIFF da view vw_resumo_cadernos). */
export function getAgeFromBirthDate(birthDate) {
  const [year, month, day] = String(birthDate).split("T")[0].split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month
    || (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }

  return age;
}

/** GET /cadernos/resumo → grupos no formato dos cards (NotebookCard). */
export function mapearGruposCadernos(gruposApi) {
  return gruposApi
    .map((grupo) => {
      const items = (grupo.cadernos ?? []).map((caderno) => ({
        id: caderno.idCaderno,
        category: (grupo.nomeGrupo ?? "Outros").toUpperCase(),
        name: caderno.nome,
        age: caderno.idadeAlvo,
        linkedMembers: caderno.totalVinculados ?? 0,
        requirementCount: caderno.totalRequisitos ?? 0,
        startDate: formatDate(caderno.dataInicio),
        endDate: formatDate(caderno.dataFim),
        status: caderno.status
      }));
      const idades = items.map((item) => item.age).filter((idade) => idade != null);
      const menor = idades.length ? Math.min(...idades) : null;
      const maior = idades.length ? Math.max(...idades) : null;

      return {
        name: grupo.nomeGrupo ?? "Outros",
        subtitle: menor === null ? "" : menor === maior ? `Cadernos para ${menor} anos` : `Cadernos para ${menor} a ${maior} anos`,
        minAge: menor ?? Number.MAX_SAFE_INTEGER,
        items
      };
    })
    .sort((a, b) => a.minAge - b.minAge)
    .map((grupo, indice) => ({ ...grupo, color: CORES_GRUPO[indice % CORES_GRUPO.length] }));
}
