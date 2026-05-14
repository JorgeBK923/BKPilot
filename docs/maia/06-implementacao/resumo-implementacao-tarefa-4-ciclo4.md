# Resumo de Implementacao - Tarefa 4 Ciclo 4

Data: 2026-05-14
Status: implementado com pendencia ambiental para smoke em device real.

## Entregas

- `BKPilot-Core/mobile-apk.js`: logica reutilizavel de APK.
- `BKPilot-Core/index.js`: export `mobileApk` sem remover contratos existentes.
- `BKPilot-Core/test/mobile-apk.test.js`: cobertura de fontes, upload, timeout, whitelist, tamanho, cache e redaction.
- `scripts/mobile-smoke.js`: prepara APK antes da sessao, valida whitelist antes de upload, faz upload Sauce `auto`, respeita `preuploaded`.
- `scripts/mobile-doctor.js`: valida APK local, URL/storage, whitelist e capabilities minimas.
- `novo-cliente.sh --target apk`: template APK.
- `clients/local-apk-smoke` e `clients/sauce-apk-smoke`.
- `docs/onboarding-mobile.md` e `AGENTS.md`.
- Core `v0.2.4` publicado; Producao e Comercial atualizados.

## Validacoes - Saidas Literais

### Core `npm test`

```text
ℹ tests 29
ℹ suites 0
ℹ pass 29
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### `node --check`

```text
rtk node --check mobile-apk.js
<sem output; exit 0>

rtk node --check test\mobile-apk.test.js
<sem output; exit 0>

rtk node --check scripts\mobile-smoke.js
<sem output; exit 0>

rtk node --check scripts\mobile-doctor.js
<sem output; exit 0>
```

### Import Producao

```text
rtk node -e "const c=require('@bugkillers/bkpilot-core'); console.log(typeof c.mobileApk.buildApkCapabilities)"
function
```

### Doctor APK Local

```text
> node scripts/mobile-doctor.js --cliente local-apk-smoke
{
  "status": "failed",
  "clientId": "local-apk-smoke",
  "provider": "local",
  "target": "apk",
  "checks": [
    { "name": "mobile_config_schema", "status": "passed", "details": "ok" },
    { "name": "client_env", "status": "passed", "details": "clients\\local-apk-smoke\\.env" },
    { "name": "capabilities_minimum", "status": "passed" },
    { "name": "apk_allowed_package", "status": "passed", "details": "WHITELIST_BYPASS_SMOKE" },
    { "name": "apk_activity", "status": "passed", "details": ".MainActivity" },
    { "name": "apk_file", "status": "passed", "details": "113 bytes" },
    { "name": "adb_available", "status": "failed", "details": "spawnSync adb ENOENT" },
    { "name": "appium_status", "status": "failed", "details": "connect ECONNREFUSED 127.0.0.1:4723" }
  ]
}
```

### Grep Credencial

```text
matches=0
```

## Decisoes H4.1-H4.5

- H4.1 confirmada para implementacao: `uploadApkToSauce()` usa `POST /v1/storage/upload` com Basic Auth. Validacao real Sauce fica para smoke com credenciais.
- H4.2 confirmada: default `uploadStrategy: "auto"`; `preuploaded` exige `storageFilename`.
- H4.3 confirmada como default operacional: `noReset: true`; `fullReset` opt-in.
- H4.4 confirmada como regra de envelope: alerta >100MB e bloqueio >500MB.
- H4.5 confirmada: path local e o template principal; URL HTTPS tambem suportada com cache.

## Mapeamento RF/RNF/RN/CA

| Item | Evidencia |
|---|---|
| RF4.1, RF4.12, RF4.13 | `clients/*-apk-smoke/config.json`, `novo-cliente.sh --target apk` |
| RF4.2, CA4.1 | `buildApkCapabilities()`, `mobile-smoke.js`, `mobile-doctor.js` |
| RF4.3 | `resolveApkSource()` testes local/URL/storage |
| RF4.4, RF4.9, CA4.5 | capabilities Appium local; smoke real pendente por ADB |
| RF4.5, RF4.10, CA4.3 | `uploadApkToSauce()` e `prepareApkExecution()` |
| RF4.6, CA4.4 | branch `uploadStrategy: "preuploaded"` |
| RF4.7, RN4.1, CA4.2 | `validateAllowedAppPackage()` antes de upload |
| RF4.8, CA4.6 | `mobile-doctor.js` valida arquivo/URL/storage |
| RF4.11 | `mobile-smoke.js` grava bloco `apk` no report |
| RF4.14, RN4.4, CA4.10 | `noReset` default true; `fullReset` opt-in |
| RF4.15 | `mobile.timeouts.uploadApk` usado no upload/download |
| RF4.16, CA4.8 | erro `APK_UPLOAD_FAILED`, sem fallback silencioso |
| RF4.17, RNF4.3, CA4.7 | `redact()`, `redactLog()`, grep `matches=0` |
| RF4.18, CA4.12 | T8 `videos_index.json` preservado; smoke real Sauce pendente |
| RNF4.1, RN4.7, CA4.11 | `validateApkFile()` alerta/bloqueia por tamanho |
| RNF4.2 | whitelist ocorre antes de download/upload |
| RNF4.4, CA4.9 | `downloadApkFromUrl()` com cache em memoria por URL |
| RNF4.5, RN4.3 | nome Sauce `<cliente>_<versao>_<timestamp>.apk` |
| RN4.2 | default auto; preuploaded opt-in |
| RN4.5 | falha de install reportada pelo Appium como erro deterministico |
| RN4.6 | smoke bypass apenas para clientes smoke |
| CA4.13 | mascaramento T6 continua em `MobileAppiumClient.screenshot()` |

## Pendencias

- Smoke APK local real nao executado: ADB ausente.
- Appium local nao estava ativo: `ECONNREFUSED 127.0.0.1:4723`.
- Smoke Sauce real nao executado por falta de APK/credenciais reais nesta etapa.
