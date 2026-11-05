# Marco 5 — estados, exclusão e acessibilidade

Validação em 04/11/2026, sobre a base `8b766f9` da `main`.

## Entregas

| Issue | Comportamento entregue |
| --- | --- |
| #61 — erro | Mensagens de falha e nova tentativa nas consultas, no carregamento de projetos dos formulários e filtros e na movimentação de tarefas. Salvamentos e exclusões mantêm os dados em caso de falha e permitem repetir a operação. |
| #62 — acessibilidade e responsividade | Idioma `pt-BR`, contraste corrigido, foco visível, foco no conteúdo ao trocar de página, foco no primeiro campo inválido, formulários e navegação adaptados para telas pequenas. |
| #65 — vazio | Mensagens diferentes para nenhuma tarefa cadastrada, projeto sem tarefas e busca/filtros sem resultados, com ações para criar uma tarefa ou limpar filtros. Projetos e colunas vazias também são identificados. |
| #66 — carregamento | Indicadores em todas as consultas de tarefas e projetos, inclusive no seletor do formulário e no filtro de projetos. Terminam com sucesso ou erro. A troca de um id durante uma consulta cancela a anterior e mantém o indicador da consulta atual. |
| #68 — excluir tarefa | O botão no detalhe pede confirmação nativa com o título da tarefa. Cancelar não envia `DELETE`. Durante a exclusão o botão fica bloqueado. Sucesso volta à lista, que consulta a API novamente; erro mantém a tarefa e permite nova tentativa. |

A função `excluirTarefa` e parte dos estados já existiam na base. Esta alteração completa esses fluxos, preserva o trabalho integrado da equipe e adiciona testes de regressão.

## Auditoria automática

Executada no build de produção, servido localmente, com uma cópia descartável do `db.json`. As dependências de auditoria foram usadas fora do projeto; o `package.json`, o lockfile e os dados do repositório não mudaram.

Lighthouse 13.6.0 — categoria **Accessibility**, viewport 375 × 812:

| Tela | Pontuação |
| --- | --- |
| `/endereco-inexistente` | 100/100 |
| `/projetos` | 100/100 |
| `/projetos/1` | 100/100 |
| `/projetos/1/editar` | 100/100 |
| `/projetos/novo` | 100/100 |
| `/quadro` | 100/100 |
| `/tarefas` | 100/100 |
| `/tarefas/1` | 100/100 |
| `/tarefas/1/editar` | 100/100 |
| `/tarefas/nova` | 100/100 |

A rota `/` usa a mesma tela de lista de `/tarefas`. Os resultados completos resumidos, as versões e as dimensões estão em [auditoria-m5.json](auditoria-m5.json).

O axe verificou as mesmas 10 telas em 375 e 1440 pixels, com as regras WCAG 2 A/AA, WCAG 2.1 AA e boas práticas: **zero violações detectadas nas 20 verificações**.

Foram corrigidos os contrastes dos textos com opacidade dos cartões coloridos, dos links de voltar e do texto branco nos botões azuis. A pontuação se refere aos critérios automáticos da ferramenta; a navegação por teclado foi verificada separadamente.

## Telas pequenas e teclado

- 40 verificações de largura: 10 telas em 320, 375, 768 e 1440 pixels, sem overflow horizontal da página.
- Menu superior com nomes visíveis em telas pequenas; campos e botões se reorganizam sem cortes. O quadro usa uma coluna por linha no celular.
- Capturas das telas de quadro, formulário e detalhe inspecionadas visualmente.
- Tab e Enter no link “Ir ao conteúdo”; foco visível e destino no conteúdo principal.
- Tarefas e Projetos ativados por teclado, com foco no conteúdo da nova página.
- Digitar na busca preserva o foco no input; limpar filtros volta a mostrar as tarefas.
- Filtros e troca Lista/Quadro por teclado preservam o status na URL.
- Envio inválido mostra erros associados aos campos e foca no primeiro inválido. O botão permite a validação; nenhum dado inválido é enviado à API.
- Os seletores “Mover para” apresentam o status real de cada tarefa.

## Falhas e exclusão

Testes no navegador cobriram falha de conexão simulada, recuperação sem atualizar a página, cancelamento da confirmação de exclusão, falha no `DELETE`, nova tentativa confirmada e remoção da tarefa da lista após sucesso. Os testes HTTP também simulam falhas de rede (status 0), como quando o json-server está parado, em todas as telas que consultam dados.

## Reproduzir

No CMD, dentro do repositório:

```cmd
npm ci
npm run build
npm test -- --watch=false
```

Resultado desta entrega: **53 testes aprovados em 10 arquivos** e build sem avisos de orçamento.

Para verificar no navegador, mantenha `npm run api` em um terminal e `npm start` em outro. Abra `http://localhost:4200`, use Tab/Shift+Tab/Enter/Espaço, teste larguras de 320 a 1440 pixels no modo de dispositivo e rode a categoria Accessibility no painel Lighthouse. Para conferir o erro real de conexão, pare o terminal da API, abra uma tela de dados, reinicie a API e use “Tentar novamente”.
