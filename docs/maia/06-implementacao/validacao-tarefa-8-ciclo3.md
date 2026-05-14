# Validacao T8 Ciclo 3 - Etapa 6

Data: 2026-05-13

## Core - npm test

Comando:

```bash
npm.cmd test
```

Saida:

```text
> @bugkillers/bkpilot-core@0.2.3 test
> node --test

✔ buildCapabilities builds local mobile web capabilities and infers local udid from deviceName (2.6239ms)
✔ buildCapabilities builds Sauce cloud web capabilities without inferring udid (1.6472ms)
✔ buildCapabilities builds generic farm apk capabilities and strips internal policy fields (0.9548ms)
✔ resolveProviderConfig resolves cloud auth without udid concerns (0.3019ms)
✔ resolveProviderConfig resolves env references in appiumUrl (0.2572ms)
✔ redact removes sensitive fields recursively before logging or Appium reporting (0.3876ms)
✔ parseElementsFromSource keeps mobile.getState element contract for Android source (7.8707ms)
✔ parseElementsFromSource returns structured error for malformed XML (0.7092ms)
✔ parseElementsFromSource parses typical 50KB source under 100ms (31.4615ms)
✔ buildVideosIndex supports 0, 1 and N entries with RF8.11 schema (5.5072ms)
✔ buildLogsIndex creates equivalent log index (1.2788ms)
✔ redactLog removes credential names and values (1.5208ms)
✔ convertWebmToMp4 returns ffmpeg_not_found when ffmpeg is absent (4.1769ms)
✔ startRecording and stopRecording call Appium endpoints (0.7709ms)
✔ redactText masks default categories in XML without breaking parseable structure (3.7378ms)
✔ redactText blocks unsafe default category disable without audit flag (0.7997ms)
✔ redactPngBuffer covers configured bounds with opaque rectangle (9.7926ms)
✔ redaction log stores counts without original values (5.1528ms)
✔ redaction performance stays under limits for typical PNG and XML (112.5981ms)
✔ validateMobileConfig reports exact fields and redacts credential-like fields (1.2259ms)
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 419.4621
```

## Producao - node --check mobile-smoke

Comando:

```bash
node --check scripts/mobile-smoke.js
```

Saida:

```text

```

Exit code: 0.

## Producao - node --check gerar-relatorio-final-mobile

Comando:

```bash
node --check scripts/gerar-relatorio-final-mobile.js
```

Saida:

```text

```

Exit code: 0.

## Producao - export Core

Comando:

```bash
node -e "const c=require('@bugkillers/bkpilot-core'); console.log(typeof c.mobileRecording.startRecording)"
```

Saida:

```text
function
```

## Grep credencial

O Windows local nao possui `bash`/`grep` no PATH:

```text
rtk: Failed to resolve 'bash' via PATH, falling back to direct exec: Binary 'bash' not found on PATH
[rtk: program not found]
```

Foi executado equivalente com `rg` no mesmo alvo.

Comando:

```bash
rg -n "QA_PASSWORD|MOBILE_FARM_ACCESS_KEY|MOBILE_FARM_USERNAME" clients -g "*/resultado/*/mobile/logs/*"
```

Saida:

```text

```

Exit code: 1, sem matches.

