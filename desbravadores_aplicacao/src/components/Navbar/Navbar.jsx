import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  return (
    <nav className={styles.navbar}>

      <div className={styles.logoArea}>
        <div className={styles.logo}>
          <i className='bx bx-landscape'></i>
        </div>
        <span className={styles.title}>Tigre da Montanha</span>
      </div>

      <div className={styles.menu}>
        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/unidades">
          <i className='bx bx-group'></i> Unidades
        </NavLink>

        <a href="/tarefas">
          <i className='bx bx-check-square'></i> Tarefas
        </a>

        <a href="/evidencias">
          <i className='bx bx-list-check'></i> Evidências
        </a>

        <NavLink className={({ isActive }) => isActive ? styles.active : ""} to="/cadernos">
          <i className='bx bx-book'></i> Cadernos
        </NavLink>

        <a href="/convites">
          <i className='bx bx-envelope'></i> Convites
        </a>
      </div>

      <div className={styles.profile}>
        <i className='bx bx-bell'></i>

        <div className={styles.avatar}>A</div>

        <div>
          <strong>Ana Santos</strong>
          <small>Diretoria</small>
        </div>

        <i className='bx bx-chevron-down'></i>
      </div>

    </nav>
  );
}

export default Navbar;
