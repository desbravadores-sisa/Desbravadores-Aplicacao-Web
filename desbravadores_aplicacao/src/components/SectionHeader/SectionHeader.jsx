import styles from "./SectionHeader.module.css";

function SectionHeader({ title, subtitle, buttonText, onButtonClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button
        type="button"
        className={styles.addButton}
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </header>
  );
}

export default SectionHeader;
