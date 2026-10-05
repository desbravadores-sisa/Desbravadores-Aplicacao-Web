import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    withCredentials: true
})

export function getKanbanBoard() {
    return api.get("/tarefas/kanban").then((response) => response.data);
}

export function updateTaskStatus(taskId, nextStatus) {
    return api.patch(`/tarefas/${taskId}/status`, { status: nextStatus });
}

export default api
