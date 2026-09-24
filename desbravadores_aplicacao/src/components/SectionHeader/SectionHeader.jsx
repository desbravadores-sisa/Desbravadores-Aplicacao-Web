import styles from "./SectionHeader.module.css";

function SectionHeader({ title, subtitle, buttonText, buttonIcon, onButtonClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {buttonText && (
        <button
          type="button"
          className={styles.addButton}
          onClick={onButtonClick}
        >
          {buttonIcon}
          {buttonText}
        </button>
      )}
    </header>
  );
}

export default SectionHeader;
