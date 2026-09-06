import { NavLink } from "react-router-dom";
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

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/unidades">
          ▦ Unidades
        </NavLink>

        <a href="/tarefas">
          ☑ Tarefas
        </a>

        <a href="/evidencias">
          ▤ Evidências
        </a>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/cadernos">
          ♧ Cadernos
        </NavLink>

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