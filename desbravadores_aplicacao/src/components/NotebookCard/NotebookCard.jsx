import styles from "./NotebookCard.module.css";

function NotebookCard({
  category,
  name,
  age,
  linkedMembers,
  requirements,
  startDate,
  endDate,
  status
}) {

  return (

    <div className={styles.card}>

      <div className={styles.category}>
        {category}
      </div>


      <div className={styles.titleArea}>

        <div>
          <h2>{name}</h2>
          <span>{age} anos</span>
        </div>

        <div className={styles.icon}>
          📖
        </div>

      </div>


      <div className={styles.divider}></div>


      <div className={styles.info}>

        <div>
          <span>Vinculados</span>
          <strong>
            {linkedMembers} desbravadores
          </strong>
        </div>

        <div>
          <span>Requisitos</span>
          <strong>
            {requirements} por desbravador
          </strong>
        </div>

      </div>


      <div className={styles.divider}></div>


      <div className={styles.footer}>

        <div>
          <p>Início: {startDate}</p>
          <p>Término: {endDate}</p>
        </div>

        <span className={`${styles.status} ${
          status === "Ativo"
            ? styles.statusActive
            : status === "Concluído antecipadamente"
              ? styles.statusCompleted
              : styles.statusClosed
        }`}>
          ● {status}
        </span>

      </div>


      <button className={styles.button}>
        Ver Caderno →
      </button>

    </div>

  );
}

export default NotebookCard;