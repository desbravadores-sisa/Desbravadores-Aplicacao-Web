# Relatório de Feedback

## Identificação da execução

- **Data:** 16/11/2026
- **Navegador:** Chrome integrado (browser tools)
- **Ambiente:** Vite local em `http://127.0.0.1:5173/`; API local em `http://localhost:8080`
- **Escopo:** login, cadastro, rotas protegidas sem sessão, rota inexistente e responsividade das telas públicas.
- **Limitação:** não foi fornecida conta de teste. Os fluxos que exigem sessão, dados e perfil autorizado foram bloqueados após a API responder 401; nenhuma operação de criação/edição/exclusão autenticada foi executada.

## Resultados dos testes

| ID | Tela / cenário | Resultado |
|---|---|---|
| T01 | Login — envio vazio | **Passou.** A tela impediu o envio e mostrou “Digite um e-mail válido” e “A senha deve ter pelo menos 6 caracteres”. |
| T02 | Login — senha com menos de 6 caracteres | **Passou.** Com e-mail válido, mostrou a validação de senha. O e-mail sem formato foi bloqueado pela validação nativa do campo do navegador. |
| T03 | Login — credenciais inválidas | **Passou.** A API retornou 401 e a tela mostrou “E-mail ou senha inválidos.” |
| T04 | Login por perfil | **Bloqueado.** Requer contas de teste de Diretoria e Conselheiro. |
| T05 | Cadastro — envio vazio e senhas divergentes | **Passou.** Exibiu validações de nome, e-mail, senha e “As senhas não conferem”, sem navegar. |
| T06 | Cadastro — campos válidos sem token de convite | **Parcial.** A API retornou 400 e a tela mostrou “Verifique os dados informados e tente novamente.” O retorno não esclarece que o cadastro precisa de convite. |
| T07 | Rotas protegidas sem sessão | **Parcial.** Foram abertas `/unidades`, `/minhas-tarefas`, `/desbravadores`, `/unidades/1`, `/cadernos`, `/cadernos/1`, `/convites`, `/evidencias`, `/tarefas` e `/perfil`. As chamadas à API retornaram 401 e o modal “Sessão encerrada” apareceu. O conteúdo da rota ainda é montado por trás do modal. |
| T07 | Unidades — retorno de erro sem sessão | **Falhou (mensagem inadequada).** Com a API ativa, a rota mostrou “Não foi possível carregar as unidades. Verifique se a API está no ar.”, embora o problema observado fosse 401/autenticação. |
| T07 | Modal de sessão — retorno ao login | **Passou.** “Fazer Login novamente” navegou para `/`. |
| T16 | URL não cadastrada | **Passou.** `/rota-inexistente` redirecionou ao login. |
| T17 | Login — 360 × 800 e 390 × 844 | **Passou.** Largura do documento igual à largura do viewport nas duas resoluções; sem overflow horizontal; formulário e botão de envio visíveis. |
| T17 | Cadastro — 360 × 800 e 390 × 844 | **Passou.** Largura do documento igual à largura do viewport nas duas resoluções; sem overflow horizontal; formulário e botão de envio visíveis. |
| T08–T15 | Áreas autenticadas e fluxos de sucesso | **Bloqueados.** Dependem de sessão e dados de teste. As telas protegidas foram abertas, mas o 401 impediu testar retornos de sucesso e ações funcionais. |

## Pontos de melhoria e erros observados

### 1. Unidades — diferenciar erro de autenticação de indisponibilidade da API

- **Reprodução:** abrir `/unidades` sem sessão com a API local disponível.
- **Observado:** a requisição retorna 401, o modal de sessão aparece e a tela também informa que a API pode estar fora do ar.
- **Impacto:** orientação incorreta para quem precisa autenticar; pode levar a investigar a API quando a causa é a sessão.
- **Melhoria sugerida:** tratar 401 separadamente (ou depender do fluxo central de sessão) e reservar a mensagem de indisponibilidade para falhas de rede/5xx.

### 2. Rotas protegidas — solicitar autenticação antes de renderizar a área

- **Reprodução:** abrir diretamente qualquer rota protegida sem sessão.
- **Observado:** a tela e a navegação são montadas; depois das chamadas 401 aparece o modal de sessão.
- **Impacto:** experiência intermediária confusa e chamadas desnecessárias à API.
- **Melhoria sugerida:** avaliar uma guarda de autenticação que redirecione para o login antes de renderizar telas protegidas. A autorização da API deve continuar sendo aplicada no servidor.

### 3. Cadastro — mensagem para convite ausente/inválido

- **Reprodução:** preencher nome, e-mail e senhas válidos em `/cadastro` sem token e enviar.
- **Observado:** retorno HTTP 400 mapeado para a mensagem genérica “Verifique os dados informados e tente novamente.”
- **Impacto:** não informa a ação necessária ao usuário e não diferencia o caso dos demais dados inválidos.
- **Melhoria sugerida:** alinhar o contrato/retorno da API com o tratamento específico de convite ausente ou inválido, ou tornar a mensagem apresentada mais orientativa.

## Pendências para próxima execução

1. Disponibilizar contas de teste autorizadas para Diretoria e Conselheiro.
2. Disponibilizar dados descartáveis de homologação (unidades, cadernos, tarefas, convites, desbravadores e evidências).
3. Reexecutar T04 e T08–T15, incluindo retornos de sucesso, erros de autorização e formulários/ações nos dois viewports móveis.
4. Repetir T06 com convites expirado, usado, inválido e válido para verificar os códigos e mensagens do contrato da API.

## Avaliação da Tela — Login

### Execução autorizada — 16/11/2026, aproximadamente 18h23–18h29 (UTC−3)

- **Escopo desta rodada:** somente Login e confirmação do destino após autenticação. As seções anteriores são histórico de outra execução.
- **Ambiente:** `http://localhost:5173/`, API `http://localhost:8080`; Chrome integrado, Playwright e axe-core **4.10.3**.
- **Autorização:** execução solicitada após a etapa documental. Nenhum código da aplicação foi alterado.
- **Credenciais:** utilizada a conta de Diretoria fornecida pelo usuário; senha não reproduzida neste relatório. A sessão foi encerrada pelo botão Sair ao concluir o acesso real.
- **Ferramentas:** snapshots de acessibilidade, inspeção do DOM/estilos computados, requisições/respostas do navegador, screenshots dos dois tamanhos móveis e auditoria axe. O motor axe foi servido localmente; o conteúdo da aplicação não foi enviado a serviço externo de avaliação. Lighthouse/WAVE não foram executados.
- **Simulações:** falhas de rede, timeout, HTTP 500 e tipo de conta desconhecido foram interceptados somente no navegador; não houve indisponibilização da API nem alteração de usuários.

### Tabela da Tela

| Tela | Nota antes de correções | Nota após correções | Data / situação |
|---|---:|---|---|
| Login (`/`) | **71/100 — provisória** | **95/100 — provisória** | 16/11/2026. Correções e reteste descritos ao final desta seção; leitor de tela e teclado virtual/aparelho real continuam pendentes. |

A estimativa anterior de **78/100** foi feita sem a auditoria completa e fica preservada apenas como histórico. A nota atual segue os subitens da rubrica e evidências desta execução; a diferença não demonstra regressão da aplicação. Não se atribui nota pós-correção sem mudança e reteste.

### Resultado por cenário

| ID | Status | Passos / resultado observado |
|---|---|---|
| L01 | Passou | Recarregamento em desktop 1366 × 768: título, marca, campos e botão presentes; nenhum erro de execução JavaScript capturado no carregamento. |
| L02 | Parcial | Envio vazio gerou zero requisições de login e exibiu os dois erros esperados. Entretanto, os inputs não receberam `aria-invalid` nem associação programática com as mensagens. |
| L03 | Parcial | E-mails sem `@`, sem parte local, com domínio `.` e com espaço interno foram bloqueados pela validação nativa, sem chamadas à API. As mensagens nativas foram exibidas em inglês neste navegador. Erros anteriores da aplicação permaneceram visíveis e desatualizados durante a correção. |
| L04 | Passou | Com e-mail válido e senha de cinco caracteres, não houve chamada de login; mensagem de mínimo de seis caracteres apresentada e e-mail preservado. |
| L05 | Passou | Uma tentativa com credenciais fictícias bem formadas recebeu HTTP 401 e exibiu “E-mail ou senha inválidos.”; permaneceu no Login. |
| L06 | Passou, com ressalva de carregamento | Interceptação de HTTP 500, rede desconectada e timeout de rede exibiu “Não foi possível entrar. Tente novamente.”; formulário continuou utilizável. A falha de rede preservou o e-mail. A autenticação real posterior confirmou recuperação após remover as simulações. Não foi medido um timeout próprio da aplicação. |
| L07 | Passou | Conta válida de Diretoria: HTTP **200**, envio pela tecla **Enter** e navegação para **`/unidades`**, com título Unidades visível e sem modal de sessão expirada. Nenhuma operação de gestão foi executada. |
| L08 | Bloqueado | Não foi fornecida conta de Conselheiro. Não se extrapola o sucesso da Diretoria para esse perfil. |
| L09 | Parcial | Resposta simulada HTTP 200 com tipo de conta desconhecido exibiu “Tipo de usuário sem acesso configurado.” e manteve o Login. Cenário real depende de conta preparada pela equipe. |
| L10 | Passou, com melhoria recomendada | Tab percorreu E-mail → Senha → Entrar; Shift+Tab retornou à Senha. O foco dos campos alterou a borda para laranja após a transição; o botão teve outline nativo. Enter executou o login real. Recomenda-se reforçar o indicador dos campos, hoje restrito à borda fina. |
| L11 | Parcial | Labels associados e tipos email/password confirmados; idioma do documento `pt-br`. Não há região `main`, `aria-invalid`, associação erro/campo nem região viva para os retornos. Leitor de tela real não disponível nesta execução. |
| L12 | Falhou no contraste; passou no zoom | axe detectou contraste de **3,52:1** no botão e **3,99:1** nas mensagens de validação, abaixo de 4,5:1. Zoom nativo de **200%**, confirmado pela mudança de devicePixelRatio de aproximadamente 1 para 2: sem overflow horizontal e botão alcançável por rolagem vertical. |
| L13 | Parcial | **360 × 800**, zoom 100%: documento com largura 360; sem overflow, cortes ou sobreposição observados, inclusive com mensagens de erro. Botão alcançável; altura de 36 CSS px, menor que a recomendação de 44 px das regras. |
| L14 | Parcial | **390 × 844**, zoom 100%: documento com largura 390; mesmos resultados de layout e ressalva sobre alvos de toque de L13. |
| L15 | Parcial | Paisagem em **844 × 390** permitiu rolagem vertical e acesso ao botão, sem overflow horizontal. Teclado virtual e aparelho real não foram avaliados; paisagem emulada não comprova funcionamento com teclado aberto. |

### Evidências de responsividade

Medições em CSS px, obtidas no navegador com os erros de campos vazios visíveis; screenshots correspondentes foram capturadas na conversa.

| Resolução / condição | Largura do documento | Campos | Botão Entrar | Resultado |
|---|---:|---|---|---|
| 360 × 800, 100% | 360 | Aproximadamente 270,67 × 41,33; texto 13 px | Aproximadamente 270,67 × 36 | Sem rolagem horizontal; botão termina em y=508. |
| 390 × 844, 100% | 390 | Aproximadamente 300,67 × 41,33; texto 13 px | Aproximadamente 300,67 × 36 | Sem rolagem horizontal; botão termina em y=508. |
| 844 × 390, paisagem | 829 de área útil, com barra vertical | Conteúdo alcançável por rolagem | Botão alcançável por rolagem | Sem overflow horizontal. |
| Desktop com zoom nativo 200% | `scrollWidth=675` e `clientWidth=675` | Sem corte horizontal | Alcançável por rolagem | Viewport interno de aproximadamente 683 px; rolagem vertical necessária. |

### Erros e pontos de melhoria — Tela Login

| ID | Prioridade | Reprodução / evidência | Impacto e melhoria sugerida |
|---|---|---|---|
| LOGIN-01 | Alta | Auditoria axe, regra `color-contrast`: botão branco sobre `#ec5800`, 3,52:1, texto de 16 px em negrito. Mensagens vermelhas `#ff0000` sobre branco, 3,99:1, texto de 12 px. | Ambos precisam de 4,5:1 para o tamanho utilizado. Ajustar as combinações de cores e reavaliar estados normal, foco, hover e erro. |
| LOGIN-02 | Alta | Após enviar vazio, as mensagens aparecem visualmente, mas os campos têm `aria-invalid` e `aria-describedby` ausentes; não há `aria-live`, `role=alert` ou `role=status` para os retornos. | A árvore acessível não associa os erros aos campos nem explicita mecanismo de anúncio. Associar mensagens/estado inválido e anunciar retornos; confirmar depois com leitor de tela. |
| LOGIN-03 | Média | Durante resposta artificialmente retardada, Entrar continuou habilitado, sem mudança de texto e sem estado `aria-busy`. Dois cliques com dados fictícios produziram **duas requisições interceptadas**. Esse cenário avalia o envio pelo frontend, não processamento duplicado no servidor. | Falta indicação de progresso e proteção contra envio duplicado. Adicionar estado de envio, feedback acessível e bloqueio até conclusão, liberando nova tentativa após falha. |
| LOGIN-04 | Média | Enviar vazio; preencher senha válida e e-mail inválido para a validação nativa. A mensagem anterior de senha curta permanece, mesmo com senha corrigida; o submit nativo impede atualizar os erros da aplicação. | Há orientações contraditórias. Revalidar/limpar os erros dos campos conforme são corrigidos e harmonizar validação nativa e da aplicação. Mensagens nativas estavam em inglês neste ambiente, apesar de `lang=pt-br`. |
| LOGIN-05 | Média | axe: `landmark-one-main` e `region`; nenhum `main`/`role=main` encontrado. | Falta uma região principal de navegação assistiva. Organizar o conteúdo principal em landmark apropriado. Esses dois achados são de boas práticas do axe, não duas falhas independentes de contraste/WCAG. |
| LOGIN-06 | Baixa | Botão com 36 px de altura; inputs com aproximadamente 41,33 px nos dois celulares. | Atendem à dimensão mínima de 24 px, mas ficam abaixo da preferência de 44 × 44 das regras. Ampliar a área de toque sem quebrar o layout. Não classificar somente essa diferença como violação automática da WCAG AA. |
| LOGIN-07 | Baixa | Documento com título genérico `desbravadores_aplicacao`; campos sem `autocomplete` explícito; texto dos inputs com 13 px. | Melhorar identificação da aba, orientar o preenchimento automático de usuário/senha e avaliar legibilidade em aparelho real. A ausência de autocomplete foi observada; seu impacto em gerenciadores não foi validado. |

O axe-core identificou **três regras com violações** no estado inicial: `color-contrast`, `landmark-one-main` e `region`, com 21 regras aprovadas e nenhuma análise inconclusiva nessa rodada. No estado com validações, a regra de contraste também apontou as duas mensagens de erro. Essa auditoria não equivale a uma certificação de acessibilidade.

### Cálculo da nota

Aplicação dos valores integral/metade/zero previstos nas regras. Itens parcialmente verificados recebem somente metade, com pendências explícitas; esta nota não é a pontuação automática de Lighthouse/axe.

| Dimensão | Subitens e pontos obtidos | Total | Fundamentação |
|---|---|---:|---|
| Funcionalidade e validação | Validações/bloqueio de entradas inválidas: 10/10; credenciais inválidas e recuperação de falha: 10/10; perfis/tipo desconhecido: 5/10 | **25/30** | Bloqueios, 401, falhas simuladas e Diretoria real confirmados. Conselheiro pendente; tipo desconhecido somente simulado. Falhas de apresentação dos erros são descontadas abaixo. |
| Acessibilidade | Semântica/labels: 4/8; teclado/ordem/foco: 7/7; erros associados/anunciados: 0/5; contraste e zoom: 0/5 | **11/25** | Labels e teclado atendidos; landmarks ausentes. Associação/anúncio dos erros ausente. Zoom passou, mas o critério de contraste falhou. |
| Responsividade | Dois celulares sem cortes/overflow: 10/10; legibilidade/toque: 2,5/5; zoom/teclado virtual/orientação: 2,5/5 | **15/20** | Layouts e zoom aprovados; alvos menores que a recomendação; teclado virtual e aparelho real pendentes. |
| Retornos e recuperação | Mensagens/preservação/nova tentativa: 8/8; carregamento/rede/401/5xx: 3,5/7 | **11,5/15** | Retornos observados permitem recuperação, mas não há feedback de carregamento nem bloqueio de envio duplicado. |
| Clareza visual | Hierarquia/legibilidade: 4/4; botão/ação: 3/3; consistência de campos/mensagens/foco: 1,5/3 | **8,5/10** | Capturas mostram hierarquia e ação claras; mensagens desatualizadas reduzem consistência. |
| **Total** | **25 + 11 + 15 + 11,5 + 8,5** | **71/100** | **Baseline provisória, antes de correções.** |

### Pendências desta rodada e reteste

1. Executar L08 com conta de Conselheiro e L09 com conta real preparada, se aplicável.
2. Confirmar L11 com leitor de tela e L15 com teclado virtual/aparelho real.
3. Após corrigir a tela, repetir os mesmos cenários e dimensões, executar axe novamente e preencher a coluna pós-correções com a nova nota, data e evidências.
4. As pendências da execução histórica para outras telas continuam fora do escopo desta rodada.

**Limpeza:** removidas interceptações usadas nas simulações; zoom restaurado para 100%; sessão válida encerrada. Servidor auxiliar temporário do axe encerrado e arquivo temporário removido; o servidor existente da aplicação não foi iniciado nem alterado por esta execução.

## Tela Login — correções e reteste em 16/11/2026

### Alterações realizadas

| Ponto | Correção | Verificação posterior |
|---|---|---|
| LOGIN-01 — Contraste | Cores de ação e erro ajustadas somente no Login; placeholder mais legível. | Contraste medido: **5,57:1** no botão normal e **6,47:1** nas mensagens, sobre branco. axe sem violações nos estados inicial, erro e hover/foco avaliados. |
| LOGIN-02 — Erros acessíveis | `aria-invalid`, associação por `aria-describedby`, mensagens com `role=alert` e região persistente de retorno. | Inputs inválidos referenciam os IDs e textos corretos. Erros gerais de autenticação são de formulário, sem atribuir a causa especificamente à senha. Anúncio real por leitor de tela ainda pendente. |
| LOGIN-03 — Progresso/duplicação | Estado “Entrando...”, `aria-busy`, status “Acessando sua conta...”, campos/botão desabilitados e trava síncrona de envio. | Dois eventos de submissão consecutivos durante requisição interceptada produziram **uma chamada XHR**, medida no navegador. Após falha, os controles foram liberados e o estado ocupado foi encerrado. |
| LOGIN-04 — Validação consistente | Login usa mensagens em português e a validade nativa do campo de e-mail, sem balões nativos de submit. Erros antigos são limpos ao editar e reavaliados no envio. | E-mails malformados e senha curta bloqueados sem requisições. Mensagem de senha antiga desapareceu após edição; foco direcionado ao primeiro campo inválido. |
| LOGIN-05 — Estrutura semântica | Conteúdo de autenticação dentro de `main`. | Uma região principal, contendo marca, formulário e retornos; regras `landmark-one-main` e `region` sem violações. |
| LOGIN-06 — Toque/foco | Botão com altura mínima de 44 px, inputs com mínimo de 44 px e contorno de foco explícito. | Botão medido em **44 CSS px** e inputs em aproximadamente **45,33 CSS px** nos dois celulares. Foco usa outline sólido com afastamento. |
| LOGIN-07 — Identificação/preenchimento | Título “Entrar \| Tigre da Montanha”; autocomplete `username`/`current-password`; fonte dos inputs de 16 px. | Título e atributos confirmados no DOM; inputs medidos em 16 px. Compatibilidade com gerenciador de senhas e aparelho real não foi certificada. |

O componente de entrada compartilhado recebeu suporte aos atributos de acessibilidade, nome, autocomplete, obrigatoriedade e estado desabilitado. Cores, dimensões e foco novos foram limitados ao Login para não alterar visualmente os demais formulários. O Cadastro manteve sua validação anterior e passou pelo teste de regressão descrito abaixo.

### Resultado do reteste

**Ambiente:** Chrome integrado em `http://localhost:5173/`, API local, Playwright e axe-core **4.10.3**, a mesma versão da avaliação anterior. Foram usadas as duas contas autorizadas fornecidas pelo usuário; suas senhas não são registradas neste documento. As duas sessões foram encerradas por Sair.

| Caso | Resultado | Evidência |
|---|---|---|
| L01 — Carregamento | Passou | Título específico do Login, uma região principal, labels e campos presentes. |
| L02 — Vazio | Passou na verificação automatizada | Zero requisições; erros em português, `aria-invalid=true`, associação com mensagens e foco no E-mail. |
| L03 — E-mails inválidos | Passou | Sem `@`, sem parte local, domínio `.` e espaço interno: zero requisições, erro textual em português e foco no E-mail. |
| L04 — Senha curta | Passou | Senha de cinco caracteres bloqueada; foco na Senha. Editar o campo removeu o erro anterior. |
| L05 — Credenciais inválidas | Passou | Resposta real HTTP **401**, mensagem “E-mail ou senha inválidos.” no alerta do formulário e nova tentativa habilitada. |
| L06 — Falha e recuperação | Passou nas simulações | HTTP **500**, rede desconectada e timeout de rede interceptados exibiram mensagem de falha; controles liberados e `aria-busy=false`. Login real funcionou depois da remoção das simulações. Não se mediu prazo próprio de timeout da aplicação. |
| L07 — Diretor | Passou | Login real HTTP **200**; `/unidades`, título Unidades visível, sem modal de sessão expirada. Nenhuma operação de gestão executada. |
| L08 — Conselheiro | Passou | Login real HTTP **200**; `/minhas-tarefas`, título Minhas Tarefas visível após carregamento, sem modal de sessão expirada. Envio pela tecla **Enter** confirmado. |
| L09 — Tipo desconhecido | Passou na simulação; integração real pendente | HTTP 200 interceptado com tipo desconhecido exibiu “Tipo de usuário sem acesso configurado.”; permaneceu no Login e liberou nova tentativa. Nenhuma conta real foi alterada para esse teste. |
| L10 — Teclado | Passou | Tab: E-mail → Senha → Entrar; Shift+Tab retornou à Senha. Outline de foco explícito. Enter realizou autenticação real de Conselheiro. |
| L11 — Acessibilidade assistiva | Parcial | Labels, obrigatoriedade, associação dos erros, alertas, status de envio e região principal verificados no DOM/árvore acessível. Leitor de tela real não disponível. |
| L12 — Contraste e zoom | Passou nas verificações realizadas | axe sem violações; zoom nativo **200%**, confirmado por devicePixelRatio aproximadamente 1 → 2; `scrollWidth=clientWidth=675` e ação alcançável por rolagem vertical. Zoom restaurado para 100%. |
| L13 — 360 × 800 | Passou na emulação | `scrollWidth=clientWidth=360`; campos e botão sem cortes/sobreposições, inclusive com mensagens; alvos com altura ≥44 px. Screenshot registrada na conversa. |
| L14 — 390 × 844 | Passou na emulação | `scrollWidth=clientWidth=390`; mesmos critérios de L13 atendidos. Auditoria axe nessa resolução também sem violações. Screenshot registrada na conversa. |
| L15 — Paisagem/teclado virtual | Parcial | Em **844 × 390**, `scrollWidth=clientWidth=829`, com barra vertical; conteúdo e ação alcançáveis. Teclado virtual e aparelho real não avaliados. |
| Regressão — Cadastro | Passou nos casos locais | Envio vazio manteve as validações de nome/e-mail/senha; senhas divergentes exibiram “As senhas não conferem”. Validação nativa do Cadastro preservada (`noValidate=false`); nenhuma conta criada. |
| Validação técnica | Passou | `npm run lint -- src\components\AuthFrom\AuthForm.jsx src\components\Input\Input.jsx` e `npm run build` concluídos com sucesso. |

**Auditoria:** axe-core, regras WCAG 2 A/AA, WCAG 2.1/2.2 AA e boas práticas: **zero violações e zero resultados inconclusivos** nas rodadas inicial e com erros; **35 regras aprovadas** em cada uma. Hover/foco e a resolução 390 × 844 também foram auditados sem violações. O hover utilizou fundo `#923400`, preservando o contraste adequado. O resultado automatizado não comprova conformidade integral nem substitui leitor de tela.

### Nota pós-correções

| Dimensão | Antes | Depois | Justificativa |
|---|---:|---:|---|
| Funcionalidade e validação | 25/30 | **30/30** | Bloqueios, erros, recuperação e ambos os perfis reais confirmados; ramo de tipo desconhecido validado por resposta simulada. |
| Acessibilidade | 11/25 | **22,5/25** | Semântica/labels 8/8; teclado/foco 7/7; associação/anúncio 2,5/5; contraste/zoom 5/5. Mantida metade do subitem de anúncio, pois falta leitor de tela real. |
| Responsividade | 15/20 | **17,5/20** | Dois celulares 10/10; legibilidade/toque 5/5; zoom/teclado/orientação 2,5/5, com teclado virtual/aparelho real pendentes. |
| Retornos e recuperação | 11,5/15 | **15/15** | Mensagens e nova tentativa 8/8; progresso, bloqueio de duplicação e recuperação nas falhas avaliadas 7/7. |
| Clareza visual | 8,5/10 | **10/10** | Hierarquia/legibilidade 4/4; ação 3/3; consistência de campos, mensagens e foco 3/3. |
| **Total** | **71/100** | **95/100 — provisória** | **Melhora de 24 pontos nas verificações realizadas.** |

**Pendências restantes:** leitor de tela real, teclado virtual/aparelho físico e integração com conta real de tipo não configurado, se a equipe disponibilizar. Os dois logins solicitados não estão mais bloqueados. Nenhuma avaliação de outras telas, além de confirmar o destino da autenticação, foi incorporada a esta nota.