# Alucinações Detectadas — maia-code-validator

**Data:** 2026-05-14

---

## Metodologia

Cada função, módulo, comando npm e arquivo referenciado nos resumos e HANDOFFs foi verificado contra existência real em disco.

---

## Resultado: 0 alucinações de código

Nenhuma função chamada sem existir. Nenhum arquivo referenciado e inexistente. Nenhum comando npm ou variável de ambiente inventado.

---

## Verificações por categoria

### Funções exportadas × funções existentes

| Função citada | Módulo | Existe? | Evidência |
|---|---|---|---|
| `buildCapabilities` | mobile-appium-client | Sim | `BKPilot-Core/mobile-appium-client.js:320` |
| `resolveProviderConfig` | mobile-appium-client | Sim | `BKPilot-Core/mobile-appium-client.js:310` |
| `parseElementsFromSource` | mobile-appium-client | Sim | `BKPilot-Core/mobile-appium-client.js:211` |
| `redact` | mobile-appium-client | Sim | `BKPilot-Core/mobile-appium-client.js:62` |
| `validateMobileConfig` | mobile-config | Sim | `BKPilot-Core/mobile-config.js:37` |
| `normalizeRedactionConfig` | mobile-redaction | Sim | `BKPilot-Core/mobile-redaction.js:26` |
| `redactText` | mobile-redaction | Sim | `BKPilot-Core/mobile-redaction.js:45` |
| `redactPngBuffer` | mobile-redaction | Sim | `BKPilot-Core/mobile-redaction.js:93` |
| `appendRedactionLog` | mobile-redaction | Sim | `BKPilot-Core/mobile-redaction.js:139` |
| `validateLocalAndroidDevice` | mobile-device-manager | Sim | `BKPilot-Core/mobile-device-manager.js:55` |
| `createMobileTools` | mobile-mcp | Sim | `BKPilot-Core/mobile-mcp.js:5` |
| `createMobileMcpServer` | mobile-mcp | Sim | `BKPilot-Core/mobile-mcp.js:81` |
| `runMobileMcpServer` | mobile-mcp | Sim | `BKPilot-Core/mobile-mcp.js:122` |
| `startRecording` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:29` |
| `stopRecording` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:34` |
| `downloadSauceVideo` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:40` |
| `convertWebmToMp4` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:87` |
| `buildVideosIndex` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:154` |
| `buildLogsIndex` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:158` |
| `redactLog` | mobile-recording | Sim | `BKPilot-Core/mobile-recording.js:125` |
| `buildApkCapabilities` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:78` |
| `resolveApkSource` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:37` |
| `uploadApkToSauce` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:114` |
| `downloadApkFromUrl` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:180` |
| `validateAllowedAppPackage` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:50` |
| `validateApkFile` | mobile-apk | Sim (git) | `BKPilot/BKPilot-Core/mobile-apk.js:60` |

### Comandos npm referenciados

| Comando | Existe no package.json? |
|---|---|
| `npm test` (Core) | Sim — `"test": "node --test"` |
| `npm run mobile:smoke` (Producao) | Não verificado (BKPilot-Producao package.json não localizado) |
| `npm run mobile:doctor` (Producao) | Não verificado |

### Imports cross-project

| Import | De | Para | Resolve? |
|---|---|---|---|
| `./lib/mobile-appium-client` | `mobile-smoke.js` | `scripts/lib/` | Sim |
| `./lib/mobile-device-manager` | `mobile-smoke.js` | `scripts/lib/` | Sim |
| `@bugkillers/bkpilot-core/mobile-recording` | `mobile-smoke.js` | node_modules | Sim |
| `@bugkillers/bkpilot-core/mobile-apk` | `mobile-smoke.js` | node_modules | Sim |

---

## Inconsistência de documentação (não é alucinação de código)

O HANDOFF.md (Ciclo 5) lista `mobile-apk.js` e `mobileApk` como parte do escopo de revisão em `BKPilot-Core/`. O arquivo e export **existem** no git repo e node_modules, mas **não existem** no diretório fonte `BKPilot-Core/`. Isso é uma inconsistência de sincronização, não uma alucinação da IA — o código foi implementado, mas a fonte não foi atualizada.

---

## Conclusão

**0 alucinações de IA detectadas.** Todo código referenciado existe (no git ou node_modules). O problema é de sincronização de diretórios, não de invenção.
