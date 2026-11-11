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

`src/app/services/tarefas.service.ts` centraliza as consultas HTTP com retorno tipado. Em desenvolvimento, a base é `http://localhost:3000`. Em produção, o build lê `API_URL` do ambiente. Os tipos de domínio estão em `src/tipos.ts`.

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

## Busca por título (M4 — issue #8)

Na página **Tarefas**, use o campo **Buscar por título...** para filtrar os cartões
enquanto digita. A busca considera partes do título, ignora diferenças entre
maiúsculas e minúsculas e desconsidera espaços no início e no fim do termo.
Descrição e responsável não entram na pesquisa.

O filtro é combinado com o projeto e a prioridade selecionados, mantendo a
ordenação atual. Limpar o campo volta a mostrar todas as tarefas que atendem
aos demais filtros. A busca é local e não altera os dados da API.

Para validar: `npm test -- --watch=false`. Veja abaixo como gerar o build de produção.

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


## Publicação (Marco 6)

**Aplicação pública:** o link será incluído aqui após o primeiro deploy no Netlify.

### 1. API no Render

Conecte o repositório no painel do Render e crie um **Blueprint** com o
`render.yaml`. Use a branch que contém o Marco 6. O serviço web roda
`npm run api:hosted`, usa a porta fornecida pelo Render e inicializa o banco
com `db.seed.json` na primeira execução. Copie a URL HTTPS que o Render exibir.

Confira se `/tarefas`, `/tarefas/2` e `/projetos/1?_embed=tarefas` retornam JSON.
A API é pública e gravável para a demonstração. Use apenas dados fictícios.
No plano gratuito, mudanças no banco podem se perder ao reiniciar ou publicar.
Caso a equipe precise preservá-las, configure um disco persistente no Render e
aponte `DB_PATH` para um arquivo dentro do disco.

### 2. Angular no Netlify

Importe o mesmo repositório no Netlify. Em **Environment variables**, cadastre
`API_URL` com a URL HTTPS do Render (sem incluir `/tarefas` ou `/projetos`).
O `netlify.toml` já informa o comando e a pasta de publicação.
Depois do primeiro deploy, substitua o aviso no início desta seção pela URL
pública que o Netlify mostrar.

Abra `/tarefas/2` diretamente em uma aba nova e recarregue. O Netlify serve
`index.html` com HTTP 200 nessa rota e o Angular resolve o detalhe. Confira
também a lista, o quadro e `/projetos/1`. Se `API_URL` mudar, gere outro deploy.

### Build de produção para conferência local

Rode `npm ci` e, em um terminal separado, `npm run api`. No CMD do Windows:

```cmd
set "API_URL=http://localhost:3000"
npm run build
```

Em Bash:

```bash
API_URL=http://localhost:3000 npm run build
```

O resultado fica em `dist/frontend-angular/browser`. Para servir essa pasta,
use um servidor estático com fallback para `index.html` nas rotas da aplicação.
O roteiro de apresentação está em [docs/MARCO6_APRESENTACAO.md](docs/MARCO6_APRESENTACAO.md).
