import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Cadernos from "./pages/Cadernos";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Unidades from "./pages/Unidades";

function App() {
  return (
    <BrowserRouter>
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
          path="/cadernos"
          element={
            <>
              <Navbar />
              <Cadernos />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
