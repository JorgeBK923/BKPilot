# Secrets Audit — BKPilot

**Data:** 2026-05-14 | **Revisor:** GLM-5.1 (MAIA Security Skill)

---

## 1. Credenciais no Codigo-Fonte

| Arquivo:Linha | Tipo | Mascarado? | Detalhe |
|---|---|---|---|
| `BKPilot-Core/env.js:4-9` | `QA_PASSWORD` via `.env` | Sim | Carrega de env var. Bloqueia inline (`--login email:senha`). Correto. |
| `BKPilot-Core/mobile-appium-client.js:314-316` | `MOBILE_FARM_USERNAME`, `MOBILE_FARM_ACCESS_KEY` | Parcial | Suporta `env:` mas aceita plaintext de `args` e `config.json` |
| `clients/*/config.json` | `username`, `accessKey` com `env:` | Sim | Todos 4 configs usam `env:MOBILE_FARM_*`. Correto. |
| `mobile-appium-client.js:256-258` | Credenciais em URL (`user:pass@host`) | Nao | Parseia `url.username`/`url.password`. Anti-pattern RFC 3986. |
| `mobile-appium-client.js:314-316` | Credenciais via CLI args | Nao | `args.username`, `args.accessKey` visiveis em `ps aux` e historico shell |
| `scripts/mobile-doctor.js:80` | Basic Auth header | Nao | `Buffer.from(username:accessKey).toString('base64')` — header gerado em cleartext |

## 2. .env e Versionamento

| Check | Status |
|---|---|
| `.env` versionado no Git? | **Nao** — `.gitignore` contem `.env` e `clients/*/.env` |
| `.env.example` existe? | Sim — `QA_PASSWORD=`, `MOBILE_FARM_USERNAME=`, etc. Sem valores reais |
| `.env` real encontrado em clientes? | Sim — `clients/tega/.env`, `clients/gni/.env`, `clients/local-usb-smoke/.env`, `clients/local-apk-smoke/.env` — protegidos por `.gitignore` |
| Credenciais hardcoded em codigo? | **Nao** — todos os valores sao env vars ou placeholders |

## 3. Credenciais em Logs e Outputs

| Arquivo:linha | Risco | Detalhe |
|---|---|---|
| `mobile-smoke.js:316` | Redacao OK | `appiumUrl.replace(/\/\/[^/@]+@/, '//[redacted]@')` |
| `mobile-smoke.js:330` | Redacao OK | `JSON.stringify(redact(capabilities))` |
| `mobile-doctor.js:53` | Redacao OK | `sanitize()` mascara `MOBILE_FARM`, `QA_PASSWORD`, `TOKEN`, `KEY`, `SECRET` |
| `mobile-doctor.js:200` | Redacao OK | `appiumUrl.replace(/\/\/[^/@]+@/, '//[redacted]@')` |
| `mobile-appium-client.js:504` | **VAZAMENTO** | `sessionId` logado em plaintext |
| `mobile-appium-client.js:281,286` | **VAZAMENTO** | Resposta Appium bruta ate 600 chars em Error |
| `mobile-appium-client.js:463-469` | **VAZAMENTO** | `logEvent` escreve URLs com query strings sem redacao |
| `mobile-appium-client.js:646` | **VAZAMENTO** | `getState()` usa `redactWithFields` que nao redata conteudo CPF/email |

## 4. Testes com Valores Simulados

| Arquivo:linha | Valor | Risco |
|---|---|---|
| `test/mobile-recording.test.js:42-45` | `QA_PASSWORD=super-secret`, `MOBILE_FARM_USERNAME=farm-user`, `MOBILE_FARM_ACCESS_KEY=farm-key` | Baixo — valores efemeros em `process.env`, limpos apos teste |
| `test/mobile-apk.test.js:58-59` | `accessKey: 'MOBILE_FARM_ACCESS_KEY_VALUE'` | Baixo — placeholder |
| `test/mobile-appium-client.test.js:103` | `accessKey: 'secret1'` | Baixo — valor de teste |

## 5. Credenciais em Relatorios e Evidencias

| Tipo | Risco | Detalhe |
|---|---|---|
| Screenshots | **Critico** | `screenshotFields: []` em todos configs — nenhuma regiao mascarada |
| Videos | **Critico** | Zero redacao frame a frame |
| XML source | OK | `redactText()` aplicado antes de gravar |
| State JSON | **Medio** | `redactWithFields()` nao redata CPF/email em `text` de elementos |
| Logcat/Appium logs | **Critico** | Nao chamam `redactLog()` antes de persistir |
| `redaction_log.json` | OK | Somente contagens, sem valores originais |

## 6. Recomendacoes

1. **Corrigir agora:** Aplicar `redactLog()` em `captureLogcat()` e `captureAppiumLogs()` antes de gravar.
2. **Corrigir agora:** Aplicar `redactText()` com DEFAULT_CATEGORIES no output de `getState()`.
3. **Corrigir agora:** Aplicar `redact()` nas mensagens de Error do Appium (`mobile-appium-client.js:281,286`).
4. **Corrigir antes de producao:** Remover suporte a credenciais em URL (`user:pass@host`).
5. **Corrigir antes de producao:** Rejeitar `http://` para URLs Appium nao-loopback.
6. **Corrigir antes de producao:** Exigir que `config.json` use `env:` para todas as credenciais; rejeitar plaintext.
7. **Melhoria futura:** Adicionar OCR automatico ou modelo de deteccao de PII para screenshots.
8. **Melhoria futura:** Implementar purga automatica baseada em `retentionDays`.