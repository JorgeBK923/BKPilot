# Cenários Faltantes

**Data:** 2026-05-15
**Critério:** Funcionalidades sem teste algum ou com cobertura insuficiente para o contrato especificado.

---

## 1. Módulos sem arquivo de teste (CRÍTICO)

### 1.1 `mobile-device-manager.js` — 0% cobertura

Arquivo de 109 linhas com duas funções exportadas. Nenhum teste existe.

**Funções não testadas:**

| Função | Linhas | Propósito | CAs afetados |
|---|---|---|---|
| `listAndroidDevices()` | 8-21 | Lista devices ADB (`adb devices -l`) | CA2.2 |
| `validateLocalAndroidDevice()` | 55-103 | Valida device Android local (bateria, tela, Chrome, autorização) | CA2.2, CA4.5 |

**Cenários mínimos necessários:**
- ADB disponível, 1 device autorizado → ok
- ADB indisponível → `adb_available: failed`
- Múltiplos devices sem UDID → erro de seleção
- Device não autorizado → `device_authorized: failed`
- Bateria abaixo do mínimo → `battery_minimum: failed`
- Tela desligada → `screen_awake: failed`
- `target: 'web'` → verifica Chrome instalado
- `target: 'apk'` → NÃO verifica Chrome

---

## 2. Funções não exportadas ou sem chamada direta nos testes

### 2.1 `downloadSauceVideo` — mobile-recording.js:46-91

46 linhas, completamente sem teste. Função essencial para CA8.1, CA8.8, CA4.12.

**Cenários mínimos necessários:**
- Download bem-sucedido de vídeo Sauce → arquivo salvo, `{ ok: true, path, sizeBytes }`
- HTTP 404/500 do Sauce → `{ ok: false, status: 'download_failed', httpStatus }`
- Timeout de download → `{ ok: false, status: 'download_failed', error: 'timeout' }`
- Erro de rede → `{ ok: false, status: 'download_failed' }`
- Parâmetros obrigatórios ausentes → `{ ok: false, error: '...' }`
- username com caracteres especiais → `encodeURIComponent` aplicado corretamente

### 2.2 `requestJson` — mobile-appium-client.js:330-376

47 linhas, completamente sem teste. Função core de transporte HTTP para Appium.

**Cenários mínimos necessários:**
- POST bem-sucedido com auth → resposta parseada
- GET bem-sucedido sem body → resposta parseada
- HTTP 500 com JSON → reject estruturado
- Appium error (`{ error: true }`) → reject
- JSON inválido na resposta → reject com mensagem
- URL com credenciais → reject CREDENTIALS_IN_URL_NOT_ALLOWED
- Timeout/erro de rede → reject

### 2.3 `redactWithFields` — mobile-appium-client.js:77-103

27 linhas, sem teste. Usada em `getState()` para sanitizar state JSON.

**Cenários mínimos necessários:**
- Objeto com campo `token` → `[redacted]`
- Array de objetos com `password` → cada um redacted
- `sensitiveFields` customizados → redacted por nome
- Objeto sem campos sensíveis → inalterado
- null/undefined → retornado como está

### 2.4 `MobileAppiumClient` — métodos de instância (~300 linhas)

Nenhum método de instância do cliente Appium tem teste direto:

| Método | Linhas | CAs afetados |
|---|---|---|
| `startSession()` | 561-618 | CA2.2, CA4.5, CA4.10 |
| `screenshot()` | 669-685 | CA4.5, CA4.13, CA6.5 |
| `getState()` | 688-741 | CA4.5 |
| `findElement()` | 762-769 | — |
| `tap()` | 772-777 | — |
| `typeText()` | 780-792 | — |
| `swipe()` | 795-820 | — |
| `back()` | 823-828 | — |
| `waitFor()` | 831-845 | — |
| `captureEvidence()` | 848-851 | — |
| `endSession()` | 854-863 | — |
| `assertInteractionAllowed()` | 640-648 | — |
| `validateStartPolicy()` (web branch) | 624-628 | CA2.3 |

---

## 3. Cenários de integração entre módulos (sem teste)

### 3.1 Fluxo APK local completo (CA4.5)

Nenhum teste integra:
1. `validateLocalAndroidDevice` → device OK
2. `buildCapabilities` → caps APK
3. `startSession` → Appium session
4. `screenshot` → captura com redaction
5. `endSession` → cleanup

### 3.2 Fluxo vídeo Sauce (CA4.12, CA8.1)

Nenhum teste integra:
1. `startSession` → session Sauce
2. `downloadSauceVideo` → baixar vídeo
3. `convertWebmToMp4` → converter se necessário
4. `buildVideosIndex` → indexar

### 3.3 Fluxo upload APK → smoke (CA4.3, CA4.5)

Nenhum teste integra:
1. `resolveApkSource` → APK local
2. `validateApkFile` → válido
3. `validateAllowedAppPackage` → permitido
4. `uploadApkToSauce` → upload
5. `buildCapabilities` → com storage:filename

### 3.4 Redaction pipeline (CA6.5)

Nenhum teste confirma que:
1. Screenshot original do Appium (base64) é capturado
2. `redactPngBuffer` aplica máscara
3. Apenas versão mascarada é salva em disco
4. Versão original NÃO existe em nenhum diretório

---

## 4. Funcionalidades da especificação sem implementação visível

### 4.1 Retry transiente (CA2.5, CA2.6)

Especificação Tarefa 2 menciona `mobile.retry.maxAttempts`, `mobile.retry.backoffMs`, `mobile.retry.retryableErrors`. O código em `mobile-config.js` valida esses campos, mas **não há lógica de retry implementada** em `mobile-appium-client.js` ou qualquer outro módulo do Core.

### 4.2 `LIMIT_EXCEEDED` (CA2.4)

Campo `mobile.limits.maxMinutesPerRun` é validado em `mobile-config.js` mas **nenhum código monitora tempo de execução** para disparar `LIMIT_EXCEEDED`.

### 4.3 `videoConsentDocumented` (CA8.11)

Especificação Tarefa 8 (RN8.5) exige flag `videoConsentDocumented: true` para cliente real. **Não existe referência a este campo** no código do Core.

### 4.4 Farm interna skip de vídeo (CA8.9)

Provider `farm-propria` é aceito em `validateMobileConfig` e `buildCapabilities`, mas **não há lógica de skip de vídeo** para farm interna.

### 4.5 `CA6.7` — Falha de mascaramento aborta

`redactPngBuffer` lança exceção com bounds inválidos (linha 104), mas **não há teste** que confirme que o caller (`screenshot()` em `mobile-appium-client.js:673`) NÃO salva o arquivo quando isso ocorre. Na verdade, se `redactPngBuffer` lança, `screenshot()` inteiro crasha — o screenshot original (base64) já foi recebido mas não há rollback.

---

## 5. Cobertura insuficiente (testes existem mas não cobrem todos os caminhos)

### 5.1 `convertWebmToMp4` — mobile-recording.js:93-105

Teste existente cobre `ffmpeg_not_found`. Faltam:
- Conversão bem-sucedida (ffmpeg exit 0)
- ffmpeg erro não-ENOENT
- ffmpeg exit != 0
- Input não encontrado
- Remoção do .webm após conversão

### 5.2 `uploadApkToSauce` — mobile-apk.js:114-157

Testes existentes cobrem sucesso e falha (500, timeout). Faltam:
- JSON de resposta malformado (linha 139-140)
- Erro de rede genérico (linha 153)
- Credenciais ausentes (username null/undefined)
- apkPath inválido (diretório, symlink quebrado)

### 5.3 `downloadApkFromUrl` — mobile-apk.js:180-201

Teste existente cobre cache hit. Faltam:
- URL não-HTTPS → rejeitado
- Download via `requestBuffer` (fetch indisponível)
- HTTP 404/500 no download
- Cache dir sem permissão de escrita

### 5.4 `buildCapabilities` — mobile-appium-client.js:407-496

Testes cobrem 3 caminhos (web local, web Sauce, apk farm). Faltam:
- `target: 'apk'` sem app via args (usa `apk.app` do config)
- `noReset`/`fullReset` vindos de `apk.noReset`/`apk.fullReset`
- `device` como fallback para `udid`
- `vendorOptions` com namespace customizado

---

## 6. Resumo

| Categoria | Cenários faltantes |
|---|---|
| Módulos sem teste | 1 (`mobile-device-manager.js`) |
| Funções sem teste | 3 (`downloadSauceVideo`, `requestJson`, `redactWithFields`) |
| Métodos de classe sem teste | 13 (`MobileAppiumClient`) |
| Cenários de integração | 4 |
| Funcionalidades especificadas não implementadas | 5 |
| Cobertura insuficiente (branches) | 4 |
| **Total de cenários/testes ausentes** | **~80+** |
