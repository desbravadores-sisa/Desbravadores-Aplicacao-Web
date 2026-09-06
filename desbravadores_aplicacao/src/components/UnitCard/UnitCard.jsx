import styles from "./UnitCard.module.css";

function UnitCard({
  name,
  leader,
  position,
  score,
  completedTasks,
  totalTasks,
  completionRate
}) {

  return (
    <div className={styles.card}>

      <div className={styles.header}>

        <h2>{name}</h2>

        <span className={styles.position}>
          #{position}
        </span>

      </div>


      <div className={styles.leader}>
        ♙ {leader}
      </div>


      <div className={styles.stats}>

        <div className={styles.stat}>
          <span>🏆 Pontuação</span>

          <strong className={styles.score}>
            {score}
          </strong>
        </div>


        <div className={styles.stat}>
          <span>✓ Tarefas Concluídas</span>

          <strong>
            {completedTasks}/{totalTasks}
          </strong>
        </div>


        <div className={styles.stat}>
          <span>↗ Taxa de Conclusão</span>

          <strong>
            {completionRate}%
          </strong>
        </div>

      </div>


      <div className={styles.progressBackground}>

        <div
          className={styles.progress}
          style={{
            width: `${completionRate}%`
          }}
        />

      </div>


      <button className={styles.button}>
        Ver Detalhes
      </button>

    </div>
  );
}

export default UnitCard;