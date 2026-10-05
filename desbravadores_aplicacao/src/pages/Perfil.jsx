import { useEffect, useState } from "react";
import styles from "./Perfil.module.css";
import api from "../service/api";

const initialProfile = {
  name: "",
  email: ""
};

function Perfil() {
  
  const [activeTab, setActiveTab] = useState("details");
  const [profile, setProfile] = useState(initialProfile);
  const [savedName, setSavedName] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirmation: "" });
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    api.get("/usuarios/buscarUsuario", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setProfile({ name: data.nome ?? "", email: data.email ?? "" });
        setSavedName(data.nome ?? "");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setMessage("Não foi possível carregar os dados do perfil.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (message !== "Alterações salvas.") return;

    const timeoutId = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timeoutId);
  }, [message]);

  function updateProfile(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (isLoading || isSaving) return;

    const name = profile.name;
    setIsSaving(true);
    setMessage("");

    try {
      await api.patch("/usuarios/nome", { nome: name });
      setSavedName(name);
      setMessage("Alterações salvas.");
    } catch {
      setMessage("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (isChangingPassword) return;

    if (password.next !== password.confirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setIsChangingPassword(true);
    setMessage("");

    try {
      await api.patch("/usuarios/senha", {
        senhaAtual: password.current,
        senhaNova: password.next
      });
      setMessage("Senha alterada com sucesso.");
      setPassword({ current: "", next: "", confirmation: "" });
    } catch {
      setMessage("Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setIsChangingPassword(false);
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
          <div><h1>{savedName}</h1><span>Diretoria</span><p>{photoName ? `Foto selecionada: ${photoName}` : "Clique no ícone da câmera para alterar a foto"}</p></div>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Opções do perfil">
          <button className={activeTab === "details" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "details"} onClick={() => setActiveTab("details")}>Dados Pessoais</button>
          <button className={activeTab === "password" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "password"} onClick={() => setActiveTab("password")}>Alterar Senha</button>
        </div>

        {activeTab === "details" ? (
          <form className={styles.form} onSubmit={saveProfile} aria-busy={isLoading || isSaving}>
            <h2>Informações Pessoais</h2>
            <ProfileField icon="bx-user" label="Nome Completo" id="name" name="name" placeholder="Digite seu nome completo" value={profile.name} onChange={updateProfile} disabled={isLoading || isSaving} />
            <ProfileField icon="bx-envelope" label="E-mail" id="email" name="email" type="email" placeholder="Digite seu e-mail" value={profile.email} disabled />
            <button className={styles.saveButton} type="submit" disabled={isLoading || isSaving}>{isSaving ? "Salvando..." : "Salvar Alterações"}</button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={savePassword} aria-busy={isChangingPassword}>
            <h2>Alterar Senha</h2>
            <ProfileField icon="bx-lock-alt" label="Senha Atual" id="current" name="current" type="password" placeholder="Digite sua senha atual" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} disabled={isChangingPassword} />
            <ProfileField icon="bx-lock-alt" label="Nova Senha" id="next" name="next" type="password" placeholder="Digite sua nova senha" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} disabled={isChangingPassword} />
            <ProfileField icon="bx-lock-alt" label="Confirmar Nova Senha" id="confirmation" name="confirmation" type="password" placeholder="Digite sua nova senha novamente" value={password.confirmation} onChange={(event) => setPassword((current) => ({ ...current, confirmation: event.target.value }))} disabled={isChangingPassword} />
            <button className={styles.saveButton} type="submit" disabled={isChangingPassword}>{isChangingPassword ? "Alterando..." : "Alterar Senha"}</button>
          </form>
        )}
        {(isLoading || message) && <p className={styles.feedback} role="status">{isLoading ? "Carregando perfil..." : message}</p>}
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
