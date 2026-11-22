import { Children, cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

function validationMessage(field) {
  const validity = field.validity;
  if (field.willValidate && field.required && ["text", "textarea"].includes(field.type) && !field.value.trim()) {
    return "Preencha este campo.";
  }
  if (!field.willValidate || validity.valid) return "";
  if (validity.valueMissing) return "Preencha este campo.";
  if (validity.typeMismatch) return field.type === "email" ? "Informe um e-mail válido." : "Informe um valor válido.";
  if (validity.rangeUnderflow) return `Informe um valor maior ou igual a ${field.min}.`;
  if (validity.rangeOverflow) return `Informe um valor menor ou igual a ${field.max}.`;
  if (validity.stepMismatch) return "Informe um valor válido para este campo.";
  if (validity.tooShort) return `Informe pelo menos ${field.minLength} caracteres.`;
  if (validity.tooLong) return `Informe no máximo ${field.maxLength} caracteres.`;
  return "Informe um valor válido.";
}

function decorateFields(children, errors, prefix, path = "field") {
  return Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;
    const childPath = `${path}-${index}`;
    if (typeof child.type === "string" && ["input", "select", "textarea"].includes(child.type)) {
      const id = child.props.id || `${prefix}-${childPath}`;
      const error = errors[id];
      const errorId = `${id}-validation-error`;
      const describedBy = [child.props["aria-describedby"], error && errorId].filter(Boolean).join(" ") || undefined;
      return (
        <>
          {cloneElement(child, {
            id,
            "aria-invalid": error ? true : child.props["aria-invalid"],
            "aria-describedby": describedBy
          })}
          {error && <span id={errorId} className={styles.fieldError} role="alert">{error}</span>}
        </>
      );
    }
    if (child.props.children != null) {
      return cloneElement(child, {}, decorateFields(child.props.children, errors, prefix, childPath));
    }
    return child;
  });
}

function Modal({
  children,
  className = "",
  stacked = false,
  title,
  eyebrow,
  eyebrowClassName = "",
  subtitle,
  subtitleClassName = "",
  labelledBy,
  headerClassName = "",
  bodyClassName = "",
  footer,
  footerClassName = "",
  onClose,
  onSubmit,
  noValidate = false
}) {
  const dialogRef = useRef(null);
  const validationId = useId();
  const [fieldErrors, setFieldErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const Container = onSubmit ? "form" : "div";

  function validate(form) {
    return Object.fromEntries(Array.from(form.elements)
      .filter((field) => field.id && field.validity)
      .map((field) => [field.id, validationMessage(field)])
      .filter(([, message]) => message));
  }

  function handleSubmit(event) {
    if (noValidate) {
      onSubmit(event);
      return;
    }
    event.preventDefault();
    const errors = validate(event.currentTarget);
    setAttempted(true);
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) onSubmit(event);
  }

  function handleChange(event) {
    if (attempted && !noValidate) setFieldErrors(validate(event.currentTarget));
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    dialog?.querySelector("button:not([disabled])")?.focus();

    return () => {
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, []);

  return createPortal((
    <div
      className={`${styles.backdrop} ${stacked ? styles.stackedBackdrop : ""}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <Container
        ref={dialogRef}
        className={`${styles.dialog} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        noValidate={onSubmit ? true : undefined}
        onSubmit={onSubmit ? handleSubmit : undefined}
        onChange={onSubmit ? handleChange : undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onClose?.();
          }
        }}
      >
        {title && (
          <header className={`${styles.header} ${headerClassName}`}>
            <div>
              {eyebrow && <small className={eyebrowClassName}>{eyebrow}</small>}
              <h2 id={labelledBy}>{title}</h2>
              {subtitle && <span className={subtitleClassName}>{subtitle}</span>}
            </div>
            <button type="button" aria-label="Fechar" onClick={onClose}>×</button>
          </header>
        )}
        <div className={`${styles.body} ${bodyClassName}`}>
          {onSubmit && !noValidate ? decorateFields(children, fieldErrors, validationId) : children}
        </div>
        {footer && <footer className={`${styles.footer} ${footerClassName}`}>{footer}</footer>}
      </Container>
    </div>
  ), document.body);
}

export default Modal;