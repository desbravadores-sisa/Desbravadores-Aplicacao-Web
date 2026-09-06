import React, { useState } from "react";
import styles from "./AuthForm.module.css";
import Input from "../Input/Input";

function AuthForm({ type }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (type === "register" && !nome) newErrors.nome = "O nome é obrigatório";
    if (!email.includes("@")) newErrors.email = "Digite um e-mail válido";
    if (type === "register" && !telefone) newErrors.telefone = "O telefone é obrigatório";
    if (senha.length < 6) newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    if (type === "register" && senha !== confirmarSenha) newErrors.confirmarSenha = "As senhas não conferem";

    setErrors(newErrors);
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
          <Input label="Nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} error={errors.nome} />
        )}

        <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />

        {type === "register" && (
          <Input label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} error={errors.telefone} />
        )}

        <Input label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} error={errors.senha} />

        {type === "register" && (
          <Input label="Confirmar Senha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} error={errors.confirmarSenha} />
        )}

        <button type="submit" className={styles.button}>
          {type === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}

export default AuthForm;
