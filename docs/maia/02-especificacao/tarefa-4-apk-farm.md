# MAIA Especificação 02 — Tarefa 4 (APK local + estratégia farm)

**Data:** 2026-05-14
**Skill:** MAIA Especificação
**Escopo:** suporte a teste de app nativo Android (.apk), local e em farm cloud.
**Destino:** Codex CLI (Ciclo 4).

---

## Visão de produto

### Objetivo
Habilitar pipeline mobile a executar testes em apps nativos Android (.apk), tanto em device local (USB/emulador) quanto em farm cloud (Sauce Labs), com governança de segurança (whitelist de pacotes).

### Usuários
- **QA operacional:** roda smoke/cenários em app nativo do cliente.
- **Cliente final:** entrega seu APK ou referência para teste.
- **Engenheiro de plataforma:** mantém integração APK no Core.

### Fora de escopo
- iOS / IPA (fase futura).
- Distribuição de APK pra usuários finais.
- Build/compilação de APK (cliente entrega já compilado).
- App híbrido React Native/Flutter — deve funcionar genericamente; tratamentos específicos ficam fora.
- Farm interna BugKillers (T10 separada).
- Múltiplas versões de APK em paralelo (V1+).

### Hipóteses (validar)
- **H4.1:** Sauce REST API aceita upload via `POST /v1/storage/upload` com basic auth (`username:accessKey`).
- **H4.2:** Pipeline usará upload automático por padrão (autonomia); pré-enviado fica como opção via flag.
- **H4.3:** `appium:noReset: true` é seguro entre cenários (mantém estado de login do app).
- **H4.4:** APK típico < 100MB (limite storage Sauce confortável).
- **H4.5:** Cliente entrega APK em path local; URL HTTPS opcional.

---

## Requisitos

### Funcionais

| ID | Requisito |
|---|---|
| RF4.1 | Suportar `mobile.target: "apk"` no `clients/<id>/config.json`. |
| RF4.2 | Capabilities obrigatórias para APK: `appium:app`, `appium:appPackage`, `appium:appActivity`. |
| RF4.3 | `appium:app` aceita 3 formatos: caminho local absoluto, URL HTTPS, ou `storage:filename=<nome>` (referência Sauce). |
| RF4.4 | Provider local: instalar APK via Appium (ou `adb install -r` se device USB). |
| RF4.5 | Provider Sauce com upload automático: `POST /v1/storage/upload` antes de criar sessão. |
| RF4.6 | Provider Sauce com APK pré-enviado: pular upload, usar `storage:filename`. |
| RF4.7 | Whitelist `mobile.allowedAppPackages` no `config.json` — pipeline aborta se `appPackage` não estiver na lista. |
| RF4.8 | `mobile:doctor` valida: APK existe (local), URL responde HEAD 200 (URL), ou storage referenciado existe via API Sauce (cloud). |
| RF4.9 | Smoke APK local: instala, abre, captura screenshot da tela inicial, fecha, gera relatório `status: passed`. |
| RF4.10 | Smoke APK Sauce: upload (se aplicável), instala, abre, screenshot, fecha, gera relatório. |
| RF4.11 | `mobile_smoke_report.json` deve conter `apk: {source, appPackage, appActivity, sizeBytes, uploadedAt?, storageFilename?}`. |
| RF4.12 | Cliente template novo: `clients/local-apk-smoke/` (USB local) e `clients/sauce-apk-smoke/` (cloud). |
| RF4.13 | `novo-cliente.sh` aceita flag `--target apk` para gerar template APK direto. |
| RF4.14 | Política de reset entre cenários respeitando `mobile.apk.noReset` no config (default `true`). |
| RF4.15 | Upload Sauce deve respeitar `mobile.timeouts.uploadApk` (default 5min). |
| RF4.16 | Falha de upload deve abortar sessão com erro `APK_UPLOAD_FAILED` — não cair em fallback silencioso. |
| RF4.17 | `redactLog()` (T6) deve cobrir credenciais Sauce também no caminho de upload. |
| RF4.18 | `videos_index.json` (T8) referencia APK quando aplicável (`provider`, `target: "apk"`, `appPackage`). |

### Não-funcionais

| ID | Requisito |
|---|---|
| RNF4.1 | Upload de APK ≤ 100MB deve completar em ≤ 5min em rede 50Mbps. |
| RNF4.2 | Falha de validação `allowedAppPackages` deve ocorrer **antes** de qualquer upload (poupa banda + storage). |
| RNF4.3 | Credenciais Sauce (`username`, `accessKey`) nunca podem aparecer em log, output ou relatório. |
| RNF4.4 | APK referenciado por URL HTTPS deve ser baixado uma vez e cachado por execução (não baixar 50× para 50 cenários). |
| RNF4.5 | Naming do APK no Sauce: `<cliente>_<versao>_<timestamp>.apk` para evitar colisão entre clientes. |

---

## Regras de negócio

### RN4.1 — Whitelist obrigatória
- Cliente real exige `mobile.allowedAppPackages` não-vazio.
- Smoke client (`local-apk-smoke`, `sauce-apk-smoke`) pode omitir, mas log explícito de "WHITELIST_BYPASS_SMOKE".
- Tentar instalar pacote fora da whitelist gera erro `APP_PACKAGE_NOT_ALLOWED` antes de qualquer ação.

### RN4.2 — Estratégia de upload
- Default: **upload automático** (autonomia + repetibilidade).
- Pré-enviado: ativado via `mobile.apk.uploadStrategy: "preuploaded"` no config.
- Em modo pré-enviado, `mobile.apk.storageFilename` é obrigatório.

### RN4.3 — Versionamento de APK
- Cada upload Sauce inclui timestamp no filename — sem sobrescrita silenciosa de versão anterior.
- Limpeza de APKs antigos no Sauce: manual nesta fase (V1+ pode automatizar).

### RN4.4 — Reset entre cenários
- Default: `noReset: true` (mantém estado de login).
- Cenários que precisam app limpo: setar `fullReset: true` no cenário específico.
- Mudança de reset não persiste entre execuções — sempre lida do config.

### RN4.5 — Falha de instalação
- APK corrompido / incompatível com device: erro `APK_INSTALL_FAILED` com motivo do Appium.
- Pipeline não tenta retry em falha de instalação (erro determinístico).
- Falha de download de URL: retry transiente (RN5 do T2 vale).

### RN4.6 — Cliente real vs smoke
- Cliente real: whitelist obrigatória, upload sempre, evidência sempre com mascaramento T6.
- Smoke: pode usar APK público de teste (ex: ApiDemos.apk) sem whitelist; log explícito.

### RN4.7 — Tamanho APK
- > 100MB: alerta no `mobile:doctor` (não bloqueia).
- > 500MB: aborta com erro `APK_TOO_LARGE` — fora de envelope realista.

---

## Critérios de aceite

### CA4.1 — Capabilities APK montadas
- **Given** `config.json` com `target: "apk"`, `mobile.apk.appPackage`, `appActivity`, `app` (path local)
- **When** `buildApkCapabilities()` roda
- **Then** retorna objeto Appium com `appium:app`, `appium:appPackage`, `appium:appActivity`, `appium:platformName: "Android"`

### CA4.2 — Whitelist bloqueia pacote não-listado
- **Given** `allowedAppPackages: ["com.cliente.app"]`
- **When** config tenta instalar `com.malicioso.app`
- **Then** skill aborta com `APP_PACKAGE_NOT_ALLOWED`, exit ≠ 0
- **And** zero rede consumida (validação antes de upload)

### CA4.3 — Upload Sauce automático
- **Given** `provider: "cloud"`, `uploadStrategy: "auto"`, APK local 50MB
- **When** smoke executa
- **Then** APK enviado via `POST /v1/storage/upload`
- **And** `storage:filename` resolvido e usado nas capabilities
- **And** `mobile_smoke_report.json` registra `uploadedAt`, `storageFilename`, `sizeBytes`

### CA4.4 — Upload Sauce pré-enviado
- **Given** `uploadStrategy: "preuploaded"`, `storageFilename: "cliente_v1.apk"`
- **When** smoke executa
- **Then** **não** há request a `/v1/storage/upload`
- **And** capabilities usam `storage:filename=cliente_v1.apk`

### CA4.5 — Smoke APK local USB
- **Given** device USB autorizado, `provider: "local"`, APK existe em path
- **When** smoke executa
- **Then** APK instalado via Appium, app aberto na `appActivity`, screenshot capturado, app fechado
- **And** `status: passed` no relatório

### CA4.6 — `mobile:doctor` valida APK
- **Given** config com `app: "/path/inexistente.apk"`
- **When** rodo `mobile:doctor`
- **Then** erro cita `mobile.apk.app: arquivo não encontrado`
- **And** exit ≠ 0

### CA4.7 — Credenciais não vazam em upload
- **Given** upload Sauce em andamento
- **When** examino logs do upload
- **Then** zero ocorrências de `MOBILE_FARM_USERNAME` ou `MOBILE_FARM_ACCESS_KEY`

### CA4.8 — Falha de upload aborta
- **Given** Sauce retorna 500 no upload
- **When** skill processa
- **Then** erro `APK_UPLOAD_FAILED` registrado
- **And** sessão Appium **não** é criada
- **And** exit ≠ 0

### CA4.9 — APK URL cachado
- **Given** `app: "https://example.com/app.apk"`, execução com 10 cenários
- **When** skill processa
- **Then** download ocorre 1× (não 10×)
- **And** path local do cache reutilizado

### CA4.10 — Reset entre cenários
- **Given** `noReset: true`, cenário 1 faz login
- **When** cenário 2 executa
- **Then** estado de login preservado (sem reinstalar)

### CA4.11 — APK > 500MB aborta
- **Given** APK de 600MB
- **When** `mobile:doctor` valida
- **Then** erro `APK_TOO_LARGE`, exit ≠ 0

### CA4.12 — Smoke Sauce APK gera vídeo (integração T8)
- **Given** `provider: "cloud"`, `target: "apk"`, `videoEnabled: true`
- **When** smoke termina
- **Then** vídeo MP4 baixado de Sauce e referenciado em `videos_index.json` com `target: "apk"`

### CA4.13 — Smoke local APK respeita mascaramento (integração T6)
- **Given** screenshot APK contém CPF visível
- **When** smoke captura
- **Then** screenshot final em disco tem CPF mascarado

---

## Dependências

- ✅ Core `v0.2.3` (Ciclo 3 entregue)
- ✅ T6 mascaramento — integração obrigatória em screenshots APK
- ✅ T2 contrato config — campo `mobile.apk.*` adicionado ao schema
- ✅ T8 vídeo/logs — funciona em APK sem ajuste novo

T4 **não bloqueia** outras tarefas em paralelo. **Bloqueia T9** (E2E em cliente com app nativo).

---

## Arquivos relevantes

| Arquivo | Propósito |
|---|---|
| `BKPilot-Core/mobile-apk.js` | Novo — lógica APK (resolveApkSource, uploadApkToSauce, buildApkCapabilities, validateAllowedAppPackage) |
| `BKPilot-Core/test/mobile-apk.test.js` | Novo — testes unit |
| `BKPilot-Producao/scripts/mobile-smoke.js` | Integrar branch `target: apk` |
| `BKPilot-Producao/scripts/mobile-doctor.js` | Adicionar validações APK |
| `BKPilot-Producao/novo-cliente.sh` | Suporte a `--target apk` |
| `BKPilot-Producao/clients/local-apk-smoke/` | Novo cliente teste local |
| `BKPilot-Producao/clients/sauce-apk-smoke/` | Novo cliente teste cloud |
| `BKPilot-Producao/docs/onboarding-mobile.md` | Seção APK |

---

## Bump esperado

- `BKPilot-Core` → `v0.2.4`
- `BKPilot-Producao` + `BKPilot-Comercial` → dep atualizada
