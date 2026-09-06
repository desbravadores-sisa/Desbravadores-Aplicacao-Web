import NotebookCard from "../components/NotebookCard/NotebookCard";

function Cadernos() {

  const cadernos = [
    {
      category: "LEÕES E TIGRESAS",
      name: "Amigo",
      age: 10,
      linkedMembers: 2,
      requirements: 6,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Ativo"
    },

    {
      category: "LEÕES E TIGRESAS",
      name: "Companheiro",
      age: 11,
      linkedMembers: 4,
      requirements: 7,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Ativo"
    },

    {
      category: "LEÕES E TIGRESAS",
      name: "Pesquisador",
      age: 12,
      linkedMembers: 3,
      requirements: 6,
      startDate: "10/02/2026",
      endDate: "10/02/2027",
      status: "Concluído antecipadamente"
    }
  ];


  return (

    <div>

      <h1>Cadernos</h1>

      <div>

        {cadernos.map((caderno) => (

          <NotebookCard
            key={caderno.name}
            {...caderno}
          />

        ))}

      </div>

    </div>

  );
}

export default Cadernos;