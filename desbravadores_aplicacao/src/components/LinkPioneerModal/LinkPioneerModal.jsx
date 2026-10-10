import { useState } from "react";
import Input from "../Input/Input";
import Modal from "../Modal/Modal";
import styles from "./LinkPioneerModal.module.css";

/**
 * @param {{
 *   age: number,
 *   pioneers: Array<{ id: number, name: string, unit: string }>,
 *   onLinkPioneer: (pioneer: { id: number, name: string, unit: string }) => void,
 *   onClose: () => void
 * }} props
 */
function LinkPioneerModal({ age, pioneers, onLinkPioneer, onClose }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const filteredPioneers = pioneers.filter((pioneer) => (
    pioneer.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
  ));

  function linkPioneer(pioneer) {
    onLinkPioneer(pioneer);
    onClose();
  }

  return (
    <Modal
      className={styles.modal}
      title="Vincular desbravador"
      labelledBy="link-pioneer-modal-title"
      headerClassName={styles.header}
      bodyClassName={styles.body}
      onClose={onClose}
    >
      <p className={styles.description}>
        Somente desbravadores com <strong>{age} anos</strong> e ainda não vinculados a este ciclo são exibidos.
      </p>
      <div className={styles.search}>
        <i className="bx bx-search" aria-hidden="true" />
        <Input
          id="eligible-pioneer-search"
          label="Buscar por nome"
          hideLabel
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome..."
        />
      </div>
      {filteredPioneers.length ? (
        <ul className={styles.list}>
          {filteredPioneers.map((pioneer) => (
            <li key={pioneer.id}>
              <button type="button" onClick={() => linkPioneer(pioneer)}>
                <span className={styles.avatar} aria-hidden="true">
                  {pioneer.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
                <span className={styles.identity}>
                  <strong>{pioneer.name}</strong>
                  <small>{pioneer.unit}</small>
                </span>
                <i className="bx bx-plus" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Nenhum desbravador elegível encontrado.</p>
      )}
    </Modal>
  );
}

export default LinkPioneerModal;
