import { useNavigate } from "react-router-dom";
import StatusBadge from "../StatusBadge/StatusBadge";
import styles from "./NotebookCard.module.css";

const cardClassByName = {
  Amigo: styles.amigo,
  Companheiro: styles.companheiro,
  Pesquisador: styles.pesquisador,
  Pioneiro: styles.pioneiro,
  Excursionista: styles.excursionista,
  Guia: styles.guia,
};

function NotebookCard({
  id,
  category,
  name,
  age,
  linkedMembers,
  startDate,
  endDate,
  status
}) {
  const navigate = useNavigate();

  return (

    <div className={`${styles.card} ${cardClassByName[name] ?? ""}`}>

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

      </div>


      <div className={styles.divider}></div>


      <div className={styles.footer}>

        <div>
          <p>Início: {startDate}</p>
          <p>Término: {endDate}</p>
        </div>

        <StatusBadge status={status} />

      </div>


      <button
        className={styles.button}
        type="button"
        onClick={() => navigate(`/cadernos/${id}`)}
      >
        Ver Caderno →
      </button>

    </div>

  );
}

export default NotebookCard;