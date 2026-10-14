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

## Tela de tarefas e API

A rota inicial (`/`) redireciona para `/tarefas`. Nessa tela, a aplicação faz uma requisição
`GET` para obter a lista de tarefas e exibe um cartão para cada item, usando `id` como chave
de rastreamento.

O repositório não especifica a URL da API. Por padrão, o serviço consulta
`http://localhost:3000/tarefas`. Ajuste a constante `TAREFAS_API_URL` em
`src/app/services/tarefas.service.ts` para o endereço fornecido pela disciplina. A API deve
responder com um array JSON compatível com o tipo `Tarefa` definido em `src/tipos.ts`, por exemplo:

```json
[
  {
    "id": 1,
    "titulo": "Preparar apresentação",
    "status": "Pendente",
    "prioridade": "Alta",
    "responsavel": "Estudante",
    "prazo": "2026-10-20"
  }
]
```

Se a API estiver em outra origem, ela deverá permitir requisições CORS do endereço da aplicação.

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
