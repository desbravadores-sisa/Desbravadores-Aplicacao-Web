import { createContext, useContext } from "react";
export const SessionContext = createContext(null);
export function isDiretoria(role) {
  return ["DIRETORIA", "DIRETOR", "VICE_DIRETOR", "SECRETARIA"].includes(
    (role || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[- ]/g, "_")
  );
}
export function useSession() { return useContext(SessionContext); }
