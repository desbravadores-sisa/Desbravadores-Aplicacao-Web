export function errorMessage(error) {
  return error.response?.data?.message || error.response?.data?.detail ||
    (error.response?.status === 403 ? "Você não tem permissão para esta ação." : "Não foi possível concluir a operação. Verifique os dados e tente novamente.");
}
export function notifyRefresh() { window.dispatchEvent(new Event("notifications:refresh")); }
