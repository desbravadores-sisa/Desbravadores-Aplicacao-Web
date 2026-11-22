import styles from "./Pagination.module.css";

export const MEMBERS_PER_PAGE = 8;

function Pagination({ total, page, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / MEMBERS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);

  if (total <= MEMBERS_PER_PAGE) return null;

  return (
    <nav className={styles.pagination} aria-label="Paginação dos membros">
      <span>
        Exibindo {(currentPage - 1) * MEMBERS_PER_PAGE + 1} a {Math.min(currentPage * MEMBERS_PER_PAGE, total)} de {total}
      </span>
      <div className={styles.controls}>
        <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Página anterior">
          <i className="bx bx-chevron-left" aria-hidden="true" /> Anterior
        </button>
        <span aria-current="page">Página {currentPage} de {pageCount}</span>
        <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pageCount} aria-label="Próxima página">
          Próxima <i className="bx bx-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
