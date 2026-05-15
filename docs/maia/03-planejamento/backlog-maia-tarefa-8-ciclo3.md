# Backlog MAIA — Tarefa 8 (vídeo + logs)

**Data:** 2026-05-13
**Skill:** MAIA Planejamento
**Escopo:** Captura, armazenamento e referência de vídeo + logs de sessões mobile.

---

## Tarefas

### **RF8.1/8.2: Lógica de `videoEnabled` (CLI override)**
- **Descrição:** Implementar leitura de `mobile.evidence.videoEnabled` em `config.json` e override via CLI (`--video=on|off`).
- **Arquivos:** `scripts/mobile-smoke.js`, `scripts/gerar-relatorio-final-mobile.js`.
- **Validação:** CLI `--video=on` força gravação mesmo com `videoEnabled: false`.

### **RF8.3/8.4: Conversão `.webm` → `.mp4` (ffmpeg)**
- **Descrição:** Criar script para conversão de vídeo com fallback para `.webm` se ffmpeg ausente.
- **Arquivos:** `scripts/converter-video.js`.
- **Validação:** Arquivo final em `.mp4` ou `.webm` com flag `pending_conversion: true`.

### **RF8.5: Salvar vídeo em `mobile/videos/`**
- **Descrição:** Salvar vídeo em `clients/<id>/resultado/<ts>/mobile/videos/` com naming `<cenario>_<sessionId>_<timestamp>.mp4`.
- **Arquivos:** `scripts/mobile-smoke.js`.
- **Validação:** Arquivo existe em disco com nome correto.

### **RF8.6: Salvar logs em `mobile/logs/`**
- **Descrição:** Capturar `appium.log`, `logcat` e stdout, salvar em `mobile/logs/` com naming `<tipo>_<sessionId>_<timestamp>.log`.
- **Arquivos:** `scripts/mobile-smoke.js`.
- **Validação:** Logs salvos sem credenciais (`QA_PASSWORD`, `MOBILE_FARM_ACCESS_KEY`).

### **RF8.7/8.8: Indexar vídeos e logs**
- **Descrição:** Gerar `videos_index.json` e `logs_index.json` com metadados (`cenario`, `sessionId`, `path`, `durationMs`, `sizeBytes`, `provider`).
- **Arquivos:** `scripts/gerar-indices.js`.
- **Validação:** Índices JSON gerados e referenciados no relatório.

### **RF8.9: Integração com relatório final**
- **Descrição:** Atualizar `/gerar-relatorio-final-mobile` para ler `videos_index.json` e citar paths de vídeos no PDF.
- **Arquivos:** `scripts/gerar-relatorio-final-mobile.js`.
- **Validação:** PDF cita paths existentes em disco.

### **RF8.10: Validação de hipóteses (H8.1-H8.4)**
- **Descrição:** Testar e registrar resultado das hipóteses (Sauce API, formato MP4, `startRecordingScreen`, farm interna).
- **Arquivos:** `resumo-implementacao-tarefa-8-ciclo3.md`.
- **Validação:** Hipóteses registradas com resultado (aceita/rejeitada).

---

## Riscos
| ID  | Descrição | Mitigação
|-----|-----------|-----------
| H8.1 | Sauce REST API não permite download de vídeo | Testar endpoint antes de implementar.
| H8.2 | Sauce não gera MP4 nativamente | Validar formato retornado.
| H8.3 | `startRecordingScreen` não retorna base64 | Testar em dispositivo Android real.
| H8.4 | Farm interna não suporta nesta fase | Pular com aviso explícito.

---

## Dependências
- **T6 (mascaramento):** Concluída no Ciclo 2.
- **T2 (contrato cliente):** `mobile.evidence.videoEnabled` já existe.
- **T1 (relatório):** Precisa ler `videos_index.json`/`logs_index.json`.

---

## Próximos Passos
1. Implementar lógica de captura (Sauce + Appium).
2. Integrar conversão de vídeo (ffmpeg).
3. Capturar logs e indexar.
4. Validar hipóteses e ajustar relatório final.