# Resumo de Implementacao - Ciclo 7 QA

Data: 2026-05-15
Status: R3 e R5 remediados.

## Escopo

Remediadas apenas as ressalvas R3 e R5 do QA. R1, R2, R4, R6, R7 e R8 foram mantidas para backlog Ciclo 8 conforme HANDOFF.md.

## Mapeamento

| Ressalva | Correcao | Evidencia |
|---|---|---|
| R3 | `uploadApkToSauce()` agora usa `FormData`/`Blob` nativos quando existem e fallback multipart manual com `Buffer` quando ausentes. Sem dependencia nova. | `BKPilot-Core/mobile-apk.js`; testes `uploadApkToSauce falls back...` e `buildMultipartApkBody...` em `test/mobile-apk.test.js` |
| R5 | `MobileAppiumClient.screenshot()` agora e fail-closed: se `redactPngBuffer()` falhar, nenhum PNG e salvo/copiad, evento critico e registrado e o erro `SCREENSHOT_REDACTION_FAILED` e lancado. | `BKPilot-Core/mobile-appium-client.js`; testes `screenshot saves redacted PNG...` e `screenshot redaction failure leaves no unmasked PNG...` em `test/mobile-appium-client.test.js` |

## Core v0.2.6

```text
Core commit/tag: v0.2.6
Push: origin/main ok; origin/v0.2.6 ok
engines.node: >=18
```

Produção e Comercial atualizados para:

```json
"@bugkillers/bkpilot-core": "github:JorgeBK923/BKPilot-Core#v0.2.6"
```

Verificacao de import em ambos:

```text
0.2.6 >=18 function
```

## Validacoes - Saidas Literais

### `node --check`

```text
rtk node --check mobile-apk.js
<sem output; exit 0>

rtk node --check mobile-appium-client.js
<sem output; exit 0>

rtk node --check test/mobile-apk.test.js
<sem output; exit 0>

rtk node --check test/mobile-appium-client.test.js
<sem output; exit 0>
```

### Core `npm test`

```text
> node --test
...
tests 43
suites 0
pass 43
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 658.7424
```

### Coverage

```text
node --test --experimental-test-coverage
tests 43
pass 43
fail 0

file                    | line % | branch % | funcs %
mobile-apk.js           |  88.98 |    65.56 |   92.86
mobile-appium-client.js |  56.24 |    65.22 |   53.57
all files               |  67.76 |    60.96 |   69.57
```

## Decisao de Backlog

Nao foram tocados neste ciclo:

| R | Destino |
|---|---|
| R1 | Backlog Ciclo 8 |
| R2 | Backlog Ciclo 8 |
| R4 | Backlog Ciclo 8 |
| R6 | Backlog Ciclo 8 |
| R7 | Backlog Ciclo 8 |
| R8 | Backlog Ciclo 8 |

## Observacoes

- R3 foi resolvido sem pacote novo.
- `npm install` manteve alertas existentes: Producao com 2 high; Comercial com 1 high. Fora do escopo R3/R5.
