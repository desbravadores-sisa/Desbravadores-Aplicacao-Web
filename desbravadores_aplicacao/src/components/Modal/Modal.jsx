import styles from "./Modal.module.css";

function Modal({
  children,
  className = "",
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
  const Container = onSubmit ? "form" : "div";

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <Container
        className={`${styles.dialog} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onSubmit={onSubmit}
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