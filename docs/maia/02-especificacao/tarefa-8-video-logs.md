# MAIA Especificação 02 — Tarefa 8 (vídeo + logs)

**Data:** 2026-05-13
**Skill:** MAIA Especificação
**Escopo:** captura, armazenamento e referência de vídeo + logs de cada sessão mobile.
**Destino:** Mistral CLI (Ciclo 3).

---

## Visão de produto

### Objetivo
Capturar vídeo e logs de cada execução mobile para diagnóstico de bugs intermitentes e entrega premium ao cliente.

### Usuários
- **QA operacional:** diagnostica bug com vídeo + logs.
- **Cliente final:** consome vídeo no relatório PDF (link/anexo).
- **Engenheiro de plataforma:** mantém integração provider.

### Fora de escopo
- Edição/corte de vídeo.
- Streaming ao vivo.
- Análise automática de vídeo (visão computacional).
- Captura de áudio.
- Vídeo de cliente real sem opt-in explícito em `config.json`.

### Hipóteses (validar)
- **H8.1:** Sauce REST API permite download de vídeo via `/rest/v1/<user>/jobs/<jobId>/assets/video.mp4`.
- **H8.2:** Sauce gera MP4 nativamente; conversão webm→mp4 só necessária se gravação local.
- **H8.3:** `appium:startRecordingScreen` retorna base64 do vídeo no `stopRecordingScreen` (Android UiAutomator2).
- **H8.4:** Farm interna (futura) terá endpoint próprio — não impacta T8 nesta fase.

---

## Requisitos

### Funcionais

| ID | Requisito |
|---|---|
| RF8.1 | Captura de vídeo deve respeitar `mobile.evidence.videoEnabled` do `config.json` (default `true`). |
| RF8.2 | CLI deve aceitar override por execução: `--video=on|off` sobrescreve config. |
| RF8.3 | Vídeo final em disco deve estar em formato **MP4** (H.264). |
| RF8.4 | Se provider entregar `.webm`, converter para `.mp4` via ffmpeg (regra BLOCK-A do `CLAUDE.md`). |
| RF8.5 | Se ffmpeg ausente: manter `.webm` original + registrar pendência no relatório (não silenciar). |
| RF8.6 | Vídeo deve ser salvo em `clients/<id>/resultado/<ts>/mobile/videos/`. |
| RF8.7 | Naming: `<cenario>_<sessionId>_<timestamp>.mp4`. |
| RF8.8 | Captura de logs deve incluir: `appium.log`, `logcat` (Android), stdout do runner. |
| RF8.9 | Logs salvos em `clients/<id>/resultado/<ts>/mobile/logs/`. |
| RF8.10 | Naming logs: `<tipo>_<sessionId>_<timestamp>.log`. |
| RF8.11 | Index JSON `clients/<id>/resultado/<ts>/mobile/videos_index.json` lista todos os vídeos com `cenario`, `sessionId`, `path`, `durationMs`, `sizeBytes`, `provider`. |
| RF8.12 | Index JSON `mobile/logs_index.json` equivalente para logs. |
| RF8.13 | Provider local (Appium USB/emulador): usar `appium:startRecordingScreen` + `stopRecordingScreen`. |
| RF8.14 | Provider cloud Sauce: baixar via REST após sessão terminar. |
| RF8.15 | Provider farm interna: marcar como **não suportado nesta fase**; manter `.webm`/fallback se houver. |
| RF8.16 | Falha de captura de vídeo não aborta cenário — registra pendência no relatório, mantém screenshots. |
| RF8.17 | Falha de download de log não aborta — registra pendência. |
| RF8.18 | Skill `/gerar-relatorio-final-mobile` (T1) deve referenciar vídeos do `videos_index.json`. |

### Não-funcionais

| ID | Requisito |
|---|---|
| RNF8.1 | Conversão webm→mp4 deve completar em ≤ 2x duração do vídeo original. |
| RNF8.2 | Download de vídeo Sauce deve respeitar timeout `mobile.timeouts.downloadArtifact` (default 60s). |
| RNF8.3 | Logs nunca podem conter credenciais (`QA_PASSWORD`, `MOBILE_FARM_ACCESS_KEY`, `MOBILE_FARM_USERNAME`). |
| RNF8.4 | Vídeo deve passar por mascaramento T6 **se** contiver tela com dados sensíveis (decisão técnica: mascarar quadros não está em escopo T8 — só metadado). |
| RNF8.5 | Tamanho médio vídeo cenário < 30MB (alerta se exceder). |

---

## Regras de negócio

### RN8.1 — Default e override
- Default global: `videoEnabled: true` em template `novo-cliente.sh`.
- Cliente pode desabilitar no `config.json`.
- CLI `--video=off` força desligar mesmo se config diz `true`.
- CLI `--video=on` força ligar mesmo se config diz `false`.

### RN8.2 — Formato
- MP4 é único formato aceito no entregável final.
- Webm intermediário pode existir durante processamento, mas não persiste após conversão bem-sucedida.
- Se conversão falhar, `.webm` mantém com flag `pending_conversion: true` no index.

### RN8.3 — Fallback ffmpeg
- Skill **não** instala ffmpeg automaticamente.
- Mensagem ao usuário cita comando de instalação por OS (BLOCK-A já cobre).
- Pipeline continua sem ffmpeg — não bloqueia execução.

### RN8.4 — Provider farm interna (futuro)
- Esta tarefa não implementa captura em farm interna.
- Adaptador específico fica para T10 (descoberta via MCP quando farm estiver no ar).
- Skill deve detectar provider farm interna e pular gravação com aviso explícito.

### RN8.5 — Vídeo em cliente real
- Em cliente de produção, vídeo só pode ser ativado se `config.json` tiver `videoEnabled: true` **e** flag de consentimento `videoConsentDocumented: true`.
- Sem consentimento documentado, sistema desabilita vídeo automaticamente mesmo com `videoEnabled: true` e registra alerta.

### RN8.6 — Retenção
- Vídeo segue `mobile.evidence.retentionDays` (já no contrato T2, default 90 dias).
- Limpeza manual nesta fase.

### RN8.7 — Tamanho e alerta
- Se vídeo > 100MB, gerar alerta no relatório.
- Não bloqueia — só sinaliza.

---

## Critérios de aceite

### CA8.1 — Vídeo Sauce baixado
- **Given** execução em Sauce Labs concluída com `videoEnabled: true`
- **When** skill termina
- **Then** vídeo `.mp4` existe em `mobile/videos/`
- **And** `videos_index.json` lista o vídeo com `provider: "sauce"`, `path`, `durationMs`, `sizeBytes`

### CA8.2 — Vídeo local Appium
- **Given** execução USB local com Appium em `localhost:4723` e device Android
- **When** cenário executa
- **Then** `startRecordingScreen` é chamado no início
- **And** `stopRecordingScreen` no fim retorna base64
- **And** base64 é decodificado e salvo como `.mp4`

### CA8.3 — Webm convertido pra MP4
- **Given** provider retorna `.webm`
- **When** ffmpeg está disponível
- **Then** arquivo final em disco é `.mp4`
- **And** `.webm` original é removido após conversão bem-sucedida

### CA8.4 — Ffmpeg ausente
- **Given** ffmpeg não está no PATH
- **And** provider retornou `.webm`
- **When** skill termina
- **Then** `.webm` permanece em disco
- **And** `videos_index.json` marca entrada com `pending_conversion: true`
- **And** relatório final cita pendência com mensagem de instalação de ffmpeg

### CA8.5 — Override CLI
- **Given** `config.json` tem `videoEnabled: false`
- **When** executo `npm run mobile:smoke -- --cliente <id> --video=on`
- **Then** vídeo é gravado mesmo com config off

### CA8.6 — Logs sem credencial
- **Given** sessão com `QA_PASSWORD` definido em env
- **When** log é capturado
- **Then** grep por `QA_PASSWORD`, `MOBILE_FARM_ACCESS_KEY`, `MOBILE_FARM_USERNAME` em qualquer arquivo `mobile/logs/*` retorna zero matches

### CA8.7 — Index JSON correto
- **Given** execução com 3 cenários e `videoEnabled: true`
- **When** termina
- **Then** `videos_index.json` tem array com 3 entradas
- **And** cada entrada tem: `cenario`, `sessionId`, `path`, `durationMs`, `sizeBytes`, `provider`, `timestamp`

### CA8.8 — Falha de download não aborta
- **Given** Sauce retorna 500 ao baixar vídeo
- **When** skill processa fim de sessão
- **Then** cenário não é marcado como `failed` por causa do vídeo
- **And** `videos_index.json` registra entrada com `status: "download_failed"`, `error: "<msg>"`
- **And** relatório final cita pendência

### CA8.9 — Farm interna pula com aviso
- **Given** `config.json` tem `provider: "cloud"` apontando para farm interna BugKillers
- **When** skill executa
- **Then** vídeo **não** é gravado nem baixado
- **And** log informativo: "Provider farm interna não suporta captura de vídeo nesta fase — pular"

### CA8.10 — Relatório referencia vídeo
- **Given** execução com vídeo bem-sucedido
- **When** `/gerar-relatorio-final-mobile` roda
- **Then** PDF cita path do vídeo em "Evidências"
- **And** path no PDF aponta para arquivo existente em disco

### CA8.11 — Consentimento cliente real
- **Given** cliente produção com `videoEnabled: true` mas sem `videoConsentDocumented: true`
- **When** skill executa
- **Then** vídeo é automaticamente desabilitado
- **And** alerta registrado em log: "VIDEO_DISABLED_NO_CONSENT"

### CA8.12 — Performance conversão
- **Given** vídeo `.webm` de 60s
- **When** ffmpeg converte
- **Then** conclusão em ≤ 120s (2x duração)

---

## Dependências

- Tarefa T6 (mascaramento) — concluída no Ciclo 2.
- Tarefa T2 (contrato cliente) — concluída; `mobile.evidence.videoEnabled` já existe.
- Tarefa T1 (skill relatório) — concluída; precisa adicionar leitura de `videos_index.json`/`logs_index.json`.

---

## Arquivos relevantes

| Arquivo | Propósito |
|---|---|
| `BKPilot-Core/mobile-appium-client.js` | Onde adicionar `startRecordingScreen`/`stopRecordingScreen` |
| `BKPilot-Producao/scripts/mobile-smoke.js` | Onde integrar captura no runner |
| `BKPilot-Producao/scripts/gerar-relatorio-final-mobile.js` | Onde ler `videos_index.json` |
| `clients/<id>/config.json` | Onde `mobile.evidence.videoEnabled` é lido |
| `novo-cliente.sh` | Onde garantir `videoEnabled: true` default |
| `CLAUDE.md` §7 (BLOCK-A) | Regra ffmpeg cross-platform já documentada |
