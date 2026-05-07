# AGENTS.md — BugKillers QA Agent

## Quick Start
```bash
claude
# Slash commands in .claude/commands/ (19 total, incluindo /plano-automacao)
```

## Framework
Claude Code + **Playwright MCP** via `.claude/settings.json` (npx, not npm install)

## Arquitetura Core/Comercial/Producao
- Este repositorio e o futuro **BKPilot-Producao**; a pasta ainda pode estar chamada `BKPilot`.
- Codigo compartilhado entre Comercial e Producao vive no pacote externo `@bugkillers/bkpilot-core`, hoje fixado em `github:JorgeBK923/BKPilot-Core#v0.1.0`.
- Os arquivos `core/browser.js`, `core/client.js`, `core/env.js`, `core/evidence.js`, `core/logger.js` e `core/paths.js` sao apenas wrappers de compatibilidade. Nao coloque logica nova neles.
- Para alterar comportamento compartilhado, edite o repositorio `BKPilot-Core`, publique nova tag e depois atualize a dependencia neste projeto.
- Frontend comercial, API da demo, relatorio comercial, fluxo `demo_mvp` e skill `/demo-comercial` nao pertencem ao Producao.
- Producao deve implementar apenas rotinas, skills e regras operacionais. Nao copiar codigo comercial para ca sem decisao arquitetural explicita.
- Este repositorio nao tem suite `npm test` configurada; ao trocar versao do Core, rode `npm install` e smoke tests de importacao dos wrappers.`n`n## Security (BLOCK-B/C/D/E)
- **NEVER** pass password inline (`--login email:senha`). Stop immediately.
- Password from `QA_PASSWORD` in `clients/<id>/.env` only (multi-tenant — each client has its own isolated env)
- Jira/GitHub tokens from root `.env` only — **NEVER** pass tokens inline as parameters
- All `.env` files (root and `clients/*/.env`) are gitignored

## Browser Automation
- Playwright MCP only — no Selenium, Cypress
- Use `networkidle` wait for SPA pages
- Log `console.error/warning` → `clients/<id>/resultado/<timestamp>/console_log.json`
- Log network failures (≥400, >3000ms) → `clients/<id>/resultado/<timestamp>/network_log.json`
- Detect session expiry (401/redirect) → re-authenticate and continue

## Data Cleanup
- Skills that create data must clean up after
- Log to `clients/<id>/resultado/<timestamp>/cleanup_log.json`
- Mark unreversible items as "pendente"

## Video Recording
- Use Playwright `recordVideo` (camelCase) — **NOT** `record_video` (snake_case is silently ignored in Node.js)
- Correct: `browser.newContext({ recordVideo: { dir: '...', size: { width: 1280, height: 720 } } })`
- Wrong: `browser.newContext({ record_video: { dir: '...', size: { width: 1280, height: 720 } } })` ← **NO VIDEO GENERATED, no error thrown**
- Use `page.video()` to get the Video object; call `await page.video().path()` for the file path
- Close the context (`await context.close()`) to finalize the .webm file before reading it
- Convert `.webm` → `.mp4`: `ffmpeg -i input.webm -c:v libx264 -crf 23 -preset fast output.mp4`
- If ffmpeg missing: keep `.webm`, show warning, continue (non-blocking)

## Artifacts (Estrutura Multi-Tenant por Cliente)
> **REGRA:** Todos os artefatos gerados por skills devem ficar **dentro** da pasta do cliente (`clients/<id>/`). **NUNCA** criar pastas `resultado/`, `estado/` ou `entregaveis/` na raiz do projeto.

```
clients/<id>/                 # pasta do cliente (multi-tenant)
  ├─ estado/                  # /explorar output
  │   ├─ mapa.md
  │   ├─ fluxos.md
  │   ├─ elementos.json
  │   └─ api_endpoints.json
  ├─ resultado/<timestamp>/   # execution outputs
  │   ├─ console_log.json
  │   ├─ network_log.json
  │   ├─ cleanup_log.json
  │   ├─ dados_brutos/
  │   ├─ videos/
  │   ├─ screenshots/
  │   └─ *.md / *.pdf
  ├─ resultado/latest → <timestamp>/   # symlink para execução mais recente
  ├─ entregaveis/automacao/<stack>/   # pacote de automação para o cliente
  │   ├─ codigo/
  │   ├─ *.md
  │   └─ *.pdf
  ├─ cenarios/                # planilhas e fichas de risco do cliente
  ├─ flows/                   # implementação customizada de runScenario
  ├─ config.json              # baseUrl, envPassword, defaultFlow
  ├─ login.js                 # função de login do cliente
  └─ .env                     # QA_PASSWORD per client (never commit)

cenarios/cenarios.xlsx        # test spreadsheet (global)
.env                          # global integrations: Jira/GitHub tokens (never commit)
CLAUDE.md                     # global rules
AGENTS.md                     # quick reference
```

## Conventions
- **Timestamps:** `YYYY-MM-DD_HHMM` (e.g., `2026-04-13_1530`)
- **Artifact naming:** `<type>_<context>_<timestamp>.<ext>`
- **Gate checks:** `/explorar` and `/gerar-cenarios` have mandatory gates — if ❌ in coverage, complete it
- **Phase 3 mutative:** controlled by `permite_mutativo` from project API (`true` = execute POST/PUT/DELETE)
- **Spreadsheet:** atualizar a original in-place (fazer backup `.bak` antes), NÃO criar planilha separada
- **Client automation reports:** todo `.md` destinado ao cliente em `clients/<id>/entregaveis/automacao/<stack>/` deve ter `.pdf` correspondente
- **Internal governance:** nunca enviar `clients/<id>/resultado/<timestamp>/governanca/`, `.env`, tokens, `geracao_id`, identidade de modelo/agente/executor ou logs internos ao cliente

## Testing
- `/testar-modulo` = Etapa A (spreadsheet) + Etapa B (free exploration: 375px viewport, 3G throttle, memory leak detection)
- `--dados <file.json>` for data-driven flow execution

## Reteste de Bugs — Regras Obrigatórias

### Regra dos 3 Tentativas Mínimas
Antes de marcar qualquer bug como **inconclusivo**, você DEVE tentar pelo menos 3 abordagens diferentes e documentar cada tentativa (o que tentou + resultado exato).

### Checklist Obrigatório (todas aplicáveis antes de "inconclusivo")
- [ ] `page.route()` para interceptar/modificar requisições de rede
- [ ] `page.evaluate()` para injetar JavaScript (override de funções, simulação de estados)
- [ ] `page.setViewportSize()` ou `document.body.style.zoom` para testar resolução/zoom
- [ ] Dados de teste alternativos (tabela inexistente, usuário diferente, input inválido)
- [ ] Documentar cada tentativa com: técnica usada, código executado, erro/resultado exato

### Técnicas de Simulação Obrigatórias
| Cenário | Técnica |
|---------|---------|
| Falha de rede | `page.route('**/api/**', route => route.abort('failed'))` ou `page.evaluate(() => { window.fetch = () => Promise.reject(new Error('network')) })` |
| Zoom 50% | `page.evaluate(() => document.body.style.zoom = '0.5')` ou `page.setViewportSize(640, 360)` |
| Tabela inexistente | Digitar diretamente no chat da IA: `"Busque dados da tabela nao_existe_xyz"` |
| Interceptação de prompts | `page.route('**/ai-assist', route => { console.log(route.request().postData()); route.continue() })` |
| Throttle de rede | `page.route('**', route => { const delay = Math.random() * 3000; setTimeout(() => route.continue(), delay) })` |
| Usuário diferente | Logout → login com credencial alternativa (nunca inline, sempre via `.env`) |

### Proibições
- **NUNCA** usar frases como "não foi possível" sem listar o que foi tentado
- **NUNCA** marcar como inconclusivo sem tentar `page.route()` para interceptação
- **NUNCA** marcar como inconclusivo sem tentar `page.evaluate()` para simulação
- **NUNCA** pular para inconclusivo por "falta de credenciais" sem tentar com as credenciais disponíveis primeiro

### Formato de Documentação de Tentativas
```markdown
### JBUG-XXX — [Título]
- **Status:** 🔄 Inconclusivo
- **Tentativas:**
  1. `page.route('**/api/**', ...)` → [resultado exato]
  2. `page.evaluate(() => ...)` → [resultado exato]
  3. [outra abordagem] → [resultado exato]
- **Bloqueio real:** [explicar o que realmente impede, não suposições]
```

## Edge Cases
- Session expiry: re-authenticate, continue
- Many 5xx: alert in summary
- ffmpeg failure: keep `.webm`, non-blocking

## Setup
```bash
bash setup.sh  # one-time per machine: installs Playwright MCP + Chromium, creates root .env (Jira/GitHub)

# For each new client (creates clients/<id>/ with .env, config.json, login.js skeleton):
./novo-cliente.sh <id> --nome "Client Name" --url https://app.client.com
# Then edit clients/<id>/.env with QA_PASSWORD
```
