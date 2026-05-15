# Checklist de Etapas — Tarefa 8 (vídeo + logs)

**Data:** 2026-05-13
**Skill:** MAIA Planejamento
**Escopo:** Captura, armazenamento e referência de vídeo + logs de sessões mobile.

---

## Validação por Etapa

| Etapa | Critério de Aceite | Arquivo de Evidência | Status | Responsável
|-------|---------------------|----------------------|--------|-------------
| **Fase 1** | Vídeo Sauce baixado via REST | `videos_index.json` (provider: "sauce") | ❌ | Implementação
| **Fase 2** | `startRecordingScreen`/`stopRecordingScreen` funcionam | Logs de execução Appium | ❌ | Implementação
| **Fase 3** | Conversão `.webm` → `.mp4` (ffmpeg) | Arquivo `.mp4` em disco | ❌ | Implementação
| **Fase 4** | Logs capturados sem credenciais | `logs_index.json` (sem `QA_PASSWORD`) | ❌ | Implementação
| **Fase 5** | Índices JSON gerados | `videos_index.json`/`logs_index.json` | ❌ | Implementação
| **Fase 6** | Relatório final referencia vídeo | PDF gerado por `/gerar-relatorio-final-mobile` | ❌ | Implementação
| **Fase 7** | Hipóteses H8.1-H8.4 validadas | Anotações em `resumo-implementacao-tarefa-8-ciclo3.md` | ❌ | Validação

---

## Detalhes por Etapa

### **Fase 1: Integração com Sauce Labs**
- **Critério:** Vídeo baixado via REST API (`/rest/v1/<user>/jobs/<jobId>/assets/video.mp4`).
- **Evidência:** Entrada em `videos_index.json` com `provider: "sauce"`.
- **Risco:** H8.1 (Sauce não permite download).

### **Fase 2: Integração com Appium Local**
- **Critério:** `startRecordingScreen`/`stopRecordingScreen` chamados e base64 decodificado.
- **Evidência:** Logs de execução Appium mostrando chamadas e arquivo `.mp4` em disco.
- **Risco:** H8.3 (`startRecordingScreen` não retorna base64).

### **Fase 3: Conversão de Vídeo**
- **Critério:** `.webm` convertido para `.mp4` via ffmpeg.
- **Evidência:** Arquivo `.mp4` em disco ou `.webm` com flag `pending_conversion: true`.
- **Risco:** Ffmpeg ausente (fallback para `.webm`).

### **Fase 4: Captura de Logs**
- **Critério:** Logs (`appium.log`, `logcat`, stdout) salvos sem credenciais.
- **Evidência:** `logs_index.json` e arquivos em `mobile/logs/`.
- **Risco:** Credenciais expostas em logs.

### **Fase 5: Indexação**
- **Critério:** `videos_index.json` e `logs_index.json` gerados com metadados.
- **Evidência:** Arquivos JSON em `mobile/`.
- **Risco:** Índices incompletos ou incorretos.

### **Fase 6: Integração com Relatório Final**
- **Critério:** PDF cita paths de vídeos existentes.
- **Evidência:** Seção "Evidências" no PDF gerado.
- **Risco:** Paths incorretos ou ausentes.

### **Fase 7: Validação de Hipóteses**
- **Critério:** Hipóteses H8.1-H8.4 validadas e registradas.
- **Evidência:** Anotações em `resumo-implementacao-tarefa-8-ciclo3.md`.
- **Risco:** Hipóteses não testadas ou mal registradas.

---

## Próximos Passos
1. **Implementar Fase 1 e 2** (Sauce + Appium).
2. **Testar conversão de vídeo** (Fase 3).
3. **Capturar logs e indexar** (Fase 4 e 5).
4. **Atualizar relatório final** (Fase 6).
5. **Validar hipóteses** (Fase 7).