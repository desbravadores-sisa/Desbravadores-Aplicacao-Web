import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Modal from "./components/Modal/Modal";
import modalStyles from "./components/Modal/Modal.module.css";
import Cadernos from "./pages/Cadernos";
import CadernoDetalhe from "./pages/CadernoDetalhe";
import LoginPage from "./pages/LoginPage";
import Perfil from "./pages/Perfil";
import RegisterPage from "./pages/RegisterPage";
import Unidades from "./pages/Unidades";
import UnidadeDashboard from "./pages/UnidadeDashboard";
import CounselorTasks from "./pages/CounselorTasks";
import CounselorDesbravadores from "./pages/CounselorDesbravadores";
import Convites from "./pages/Convites";
import Evidencias from "./pages/Evidencias";
import Tarefas from "./pages/Tarefas";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    function handleSessionExpired() {
      setSessionExpired(true);
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  function returnToLogin() {
    setSessionExpired(false);
    navigate("/", { replace: true });
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route
          path="/unidades"
          element={
            <>
              <Navbar />
              <Unidades />
            </>
          }
        />
        <Route
          path="/minhas-tarefas"
          element={
            <>
              <Navbar />
              <CounselorTasks />
            </>
          }
        />
        <Route
          path="/desbravadores"
          element={
            <>
              <Navbar />
              <CounselorDesbravadores />
            </>
          }
        />
        <Route
          path="/unidades/:unidadeId"
          element={
            <>
              <Navbar />
              <UnidadeDashboard />
            </>
          }
        />
        <Route
          path="/cadernos"
          element={
            <>
              <Navbar />
              <Cadernos />
            </>
          }
        />
        <Route
          path="/cadernos/:cadernoId"
          element={
            <>
              <Navbar />
              <CadernoDetalhe />
            </>
          }
        />
        <Route
          path="/convites"
          element={
            <>
              <Navbar />
              <Convites />
            </>
          }
        />
        <Route
          path="/evidencias"
          element={
            <>
              <Navbar />
              <Evidencias />
            </>
          }
        />
        <Route
          path="/tarefas"
          element={
            <>
              <Navbar />
              <Tarefas />
            </>
          }
        />
        <Route
          path="/perfil"
          element={<PerfilPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {sessionExpired && (
        <Modal
          className={modalStyles.formModal}
          title="Sessão encerrada"
          labelledBy="session-expired-title"
          headerClassName={modalStyles.formHeader}
          bodyClassName={modalStyles.formBody}
          footerClassName={modalStyles.formFooter}
          footer={(
            <button className={modalStyles.primaryAction} type="button" onClick={returnToLogin}>
              Fazer Login novamente
            </button>
          )}
          onClose={returnToLogin}
        >
          <p>Sua sessão foi encerrada por inatividade. Faça login novamente para continuar.</p>
        </Modal>
      )}
    </>
  );
}

function PerfilPage() {
  const [profileVersion, setProfileVersion] = useState(0);

  function handleProfileUpdated() {
    setProfileVersion((current) => current + 1);
  }

  return (
    <>
      <Navbar profileVersion={profileVersion} />
      <Perfil onProfileUpdated={handleProfileUpdated} />
    </>
  );
}

export default App;
