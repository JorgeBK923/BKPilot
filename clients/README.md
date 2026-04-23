# Packs de cliente

Um pack por cliente. Tudo que é específico de um cliente vive aqui — nunca no `core/` ou na pasta `cenarios/` (engine CLI).

## Estrutura completa

```
clients/<id>/
├── config.json       ← OBRIGATÓRIO — baseUrl, timeouts, defaultFlow
├── login.js          ← OBRIGATÓRIO — função de login
├── flows/            ← OBRIGATÓRIO — pelo menos o defaultFlow
│   ├── <nome>.js     ← exporta { runScenario } ou { retestarBug }
│   └── ...
│
├── selectors.json    ← opcional — seletores mapeados de áreas-chave
├── scripts/          ← opcional — manutenção específica (ex: limpar-chats.js)
├── bugs/<data>/      ← opcional — export Jira + Anexos/
├── fixtures/         ← opcional — dados de teste (.gitignore)
├── cenarios/         ← opcional — planilhas geradas, fichas de risco, perfis
├── report-theme/     ← opcional — logo, cores do PDF
└── .env              ← NUNCA commitado — credenciais do cliente
```

As pastas opcionais são criadas sob demanda — um cliente novo pode começar só com `config.json` + `login.js` + `flows/smoke.js`.

## Contrato do `config.json`

```json
{
  "id": "<id>",
  "nome": "<nome visível>",
  "baseUrl": "https://...",
  "timeout_ms": 30000,
  "max_paginas": 500,
  "envPassword": "QA_PASSWORD",
  "postLoginSelector": "...",
  "loginMaxAttempts": 3,
  "defaultFlow": "<nome-do-flow-principal>",
  "defaultRetesteFlow": "<opcional, se tiver reteste de bugs>"
}
```

## Contrato do `login.js`

```javascript
module.exports = async function login(page, { email, password, config, log }) {
  await page.goto(config.baseUrl);
  // preencher formulário, submeter, aguardar redirect
};
```

## Contrato dos flows

Cada flow exporta um contrato dependente de como vai ser usado:

- **Flow de execução em lote** (`_executar_planilha.js`):
  ```javascript
  module.exports = {
    preRun?(browser, ctx),              // opcional — cleanup pre-run
    async runScenario(page, cenario, ctx) {
      return { status: 'Passou|Falhou|Pulou', observacoes };
    }
  };
  ```

- **Flow de reteste de bugs** (`_retestar_bug.js`):
  ```javascript
  module.exports = {
    async retestarBug(context, bug, ctx) {
      return { id, titulo, fluxo, status_atual, observacoes, screenshot, ... };
    },
    extrairUrlHint?(desc, titulo)       // opcional — hint por descrição
  };
  ```

`ctx` contém: `{ client, creds, log, paths, ts, BASE_URL, flags? }`.

## Onde colocar o quê

| Tipo | Destino |
|---|---|
| Export Jira + prints de bugs | `clients/<id>/bugs/<data>/` |
| Planilhas geradas (.xlsx) | `clients/<id>/cenarios/` |
| Fichas de risco, perfis, relatórios de requisitos | `clients/<id>/cenarios/` |
| Script de manutenção específico | `clients/<id>/scripts/` |
| Dados de teste (baseline, CSVs de import) | `clients/<id>/fixtures/` |
| Seletores mapeados | `clients/<id>/selectors.json` |
| Logo e tema de PDF | `clients/<id>/report-theme/` |

## Onboarding de cliente novo

```bash
mkdir -p clients/novo/flows
cp clients/tega/config.json clients/novo/
# editar id, nome, baseUrl, envPassword, defaultFlow
# escrever login.js
# escrever flows/<defaultFlow>.js
echo "QA_PASSWORD_NOVO=..." >> .env
```

## Referência arquitetural

Ver `arquivo/Arquitetura4_MultiTenant.md` para detalhes do racional (engine × client pack, contrato de flow, hooks, migração).
