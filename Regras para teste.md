# Regras de teste — Tela de Login

## Objetivo e escopo

Definir a sequência para avaliar somente a tela de Login (`/`): funcionamento, validações e retornos, acessibilidade e responsividade. Estas regras não autorizam alteração na aplicação.

**Nesta etapa, apenas documentar as regras. Não abrir o site, não executar testes e não enviar dados à API.**

## Ferramentas a utilizar na execução futura

- **Chrome tools / navegador integrado:** abrir e navegar na aplicação, inspecionar a árvore de acessibilidade, preencher campos e acionar botões, verificar foco e capturar screenshots.
- **Chrome DevTools:** usar Elements/Accessibility para semântica e nomes acessíveis; Console para erros de JavaScript; Network para status/tempo das requisições e respostas da API; Device Toolbar para emular viewports.
- **Playwright:** quando as ações manuais não forem suficientes, automatizar os mesmos passos, testar teclado e viewports e medir rolagem horizontal. Scripts devem usar contas/dados descartáveis e não imprimir credenciais.
- **Lighthouse e axe DevTools/axe-core ou WAVE:** avaliar acessibilidade e boas práticas. Usar os resultados como apoio à verificação manual, não como substituto para teste por teclado e leitor de tela.

## Preparação e segurança

1. Usar ambiente local ou de homologação, nunca produção.
2. Confirmar que a aplicação e a API estão disponíveis antes dos casos que dependem de rede; registrar navegador, ambiente e data.
3. Usar e-mails e credenciais fictícios para casos negativos. Usar credenciais de teste autorizadas para o caso de sucesso; não gravar senhas em screenshots, console ou relatório.
4. Não testar bloqueio de conta, força bruta ou volume de tentativas. Uma tentativa controlada por caso é suficiente.
5. Registrar cada execução com ID, viewport, passos, resultado esperado, resultado observado e status (**Passou**, **Falhou**, **Parcial** ou **Bloqueado**).
6. Nesta tarefa de documentação, não executar nenhum dos casos abaixo. Resultados de execuções anteriores podem ser citados como baseline, identificando sua data e origem.

## Sequência de testes

| ID | Cenário | Ações | Resultado esperado |
|---|---|---|---|
| L01 | Carregamento inicial | Abrir `/` em sessão limpa. | Logo/título, texto de orientação, campos E-mail e Senha e botão Entrar visíveis; nenhuma falha inesperada no Console. |
| L02 | Campos vazios | Acionar Entrar sem preencher os campos. | Não enviar a requisição; mostrar erros claros e associados aos campos; manter a página utilizável. |
| L03 | E-mail malformado | Testar e-mail sem `@`, sem parte local, domínio inválido e espaços. | Impedir envio com indicação compreensível; observar se a validação é do navegador ou da aplicação e não depender apenas de uma mensagem transitória. |
| L04 | Senha curta | Informar e-mail válido e senha com menos de 6 caracteres. | Impedir envio e explicar o limite; não apagar o e-mail. |
| L05 | E-mail válido e senha inválida | Enviar credenciais fictícias bem formadas. | Tratar 401 com mensagem genérica de credenciais inválidas; não revelar se o e-mail existe e não navegar. |
| L06 | Falha de rede/API | Em ambiente controlado, simular API indisponível, timeout ou erro 5xx pelo DevTools. | Mostrar mensagem de falha compreensível, preservar os dados seguros e permitir nova tentativa; não deixar carregamento infinito. |
| L07 | Acesso de Diretoria | Entrar com conta de teste autorizada de Diretoria. | Navegar para a área prevista; observar retorno e chamadas sem erros inesperados. |
| L08 | Acesso de Conselheiro | Entrar com conta de teste autorizada de Conselheiro. | Navegar para a área prevista; observar retorno e chamadas sem erros inesperados. |
| L09 | Tipo de conta não reconhecido | Usar conta de teste preparada pela equipe para essa condição, se disponível. | Exibir mensagem compreensível e permanecer em estado recuperável, sem expor dados internos. |
| L10 | Teclado e foco | Recarregar; percorrer a tela com Tab/Shift+Tab; preencher e enviar com teclado. | Ordem de foco lógica, foco sempre visível, campos editáveis e botão acionável; Enter envia o formulário quando válido. |
| L11 | Leitor de tela e mensagens | Inspecionar nomes/roles/labels na árvore de acessibilidade; testar erros e retorno da API com leitor de tela quando disponível. | E-mail, senha, erros e mensagens de retorno são identificáveis e anunciados; o erro é associado ao campo correspondente. |
| L12 | Contraste e zoom | Usar axe/Lighthouse e verificar contraste; ampliar até 200%. | Texto normal com contraste mínimo 4,5:1, texto grande 3:1; conteúdo e ações não se perdem nem exigem rolagem horizontal. |
| L13 | Celular — viewport 1 | Emular **360 × 800 CSS px**, orientação retrato. | Sem overflow horizontal, sobreposição ou corte; campos e botão cabem ou são alcançáveis por rolagem vertical; alvos são fáceis de tocar. |
| L14 | Celular — viewport 2 | Emular **390 × 844 CSS px**, orientação retrato. | Repetir os mesmos critérios de L13 e registrar o resultado separadamente. |
| L15 | Teclado virtual/orientação | Emular teclado virtual e, se possível, orientação paisagem em dispositivo/simulador compatível. | Campo em edição e botão de envio permanecem alcançáveis; o teclado não encobre a ação sem permitir rolagem. |

## Critérios de acessibilidade

- Validar que cada campo tem rótulo programático associado, nome acessível e tipo apropriado; placeholder não substitui label.
- Verificar navegação integral por teclado, ordem lógica, foco visível, contraste e zoom/reflow.
- Confirmar que erros são textuais, específicos, associados ao campo (`aria-describedby` ou equivalente), indicam estado inválido e não dependem somente de cor.
- Confirmar que erros de formulário e retornos da API são anunciados sem roubar o foco indevidamente.
- Verificar alvos interativos: atender ao mínimo WCAG aplicável e preferir área de toque de aproximadamente 44 × 44 CSS px em celular.
- Rodar axe/Lighthouse/WAVE e registrar regra, elemento e impacto de cada falha; confirmar os achados manualmente.

## Critérios de responsividade

- Executar e registrar **ambos** os viewports: 360 × 800 e 390 × 844 CSS px.
- Comparar `scrollWidth` do documento com a largura do viewport; não deve haver rolagem horizontal.
- Verificar dimensões, espaçamento, legibilidade, mensagens de erro, foco e alcance do botão Entrar.
- Confirmar rolagem vertical quando necessária e repetir a avaliação com zoom de 200% e teclado virtual quando disponível.
- Informar que emulação não substitui validação em aparelho real; se houver aparelho, repetir os fluxos críticos.

## Critérios de avaliação da tela (0 a 100)

Para cada item, atribuir o valor integral quando verificado e atendido, metade quando parcialmente atendido e zero quando falhar. Item não executado ou sem evidência não deve ser marcado como aprovado; registrar como pendente e usar pontuação provisória. Somar as cinco dimensões:

| Dimensão | Pontos | O que avaliar |
|---|---:|---|
| Funcionalidade e validação | 30 | Validações locais e limites (10); retorno de credenciais inválidas e recuperação de falha da API (10); navegação correta para os perfis e tipo de conta não reconhecido (10). |
| Acessibilidade | 25 | Semântica, labels e nomes acessíveis (8); teclado, ordem e foco (7); erros associados/anunciados (5); contraste e zoom/reflow (5). |
| Responsividade | 20 | Uso em 360 × 800 e 390 × 844 sem overflow/corte (10); legibilidade e alvos tocáveis (5); zoom, teclado virtual e orientação (5). |
| Retornos e recuperação | 15 | Mensagens específicas, preservação de dados e nova tentativa (8); estados de carregamento e tratamento de rede/401/5xx (7). |
| Clareza visual | 10 | Hierarquia e legibilidade (4); clareza do botão e da ação (3); consistência de campos, mensagens e foco (3). |
| **Total** | **100** | **Nota final = soma dos pontos obtidos.** |

## Registro no Relatório de Feedback

Atualizar `Relatório de Feedback.md` após a execução, incluindo uma linha da **Tela Login** com nota antes e depois, data e evidência. Se não houver alteração na tela entre as avaliações, manter a nota e explicitar que não houve mudança nem novo reteste; não atribuir melhoria apenas por atualizar este documento.