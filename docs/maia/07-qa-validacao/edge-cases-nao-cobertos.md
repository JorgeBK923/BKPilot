# Edge Cases Não Cobertos

**Data:** 2026-05-15
**Critério:** Cada entrada cita arquivo:função e valor concreto não testado.

---

## mobile-apk.js

### `resolveApkSource` (linha 37-44)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E1 | `resolveApkSource(null)` | throw APK_SOURCE_REQUIRED | Linha 43 nunca exercitada |
| E2 | `resolveApkSource({})` | throw APK_SOURCE_REQUIRED | Idem |
| E3 | `resolveApkSource({ app: '' })` | throw APK_SOURCE_REQUIRED | String vazia cai em `if (source)` (truthy), path vazio propagado |
| E4 | `resolveApkSource({ app: 'storage:' })` | filename vazio retornado | `parseStorageFilename('storage:')` retorna `''` — storage sem nome de arquivo |
| E5 | `resolveApkSource({ app: '../../../etc/passwd' })` | type: 'local', path absoluto | Path traversal não sanitizado — caminho relativo vira absoluto dentro de ROOT via `toAbs`, mas `../../` sobe acima de ROOT |

### `uploadApkToSauce` (linha 114-157)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E6 | `uploadApkToSauce({})` | throw (sem apkPath) | `validateApkFile(undefined)` → APK_FILE_NOT_FOUND? Ou erro genérico? |
| E7 | `uploadApkToSauce({ apkPath, username: null, accessKey: null })` | throw APK_UPLOAD_FAILED | Linha 115: `!username` → true para null |
| E8 | Sauce retorna 200 mas JSON inválido | `JSON.parse` falha, cai em `body = { raw: text }` | Linha 139-140 nunca testada — `body.item?.name` seria undefined, `storageFilename` cai no fallback |
| E9 | Erro genérico (não AbortError, não APK_UPLOAD_FAILED) | Wrapped como APK_UPLOAD_FAILED | Linha 153 nunca testada |
| E10 | `filename` com caracteres especiais (unicode, espaços, `/`) | Propaga para Sauce | Sem sanitização de filename |

### `validateAllowedAppPackage` (linha 50-58)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E11 | `validateAllowedAppPackage(null, ['com.x'])` | throw APP_PACKAGE_REQUIRED | `!packageName` → true para null |
| E12 | `validateAllowedAppPackage('com.cliente.app', ['COM.CLIENTE.APP'])` | Deveria falhar (case-sensitive) | `allowed.includes(packageName)` é case-sensitive. Pacotes Android são case-sensitive — correto, mas surpreendente. |
| E13 | `validateAllowedAppPackage('com.cliente.app', undefined)` | allowed = [], depende de options | `Array.isArray(undefined)` → false, allowed = [] |
| E14 | `validateAllowedAppPackage('com.x', [], { allowSmokeBypass: true, clientId: undefined })` | bypass permitido | `options.allowSmokeBypass === true` cobre antes de `isSmokeClient` |

### `validateApkFile` (linha 60-76)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E15 | `validateApkFile('')` | throw APK_FILE_NOT_FOUND | `toAbs('')` → path.join(ROOT, '') → ROOT (é diretório, não arquivo) |
| E16 | `validateApkFile('/caminho/é um/diretório/')` | throw (não é arquivo) | Linha 66: `!stat.isFile()` testa diretório |
| E17 | `validateApkFile(apkPath, -1)` | maxBytes negativo → qualquer APK dispara APK_TOO_LARGE | `Number(-1 \|\| DEFAULT)` → -1, `stat.size > -1` sempre true |
| E18 | `validateApkFile(apkPath, 0)` | maxBytes = 0 → APK_TOO_LARGE para qualquer APK > 0 bytes | `Number(0 \|\| DEFAULT)` → DEFAULT (short-circuit do || trata 0 como falsy) |
| E19 | Symlink para APK | Deveria funcionar | `fs.existsSync` e `fs.statSync` seguem symlinks. Comportamento OK, mas não testado. |

### `downloadApkFromUrl` (linha 180-201)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E20 | `downloadApkFromUrl('http://example.com/app.apk')` | throw APK_DOWNLOAD_FAILED | Linha 181: `!isHttpsUrl(url)` bloqueia HTTP. ✓ (validação existe, não testada) |
| E21 | `downloadApkFromUrl(url, cacheDir, { fetch: false })` | Usa `requestBuffer` (http/https nativo) | Linhas 193-194: caminho alternativo sem fetch. Completamente sem teste. |
| E22 | URL retorna 404 no download | throw APK_DOWNLOAD_FAILED | `!res.ok` → throw. Não testado. |
| E23 | Cache dir não existe | `fs.mkdirSync` cria recursivo | Teste existente cobre caminho feliz, mas não testa permissão negada no mkdir. |

---

## mobile-recording.js

### `downloadSauceVideo` (linha 46-91)

**Função inteira sem cobertura de teste.**

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E24 | `downloadSauceVideo({})` | `{ ok: false, status: 'download_failed' }` | Linha 48: validação de parâmetros |
| E25 | `downloadSauceVideo({ jobId: 'x', username: 'u', accessKey: 'k', outputPath: '/tmp/v.mp4' })` | Download real | Linhas 52-90 nunca exercitadas |
| E26 | Sauce retorna 404 no download de vídeo | `{ ok: false, httpStatus: 404 }` | Linha 73: `res.statusCode >= 400` |
| E27 | Timeout no download | `{ ok: false, status: 'download_failed', error: 'timeout' }` | Linhas 84-86 |
| E28 | Erro de rede no download | `{ ok: false, status: 'download_failed', error: '<msg>' }` | Linha 88 |
| E29 | Falha ao escrever arquivo (ENOSPC) | `{ ok: false, status: 'download_failed' }` | Linha 82: `file.on('error')` |
| E30 | username com caracteres especiais (espaço, @, unicode) | `encodeURIComponent` aplicado | Linha 52: `encodeURIComponent(username)` |

### `convertWebmToMp4` (linha 93-105)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E31 | `convertWebmToMp4('missing.webm', 'out.mp4')` | `{ converted: false, reason: 'input_not_found' }` | Linha 96: `!exists(inputPath)` |
| E32 | ffmpeg retorna erro (não-ENOENT) | `{ converted: false, reason: '<error.message>' }` | Linha 99 nunca testada |
| E33 | ffmpeg exit != 0 | `{ converted: false, reason: '<stderr>' }` | Linha 100 nunca testada |
| E34 | Conversão bem-sucedida | `{ converted: true, path: outputPath }` | Linhas 101-104 nunca testadas. `.webm` removido via `fs.unlinkSync` |
| E35 | `unlinkSync` falha após conversão (permissão) | catch vazio — `.webm` permanece | Linhas 102-103: try/catch silencioso |

### `startRecording` / `stopRecording` (linhas 35-44)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E36 | `startRecording(null)` | throw "client.appium is required" | Não testado |
| E37 | `startRecording({})` | throw (sem appium) | Não testado |
| E38 | `stopRecording(client)` quando base64 é null/undefined | `Buffer.alloc(0)` | Linha 43: `base64 ? Buffer.from(...) : Buffer.alloc(0)` |
| E39 | `stopRecording(client)` quando base64 é string vazia | `Buffer.alloc(0)` | String vazia é falsy → Buffer.alloc(0) |

### `redactLog` (linha 132-136)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E40 | `redactLog(null)` | `String(null)` → `'null'` | Sem crash, mas output estranho |
| E41 | `redactLog(undefined)` | `String(undefined)` → `'undefined'` | Idem |
| E42 | `redactLog(123)` | `String(123)` → `'123'` | Números não esperados |
| E43 | Credencial em maiúsculas/minúsculas misturadas | Alguns patterns têm flag `/i`, outros não | `QA_PASSWORD` sem `/i` — `qa_password=xxx` não seria redactado pelo pattern específico |

### `captureAppiumLogs` (linha 107-124)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E44 | `captureAppiumLogs(null, 'sid')` | `String(null)` → base vazia → URL malformada | Sem validação de appiumUrl |
| E45 | Appium retorna array vazio | `''.join('\n')` → `''` | OK |
| E46 | Appium retorna objeto (não array) | `String(value)` aplicado | Linha 122: caminho alternativo |
| E47 | `fetch` retorna erro de rede | Exceção não capturada | Sem try/catch — erro propaga para caller |

---

## mobile-retention.js

### `parseTimestamp` (linha 19-26)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E48 | `parseTimestamp(null)` | `null` | `String(null)` → `'null'`, não match no regex |
| E49 | `parseTimestamp(undefined)` | `null` | `String(undefined)` → `'undefined'` |
| E50 | `parseTimestamp('')` | `null` | Regex falha em string vazia |
| E51 | `parseTimestamp('2026-13-01_0000')` | `Date` com mês 13 | `new Date(2026, 12, 1)` → Janeiro 2027 (rollover do Date). Sem validação de mês. |
| E52 | `parseTimestamp('2026-05-01_9999')` | `Date` inválido | Hora 99, minuto 99 — Date do JS aceita. |
| E53 | `parseTimestamp('0000-01-01_0000')` | `new Date(0, 0, 1)` → ano 1900 | Data válida mas potencialmente problemática para cutoff |

### `purgeOldArtifacts` (linha 33-75)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E54 | `purgeOldArtifacts(null, 30)` | throw CLIENT_ID_REQUIRED | `!clientId` → true |
| E55 | `purgeOldArtifacts('c', -1)` | throw RETENTION_DAYS_INVALID | `days < 0` → true |
| E56 | `purgeOldArtifacts('c', 0)` | cutoff = now (remove tudo com timestamp ≤ now) | Todas as pastas de timestamp seriam removidas |
| E57 | `purgeOldArtifacts('c', 0.5)` | dias fracionários | `Number.isFinite(0.5)` → true. Funciona? |
| E58 | `purgeOldArtifacts('c', 30, false, { now: '2026-01-01' })` | `new Date('2026-01-01')` | String funciona, mas não testado |
| E59 | Result dir não existe | Retorna summary vazio | Linha 49: `!fs.existsSync` → return summary |
| E60 | Path traversal no clientId (`'../../../etc'`) | `path.join('clients', '../../../etc', 'resultado')` → sai do ROOT | Linha 40: path.join normaliza. Linha 46: verificação `startsWith(root)` → segurança ✓ (não testada) |

---

## mobile-redaction.js

### `redactText` (linha 45-73)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E61 | `redactText(null)` | `{ value: null, counts: {...}, total: 0 }` | `typeof null` → `'object'`, não é string → retorna sem processar |
| E62 | `redactText(undefined)` | `{ value: undefined, counts: {...}, total: 0 }` | Idem |
| E63 | `redactText(123)` | `{ value: 123, counts: {...}, total: 0 }` | Número não processado |
| E64 | String com emoji/non-BMP unicode | Regex podem quebrar com surrogate pairs | Ex: `'💳 1234-5678-9012-3456'` — cartão mascarado? Emoji preservado? |
| E65 | String de 10MB | Performance? Stack overflow? | Sem teste de stress |
| E66 | `xmlFields` com pattern RegExp malformado | `new RegExp(pattern, 'g')` lança exceção | Linha 65: sem try/catch |
| E67 | `xmlFields` com `{ name: 'href', pattern: '...' }` | `!name && !pattern` → false, processa | OK, mas não testado |

### `redactPngBuffer` (linha 93-130)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E68 | `redactPngBuffer(null)` | `PNG.sync.read(null)` → exceção | Sem validação de buffer nulo |
| E69 | `redactPngBuffer(Buffer.alloc(0))` | `PNG.sync.read` lança | PNG inválido |
| E70 | Bounds com valores negativos (x=-10) | `x0 = Math.max(0, -10)` → 0. Clampa. | Linha 108: clamp evita crash |
| E71 | Bounds fora da imagem (x=99999) | `x0 = 99999`, `x1 = min(width, 99999+w)` → não itera | Loop não executa — OK, mas bounds não testados |
| E72 | Bounds com NaN/Infinity | `!Number.isFinite` → throw | Linha 104: validação existe, não testada |
| E73 | PNG enorme (4096×4096) | 16M pixels para iterar. Memória? Tempo? | Sem teste de stress |

### `appendRedactionLog` (linha 139-150)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E74 | `appendRedactionLog('/tmp/new.json', event)` | Arquivo não existe → array vazio → push → escreve | Testado |
| E75 | `appendRedactionLog(path, event)` com JSON malformado no disco | `JSON.parse` lança exceção | Linha 140: sem try/catch |
| E76 | `appendRedactionLog(path, event)` sem permissão de escrita | `fs.writeFileSync` lança | Sem try/catch |

### `normalizeRedactionConfig` (linha 26-43)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E77 | `normalizeRedactionConfig(null)` | `config \|\| {}` → `{}` → enabled=true | OK |
| E78 | `normalizeRedactionConfig({ disableCategories: 'cpf' })` | `asArray('cpf')` → `['cpf']` | String única convertida para array |
| E79 | `normalizeRedactionConfig({ disableCategories: ['CPF', 'Cpf'] })` | `.toLowerCase()` → `['cpf', 'cpf']` | Duplicata no array. Categoria aparece 2× no filter → removida 1× (Set implícito pelo filter). |

---

## mobile-appium-client.js

### `buildCapabilities` (linha 407-496)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E80 | `buildCapabilities({})` | Caps mínimas com defaults | Não testado — sempre passa args parciais |
| E81 | `buildCapabilities({ provider: 'local', target: 'apk' })` sem appPackage | `raw.appPackage` undefined → propagado | `buildApkCapabilities` interno jogaria erro? buildCapabilities NÃO chama buildApkCapabilities — duplicação de lógica |
| E82 | `buildCapabilities({ provider: 'local', target: 'web', deviceName: '' })` | udid não inferido (string vazia não match no regex) | Linha 451: `/^[A-Za-z0-9._:-]+$/` não match string vazia. OK. |

### `validateAppiumEndpointPolicy` (linha 156-187)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E83 | `validateAppiumEndpointPolicy({ appiumUrl: 'not-a-url' })` | throw APPIUM_URL_INVALID | Testado indiretamente via throws |
| E84 | `validateAppiumEndpointPolicy({ appiumUrl: 'http://localhost:4723' })` | ok: true (loopback HTTP permitido) | Testado |
| E85 | Hostname com IPv6 loopback `[::1]` | `isLoopbackHost` trata colchetes | Linha 129: `.replace(/^\[|\]$/g, '')` — testado? Não diretamente. |
| E86 | `allowedAppiumHosts: ['*.example.com']` | Wildcard no início | Linha 151: `host.endsWith('.example.com')` — host `example.com` match? Não: `'example.com'.endsWith('.example.com')` → false. Bug? |

### `validateScreenshotRedactionPolicy` (linha 189-196)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E87 | `validateScreenshotRedactionPolicy({}, 'cliente-real')` | throw SCREENSHOT_REDACTION_NOT_CONFIGURED | `mobile.redaction` undefined → `{}` → `screenshotFields` undefined → `asArray` → `[]` → throw |
| E88 | `validateScreenshotRedactionPolicy(null, 'c')` | throw (acesso a null.redaction) | TypeError, não erro estruturado |

### `redact` (linha 63-75)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E90 | `redact(null)` | `null` | Retorna null direto |
| E91 | `redact('string')` | `'string'` | typeof !== 'object' → retorna sem processar |
| E92 | `redact([{ token: 'x' }])` | `[[{ token: '[redacted]' }]]` | Array de objetos processado recursivamente ✓ |

### `requestJson` (linha 330-376)

**Função completamente sem teste (47 linhas).**

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E93 | URL com credenciais embutidas | reject CREDENTIALS_IN_URL_NOT_ALLOWED | Linha 333-335 |
| E94 | Resposta HTTP 500 com JSON | reject com `Appium ... failed` | Linha 365 |
| E95 | Resposta com `{ error: true }` (Appium error) | reject | Linha 365: `parsed.error` |
| E96 | Resposta com JSON inválido | reject com "Invalid JSON from Appium" | Linha 361 |
| E97 | Resposta vazia (204 No Content) | resolve `{}` | Linha 357: `if (raw)` → string vazia → `{}` |
| E98 | Timeout de rede | reject com erro | `req.on('error')` |

---

## mobile-config.js

### `validateMobileConfig` (linha 39-76)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E99 | `validateMobileConfig(null)` | `{ ok: false, errors: [...] }` | `requireObject` falha |
| E100 | `validateMobileConfig({})` | Múltiplos erros de campos required | Teste existente cobre parcialmente |
| E101 | `validateMobileConfig({ provider: 'local', target: 'web', appiumUrl: 'invalid-format', ... })` | Erro em `mobile.appiumUrl` | Linha 50: regex `^env:[A-Z0-9_]+$\|^https?:\/\/` — string sem protocolo falha |
| E102 | `validateMobileConfig({ ... mobile.timeouts: {} })` sem keys | Erros em cada key de timeouts | `requireKeys` reporta cada campo missing |

---

## mobile-device-manager.js (0% cobertura)

### `validateLocalAndroidDevice` (linha 55-103)

| # | Entrada | Comportamento esperado | Risco |
|---|---|---|---|
| E103 | ADB não instalado | `adb_available: failed` | `execFileSync` lança, catch retorna `{ ok: false }` |
| E104 | `validateLocalAndroidDevice({})` | Sem UDID, auto-select se 1 device | Não testado |
| E105 | Múltiplos devices sem --device | Erro de seleção | Não testado |
| E106 | Device não autorizado | `device_authorized: failed` | Status !== 'device', mas testado? |
| E107 | `getBattery` retorna null (dumpsys sem level) | warning "Battery level could not be read" | Linha 85 |
| E108 | `isScreenAwake` retorna null | warning "Screen awake state could not be read" | Linha 89 |
| E109 | `target: 'apk'` — não verifica Chrome | Branch 91-94 pula | Não testado |

---

## Totais

| Arquivo | Edge cases listados |
|---|---|
| `mobile-apk.js` | 23 |
| `mobile-recording.js` | 24 |
| `mobile-retention.js` | 13 |
| `mobile-redaction.js` | 19 |
| `mobile-appium-client.js` | 19 |
| `mobile-config.js` | 4 |
| `mobile-device-manager.js` | 7 |
| **TOTAL** | **109** |
