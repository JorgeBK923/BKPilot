# Plano de Execução — Tarefa 8 (vídeo + logs)

**Data:** 2026-05-13
**Skill:** MAIA Planejamento
**Escopo:** Captura, armazenamento e referência de vídeo + logs de sessões mobile.

---

## Visão Geral
Capturar vídeo e logs de cada execução mobile para diagnóstico de bugs intermitentes e entrega premium ao cliente.

### Usuários
- QA operacional: diagnóstico de bugs.
- Cliente final: consumo de vídeo no relatório PDF.
- Engenheiro de plataforma: manutenção da integração.

---

## Fases

### **Fase 1: Integração com Sauce Labs**
- **Objetivo:** Baixar vídeo via REST API (`/rest/v1/<user>/jobs/<jobId>/assets/video.mp4`).
- **Arquivos:** `scripts/mobile-smoke.js` (integração Sauce).
- **Validação:** Vídeo salvo em `mobile/videos/` com `provider: "sauce"`.

### **Fase 2: Integração com Appium Local**
- **Objetivo:** Usar `appium:startRecordingScreen`/`stopRecordingScreen` para gravação local.
- **Arquivos:** `BKPilot-Core/mobile-appium-client.js`.
- **Validação:** Base64 decodificado e salvo como `.mp4`.

### **Fase 3: Conversão de Vídeo**
- **Objetivo:** Converter `.webm` → `.mp4` via ffmpeg (regra BLOCK-A).
- **Fallback:** Se ffmpeg ausente, manter `.webm` com flag `pending_conversion: true`.
- **Arquivos:** `scripts/converter-video.js`.
- **Validação:** Arquivo final em `.mp4` ou `.webm` com flag pendente.

### **Fase 4: Captura de Logs**
- **Objetivo:** Capturar `appium.log`, `logcat` (Android) e stdout do runner.
- **Arquivos:** `scripts/mobile-smoke.js` (integração logs).
- **Validação:** Logs salvos em `mobile/logs/` sem credenciais.

### **Fase 5: Indexação**
- **Objetivo:** Gerar `videos_index.json` e `logs_index.json`.
- **Estrutura:** Lista de vídeos/logs com `cenario`, `sessionId`, `path`, `durationMs`, `sizeBytes`, `provider`.
- **Arquivos:** `scripts/gerar-indices.js`.
- **Validação:** Índices JSON gerados e referenciados no relatório.

### **Fase 6: Integração com Relatório Final**
- **Objetivo:** Atualizar `/gerar-relatorio-final-mobile` para ler `videos_index.json`.
- **Arquivos:** `scripts/gerar-relatorio-final-mobile.js`.
- **Validação:** PDF cita paths de vídeos existentes.

### **Fase 7: Validação de Hipóteses**
- **Objetivo:** Validar H8.1-H8.4 (Sauce API, formato MP4, `startRecordingScreen`, farm interna).
- **Arquivos:** `resumo-implementacao-tarefa-8-ciclo3.md`.
- **Validação:** Hipóteses registradas com resultado (aceita/rejeitada).

---

## Dependências
- **T6 (mascaramento):** Concluída no Ciclo 2.
- **T2 (contrato cliente):** `mobile.evidence.videoEnabled` já existe.
- **T1 (relatório):** Precisa ler `videos_index.json`/`logs_index.json`.

---

## Riscos
| ID  | Descrição | Mitigação
|-----|-----------|-----------
| H8.1 | Sauce REST API não permite download de vídeo | Testar endpoint antes de implementar.
| H8.2 | Sauce não gera MP4 nativamente | Validar formato retornado.
| H8.3 | `startRecordingScreen` não retorna base64 | Testar em dispositivo Android real.
| H8.4 | Farm interna não suporta nesta fase | Pular com aviso explícito.

---

## Ordem Recomendada
1. **Fase 1** (Sauce Labs) → 2. **Fase 2** (Appium Local) → 3. **Fase 3** (Conversão) → 4. **Fase 4** (Logs) → 5. **Fase 5** (Indexação) → 6. **Fase 6** (Relatório) → 7. **Fase 7** (Hipóteses).