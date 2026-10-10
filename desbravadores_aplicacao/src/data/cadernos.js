export const initialCadernos = [
  {
    id: "amigo",
    category: "LEÕES E TIGRESAS",
    name: "Amigo",
    age: 10,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo",
    requirementCount: 6
  },
  {
    id: "companheiro",
    category: "LEÕES E TIGRESAS",
    name: "Companheiro",
    age: 11,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Ativo",
    requirementCount: 7
  },
  {
    id: "pesquisador",
    category: "LEÕES E TIGRESAS",
    name: "Pesquisador",
    age: 12,
    startDate: "10/02/2026",
    endDate: "10/02/2027",
    status: "Concluído antecipadamente",
    requirementCount: 6
  },
  {
    id: "pioneiro",
    category: "ONÇAS E PANTERAS",
    name: "Pioneiro",
    age: 13,
    startDate: "15/02/2026",
    endDate: "15/02/2027",
    status: "Ativo",
    requirementCount: 6
  },
  {
    id: "excursionista",
    category: "ONÇAS E PANTERAS",
    name: "Excursionista",
    age: 14,
    startDate: "18/02/2026",
    endDate: "18/02/2027",
    status: "Ativo",
    requirementCount: 6
  },
  {
    id: "guia",
    category: "ONÇAS E PANTERAS",
    name: "Guia",
    age: 15,
    startDate: "10/02/2025",
    endDate: "10/02/2026",
    status: "Encerrado",
    requirementCount: 6
  }
];

export const initialMembers = [
  {
    id: 1,
    name: "Marina Costa",
    age: 10,
    unit: "Tigresas",
    joinedAt: "10/02/2026",
    cadernoId: "amigo",
    completedRequirements: 1,
    completedRequirementIds: ["amigo-requirement-1"],
    inProgressRequirementIds: ["amigo-requirement-2"],
    requirementObservations: {
      "amigo-requirement-1": "Apresentou trabalho sobre história dos Desbravadores."
    },
    completedNotebooks: []
  },
  {
    id: 2,
    name: "Gabriel Souza",
    age: 10,
    unit: "Leões",
    joinedAt: "10/02/2026",
    cadernoId: "amigo",
    completedRequirements: 2,
    completedRequirementIds: ["amigo-requirement-1", "amigo-requirement-2"],
    inProgressRequirementIds: [],
    requirementObservations: {
      "amigo-requirement-1": "Atividade aprovada pelo conselheiro.",
      "amigo-requirement-2": "Trilha e registros concluídos."
    },
    completedNotebooks: []
  },
  { id: 3, name: "Ana Clara", age: 11, unit: "Tigresas", joinedAt: "15/03/2026", cadernoId: "companheiro", completedRequirements: 0, completedNotebooks: [] },
  { id: 4, name: "Pedro Henrique", age: 11, unit: "Leões", joinedAt: "20/02/2026", cadernoId: "companheiro", completedRequirements: 1, completedNotebooks: [] },
  {
    id: 5,
    name: "Lucas Almeida",
    age: 11,
    unit: "Leões",
    joinedAt: "05/01/2026",
    cadernoId: "companheiro",
    completedRequirements: 7,
    completedRequirementIds: Array.from({ length: 7 }, (_, index) => `companheiro-requirement-${index + 1}`),
    requirementObservations: {
      "companheiro-requirement-1": "Aprovado.",
      "companheiro-requirement-2": "ok",
      "companheiro-requirement-3": "Projeto apresentado e aprovado pelo conselheiro.",
      "companheiro-requirement-4": "Concluído.",
      "companheiro-requirement-5": "Concluído.",
      "companheiro-requirement-6": "Concluído.",
      "companheiro-requirement-7": "Concluído."
    },
    completedNotebooks: ["companheiro"]
  },
  { id: 6, name: "Sofia Martins", age: 11, unit: "Tigresas", joinedAt: "12/02/2026", cadernoId: "companheiro", completedRequirements: 2, completedNotebooks: [] },
  { id: 7, name: "Helena Lima", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", cadernoId: "pesquisador", completedRequirements: 1, completedNotebooks: ["pesquisador"] },
  { id: 8, name: "Rafael Torres", age: 12, unit: "Leões", joinedAt: "10/02/2026", cadernoId: "pesquisador", completedRequirements: 2, completedNotebooks: ["pesquisador"] },
  { id: 9, name: "Beatriz Santos", age: 12, unit: "Tigresas", joinedAt: "10/02/2026", cadernoId: "pesquisador", completedRequirements: 4, completedNotebooks: ["pesquisador"] },
  { id: 10, name: "Carlos Eduardo", age: 13, unit: "Onças", joinedAt: "15/02/2026", cadernoId: "pioneiro", completedRequirements: 0, completedNotebooks: [] },
  { id: 11, name: "João Pedro", age: 13, unit: "Panteras", joinedAt: "18/02/2026", cadernoId: "pioneiro", completedRequirements: 3, completedNotebooks: [] },
  { id: 12, name: "Camila Rocha", age: 13, unit: "Onças", joinedAt: "20/02/2026", cadernoId: "pioneiro", completedRequirements: 2, completedNotebooks: [] },
  { id: 13, name: "Enzo Ferreira", age: 14, unit: "Onças", joinedAt: "18/02/2026", cadernoId: "excursionista", completedRequirements: 1, completedNotebooks: [] },
  { id: 14, name: "Isabela Mendes", age: 14, unit: "Panteras", joinedAt: "22/02/2026", cadernoId: "excursionista", completedRequirements: 4, completedNotebooks: [] },
  { id: 15, name: "Matheus Oliveira", age: 15, unit: "Onças", joinedAt: "10/02/2025", cadernoId: "guia", completedRequirements: 2, completedNotebooks: [] },
  { id: 16, name: "Laura Almeida", age: 15, unit: "Panteras", joinedAt: "12/02/2025", cadernoId: "guia", completedRequirements: 3, completedNotebooks: [] },
  { id: 17, name: "Davi Carvalho", age: 15, unit: "Onças", joinedAt: "15/02/2025", cadernoId: "guia", completedRequirements: 0, completedNotebooks: [] }
];

const requirementTemplates = {
  amigo: [
    {
      title: "Identidade do desbravador",
      description: "Conhecer a história e os valores do movimento Desbravadores."
    },
    {
      title: "Vida na natureza",
      description: "Realizar trilha orientada e registrar fauna e flora observadas."
    },
    {
      title: "Hábitos saudáveis",
      description: "Participar do desafio de saúde por 30 dias consecutivos."
    },
    {
      title: "Serviço à comunidade",
      description: "Participar de uma ação de serviço comunitário organizada pela unidade."
    },
    {
      title: "Habilidades manuais",
      description: "Demonstrar uma habilidade manual e explicar como ela pode ser utilizada."
    },
    {
      title: "Especialidade básica",
      description: "Desenvolver uma especialidade básica com orientação do conselheiro."
    }
  ],
  companheiro: [
    {
      title: "Liderança na unidade",
      description: "Atuar como auxiliar do conselheiro por no mínimo um mês."
    },
    {
      title: "Primeiros socorros",
      description: "Demonstrar procedimentos básicos de primeiros socorros para a unidade."
    },
    {
      title: "Projeto ambiental",
      description: "Planejar e participar de um projeto ambiental com a unidade."
    },
    {
      title: "Desenvolvimento espiritual",
      description: "Preparar e apresentar uma reflexão espiritual para a unidade."
    },
    {
      title: "Acampamento",
      description: "Participar do planejamento e da realização de um acampamento."
    },
    {
      title: "Habilidades ao ar livre",
      description: "Demonstrar habilidades de orientação e segurança ao ar livre."
    },
    {
      title: "Serviço comunitário",
      description: "Participar de uma atividade de serviço em benefício da comunidade."
    }
  ],
  default: [
  {
    title: "Especialidade básica",
    description: "Desenvolver uma especialidade básica com orientação do conselheiro."
  },
  {
    title: "Devocional",
    description: "Conduzir o devocional da unidade por uma semana inteira."
  },
  {
    title: "Conhecimento do caderno",
    description: "Demonstrar conhecimento dos temas estudados neste caderno."
  },
  {
    title: "Atividade prática",
    description: "Participar de uma atividade prática relacionada ao ciclo."
  },
  {
    title: "Serviço à comunidade",
    description: "Planejar e realizar uma ação de serviço à comunidade."
  },
  {
    title: "Apresentação final",
    description: "Apresentar ao conselheiro o que aprendeu durante o ciclo."
  }
  ]
};

export function getNotebookForAge(age, cadernos = initialCadernos) {
  return cadernos.find((caderno) => caderno.age === Number(age)) || cadernos[0];
}

export function getMembersForNotebook(caderno, members = initialMembers) {
  return members.filter((member) => member.cadernoId === caderno.id);
}

export function getRequirementsForNotebook(cadernoId) {
  const requirements = requirementTemplates[cadernoId] || requirementTemplates.amigo;

  return requirements.map((requirement, index) => ({
    ...requirement,
    id: `${cadernoId}-requirement-${index + 1}`
  }));
}
