import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Cadernos from "./pages/Cadernos";
import LoginPage from "./pages/LoginPage";
import Perfil from "./pages/Perfil";
import RegisterPage from "./pages/RegisterPage";
import Unidades from "./pages/Unidades";
import Convites from "./pages/Convites";
import Evidencias from "./pages/Evidencias";
import Tarefas from "./pages/Tarefas";
import MinhasTarefas from "./pages/MinhasTarefas";
import { useSession, isDiretoria } from "./service/session";
import { SessionProvider } from "./service/SessionProvider";
function Protected({ diretoria = false }) {
  const { user, loading } = useSession();
  if (loading) return <p role="status">Carregando sessão...</p>;
  if (!user) return <Navigate to="/" replace />;
  if (diretoria && !isDiretoria(user.tipoConta)) return <Navigate to="/minhas-tarefas" replace />;
  return <Outlet />;
}
function Layout() { return <><Navbar /><Outlet /></>; }
function App() {
  return <BrowserRouter><SessionProvider><Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/cadastro" element={<RegisterPage />} />
    <Route element={<Protected />}><Route element={<Layout />}>
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/minhas-tarefas" element={<MinhasTarefas />} />
      <Route element={<Protected diretoria />}>
        <Route path="/unidades" element={<Unidades />} />
        <Route path="/cadernos" element={<Cadernos />} />
        <Route path="/convites" element={<Convites />} />
        <Route path="/evidencias" element={<Evidencias />} />
        <Route path="/tarefas" element={<Tarefas />} />
      </Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></SessionProvider></BrowserRouter>;
}
export default App;
