# Marco 6: configuração e publicação

Roteiro para três pessoas, em até 5 minutos.

| Tempo | Pessoa | O que mostrar |
| --- | --- | --- |
| 0:00–1:20 | 1 | Abra `scripts/build.mjs` e `api-config.ts`. Mostre como `API_URL` entra no build e como o desenvolvimento continua usando a API local. |
| 1:20–2:45 | 2 | Mostre `render.yaml` e `start-api.mjs`. Abra a resposta de `GET /projetos/1?_embed=tarefas` para provar que o contrato e os dados de exemplo foram mantidos. |
| 2:45–4:40 | 3 | Mostre a pasta do build e a regra no `netlify.toml`. Cole `/tarefas/2` em uma aba nova, recarregue e mostre o detalhe. Abra o quadro para encerrar. |

**Dificuldade principal:** ao recarregar, o navegador pede `/tarefas/2` ao
servidor estático antes de o Angular iniciar. A regra de rewrite devolve
`index.html` com HTTP 200 e mantém a URL, para que o Angular abra a tarefa.

Use os links públicos do README se o deploy já estiver ativo. Enquanto
a publicação estiver pendente, faça a demonstração com o build servido
localmente e diga que a verificação foi local.
