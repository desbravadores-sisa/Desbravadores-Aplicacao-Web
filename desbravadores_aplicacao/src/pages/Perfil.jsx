import { useEffect, useState } from "react";
import styles from "./Perfil.module.css";
import api, { urlArquivo } from "../service/api";

const initialProfile = {
  name: "",
  email: ""
};
const initialPassword = { current: "", next: "", confirmation: "" };

function Perfil({ onProfileUpdated }) {

  const [activeTab, setActiveTab] = useState("details");
  const [profile, setProfile] = useState(initialProfile);
  const [savedName, setSavedName] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [password, setPassword] = useState(initialPassword);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordFormError, setPasswordFormError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFeedback, setPhotoFeedback] = useState("");
  const [isPhotoError, setIsPhotoError] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    api.get("/usuarios/perfil", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setProfile({ name: data.nome ?? "", email: data.email ?? "" });
        setSavedName(data.nome ?? "");
        setPhotoUrl(data.fotoUrl ?? null);
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

  function changeTab(tab) {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setProfileErrors({});
    setPassword(initialPassword);
    setPasswordErrors({});
    setPasswordFormError("");
    setMessage("");
    if (tab === "details") {
      setProfile((current) => ({ ...current, name: savedName }));
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoFeedback("Escolha uma imagem JPG, PNG ou WEBP.");
      setIsPhotoError(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoFeedback("A imagem deve ter no máximo 5 MB.");
      setIsPhotoError(true);
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", file);
    setIsUploadingPhoto(true);
    setPhotoFeedback("Enviando foto...");
    setIsPhotoError(false);

    try {
      const { data } = await api.put("/usuarios/perfil/foto", formData);
      if (!data?.fotoUrl) {
        throw new Error("A API não retornou a URL da foto.");
      }
      setPhotoUrl(data.fotoUrl);
      setPhotoFeedback("Foto de perfil atualizada.");
      onProfileUpdated?.();
    } catch {
      setPhotoFeedback("Não foi possível enviar a foto. Tente novamente.");
      setIsPhotoError(true);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (isLoading || isSaving) return;

    const name = profile.name.trim();
    if (!name) {
      setProfileErrors({ name: "Preencha o campo Nome Completo." });
      setMessage("");
      return;
    }

    setProfileErrors({});
    const email = profile.email;
    setIsSaving(true);
    setMessage("");

    try {
      await api.put("/usuarios/perfil", { nome: name, email });
      setProfile((current) => ({ ...current, name }));
      setSavedName(name);
      setMessage("Alterações salvas.");
      onProfileUpdated?.();
    } catch {
      setMessage("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    if (isChangingPassword) return;

    const errors = {};
    if (!password.current) {
      errors.current = "Informe a senha atual.";
    }
    if (!password.next) {
      errors.next = "Informe a nova senha.";
    } else if (password.next.length < 6) {
      errors.next = "A nova senha deve ter ao menos 6 caracteres.";
    } else if (password.current && password.next === password.current) {
      errors.next = "A nova senha deve ser diferente da senha atual.";
    }
    if (!password.confirmation) {
      errors.confirmation = "Confirme a nova senha.";
    } else if (password.next && password.next !== password.confirmation) {
      errors.confirmation = "A confirmação deve ser igual à nova senha.";
    }

    setPasswordErrors(errors);
    setPasswordFormError("");
    setMessage("");
    if (Object.keys(errors).length > 0) return;

    setIsChangingPassword(true);

    try {
      await api.put("/usuarios/senha", {
        senhaAtual: password.current,
        novaSenha: password.next,
        confirmacaoNovaSenha: password.confirmation
      });
      setMessage("Senha alterada com sucesso.");
      setPassword(initialPassword);
    } catch (error) {
      const status = error.response?.status;
      const response = error.response?.data;
      const serverErrors = response?.campos ?? {};
      const mappedErrors = Object.fromEntries(Object.entries(serverErrors).map(([field, text]) => [
        field === "senhaAtual" ? "current" :
          field === "novaSenha" ? "next" :
            field === "confirmacaoNovaSenha" || field === "confirmacaoNovaSenhaValida" ? "confirmation" : field,
        text
      ]));

      if (status === 401) {
        mappedErrors.current = response?.message || "A senha atual está incorreta.";
      } else if (response?.message === "A nova senha deve ser diferente da senha atual.") {
        mappedErrors.next = response.message;
      } else if (response?.message === "A confirmação da nova senha não corresponde.") {
        mappedErrors.confirmation = response.message;
      }

      if (Object.keys(mappedErrors).length > 0) {
        setPasswordErrors(mappedErrors);
      } else {
        setPasswordFormError("Não foi possível alterar a senha. Tente novamente.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.profileCard}>
        <header className={styles.profileHeader}>
          <div className={styles.photoArea}>
            <div className={styles.photo}>
              {photoUrl
                ? <img className={styles.photoImage} src={urlArquivo(photoUrl)} alt={`Foto de perfil de ${savedName}`} />
                : <span>{savedName.charAt(0).toUpperCase() || <i className="bx bx-user" />}</span>}
            </div>
            <label className={`${styles.cameraButton} ${isUploadingPhoto ? styles.cameraButtonDisabled : ""}`} title={isUploadingPhoto ? "Enviando foto..." : "Alterar foto"}>
              <i className="bx bx-camera" />
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={isUploadingPhoto} aria-label="Selecionar foto de perfil" />
            </label>
          </div>
          <div>
            <h1>{savedName}</h1>
            <span>Diretoria</span>
            <p className={isPhotoError ? styles.photoFeedbackError : ""} role="status" aria-live="polite">
              {photoFeedback || (photoUrl ? "Clique no ícone da câmera para alterar a foto" : "Clique no ícone da câmera para adicionar uma foto")}
            </p>
          </div>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Opções do perfil">
          <button className={activeTab === "details" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "details"} onClick={() => changeTab("details")}>Dados Pessoais</button>
          <button className={activeTab === "password" ? styles.tabActive : ""} type="button" role="tab" aria-selected={activeTab === "password"} onClick={() => changeTab("password")}>Alterar Senha</button>
        </div>

        {activeTab === "details" ? (
          <form className={styles.form} onSubmit={saveProfile} aria-busy={isLoading || isSaving} noValidate>
            <h2>Informações Pessoais</h2>
            <ProfileField icon="bx-user" label="Nome Completo" id="name" name="name" placeholder="Digite seu nome completo" value={profile.name} onChange={updateProfile} disabled={isLoading || isSaving} error={profileErrors.name} />
            <ProfileField icon="bx-envelope" label="E-mail" id="email" name="email" type="email" placeholder="Digite seu e-mail" value={profile.email} disabled />
            <button className={styles.saveButton} type="submit" disabled={isLoading || isSaving}>{isSaving ? "Salvando..." : "Salvar Alterações"}</button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={savePassword} aria-busy={isChangingPassword} noValidate>
            <h2>Alterar Senha</h2>
            <ProfileField icon="bx-lock-alt" label="Senha Atual" id="current" name="current" type="password" placeholder="Digite sua senha atual" value={password.current} onChange={(event) => setPassword((current) => ({ ...current, current: event.target.value }))} disabled={isChangingPassword} error={passwordErrors.current} />
            <ProfileField icon="bx-lock-alt" label="Nova Senha" id="next" name="next" type="password" placeholder="Digite sua nova senha" value={password.next} onChange={(event) => setPassword((current) => ({ ...current, next: event.target.value }))} disabled={isChangingPassword} error={passwordErrors.next} />
            <ProfileField icon="bx-lock-alt" label="Confirmar Nova Senha" id="confirmation" name="confirmation" type="password" placeholder="Digite sua nova senha novamente" value={password.confirmation} onChange={(event) => setPassword((current) => ({ ...current, confirmation: event.target.value }))} disabled={isChangingPassword} error={passwordErrors.confirmation} />
            <button className={styles.saveButton} type="submit" disabled={isChangingPassword}>{isChangingPassword ? "Alterando..." : "Alterar Senha"}</button>
            {passwordFormError && <p className={styles.fieldError} role="alert">{passwordFormError}</p>}
          </form>
        )}
        {(isLoading || message) && <p className={styles.feedback} role="status">{isLoading ? "Carregando perfil..." : message}</p>}
      </section>
    </main>
  );
}

function ProfileField({ icon, label, id, error, ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={`${styles.fieldControl} ${error ? styles.fieldControlError : ""}`}>
        <i className={`bx ${icon}`} />
        <input
          id={id}
          {...inputProps}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && <span id={errorId} className={styles.fieldError} role="alert">{error}</span>}
    </div>
  );
}

export default Perfil;
