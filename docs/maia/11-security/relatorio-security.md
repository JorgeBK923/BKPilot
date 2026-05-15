# Relatorio de Revisao de Seguranca — BKPilot

**Data:** 2026-05-14
**Revisor:** GLM-5.1 (MAIA Security Skill)
**Escopo:** Ciclos 1–4 — BKPilot-Core + BKPilot-Producao + BKPilot-Comercial

---

## Resumo Executivo

A revisao identificou **3 riscos Criticos**, **5 riscos Altos**, **10 riscos Medios** e **4 riscos Baixos**. A entrega **NAO pode avancar para producao** sem resolver os 3 riscos criticos.

Os 3 riscos criticos sao:

1. **Screenshots e videos salvos sem redacao de PII** — `screenshotFields` padrao e `[]`, nenhum pixel e mascarado. Dados pessoais (nome, CPF, foto) persistem em evidencias.
2. **Logs (logcat/Appium) persistidos sem redacao de PII** — `captureLogcat` e `captureAppiumLogs` nao aplicam `redactLog()` antes de gravar em disco. CPF, email, telefone podem vazar.
3. **Politica de retencao declarada mas nao executada** — `retentionDays: 90` existe em todos os config.json, mas nenhum codigo implementa purga automatica. Dados pessoais acumulam-se indefinidamente.

Riscos altos adicionais: URLs Appium sem forcar HTTPS, credenciais em URL (`user:pass@host`), SSRF via `appiumUrl` sem allowlist, e dados de cliente injetaveis no contexto de LLMs sem sanitizacao.

---

## Detalhamento por Categoria

### 1. Credenciais e Segredos

- `.env` reais estao protegidos por `.gitignore` (`.env` e `clients/*/.env`).
- `.env.example` existe e nao contem valores reais.
- `env.js:6-9` bloqueia senhas inline (`--login email:senha`).
- `resolveSecret()` suporta `env:` prefixo para indirecao de credenciais.
- **Porem:** `config.json` aceita credenciais em plaintext (ex: `"username": "valor"` em vez de `"username": "env:MOBILE_FARM_USERNAME"`). Nenhum codigo rejeita plaintext.
- Credenciais via argumentos CLI ficam visiveis em `ps aux` / historico de shell.
- `mobile-appium-client.js:256-258` parseia credenciais embutidas em URL (`url.username`, `url.password`).

### 2. Dados Sensiveis e LGPD

- Motor de redacao (`mobile-redaction.js`) cobre CPF, CNPJ, email, telefone, cartao, JWT, senhas.
- **Gaps identificados:**
  - Nao redata RG, PIS/PASEP, CEP, CNH, data de nascimento, endereco, nome proprio.
  - Regex de cartao (`\b(?:\d[ -]*?){13,19}\b`) e excessivamente amplo — gera falsos positivos em IMEIs, timestamps.
  - `redactLog()` em `mobile-recording.js` so cobre env vars e senhas; nao aplica CPF/email/telefone.
  - `redactWithFields()` em `getState()` so redata por nome de campo; texto de elementos com CPF passa direto.
  - Screenshots: `screenshotFields: []` em todos os configs = nenhuma regiao mascarada.
  - Videos: zero redacao frame a frame.
  - Politica de retencao (`retentionDays`) e validada mas nunca executada.

### 3. Autenticacao e Autorizacao

- Sauce Labs usa Basic Auth (`Authorization: Basic <base64>`). Aceito em HTTP ou HTTPS.
- Nenhum enforce de HTTPS para URLs Appium remotas. So APK download forca HTTPS.
- MCP server nao tem autenticacao — qualquer processo local pode invocar ferramentas.
- `allowedUrls` so valida `baseUrl`, nao `appiumUrl`.
- Cliente smoke bypassa allowlist de app packages (`isSmokeClient`).

### 4. APIs, Endpoints e SSRF

- Nenhum rate limit em chamadas Appium.
- `appiumUrl` sem allowlist = risco SSRF — trafego autenticado redirecionavel para host arbitrario.
- `capabilities` via `args.capabilities` injetavel sem sanitizacao.
- XPath construido com interpolacao de texto (risco de XPath injection limitado).
- `deviceId` de capabilities passado como argumento ADB (risco de command injection limitado).

### 5. Dependencias

- `npm audit` no BKPilot-Core: **0 vulnerabilidades**.
- Dependencia principal `@bugkillers/bkpilot-core` via GitHub (nao npm registry).
- Nenhum lockfile visivel no escopo de revisao.

### 6. Infraestrutura

- Fora do escopo deste ciclo (sem Docker, Nginx ou VPS no codigo entregue).

### 7. Seguranca em Agentes IA

- `HANDOFF.md` contem prompts literais para LLMs revisores — vetor de prompt injection direto.
- Skills MAIA (`.claude/commands/*.md`) estao no repositorio e expostos a qualquer pessoa com acesso.
- Dados de cliente (config.json, XML Appium, spreadsheets) entram no contexto do LLM sem sanitizacao — risco de prompt injection indireto.
- Guarda de acoes destrutivas e client-side (substring match em labels) — bypassavel e sem human-in-the-loop.

### 8. Logs e Evidencias

- `logEvent()` escreve eventos sem redacao de conteudo (URLs com PII, texto de seletores).
- `redact()` so cobre chaves com nomes sensiveis; nao cobre CPF/email em valores.
- Session IDs logados em plaintext.
- Appium responses em mensagens de erro (ate 600 chars) podem conter credenciais.
- `clients/*/resultado/` nao tem verificacao de vazamento de credenciais antes de persistir.

---

## Decisao

**BLOQUEADO** — Existem 3 riscos criticos abertos. Ver `decisao-final.md`.