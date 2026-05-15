# Requisitos — Itens 1, 2, 6

**Skill:** MAIA Especificação (02)
**Data:** 2026-05-13

---

## Item 1 — Skill `/gerar-relatorio-final-mobile`

### Funcionais

| ID | Requisito |
|---|---|
| RF1.1 | Skill deve consolidar evidências web e mobile do mesmo cliente em relatório único. |
| RF1.2 | Skill deve ler artefatos de `clients/<id>/resultado/<timestamp>/` (web) e `clients/<id>/resultado/<timestamp>/mobile/` (mobile). |
| RF1.3 | Skill deve gerar saída em `.md` **e** `.pdf` correspondente. |
| RF1.4 | Relatório deve incluir: visão executiva, cobertura, bugs encontrados, evidências (screenshots, vídeos), métricas (tempo, cenários executados), próximos passos. |
| RF1.5 | Bugs mobile devem ser convertidos em bug cards com evidência visual antes da geração do relatório. |
| RF1.6 | Skill deve aceitar parâmetro `--cliente <id>` e opcional `--timestamp <ts>` (default: `latest`). |
| RF1.7 | Skill deve aceitar parâmetro `--target web|apk|hybrid` (default: `hybrid`). |
| RF1.8 | Skill deve gerar `demo_summary.json` com status, provider, cenários, bugs, paths de evidência. |
| RF1.9 | Skill deve validar que evidências citadas existem em disco antes de finalizar. |
| RF1.10 | Se evidência faltante, skill deve registrar pendência explícita no relatório (não silenciar). |

### Não-funcionais

| ID | Requisito |
|---|---|
| RNF1.1 | PDF gerado deve respeitar regra: título de seção não pode ficar sozinho no fim da página (regra existente do projeto). |
| RNF1.2 | Skill deve concluir em ≤ 60s para cliente com ≤ 50 cenários. |
| RNF1.3 | Skill deve operar offline (sem chamada a serviço externo) após dados coletados. |
| RNF1.4 | Skill deve respeitar regra de evidência visual obrigatória do `CLAUDE.md` §7.1. |

---

## Item 2 — Contrato de execução mobile por cliente

### Funcionais

| ID | Requisito |
|---|---|
| RF2.1 | Template `clients/<id>/config.json` deve incluir bloco `mobile` obrigatório com sub-chaves: `provider`, `target`, `appiumUrl`, `username`, `accessKey`, `baseUrl`, `capabilities`, `allowedUrls`, `allowedAppPackages`. |
| RF2.2 | Template deve incluir `mobile.timeouts` com sub-chaves explícitas: `session`, `pageLoad`, `findElement`, `command`, `uploadApk`, `downloadArtifact`. |
| RF2.3 | Template deve incluir `mobile.retry` com `maxAttempts`, `backoffMs`, `retryableErrors`. |
| RF2.4 | Template deve incluir `mobile.limits` com `maxConcurrentSessions`, `maxMinutesPerRun`, `maxScenariosPerRun`. |
| RF2.5 | Template deve incluir `mobile.evidence` com `videoEnabled`, `screenshotOnFail`, `retentionDays`. |
| RF2.6 | Template deve incluir `mobile.redaction` com `enabled`, `screenshotFields`, `xmlFields` (referência ao item 6). |
| RF2.7 | Comando `mobile:doctor` deve validar config antes de execução real. |
| RF2.8 | Falha em pré-requisito (config inválida, credencial faltando, device offline) deve abortar execução com erro claro. |
| RF2.9 | Documentação de onboarding deve cobrir: criar `.env`, criar `config.json`, smoke USB, smoke farm. |

### Não-funcionais

| ID | Requisito |
|---|---|
| RNF2.1 | Validação de config deve rodar em ≤ 5s. |
| RNF2.2 | Erros de validação devem citar o campo exato e exemplo válido. |
| RNF2.3 | Credenciais (`username`, `accessKey`, `QA_PASSWORD`) **nunca** podem aparecer em log de validação. |

---

## Item 6 — Mascaramento de dados sensíveis

### Funcionais

| ID | Requisito |
|---|---|
| RF6.1 | Mascaramento deve cobrir screenshots (PNG) **e** source XML do Appium. |
| RF6.2 | Lista de campos sensíveis deve ser configurável em `mobile.redaction` do `config.json` do cliente. |
| RF6.3 | Categorias padrão suportadas: CPF, CNPJ, e-mail, telefone, cartão, token/JWT, senha. |
| RF6.4 | Em screenshots, mascaramento deve cobrir região via seletor CSS/XPath ou bounding box explícita. |
| RF6.5 | Em XML, mascaramento deve substituir valor do atributo/texto por `***REDACTED***`. |
| RF6.6 | Mascaramento deve ser aplicado **antes** do arquivo ser salvo no disco final. |
| RF6.7 | Arquivo original não-mascarado **não** pode existir em disco após processamento. |
| RF6.8 | Skill deve registrar contagem de campos mascarados em `redaction_log.json` (sem expor valores). |
| RF6.9 | Falha de mascaramento deve abortar geração da evidência (não vazar dado em caso de erro). |

### Não-funcionais

| ID | Requisito |
|---|---|
| RNF6.1 | Mascaramento de screenshot típico (~1MB) deve completar em ≤ 500ms. |
| RNF6.2 | Mascaramento de XML típico (~50KB) deve completar em ≤ 100ms. |
| RNF6.3 | Regex/policies de campos sensíveis devem ficar no `BKPilot-Core`, não duplicadas por cliente. |
| RNF6.4 | Cliente pode adicionar campos extras via `config.json`, mas não pode desabilitar categorias padrão sem flag explícita auditável. |

---

## Dependências entre itens

- Item 6 deve estar pronto **antes** de item 1 finalizar (relatório não pode citar evidência sem mascaramento aplicado).
- Item 2 (`mobile.redaction`) referencia contrato do item 6.
- Item 1 consome contrato do item 2 (cliente, timestamp, paths).

Ordem de implementação sugerida: **6 → 2 → 1**.
