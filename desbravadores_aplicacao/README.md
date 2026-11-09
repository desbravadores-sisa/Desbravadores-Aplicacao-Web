# Desbravadores — Frontend (React + Vite)

> Visão geral do projeto, status das telas e próximos passos: veja o [README principal](../README.md).
> Protótipo de referência: [Figma Make — prototipo_versãofinal](https://www.figma.com/make/zdjDwsWCbkBmPXUXtR9QxT/prototipo_vers%C3%A3ofinal?t=SkffTCtZwgP5uuL2-1)

## Rodando localmente

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8080
npm run dev            # http://localhost:5173
npm run build          # build de produção em dist/
```

## Fluxo de trabalho com Git

### Branches

| Pessoa | Branch |
|---|---|
| Gabrielly | `feature/gabrielly` |
| Nathan | `feature/nathan` |
| Marcela | `feature/marcela` |
| Consolidação (todas as features + integração com a API) | `consolidacao/sprint-final` |

As branches já existem no repositório. Não crie uma branch nova e não use `-b`.

> **Atenção:** até o PR de `consolidacao/sprint-final` → `main` ser aprovado, a versão integrada com o backend está **somente** em `consolidacao/sprint-final`. Depois do merge, atualize sua branch com a `main` (passo 3) antes de continuar.

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

Faça isso antes de abrir um Pull Request e depois que qualquer PR for aprovado.
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
- Nunca versione o `.env` (ele já está no `.gitignore`); use o `.env.example` como modelo.

## Convenções de integração com a API

- Todas as chamadas passam por `src/service/api.js` (axios com `withCredentials: true`). Não use `fetch` direto.
- A sessão usa o cookie httpOnly `authToken`; o front **não** guarda token em `localStorage`.
- Os perfis vêm do banco com os nomes `Diretoria` e `Conselheiro`; use exatamente esses valores ao comparar `tipoConta`.
- O clube do usuário é definido pelo backend a partir da sessão. Não envie `idClube` nas requisições.
