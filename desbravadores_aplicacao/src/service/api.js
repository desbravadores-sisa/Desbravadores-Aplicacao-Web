import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

export function getKanbanBoard() {
    return api.get("/tarefas/kanban").then((response) => response.data);
}

export function updateTaskStatus(taskId, nextStatus) {
    return api.patch(`/tarefas/${taskId}/status`, { status: nextStatus });
}

/** Check-in das crianças numa tarefa de caderno (conselheiro). */
export function getCheckin(taskId) {
    return api.get(`/tarefas/${taskId}/checkin`).then((response) => response.data);
}

export function marcarCheckin(taskId, idDesbravador, concluiu) {
    return api.put(`/tarefas/${taskId}/checkin/${idDesbravador}`, { concluiu }).then((response) => response.data);
}

/** Envia para a Diretoria um check-in com parte das crianças marcadas. */
export function enviarCheckinParaRevisao(taskId) {
    return api.post(`/tarefas/${taskId}/checkin/enviar`).then((response) => response.data);
}

/** Envia a evidência (foto/PDF) de uma tarefa de clube; a tarefa vai para "Em revisão". */
export function enviarEvidencia(taskId, arquivo, comentario) {
    const form = new FormData();
    form.append("idTarefa", taskId);
    form.append("arquivo", arquivo);
    if (comentario) form.append("comentario", comentario);
    return api.post("/evidencias/envio", form).then((response) => response.data);
}

/** URL absoluta de um arquivo servido pela API ("/arquivos/..."). */
export function urlArquivo(caminho) {
    if (!caminho) return null;
    if (/^https?:\/\//.test(caminho)) return caminho;

    const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
    const filePath = caminho.startsWith("/") ? caminho : `/${caminho}`;
    return `${baseUrl}${filePath}`;
}

export default api
