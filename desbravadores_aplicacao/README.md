# React + Vite

## Fluxo de trabalho com Git

### Branches

| Pessoa | Branch |
|---|---|
| Gabrielly | `feature/gabrielly` |
| Nathan | `feature/nathan` |
| Marcela | `feature/marcela` |

As branches já existem no repositório. Não crie uma branch nova e não use `-b`.

### 1. Começar a trabalhar (só na primeira vez)

```bash
git fetch origin
git checkout feature/seu-nome
```

Antes de mexer no código, confirme que está na sua branch:

```bash
git branch --show-current
```

### 2. Rotina do dia a dia

```bash
git add .
git commit -m "feat: descrição do que foi feito"
git push
```

### 3. Atualizar sua branch com a main

Faça antes de abrir um Pull Request e depois que qualquer PR for aprovado.
Deixe tudo commitado antes (`git status` limpo).

```bash
git checkout main
git pull origin main
git checkout feature/seu-nome
git merge main
git push
```

Atalho, sem sair da sua branch:

```bash
git fetch origin
git merge origin/main
git push
```

Se houver conflito, abra os arquivos marcados, escolha o trecho correto,
remova os marcadores `<<<<<<<`, `=======` e `>>>>>>>`, e depois:

```bash
git add .
git commit
git push
```

### 4. Entregar o trabalho

1. Abra um Pull Request no GitHub: `feature/seu-nome` → `main`.
2. Descreva no PR o que foi feito.
3. Após aprovação, use **"Create a merge commit"** (não use "Squash and merge").
4. Depois do merge, repita o passo 3 para atualizar sua branch e continue nela.

### Regras

- Ninguém faz commit direto na `main`.
- Mudanças entram na `main` apenas via Pull Request.
- Commits claros: `feat:` para novidade, `fix:` para correção.
- Avise o time no grupo antes de mexer em arquivos compartilhados.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
