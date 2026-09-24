import { useState } from "react";
import styles from "./Perfil.module.css";

const initialProfile = {
  name: "Ana Santos",
  email: "diretoria@tigre.com",
  phone: "(11) 98765-4321"
};

function Perfil() {
  const [activeTab, setActiveTab] = useState("details");
  const [profile, setProfile] = useState(initialProfile);
  const [password, setPassword] = useState({ current: "", next: "", confirmation: "" });
  const [photoName, setPhotoName] = useState("");
  const [message, setMessage] = useState("");

  function updateProfile(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function saveProfile(event) {
    event.preventDefault();
    setMessage("Alterações salvas.");
  }

  function savePassword(event) {
    event.preventDefault();
    if (password.next !== password.confirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }
    setMessage("Senha alterada com sucesso.");
    setPassword({ current: "", next: "", confirmation: "" });
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
          <div><h1>{profile.name}</h1><span>Diretoria</span><p>{photoName ? `Foto selecionada: ${photoName}` : "Clique no ícone da câmera para alterar a foto"}</p></div>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Opções do perfil">
          <button className={activeTab === "details" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "details"} onClick={() => setActiveTab("details")}>Dados Pessoais</button>
          <button className={activeTab === "password" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "password"} onClick={() => setActiveTab("password")}>Alterar Senha</button>
        </div>

        {activeTab === "details" ? (
          <form className={styles.form} onSubmit={saveProfile}>
            <h2>Informações Pessoais</h2>
            <ProfileField icon="bx-user" label="Nome Completo" id="name" name="name" placeholder="Digite seu nome completo" value={profile.name} onChange={updateProfile} />
            <ProfileField icon="bx-envelope" label="E-mail" id="email" name="email" type="email" placeholder="Digite seu e-mail" value={profile.email} onChange={updateProfile} />
            <ProfileField icon="bx-phone" label="Telefone" id="phone" name="phone" type="tel" placeholder="Digite seu telefone" value={profile.phone} onChange={updateProfile} />
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
