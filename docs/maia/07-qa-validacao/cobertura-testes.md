# Cobertura de Testes — BKPilot-Core

**Data:** 2026-05-15
**Comando:** `node --test --experimental-test-coverage`
**Resultado:** 39 testes, 0 falhas, 0 skipped

---

## Tabela de Cobertura por Módulo

| Módulo | Linha % | Branch % | Função % | Status |
|---|---|---|---|---|
| `mobile-apk.js` | 87.74 | 63.53 | 92.31 | AMARELO |
| `mobile-appium-client.js` | 52.85 | 65.99 | 48.21 | VERMELHO |
| `mobile-config.js` | 88.89 | 33.33 | 100.00 | AMARELO |
| `mobile-recording.js` | 66.50 | 42.37 | 75.00 | VERMELHO |
| `mobile-redaction.js` | 80.12 | 65.12 | 86.67 | AMARELO |
| `mobile-retention.js` | 87.50 | 57.14 | 80.00 | AMARELO |
| `mobile-device-manager.js` | 0.00 | 0.00 | 0.00 | VERMELHO |
| **TODOS** | **65.39** | **59.86** | **66.67** | **VERMELHO** |

### Módulos fora da suite (sem arquivo de teste)

| Módulo | Linhas | Funções exportadas |
|---|---|---|
| `mobile-device-manager.js` | 109 | `listAndroidDevices`, `validateLocalAndroidDevice` |
| `mobile-mcp.js` | — | não analisado |
| `browser.js` | — | não analisado |
| `client.js` | — | não analisado |
| `env.js` | — | não analisado |
| `evidence.js` | — | não analisado |
| `logger.js` | — | não analisado |
| `paths.js` | — | não analisado |

---

## Linhas Não Cobertas por Módulo

### mobile-apk.js (12.26% descoberto)

```
Linha 43:    resolveApkSource — throw APK_SOURCE_REQUIRED (config vazio)
Linha 139-140: uploadApkToSauce — JSON.parse falha, fallback {raw: text}
Linha 153:   uploadApkToSauce — catch de erro genérico (não-AbortError, não-APK_UPLOAD_FAILED)
Linha 159-178: requestBuffer — função inteira (http/https download sem fetch)
Linha 194-195: downloadApkFromUrl — fallback quando fetch indisponível (options.fetch === false)
```

### mobile-appium-client.js (47.15% descoberto)

```
Linhas 31-35:   timestamp, toAbs não testados diretamente
Linhas 42-44:   ensureDir (usado internamente)
Linhas 46-48:   readJson
Linhas 50-55:   safeName, resolveSecret
Linhas 77-103:  redactWithFields — completamente sem teste
Linhas 161-162: isSmokeClient
Linhas 180-181: matchesAllowedHost sem teste isolado
Linhas 227-237: elementScore
Linhas 242-244: collectXmlNodes (testado via parseElementsFromSource)
Linhas 283-290: compactElements sem teste isolado
Linhas 294-295: parseElementsFromSource string vazia/null
Linhas 324-328: normalizeTarget
Linhas 330-376: requestJson — 47 linhas, completamente sem teste
Linha 482:      buildCapabilities branch de appiumOptions
Linhas 488-489: buildCapabilities vendor options
Linhas 498-517: resolveResultDirs — sem teste
Linhas 544-545: appiumPath
Linhas 548-549: appium (método delegado)
Linhas 555-557: logEvent sem resultDir definido
Linhas 561-618: startSession — 58 linhas, completamente sem teste
Linhas 624-628: validateStartPolicy — branch web URL
Linhas 635-636: validateStartPolicy — appPackage com allowedPackages não-APK
Linhas 640-648: assertInteractionAllowed — observe mode, destructive words
Linhas 651-652: requireSession
Linhas 655-660: getOptional
Linhas 663-666: status
Linhas 669-685: screenshot
Linhas 688-741: getState — 54 linhas
Linhas 744-759: locatorFromArgs
Linhas 762-769: findElement
Linhas 772-777: tap
Linhas 780-792: typeText
Linhas 795-820: swipe
Linhas 823-828: back
Linhas 831-845: waitFor
Linhas 848-851: captureEvidence
Linhas 854-863: endSession
```

### mobile-recording.js (33.50% descoberto)

```
Linhas 23-28:   safeName (não testado isoladamente)
Linhas 46-91:   downloadSauceVideo — 46 linhas completamente sem teste
Linhas 99-104:  convertWebmToMp4 — branches ffmpeg error (não-ENOENT) e status != 0
Linhas 178-182: videoOutputPath
Linhas 184-188: logOutputPath
```

### mobile-redaction.js (19.88% descoberto)

```
Linhas 49-50:   redactText — caminho disabled/empty
Linhas 60-71:   redactText — xmlFields com pattern customizado
Linhas 83-90:   normalizeBounds — caminho alternativo (field.x/y/width/height)
Linhas 97-98:   redactPngBuffer — caminho disabled/sem fields
Linhas 104-105: redactPngBuffer — bounds inválidos
Linhas 132-137: mergeCounts — sem teste
```

### mobile-config.js (11.11% descoberto)

```
Linhas 25-27:   requireObject retorna false (objeto inválido)
Linhas 45-46:   mobile.target valor inválido
Linhas 51-52:   mobile.appiumUrl formato inválido
Linhas 69-70:   mobile.redaction.allowEmptyScreenshotFields tipo inválido
```

### mobile-retention.js (12.50% descoberto)

```
Linhas 9-13:    error() helper, toAbs
Linhas 47-48:   purgeOldArtifacts — baseDir fora do root
Linhas 58-60:   purgeOldArtifacts — skip not_directory, isInside check no dryRun
```

---

## Critérios de Avaliação

| Faixa | Linha % | Branch % | Função % |
|---|---|---|---|
| VERDE | >= 90 | >= 80 | >= 90 |
| AMARELO | 70-89 | 50-79 | 60-89 |
| VERMELHO | < 70 | < 50 | < 60 |
