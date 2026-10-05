import { useEffect, useState } from "react";
import { SessionContext } from "./session";
import api from "./api";
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    try { const { data } = await api.get("/usuarios/buscarUsuario"); setUser(data); return data; }
    catch { setUser(null); return null; }
    finally { setLoading(false); }
  }
  useEffect(() => {
    api.get("/usuarios/buscarUsuario").then(({ data }) => setUser(data)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  return <SessionContext.Provider value={{ user, loading, refresh, clear: () => setUser(null) }}>{children}</SessionContext.Provider>;
}
