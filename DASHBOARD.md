# Dashboard Dark / Bento

Refatoração da branch `main` de https://github.com/FelipeEstival/projeto-faculdade-angular.

## Executar

Requer Node.js 24 ou superior, conforme o package.json original.

```bash
npm ci
npm run api
```

Em outro terminal, na mesma pasta:

```bash
npm start
```

Abra http://localhost:4200. A API continua em http://localhost:3000.

## Organização

- `src/styles.scss`: tokens de tema, tipografia, controles e estilos globais do CDK. O `angular.json` foi atualizado para usar esse arquivo em vez de `styles.css`.
- `components/header.*`: sidebar responsiva e navegação.
- `components/board-header/*`: banner, seleção de projeto, membros e progresso.
- `pages/tarefas/*`: toolbar, filtros, quatro colunas e integração com a API.
- `components/tarefa-card/*`: cards com cores por prioridade/status, prazo e responsável.
- Formulários, detalhes e lista de projetos também usam o novo tema; estilos de páginas foram extraídos do TypeScript para arquivos CSS.

## Comportamento

A versão original tinha uma lista e não incluía Angular CDK. Foi adicionada a dependência `@angular/cdk`, respeitando a versão principal do Angular do projeto.

Arraste a tarefa pela alça ⠿. Alterar a coluna envia PATCH de `status` para a API. Em caso de falha, o estado anterior é restaurado e uma mensagem aparece. Uma operação de movimentação ocorre por vez. Também é possível usar o seletor “Mover para” com teclado ou toque.

A busca considera título, descrição e responsável. Há filtro por prioridade, escolha de projeto e ordenação por prazo/prioridade. A reordenação manual dentro da coluna dura somente a sessão: o modelo original não possui campo de posição. Alterações de status persistem na API.

Os botões de adicionar nas colunas pré-selecionam o status e, quando selecionado, o projeto. Cadastro e edição existentes foram preservados.

## Adaptações ao domínio existente

- Colunas mantidas: A fazer, Em andamento, Em revisão e Concluída. Não foi inventado um status de arquivamento.
- Responsáveis são nomes no modelo, sem fotos ou contas de usuário. Os avatares usam iniciais; o rodapé indica workspace local.
- Reports, Events, Deals, Users e Invite member permanecem desabilitados: não existem rotas ou APIs para esses módulos.
- Research, Design e Development são etiquetas visuais do banner, não filtros ou categorias persistidas.
- Quickit Project é o título da visão geral. Ao selecionar um projeto, o banner mostra seu nome, descrição e data reais.
- Plus Jakarta Sans é carregada pelo Google Fonts, com fallback para fontes do sistema.
- Em telas estreitas, a sidebar fica compacta e somente o quadro tem rolagem horizontal.

## Verificação

```bash
npm run build
npm test -- --watch=false
```

Documentação de referência: https://angular.dev/guide/drag-drop

Resultado: build de produção sem avisos; 29 testes passaram. A verificação visual interativa não foi concluída porque este ambiente bloqueia a inicialização do Chromium (socket não permitido). Os testes de CDK verificam o evento de drop e o PATCH/reversão, não substituem a inspeção visual de arrastar com mouse ou toque.
