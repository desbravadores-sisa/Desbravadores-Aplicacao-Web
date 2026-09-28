import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./AuthForm.module.css";
import Input from "../Input/Input";
import api from "../../service/api";

function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (type === "register" && !nome) newErrors.nome = "O nome é obrigatório";
    if (!email.includes("@")) newErrors.email = "Digite um e-mail válido";
    if (senha.length < 6) newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    if (type === "register" && senha !== confirmarSenha) newErrors.confirmarSenha = "As senhas não conferem";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    if (type === "login") {
      api.post("/usuarios/login", { email: email, senha: senha }, { withCredentials: true })
        .then((resposta) => {
          const res = resposta.data;
          sessionStorage.setItem("desbravadores.user", JSON.stringify({ nome: res.nome, tipoConta: res.tipoConta }));
          const role = String(res.tipoConta).toLowerCase();
          if (role === "conselheiro") {
            navigate("/minhas-tarefas");
          } else if (["diretoria", "diretor"].includes(role)) {
            navigate("/unidades");
          } else {
            setErrors({ form: "Tipo de usuário sem acesso configurado." });
          }
        }).catch((erro) => {
          const status = erro.response?.status;
          if (status === 401) {
            setErrors({ senha: "E-mail ou senha inválidos." });
          } else {
            setErrors({ form: "Não foi possível entrar. Tente novamente." });
          }
        });
    } else if (type === "register") {
      api.post("/usuarios/cadastro", { nome: nome, email: email, senha: senha, token: token })
      .then((resposta) => {
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
    <div className={styles.container}>
      <h1 className={styles.title}>Tigre da Montanha</h1>
      <p className={styles.subtitle}>Sistema de Gerenciamento das Tarefas</p>

      <form onSubmit={handleSubmit} className={styles.form}>
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

        <Input label="E-mail" type="email" placeholder="Digite seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

        <Input label="Senha" type="password" placeholder="Digite a senha" value={senha} onChange={(e) => setSenha(e.target.value)} error={errors.senha} />

        {type === "register" && (
          <Input label="Confirmar Senha" type="password" placeholder="Digite a senha novamente" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} error={errors.confirmarSenha} />
        )}

        {errors.form && <p className={styles.formError}>{errors.form}</p>}

        <button type="submit" className={styles.button}>
          {type === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
