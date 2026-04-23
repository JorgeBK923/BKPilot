# AGENTS.md — BugKillers QA Agent

## Quick Start
```bash
claude
# Slash commands in .claude/commands/ (14 total)
```

## Framework
Claude Code + **Playwright MCP** via `.claude/settings.json` (npx, not npm install)

## Security (BLOCK-B/C/D/E)
- **NEVER** pass password inline (`--login email:senha`). Stop immediately.
- Password from `QA_PASSWORD` in `.env` only
- Jira/GitHub tokens from `.env` only — **NEVER** pass tokens inline as parameters
- `.env` is gitignored

## Browser Automation
- Playwright MCP only — no Selenium, Cypress
- Use `networkidle` wait for SPA pages
- Log `console.error/warning` → `resultado/<timestamp>/console_log.json`
- Log network failures (≥400, >3000ms) → `resultado/<timestamp>/network_log.json`
- Detect session expiry (401/redirect) → re-authenticate and continue

## Data Cleanup
- Skills that create data must clean up after
- Log to `resultado/<timestamp>/cleanup_log.json`
- Mark unreversible items as "pendente"

## Video Recording
- Use Playwright `recordVideo` (camelCase) — **NOT** `record_video` (snake_case is silently ignored in Node.js)
- Correct: `browser.newContext({ recordVideo: { dir: '...', size: { width: 1280, height: 720 } } })`
- Wrong: `browser.newContext({ record_video: { dir: '...', size: { width: 1280, height: 720 } } })` ← **NO VIDEO GENERATED, no error thrown**
- Use `page.video()` to get the Video object; call `await page.video().path()` for the file path
- Close the context (`await context.close()`) to finalize the .webm file before reading it
- Convert `.webm` → `.mp4`: `ffmpeg -i input.webm -c:v libx264 -crf 23 -preset fast output.mp4`
- If ffmpeg missing: keep `.webm`, show warning, continue (non-blocking)

## Artifacts
```
estado/                    # /explorar output
  mapa.md, fluxos.md, elementos.json, api_endpoints.json
resultado/<timestamp>/     # execution outputs
  console_log.json, network_log.json, cleanup_log.json
  videos/, screenshots/, *.md
resultado/latest → resultado/<timestamp>/  # symlink after each run
cenarios/cenarios.xlsx     # test spreadsheet
.env                       # QA_PASSWORD (never commit)
CLAUDE.md                  # global rules
```

## Conventions
- **Timestamps:** `YYYY-MM-DD_HHMM` (e.g., `2026-04-13_1530`)
- **Artifact naming:** `<type>_<context>_<timestamp>.<ext>`
- **Gate checks:** `/explorar` and `/gerar-cenarios` have mandatory gates — if ❌ in coverage, complete it
- **Phase 3 mutative:** controlled by `permite_mutativo` from project API (`true` = execute POST/PUT/DELETE)
- **Spreadsheet:** atualizar a original in-place (fazer backup `.bak` antes), NÃO criar planilha separada

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
bash setup.sh  # installs Playwright MCP + Chromium, creates .env from .env.example
# Then edit .env with QA_PASSWORD
```
