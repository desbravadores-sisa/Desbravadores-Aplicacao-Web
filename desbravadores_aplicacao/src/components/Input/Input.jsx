import React from "react";
import styles from "./Input.module.css";

function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  hideLabel = false
}) {
  const inputId = id || label;
  const inputPlaceholder = placeholder || `Digite ${label.toLowerCase()}`;

  return (
    <div className={styles.formGroup}>
      <label className={hideLabel ? styles.visuallyHidden : styles.label} htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
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
