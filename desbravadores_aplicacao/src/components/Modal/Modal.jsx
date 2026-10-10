import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

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
  onSubmit
}) {
  const dialogRef = useRef(null);
  const Container = onSubmit ? "form" : "div";

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

  return (
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
        onSubmit={onSubmit}
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
        <div className={`${styles.body} ${bodyClassName}`}>{children}</div>
        {footer && <footer className={`${styles.footer} ${footerClassName}`}>{footer}</footer>}
      </Container>
    </div>
  );
}

export default Modal;