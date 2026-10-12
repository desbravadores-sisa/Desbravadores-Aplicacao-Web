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
| Unidades | Listar (pontuação, conselheiro, progresso, idade mínima), criar, excluir; **"Ver Detalhes" → dashboard** (`/unidades/:id`): cards, ganhos × descontos por semana, curva do saldo, atividades abertas e edição (`GET /unidades/{id}/dashboard`, `PUT /unidades`) | — |
| Tarefas | Listar com "X/N unidades entregaram" e caderno; filtro por caderno; criar (Geral ou Caderno, com seletor de caderno; distribuída a todas as unidades), editar, excluir com aviso quando já há entregas | "Instruções de evidência" e "Data de início" do protótipo (sem colunas no banco) |
| Evidências | Listar, abrir o arquivo enviado (miniatura para imagens), identificar pendência de check-in, aprovar com ajuste de pontos, pedir correção, reconhecer caderno, excluir com confirmação | — |
| Cadernos | Resumo por grupo (ciclo, vinculados, requisitos, cores por caderno); **"Novo ciclo"** encerra o ciclo atual e aplica o período a todos os cadernos (`POST /ciclos`) | — |
| Cadernos → Membros | Listar, cadastrar com data de aniversário (idade calculada), editar, excluir com confirmação; caderno atual pelo vínculo e **cadernos concluídos** (histórico) | — |
| Cadernos → Ver Caderno | Cabeçalho do ciclo; requisitos com adicionar, editar e excluir com confirmação; **vincular/desvincular persistido** (`/cadernos/{id}/desbravadores`); progresso individual pelo check-in do conselheiro | — |
| Convites | Criar (Conselheiro ou Diretoria), copiar o link real, excluir com confirmação; lista só os convites pendentes (sem aba "Expirados" nem textos de validade/reenvio, por decisão do time) | — |
| Perfil | Ver e editar nome, e-mail e telefone; trocar senha; **foto de perfil** (enviar/remover, aparece também no menu) | — |
| Navbar | Menu responsivo; usuário logado, notificações reais e "marcar como lidas" | — |

### Conselheiro

O login leva a **`/minhas-tarefas`**, o Kanban da unidade (da `feature/nathan`, ligado a `GET /tarefas/kanban` e `PATCH /tarefas/{id}/status`). Os cards se arrastam entre A fazer e Em andamento. **Clicar num card** abre:

- tarefa de clube → **enviar evidência** (foto ou PDF até 5 MB, comentário opcional); a tarefa vai para Em revisão;
- tarefa de caderno → **check-in** das crianças vinculadas; com todas marcadas vai sozinha para Em revisão, e o botão **"Enviar para revisão"** manda com parte delas.

Em revisão e Concluído não aceitam arraste: quem decide é a Diretoria. A tela **`/desbravadores`** (layout do Nathan, agora com dados reais) mostra as crianças da unidade, o progresso por caderno e os requisitos individuais, com "Marcar cumprido" usando o mesmo check-in.

Na Diretoria, o dashboard da unidade ganhou **"Lançar desconto"** (pontos + motivo) e a lista de descontos do ciclo com exclusão confirmada.

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
2. ~~Ciclo global, histórico e vínculo de cadernos, dashboard, conselheiro (Kanban, check-in, evidência, Desbravadores), Convites, confirmações de exclusão, foto de perfil, descontos~~ ✅ 12/10.
3. Recuperação de senha (não existe endpoint).
4. Qualidade: testes de componentes e tratar os avisos do `oxlint` (`catch (err)` sem uso).

O plano completo, com as decisões tomadas e os riscos, está em `PLANO_CONSOLIDACAO.md`, na pasta raiz do projeto.

O fluxo de trabalho com Git do time está em [`desbravadores_aplicacao/README.md`](desbravadores_aplicacao/README.md).
