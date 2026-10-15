# Projeto Angular com TypeScript

Projeto Acadêmico em Grupo em desenvolvimento utilizando **Angular**, **TypeScript** 

## Tecnologias utilizadas

- **Angular** — framework para desenvolvimento de aplicações web.
- **TypeScript** — linguagem com tipagem estática baseada em JavaScript.
- **Node.js** — ambiente de execução JavaScript.
- **npm** — gerenciamento de dependências e execução de scripts.
- **Vite** — ferramenta de desenvolvimento e build, caso esteja configurada no projeto.

## Pré-requisitos

Antes de executar o projeto, instale:

- [Node.js](https://nodejs.org/)
- npm, incluído na instalação do Node.js.

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/FelipeEstival/projeto-faculdade-angular.git
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento

Se o projeto utilizar Vite:

```bash
npm run dev
```

Se utilizar o Angular CLI:

```bash
npm start
```

O terminal exibirá o endereço local para acessar a aplicação no navegador.

## Módulo de leitura da API (M2)

`src/app/services/tarefas.service.ts` centraliza as consultas HTTP com retorno tipado. A base
local da API é `http://localhost:3000` (`API_URL`), e os tipos de domínio estão em `src/tipos.ts`.

| Função | Retorno | Requisição |
| --- | --- | --- |
| `getTodas()` | `Observable<Tarefa[]>` | `GET /tarefas` |
| `getPorId(id)` | `Observable<Tarefa>` | `GET /tarefas/:id` |
| `getTodosProjetos()` | `Observable<Projeto[]>` | `GET /projetos` |
| `getProjetoPorId(id)` | `Observable<Projeto>` | `GET /projetos/:id` |
| `getProjetoComTarefas(id)` | `Observable<ProjetoComTarefas>` | `GET /projetos/:id?_embed=tarefas` |

O tipo `ProjetoComTarefas`, definido em `src/app/services/projeto-com-tarefas.ts`, estende
`Projeto` com a lista `tarefas: Tarefa[]`. Na API JSON Server, essa lista é carregada com o
parâmetro `_embed=tarefas`, não por uma chamada separada.

## Autores

**Felipe Mauro Estival**
**Mateus Santana Machado**
**Rafael Borges**
**Kaio Bezerra Santos**

## Referências

- [Documentação oficial do Angular](https://angular.dev/)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Vite](https://vite.dev/guide/)
- [Documentação do npm](https://docs.npmjs.com/)

## API local e contrato de dados (Marco 1)

Use Node.js 24 ou superior. Após clonar, execute `npm install`.
Inicie o Angular com `npm run dev` (ou `npm start`).
Em outro terminal, rode `npm run api` (ou `npx json-server db.json`).

- http://localhost:3000/tarefas: 5 tarefas.
- http://localhost:3000/projetos: 2 projetos.
- http://localhost:3000/projetos/1?_embed=tarefas: projeto 1 com 4 tarefas.
- http://localhost:3000/tarefas?status=a-fazer: 2 tarefas.

`src/tipos.ts` contém o contrato do guia. IDs e datas são strings.
A extensão `ProjetoComTarefas` fica em `src/app/services/projeto-com-tarefas.ts`.

A API altera `db.json` ao receber escritas. Para restaurar, copie `db.seed.json`
sobre `db.json`: `cp db.seed.json db.json` no Linux/macOS ou
`Copy-Item db.seed.json db.json` no PowerShell.
