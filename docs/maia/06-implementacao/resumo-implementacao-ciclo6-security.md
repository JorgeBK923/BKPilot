# Resumo de Implementacao - Ciclo 6 Security

Data: 2026-05-14
Status: remediado com pendencias ambientais nos doctors.

## Escopo

Remediados SEC-01 a SEC-07. SEC-08 aceito e documentado em `docs/maia/11-security/decisoes-aceitas.md`.

## Mapeamento dos Achados

| ID | Correcao | Evidencia |
|---|---|---|
| SEC-01 | Politica obrigatoria de `screenshotFields` para cliente real; smoke usa bypass auditavel. | `BKPilot-Core/mobile-appium-client.js` (`validateScreenshotRedactionPolicy`) + testes em `test/mobile-appium-client.test.js` |
| SEC-02 | Logs Appium/logcat passam por `redactLog()` e `redactText()` antes de retorno/persistencia. | `BKPilot-Core/mobile-recording.js` (`redactMobileLog`) + testes em `test/mobile-recording.test.js` |
| SEC-03 | Novo modulo de retencao remove `clients/<id>/resultado/<timestamp>/` vencidos preservando `latest`. | `BKPilot-Core/mobile-retention.js`, `scripts/mobile-purge.js`, `scripts/mobile-smoke.js --purge` |
| SEC-04 | HTTP remoto bloqueado; HTTP permitido apenas em loopback. | `validateAppiumEndpointPolicy()` |
| SEC-05 | Credenciais em URL bloqueadas com `CREDENTIALS_IN_URL_NOT_ALLOWED`. | `requestJson()` e `validateAppiumEndpointPolicy()` |
| SEC-06 | `appiumUrl` validado por allowlist/defaults seguros para loopback/Sauce/IP privado local com HTTPS. | `validateAppiumEndpointPolicy()` + `mobile.allowedAppiumHosts` |
| SEC-07 | Prefacio anti-injection em `.claude/commands/*.md`, regra em `CLAUDE.md` e comentarios em scripts que resumem artefatos. | `.claude/commands/*.md`, `CLAUDE.md`, `scripts/mobile-smoke.js`, `scripts/gerar-relatorio-final-mobile.js` |
| SEC-08 | Aceito formalmente como canal interno. | `docs/maia/11-security/decisoes-aceitas.md` |

## Core v0.2.5

```text
commit: ef85743de936a0646ff3cc6a7e7d106fb7fb85ea
tag: v0.2.5
push: origin/main ok; origin/v0.2.5 ok
```

Producao e Comercial atualizados para:

```json
"@bugkillers/bkpilot-core": "github:JorgeBK923/BKPilot-Core#v0.2.5"
```

Imports verificados:

```text
0.2.5 object function
wrappers-ok
```

## Validacoes - Saidas Literais

### Core `npm test`

```text
> node --test
...
tests 39
suites 0
pass 39
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 404.5168
```

### `node --check`

```text
rtk node --check mobile-appium-client.js
<sem output; exit 0>

rtk node --check mobile-recording.js
<sem output; exit 0>

rtk node --check mobile-retention.js
<sem output; exit 0>

rtk node --check scripts/mobile-smoke.js
<sem output; exit 0>

rtk node --check scripts/mobile-doctor.js
<sem output; exit 0>

rtk node --check scripts/mobile-purge.js
<sem output; exit 0>

rtk node --check scripts/gerar-relatorio-final-mobile.js
<sem output; exit 0>
```

### Grep credencial/PII em logs mobile

```text
matches=0
```

### Doctors mobile

`local-usb-smoke`:

```text
mobile_config_schema: passed
screenshot_redaction_policy: passed (SCREENSHOT_REDACTION_EMPTY_ALLOWED)
appium_endpoint_policy: passed
client_env: passed
capabilities_minimum: passed
adb_available: failed (spawnSync adb ENOENT)
appium_status: failed
status: failed
```

`sauce-mobile-smoke`:

```text
mobile_config_schema: passed
screenshot_redaction_policy: passed (SCREENSHOT_REDACTION_EMPTY_ALLOWED)
appium_endpoint_policy: passed
capabilities_minimum: passed
cloud_credentials: passed
client_env: failed (clients/<id>/.env not found)
appium_status: failed (connect EACCES 34.125.90.102:443)
status: failed
```

`local-apk-smoke`:

```text
mobile_config_schema: passed
screenshot_redaction_policy: passed (SCREENSHOT_REDACTION_EMPTY_ALLOWED)
appium_endpoint_policy: passed
capabilities_minimum: passed
apk_allowed_package: passed (WHITELIST_BYPASS_SMOKE)
apk_file: passed (113 bytes)
adb_available: failed (spawnSync adb ENOENT)
appium_status: failed (connect ECONNREFUSED 127.0.0.1:4723)
status: failed
```

`sauce-apk-smoke`:

```text
mobile_config_schema: passed
screenshot_redaction_policy: passed (SCREENSHOT_REDACTION_EMPTY_ALLOWED)
appium_endpoint_policy: passed
capabilities_minimum: passed
apk_allowed_package: passed (WHITELIST_BYPASS_SMOKE)
apk_file: passed (113 bytes)
cloud_credentials: passed
client_env: failed (clients/<id>/.env not found)
appium_status: failed (connect EACCES 34.125.90.102:443)
status: failed
```

## Pendencias Reais

- Doctors falham por ambiente: ADB ausente, Appium local indisponivel, acesso Sauce bloqueado/sem `.env` por cliente.
- `docs/maia/07-qa-validacao/` nao existe; QA paralelo registrou as validacoes esperadas, mas nao havia relatorio local para ler.
- `npm install` reportou vulnerabilidades existentes: Producao com 2 high; Comercial com 1 high. Fora do escopo SEC-01..SEC-07.
