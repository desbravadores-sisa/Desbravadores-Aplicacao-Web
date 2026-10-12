import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import styles from "./Perfil.module.css";

function Perfil() {
  const [activeTab, setActiveTab] = useState("details");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ nome: "", email: "", telefone: "" });
  const [emailOriginal, setEmailOriginal] = useState("");
  const [tipoConta, setTipoConta] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirmation: "" });
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      setCarregando(true);
      const { data } = await api.get("/usuarios/perfil");
      if (data) {
        setProfile({
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
        });
        setEmailOriginal(data.email || "");
        setTipoConta(data.tipoConta || "");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/");
        return;
      }
      setMessage("Não foi possível carregar o perfil.");
    } finally {
      setCarregando(false);
    }
  }

  function updateProfile(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    try {
      await api.put("/usuarios/perfil", {
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone,
      });
      // O JWT da sessão é emitido para o e-mail; ao trocá-lo é preciso entrar de novo.
      if (emailOriginal && profile.email.trim().toLowerCase() !== emailOriginal.toLowerCase()) {
        setMessage("E-mail alterado. Faça login novamente com o novo e-mail.");
        await api.post("/usuarios/logoff").catch(() => {});
        setTimeout(() => navigate("/"), 1500);
        return;
      }
      setMessage("Alterações salvas.");
    } catch (err) {
      const status = err.response?.status;
      setMessage(status === 409 ? "Este e-mail já está em uso por outro usuário." : "Não foi possível salvar as alterações.");
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (password.next !== password.confirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }
    try {
      await api.put("/usuarios/senha", {
        senhaAtual: password.current,
        novaSenha: password.next,
      });
      setMessage("Senha alterada com sucesso.");
      setPassword({ current: "", next: "", confirmation: "" });
    } catch (err) {
      const status = err.response?.status;
      setMessage(status === 401 ? "Senha atual incorreta." : status === 400 ? "A nova senha deve ter pelo menos 6 caracteres." : "Não foi possível alterar a senha.");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.profileCard}>
        <header className={styles.profileHeader}>
          <div className={styles.photoArea}>
            <div className={styles.photo}>{photoName ? <span>{photoName.slice(0, 1).toUpperCase()}</span> : <i className="bx bx-user" />}</div>
            <label className={styles.cameraButton} title="Alterar foto">
              <i className="bx bx-camera" />
              <input type="file" accept="image/*" onChange={(event) => setPhotoName(event.target.files?.[0]?.name || "")} />
            </label>
          </div>
          <div><h1>{profile.nome || "Usuário"}</h1><span>{tipoConta || "—"}</span><p>{photoName ? `Foto selecionada: ${photoName}` : "Clique no ícone da câmera para alterar a foto"}</p></div>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Opções do perfil">
          <button className={activeTab === "details" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "details"} onClick={() => setActiveTab("details")}>Dados Pessoais</button>
          <button className={activeTab === "password" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "password"} onClick={() => setActiveTab("password")}>Alterar Senha</button>
        </div>

        {activeTab === "details" ? (
          <form className={styles.form} onSubmit={saveProfile}>
            <h2>Informações Pessoais</h2>
            <ProfileField icon="bx-user" label="Nome Completo" id="nome" name="nome" placeholder="Digite seu nome completo" value={profile.nome} onChange={updateProfile} />
            <ProfileField icon="bx-envelope" label="E-mail" id="email" name="email" type="email" placeholder="Digite seu e-mail" value={profile.email} onChange={updateProfile} />
            <ProfileField icon="bx-phone" label="Telefone" id="telefone" name="telefone" type="tel" placeholder="Digite seu telefone" value={profile.telefone} onChange={updateProfile} />
            <button className={styles.saveButton} type="submit">Salvar Alterações</button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={savePassword}>
            <h2>Alterar Senha</h2>
            <ProfileField icon="bx-lock-alt" label="Senha Atual" id="current" name="current" type="password" placeholder="Digite sua senha atual" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} />
            <ProfileField icon="bx-lock-alt" label="Nova Senha" id="next" name="next" type="password" placeholder="Digite sua nova senha" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} />
            <ProfileField icon="bx-lock-alt" label="Confirmar Nova Senha" id="confirmation" name="confirmation" type="password" placeholder="Digite sua nova senha novamente" value={password.confirmation} onChange={(event) => setPassword((current) => ({ ...current, confirmation: event.target.value }))} />
            <button className={styles.saveButton} type="submit">Alterar Senha</button>
          </form>
        )}
        {message && <p className={styles.feedback} role="status">{message}</p>}
      </section>
    </main>
  );
}

function ProfileField({ icon, label, id, ...inputProps }) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <div><i className={`bx ${icon}`} /><input id={id} {...inputProps} required /></div>
    </label>
  );
}

export default Perfil;
