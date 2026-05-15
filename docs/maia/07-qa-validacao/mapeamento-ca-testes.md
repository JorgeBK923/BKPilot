# Mapeamento Critérios de Aceite → Testes

**Data:** 2026-05-15
**Legenda:** ✅ Coberto | ⚠️ Parcial | ❌ Sem cobertura

---

## Tarefa 4 — APK Farm

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CA4.1 | Capabilities APK montadas | ✅ | `buildApkCapabilities supports web and apk local/cloud capabilities` (mobile-apk.test.js:112) | Local, cloud e web testados |
| CA4.2 | Whitelist bloqueia pacote não-listado | ✅ | `validateAllowedAppPackage blocks outside list` (mobile-apk.test.js:142) + `validateStartPolicy blocks APK clients` (mobile-appium-client.test.js:147) | Bloqueio + smoke bypass testados |
| CA4.3 | Upload Sauce automático | ✅ | `uploadApkToSauce uploads with fetch and returns storage metadata` (mobile-apk.test.js:41) | URL, auth, body, metadata verificados |
| CA4.4 | Upload Sauce pré-enviado | ⚠️ | `resolveApkSource supports ... Sauce storage formats` (mobile-apk.test.js:26) | storage:filename resolvido, mas skip de upload não validado isoladamente |
| CA4.5 | Smoke APK local USB | ❌ | — | Fluxo completo (instalar → abrir → screenshot → fechar) sem teste. `mobile-device-manager.js` sem testes. |
| CA4.6 | mobile:doctor valida APK | ⚠️ | `validateApkFile checks exists and size limits` (mobile-apk.test.js:158) | Valida arquivo, mas comando `mobile:doctor` em si não testado |
| CA4.7 | Credenciais não vazam em upload | ✅ | `redact masks Sauce credential fields` (mobile-apk.test.js:193) + `redactLog removes credential names` (mobile-recording.test.js:44) | MOBILE_FARM_USERNAME, MOBILE_FARM_ACCESS_KEY verificados |
| CA4.8 | Falha de upload aborta | ✅ | `uploadApkToSauce fails with APK_UPLOAD_FAILED on Sauce 500` (mobile-apk.test.js:72) + `on timeout` (mobile-apk.test.js:91) | HTTP 500 + timeout testados |
| CA4.9 | APK URL cachado | ✅ | `downloadApkFromUrl caches URL downloads within the process` (mobile-apk.test.js:169) | Cache hit (calls=1) e path idêntico verificados |
| CA4.10 | Reset entre cenários | ⚠️ | `buildApkCapabilities supports web and apk local/cloud capabilities` (mobile-apk.test.js:112) | noReset/fullReset flags testados, mas preservação de estado entre cenários não |
| CA4.11 | APK >500MB aborta | ✅ | `validateApkFile checks exists and size limits` (mobile-apk.test.js:158) | APK_TOO_LARGE com maxBytes customizado |
| CA4.12 | Smoke Sauce APK gera vídeo | ❌ | — | `downloadSauceVideo` completamente sem teste (46 linhas). Integração APK→vídeo não validada. |
| CA4.13 | Smoke local APK respeita mascaramento | ⚠️ | `redactPngBuffer covers configured bounds` (mobile-redaction-config.test.js:49) | Mascaramento PNG funciona, mas integração com fluxo APK não testada |

---

## Tarefa 8 — Vídeo + Logs

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CA8.1 | Vídeo Sauce baixado | ❌ | — | `downloadSauceVideo` sem teste. Sem validação de arquivo MP4 em disco. |
| CA8.2 | Vídeo local Appium | ✅ | `startRecording and stopRecording call Appium endpoints` (mobile-recording.test.js:95) | Chamadas Appium e decodificação base64 verificadas |
| CA8.3 | Webm convertido pra MP4 | ⚠️ | `convertWebmToMp4 returns ffmpeg_not_found when ffmpeg is absent` (mobile-recording.test.js:82) | Só testa ausência de ffmpeg. Conversão bem-sucedida e falha de ffmpeg não-ENOENT sem teste. |
| CA8.4 | Ffmpeg ausente | ✅ | `convertWebmToMp4 returns ffmpeg_not_found when ffmpeg is absent` (mobile-recording.test.js:82) | pending_conversion no index testado via buildVideosIndex |
| CA8.5 | Override CLI (--video) | ❌ | — | Lógica de override não está no Core, está no Producao. Fora do escopo de teste unitário do Core. |
| CA8.6 | Logs sem credencial | ✅ | `captureAppiumLogs returns redacted log` (mobile-recording.test.js:63) + `captureLogcat returns redacted log` (mobile-recording.test.js:74) | Ambos os sources de log validados |
| CA8.7 | Index JSON correto | ✅ | `buildVideosIndex supports 0, 1 and N entries with RF8.11 schema` (mobile-recording.test.js:21) + `buildLogsIndex creates equivalent log index` (mobile-recording.test.js:39) | Schema completo verificado |
| CA8.8 | Falha de download não aborta | ❌ | — | `downloadSauceVideo` sem teste. Fallback e registro de erro não validados. |
| CA8.9 | Farm interna pula com aviso | ❌ | — | Sem teste. Provider "farm-propria" aparece em buildCapabilities mas sem validação de skip de vídeo. |
| CA8.10 | Relatório referencia vídeo | ❌ | — | Fora do escopo do Core. Lógica em BKPilot-Producao. |
| CA8.11 | Consentimento cliente real | ❌ | — | `videoConsentDocumented` não existe no código do Core. Funcionalidade não implementada. |
| CA8.12 | Performance conversão | ❌ | — | Sem teste de tempo de conversão ffmpeg. |

---

## Critérios de Aceite — Item 1 (Relatório Final Mobile)

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CA1.1 | Geração básica | ❌ | — | Fora do escopo do Core. Em BKPilot-Producao. |
| CA1.2 | Consolidação web + mobile | ❌ | — | Fora do escopo do Core. |
| CA1.3 | Validação de evidência ausente | ❌ | — | Fora do escopo do Core. |
| CA1.4 | Performance (≤60s) | ❌ | — | Fora do escopo do Core. |
| CA1.5 | Layout PDF | ❌ | — | Fora do escopo do Core. |

---

## Critérios de Aceite — Item 2 (Contrato Mobile)

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CA2.1 | Template completo | ❌ | — | `novo-cliente.sh` em BKPilot-Producao. Fora do escopo do Core. |
| CA2.2 | mobile:doctor valida | ❌ | — | Comando em BKPilot-Producao. `validateLocalAndroidDevice` sem teste. |
| CA2.3 | mobile:doctor falha clara | ⚠️ | `validateMobileConfig reports exact fields` (mobile-redaction-config.test.js:99) + `validateAppiumEndpointPolicy` (mobile-appium-client.test.js:174) | Validações individuais testadas, comando integrado não |
| CA2.4 | Limites Sauce | ❌ | — | `LIMIT_EXCEEDED` sem implementação ou teste visível. |
| CA2.5 | Retry transiente | ❌ | — | Lógica de retry não implementada no Core. |
| CA2.6 | Erro de teste não retenta | ❌ | — | Idem CA2.5. |
| CA2.7 | Onboarding documentado | ❌ | — | Não testável em unidade. |

---

## Critérios de Aceite — Item 6 (Mascaramento)

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CA6.1 | Mascaramento em screenshot | ✅ | `redactPngBuffer covers configured bounds with opaque rectangle` (mobile-redaction-config.test.js:49) | Retângulo opaco (0,0,0,255) verificado |
| CA6.2 | Mascaramento em XML | ✅ | `redactText masks default categories in XML without breaking parseable structure` (mobile-redaction-config.test.js:31) | REDACTED no text, estrutura preservada |
| CA6.3 | Categorias padrão sempre ativas | ✅ | `redactText masks default categories` + `redactMobileLog removes credentials and default PII categories` (mobile-recording.test.js:56) | CPF, e-mail, telefone cobertos |
| CA6.4 | Desabilitar requer flag auditável | ✅ | `redactText blocks unsafe default category disable without audit flag` (mobile-redaction-config.test.js:42) | UNSAFE_REDACTION_DISABLE verificado |
| CA6.5 | Arquivo original não persiste | ❌ | — | Código redactPngBuffer retorna buffer novo (não apaga original). Mas não há teste que confirme ausência do original em disco. |
| CA6.6 | Log de mascaramento | ✅ | `redaction log stores counts without original values` (mobile-redaction-config.test.js:65) | Counts verificados, valores originais ausentes |
| CA6.7 | Falha de mascaramento aborta | ❌ | — | Sem teste para redactPngBuffer lançando exceção com bounds inválidos. |
| CA6.8 | Performance (≤500ms) | ✅ | `redaction performance stays under limits for typical PNG and XML` (mobile-redaction-config.test.js:80) | Medido: XML ≤100ms, PNG ≤500ms |

---

## Critérios Transversais (CAT)

| CA | Descrição | Status | Teste correspondente | Observação |
|---|---|---|---|---|
| CAT.1 | Sem regressão | ✅ | Suite completa: 39/39 passando | Nenhuma regressão detectada |
| CAT.2 | Documentação atualizada | — | — | Fora de escopo de teste unitário |
| CAT.3 | Sem credencial vazada | ✅ | `redactLog`, `redactMobileLog`, `captureAppiumLogs`, `captureLogcat`, `redact` — múltiplos testes | Cobertura redundante de segurança |

---

## Resumo

| Categoria | Total | ✅ Coberto | ⚠️ Parcial | ❌ Sem cobertura |
|---|---|---|---|---|
| Tarefa 4 (APK) | 13 | 7 | 4 | 2 |
| Tarefa 8 (Vídeo/Logs) | 12 | 4 | 1 | 7 |
| Item 1 (Relatório) | 5 | 0 | 0 | 5 |
| Item 2 (Contrato) | 7 | 0 | 1 | 6 |
| Item 6 (Mascaramento) | 8 | 6 | 0 | 2 |
| Transversais | 3 | 2 | 0 | 0 |
| **TOTAL** | **48** | **19** | **6** | **22** |

**Taxa de cobertura de CA: 39.6% (19/48) cobertos, 45.8% (22/48) sem cobertura.**
