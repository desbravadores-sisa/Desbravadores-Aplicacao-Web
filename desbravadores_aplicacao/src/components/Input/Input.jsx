import React from "react";
import styles from "./Input.module.css";

function Input({ label, type = "text", value, onChange, error, placeholder }) {
  const inputPlaceholder = placeholder || `Digite ${label.toLowerCase()}`;

  return (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={label}>{label}</label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={inputPlaceholder}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}

export default Input;
