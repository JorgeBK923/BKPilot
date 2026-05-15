# Contratos Quebrados — maia-code-validator

**Data:** 2026-05-14

---

## Contrato esperado (HANDOFF.md)

```javascript
mobileAppium    // mobile-appium-client.js
mobileDeviceManager  // mobile-device-manager.js
mobileMcp       // mobile-mcp.js
mobileRedaction // mobile-redaction.js
mobileConfig    // mobile-config.js
mobileRecording // mobile-recording.js
mobileApk       // mobile-apk.js
```

---

## Contrato real (BKPilot-Core/index.js — FONTE)

```javascript
module.exports = {
  browser: require('./browser'),
  client: require('./client'),
  env: require('./env'),
  evidence: require('./evidence'),
  logger: require('./logger'),
  paths: require('./paths'),
  mobileAppium: require('./mobile-appium-client'),       // OK
  mobileConfig: require('./mobile-config'),              // OK
  mobileRedaction: require('./mobile-redaction'),        // OK
  mobileDeviceManager: require('./mobile-device-manager'), // OK
  mobileMcp: require('./mobile-mcp'),                    // OK
  mobileRecording: require('./mobile-recording'),        // OK
  // mobileApk: AUSENTE                                  // QUEBRADO
};
```

## Contrato real (BKPilot/BKPilot-Core/index.js — GIT v0.2.4)

```javascript
module.exports = {
  // ... todos acima ...
  mobileApk: require('./mobile-apk'),  // OK
};
```

## Contrato real (node_modules/@bugkillers/bkpilot-core/index.js)

```javascript
// ... todos acima ...
mobileApk: require('./mobile-apk'),    // OK
```

---

## Análise de impacto

### Contratos preservados (6/7 na fonte, 7/7 no git)
- `mobileAppium` → `MobileAppiumClient`, `buildCapabilities`, `loadClientMobileConfig`, `resolveProviderConfig`, `parseElementsFromSource`, `validateMobileConfig`, `redact`, `timestamp`
- `mobileConfig` → `validateMobileConfig`
- `mobileRedaction` → `REDACTED`, `DEFAULT_CATEGORIES`, `appendRedactionLog`, `mergeCounts`, `normalizeRedactionConfig`, `redactPngBuffer`, `redactText`
- `mobileDeviceManager` → `listAndroidDevices`, `validateLocalAndroidDevice`
- `mobileMcp` → `createMobileTools`, `createMobileMcpServer`, `runMobileMcpServer`
- `mobileRecording` → `startRecording`, `stopRecording`, `downloadSauceVideo`, `convertWebmToMp4`, `captureAppiumLogs`, `captureLogcat`, `redactLog`, `buildVideosIndex`, `buildLogsIndex`, `videoOutputPath`, `logOutputPath`

### Contratos quebrados (1/7 na fonte)
- `mobileApk` → **AUSENTE** do `BKPilot-Core/index.js`. No git e node_modules exporta: `DEFAULT_MAX_APK_BYTES`, `WARN_APK_BYTES`, `buildApkCapabilities`, `downloadApkFromUrl`, `resolveApkSource`, `uploadApkToSauce`, `validateAllowedAppPackage`, `validateApkFile`

### Dependentes afetados
- `BKPilot/scripts/mobile-smoke.js` — importa de `@bugkillers/bkpilot-core/mobile-apk` (node_modules) → **não afetado** (usa versão instalada)
- `BKPilot/scripts/mobile-doctor.js` — importa de `@bugkillers/bkpilot-core/mobile-apk` (node_modules) → **não afetado** (usa versão instalada)
- `BKPilot-Comercial` — depende de `github:JorgeBK923/BKPilot-Core#v0.2.4` → **não afetado** (usa versão publicada)

### Quebra de compatibilidade
- Nenhum export renomeado ou removido
- Nenhuma assinatura de função alterada
- `mobileApk` simplesmente **não foi adicionado** à fonte `BKPilot-Core/index.js`

---

## Correção recomendada

Adicionar ao `BKPilot-Core/index.js`:

```javascript
mobileApk: require('./mobile-apk'),
```

E garantir que `mobile-apk.js` existe no diretório.

---

## Teste mínimo de importação

```bash
node -e "const m = require('./'); console.log(typeof m.mobileApk)"
# Deve retornar: 'object'
```

Atualmente no `BKPilot-Core/`: retornaria `'undefined'` (quebra de contrato).
No `BKPilot/BKPilot-Core/`: retorna `'object'` (OK).
