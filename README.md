# Desbravadores — Aplicação Web (Tigre da Montanha)

Frontend do sistema de gestão do Clube de Desbravadores **Tigre da Montanha** (Projeto Integrador SPTech).

| Repositório | Papel |
|---|---|
| **Desbravadores-Aplicacao-Web** (este) | Frontend React (SPA) |
| [Desbravadores-BackEnd-Java](https://github.com/desbravadores-sisa/Desbravadores-BackEnd-Java) | API REST Spring Boot |
| [Desbravadores-Banco-De-Dados](https://github.com/desbravadores-sisa/Desbravadores-Banco-De-Dados) | Scripts MySQL e modelagem |

🎨 **Protótipo (Figma Make):** [prototipo_versãofinal](https://www.figma.com/make/zdjDwsWCbkBmPXUXtR9QxT/prototipo_vers%C3%A3ofinal?t=SkffTCtZwgP5uuL2-1). Ele é a referência visual e funcional das telas.

---

## Em que pé estamos (11/10/2026)

A branch **`consolidacao/sprint-final`** reúne o trabalho de todas as branches **e os 27 commits mais recentes da `main`** (Ver Caderno, Membros, Novo Ciclo, menu responsivo etc.). Ela está **integrada ao backend**: as telas da Diretoria consomem a API real e não há mais dados fixos (mock) no código. A validação foi feita de ponta a ponta: MySQL real, API e navegador.

> A `main` ainda **não** recebeu essa consolidação. Ela entra via Pull Request (veja "Próximos passos").

### Telas da Diretoria

| Tela | O que funciona com a API | O que falta (comparado ao protótipo) |
|---|---|---|
| Login / Cadastro por convite | Login com cookie de sessão; cadastro pelo link `/cadastro?token=` | Recuperação de senha |
| Unidades | Listar (pontuação, conselheiro, progresso), criar com idade necessária, excluir | Botão **"Ver Detalhes"**: dashboard da unidade com gráficos e edição. A idade mínima só aparece no card quando `GET /unidades/diretor` passar a devolvê-la (hoje vem `null`) |
| Tarefas | Listar, criar (distribuída a todas as unidades), editar, excluir | — |
| Evidências | Listar, aprovar com ajuste de pontos, pedir correção, reconhecer caderno, excluir | — (o envio da evidência é feito pelo conselheiro) |
| Cadernos | Resumo por grupo (ciclo, vinculados, requisitos, cores por caderno); **"Novo ciclo"** cria o ciclo (`POST /ciclos`) | Aplicar o ciclo novo a todos os cadernos (falta endpoint no back) |
| Cadernos → Membros | Listar, cadastrar com data de aniversário (idade calculada), editar, excluir (`/desbravadores`) | Cadernos concluídos por desbravador (sem endpoint); confirmação antes de excluir |
| Cadernos → Ver Caderno | Cabeçalho do ciclo; requisitos (tarefas `CADERNO`) com adicionar, editar e excluir com confirmação; vinculados calculados por idade; progresso individual via checklists | Vincular/desvincular de forma explícita (hoje só na tela, não persiste: **decisão do time**) |
| Convites | Criar (Conselheiro ou Diretoria), copiar o link real, listar, excluir | Alinhar ao protótipo: remover a aba "Expirados" e os textos de validade |
| Perfil | Ver e editar nome, e-mail e telefone; trocar senha | Upload da foto (hoje é só visual) |
| Navbar | Menu responsivo; usuário logado, notificações reais e "marcar como lidas" | — |

### Conselheiro

O login funciona na API, mas **o front ainda bloqueia o acesso** com a mensagem "ainda não disponível". As telas do protótipo para o conselheiro ainda não foram implementadas: Kanban da unidade, check-in das crianças nas tarefas de caderno e envio de evidências.

---

## Como rodar

Pré-requisitos: Node 20+ e a API rodando (veja o README do backend).

```bash
cd desbravadores_aplicacao
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8080
npm run dev               # http://localhost:5173
```

- A API precisa liberar a origem `http://localhost:5173` no CORS. Isso já está configurado.
- A sessão usa um cookie httpOnly (`authToken`) emitido no login, e todas as chamadas usam `withCredentials`.
- `npm run build` gera a versão de produção em `dist/`.

## Estrutura

```text
desbravadores_aplicacao/src/
  service/api.js     cliente axios (baseURL = VITE_API_URL)
  pages/             Unidades, Tarefas, Evidencias, Cadernos, Convites, Perfil, Login, Register
  components/        Navbar, Modal, cards (Unit, Task, Notebook, Invite...), AuthForm
```

## Próximos passos (frontend)

1. **Merge** de `consolidacao/sprint-final` na `main`, depois que os PRs do banco e do backend forem aprovados.
2. **Cadernos (depende do back):** endpoint que aplica o ciclo novo a todos os cadernos (e desativa o anterior); histórico de cadernos concluídos por desbravador; vínculo explícito desbravador ↔ caderno, se o time decidir por ele. `POST /desbravadores` e `POST /ciclos` ainda exigem `idClube` no corpo (o front envia o do usuário logado).
3. **Unidades:** criar o dashboard da unidade ("Ver Detalhes") com a edição `PUT /unidades`; os gráficos dependem de um endpoint novo no back.
4. **Conselheiro:** liberar o login e criar as telas de Kanban, check-in e envio de evidência.
5. **Convites:** ajustar ao protótipo (sem aba "Expirados", sem texto de validade).
6. **Confirmação antes de excluir** em todas as telas (o protótipo exige; hoje existe só em Convites, Tarefas e Unidades).
7. Qualidade: testes de componentes e tratar os avisos do `oxlint` (`catch (err)` sem uso).

O plano completo, com as decisões tomadas e os riscos, está em `PLANO_CONSOLIDACAO.md`, na pasta raiz do projeto.

O fluxo de trabalho com Git do time está em [`desbravadores_aplicacao/README.md`](desbravadores_aplicacao/README.md).
