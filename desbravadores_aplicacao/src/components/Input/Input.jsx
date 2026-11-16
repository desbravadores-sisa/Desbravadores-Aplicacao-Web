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
  hideLabel = false,
  name,
  autoComplete,
  required = false,
  disabled = false
}) {
  const inputId = id || label;
  const errorId = `${inputId}-error`;
  const inputPlaceholder = placeholder || `Digite ${label.toLowerCase()}`;

  return (
    <div className={styles.formGroup}>
      <label className={hideLabel ? styles.visuallyHidden : styles.label} htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onChange={onChange}
        placeholder={inputPlaceholder}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
      {error && <span id={errorId} className={styles.errorMessage} role="alert">{error}</span>}
    </div>
  );
}

export default Input;
