import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <nav className={styles.navbar}>

      <div className={styles.logoArea}>
        <div className={styles.logo}>
          🏕️
        </div>

        <span className={styles.title}>
          Tigre da Montanha
        </span>
      </div>


      <div className={styles.menu}>

        <a href="/unidades">
          ▦ Unidades
        </a>

        <a href="/tarefas">
          ☑ Tarefas
        </a>

        <a href="/evidencias">
          ▤ Evidências
        </a>

        <a href="/cadernos">
          ♧ Cadernos
        </a>

        <a href="/convites">
          ✉ Convites
        </a>

      </div>


      <div className={styles.profile}>

        <span className={styles.notification}>
          ♧
        </span>

        <div className={styles.avatar}>
          A
        </div>

        <div>
          <strong>Ana Santos</strong>
          <small>Diretoria</small>
        </div>

        <span>⌄</span>

      </div>

    </nav>
  );
}

export default Navbar;