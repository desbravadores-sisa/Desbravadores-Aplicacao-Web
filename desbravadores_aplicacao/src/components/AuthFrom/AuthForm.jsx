import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AuthForm.module.css";
import logo from "../../assets/logo_tigredamontanha.png";
import Input from "../Input/Input";
import api from "../../service/api";

function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLock = useRef(false);
  const isLogin = type === "login";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!isLogin) return;
    const previousTitle = document.title;
    document.title = "Entrar | Tigre da Montanha";
    return () => {
      document.title = previousTitle;
    };
  }, [isLogin]);

  function changeEmail(event) {
    setEmail(event.target.value);
    if (isLogin) setErrors((current) => ({ ...current, email: "", form: "" }));
  }

  function changePassword(event) {
    setSenha(event.target.value);
    if (isLogin) setErrors((current) => ({ ...current, senha: "", form: "" }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin && submitLock.current) return;
    let newErrors = {};

    if (type === "register" && !nome) newErrors.nome = "O nome é obrigatório";
    const invalidEmail = isLogin
      ? !e.currentTarget.elements.namedItem("email").validity.valid
      : !email.includes("@");
    if (invalidEmail) newErrors.email = "Digite um e-mail válido";
    if (senha.length < 6) newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    if (type === "register" && senha !== confirmarSenha) newErrors.confirmarSenha = "As senhas não conferem";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (isLogin) {
        e.currentTarget.elements.namedItem(newErrors.email ? "email" : "senha").focus();
      }
      return;
    }

    if (type === "login") {
      submitLock.current = true;
      setIsSubmitting(true);
      api.post("/usuarios/login", { email: email, senha: senha })
        .then((resposta) => {
          const res = resposta.data;
          const perfil = String(res.tipoConta || "").toLowerCase();
          if (perfil === "conselheiro") {
            navigate("/minhas-tarefas");
          } else if (perfil === "diretoria") {
            navigate("/unidades");
          } else {
            setErrors({ form: "Tipo de usuário sem acesso configurado." });
          }
        })
        .catch((erro) => {
          const status = erro.response?.status;
          if (status === 401) {
            setErrors({ form: "E-mail ou senha inválidos." });
          } else {
            setErrors({ form: "Não foi possível entrar. Tente novamente." });
          }
        })
        .finally(() => {
          submitLock.current = false;
          setIsSubmitting(false);
        });
    } else if (type === "register") {
      api.post("/usuarios/cadastro", { nome: nome, email: email, senha: senha, token: token })
        .then(() => {
          navigate("/");
        })
        .catch((erro) => {
          const status = erro.response?.status;
          const messages = {
            400: "Verifique os dados informados e tente novamente.",
            404: "O convite não foi encontrado. Solicite um novo convite.",
            409: "Este e-mail já está cadastrado ou o convite já foi utilizado.",
            410: "O convite está expirado ou já foi aceito.",
            422: "O convite expirou ou o e-mail não corresponde ao convite.",
          };

          setErrors({ form: messages[status] || "Não foi possível cadastrar sua conta. Tente novamente." });
        });
    }
  };

  return (
    <main className={`${styles.container} ${isLogin ? styles.login : ""}`}>
      <div className={styles.brand}>
        <img className={styles.brandLogo} src={logo} alt="" />
        <h1 className={styles.title}>Tigre da Montanha</h1>
      </div>
      <p className={styles.subtitle}>Sistema de Gerenciamento das Tarefas</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate={isLogin} aria-busy={isLogin ? isSubmitting : undefined}>
        <h2 className={styles.formTitle}>
          {type === "login" ? "Entrar no Sistema" : "Criar Conta"}
        </h2>
        <p className={styles.formSubtitle}>
          {type === "login"
            ? "Acesse sua conta para continuar."
            : "Registre-se para obter acesso ao sistema."}
        </p>

        {type === "register" && (
          <Input label="Nome" type="text" placeholder="Digite seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} error={errors.nome} />
        )}

        <Input label="E-mail" name="email" type="email" autoComplete={isLogin ? "username" : "email"} required={isLogin} disabled={isSubmitting} placeholder="Digite seu e-mail" value={email} onChange={changeEmail} error={errors.email} />

        <Input label="Senha" name="senha" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required={isLogin} disabled={isSubmitting} placeholder="Digite a senha" value={senha} onChange={changePassword} error={errors.senha} />

        {type === "register" && (
          <Input label="Confirmar Senha" type="password" placeholder="Digite a senha novamente" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} error={errors.confirmarSenha} />
        )}

        <p className={styles.formError} role="alert" aria-atomic="true">{errors.form}</p>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isLogin ? (isSubmitting ? "Entrando..." : "Entrar") : "Cadastrar"}
        </button>
      </form>
      {isLogin && <p className={styles.status} role="status" aria-atomic="true">{isSubmitting ? "Acessando sua conta..." : ""}</p>}
    </main>
  );
}

export default AuthForm;
