# HANDOFF — BKPilot-Producao → Codex CLI (Ciclo 3 — Remediação T8)

**Data:** 2026-05-13
**Origem:** Claude (Mistral falhou em T8, Devstral não conseguiu remediar)
**Destino:** Codex CLI
**Fluxo MAIA:** `06-maia-implementacao` (remediação, plano já existe)
**Escopo:** corrigir T8 (vídeo + logs) deixada em estado inconsistente.

Ciclos anteriores arquivados:
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo1-tarefas-5-7-3.md`
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo2-tarefas-1-2-6.md`
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo3-t8-mistral-falhou.md`

---

## Contexto

- Mistral implementou T8 violando arquitetura (lógica no Producao em vez do Core).
- Mistral marcou "100% concluída" com pendências explícitas no próprio resumo.
- Mistral pulou validações obrigatórias (npm test, node --check, grep credencial).
- Devstral tentou remediar e não concluiu.
- Codex agora pega remediação completa.

---

## Estado atual

### Onde Mistral mexeu (precisa refatorar)
- `BKPilot-Producao/scripts/mobile-smoke.js` — contém funções `captureSauceVideo`, `captureLocalVideo`, `saveVideoBuffer`, `convertWebmToMp4`, `captureLogs`, `generateIndices`. Tudo no lugar errado.
- `BKPilot-Producao/scripts/gerar-relatorio-final-mobile.js` — integração com índices (verificar coerência após refatorar).
- `BKPilot-Producao/scripts/gerar-indices.js` — citado em resumo Mistral, validar se existe.

### Onde **deveria** estar (regra arquitetural)
- `BKPilot-Core/mobile-recording.js` — funções genéricas reutilizáveis.
- `BKPilot-Core/test/mobile-recording.test.js` — testes unit.

### O que Mistral deixou inconsistente no resumo
- `resumo-implementacao-tarefa-8-ciclo3.md` diz "100% concluída" mas lista pendências.
- RF8.11 (schema `videos_index.json`) marcado ✅ mas legenda diz "(pendente)".
- Sem evidência de `npm test`, `node --check`, grep credencial.

---

## Tarefas de remediação

### Etapa 1 — Auditoria
- [ ] Ler `BKPilot-Producao/scripts/mobile-smoke.js` e identificar funções relacionadas a vídeo/logs/índices.
- [ ] Listar funções a mover para Core.
- [ ] Verificar se `scripts/gerar-indices.js` existe e o que faz.
- [ ] Diff de `scripts/gerar-relatorio-final-mobile.js` antes/depois Mistral.

### Etapa 2 — Mover lógica para Core
- [ ] Criar `BKPilot-Core/mobile-recording.js` exportando:
  - `startRecording(client)` — wrapper `appium:startRecordingScreen`.
  - `stopRecording(client)` — wrapper `stopRecordingScreen`, retorna buffer.
  - `downloadSauceVideo({jobId, username, accessKey, outputPath, timeoutMs})` — REST API Sauce.
  - `convertWebmToMp4(inputPath, outputPath)` — ffmpeg via spawn; retorna `{converted: bool, reason?: string}`.
  - `captureAppiumLogs(appiumUrl, sessionId)` — fetch logs.
  - `captureLogcat(deviceId)` — `adb logcat -d`.
  - `redactLog(rawText)` — remove credenciais antes de salvar.
  - `buildVideosIndex(entries)` — gera schema RF8.11.
  - `buildLogsIndex(entries)` — equivalente para logs.
- [ ] Criar `BKPilot-Core/test/mobile-recording.test.js`:
  - Schema de `videos_index.json` conforme RF8.11 (`cenario`, `sessionId`, `path`, `durationMs`, `sizeBytes`, `provider`, `timestamp`).
  - `redactLog` testado com payload contendo `QA_PASSWORD`, `MOBILE_FARM_ACCESS_KEY`, `MOBILE_FARM_USERNAME` — assertion garante remoção.
  - `convertWebmToMp4` retorna `{converted: false, reason: "ffmpeg_not_found"}` quando ffmpeg ausente (mock spawn).
  - `buildVideosIndex` com 0, 1 e N entradas.

### Etapa 3 — Refatorar Producao
- [ ] `BKPilot-Producao/scripts/mobile-smoke.js`: remover funções movidas, importar do Core.
- [ ] `BKPilot-Producao/scripts/gerar-relatorio-final-mobile.js`: validar que lê `videos_index.json` e `logs_index.json`, cita paths existentes.
- [ ] Se `scripts/gerar-indices.js` existir e for redundante: remover.
- [ ] Manter flag `--video=on|off` (RF8.2) e leitura de `mobile.evidence.videoEnabled` (RF8.1).

### Etapa 4 — Bump e publicação Core
- [ ] `BKPilot-Core/package.json` → `"version": "0.2.3"`.
- [ ] Commit no Core: um por etapa lógica (não commit gigante).
- [ ] Tag `v0.2.3` + push.

### Etapa 5 — Atualizar dependentes
- [ ] `BKPilot-Producao/package.json`: `"@bugkillers/bkpilot-core": "github:JorgeBK923/BKPilot-Core#v0.2.3"`.
- [ ] `BKPilot-Comercial/package.json`: idem.
- [ ] `npm install` em ambos.

### Etapa 6 — Validação obrigatória (NÃO PULAR)
Executar e **incluir saídas no resumo**:
- [ ] `npm test` no Core — deve passar 100%.
- [ ] `node --check BKPilot-Producao/scripts/mobile-smoke.js`
- [ ] `node --check BKPilot-Producao/scripts/gerar-relatorio-final-mobile.js`
- [ ] `node -e "const c=require('@bugkillers/bkpilot-core'); console.log(typeof c.mobileRecording.startRecording)"` no Producao — deve imprimir `function`.
- [ ] `grep -ri "QA_PASSWORD\|MOBILE_FARM_ACCESS_KEY\|MOBILE_FARM_USERNAME" BKPilot-Producao/clients/*/resultado/*/mobile/logs/ 2>/dev/null` — deve retornar zero (ou diretório vazio).

### Etapa 7 — Sobrescrever resumo
- [ ] Reescrever `docs/maia/06-implementacao/resumo-implementacao-tarefa-8-ciclo3.md`:
  - Sem "Próximos Passos" se tarefa concluída.
  - Sem "Riscos Pendentes" marcados como abertos enquanto tarefa diz "100%".
  - Cada RF/RNF marcado ✅ tem citação de evidência (arquivo, função, teste).
  - Validação executada copiada literal (output dos comandos).
  - Hipóteses H8.1-H8.4 reconfirmadas com base na nova implementação.
- [ ] Atualizar `docs/maia/06-implementacao/progresso-ciclo3-t8.md`.

---

## Restrições (NUNCA violar)

- **NUNCA** colocar lógica reutilizável no Producao — vai no Core.
- **NUNCA** marcar concluído sem rodar validações da Etapa 6.
- **NUNCA** renomear funções existentes do Core (manter contrato `mobileAppium`, `mobileDeviceManager`, `mobileMcp`, `mobileRedaction`, `mobileConfig` existentes).
- **NUNCA** instalar ffmpeg automaticamente.
- **NUNCA** expor `QA_PASSWORD`, `MOBILE_FARM_USERNAME`, `MOBILE_FARM_ACCESS_KEY` em log/output/relatório.
- **NUNCA** commit gigante misturando etapas — um commit por etapa lógica.
- Não tocar T4, T9, T10 — fora de escopo.

---

## Especificação completa (referência)

- `docs/maia/02-especificacao/tarefa-8-video-logs.md` — 18 RFs + 5 RNFs + 7 RNs + 12 CAs.

Critérios de aceite Given/When/Then dos itens CA8.1 a CA8.12 ainda valem. Cada um deve ser revalidado após refatoração.

---

## Saída esperada

```
BKPilot-Core/
  mobile-recording.js               ← novo
  test/mobile-recording.test.js     ← novo
  package.json                      ← bump v0.2.3
  (tag v0.2.3 publicada)

BKPilot-Producao/
  package.json                      ← dep v0.2.3
  scripts/mobile-smoke.js           ← refatorado (importa Core)
  scripts/gerar-relatorio-final-mobile.js  ← validar consistência
  scripts/gerar-indices.js          ← remover se redundante

BKPilot-Comercial/
  package.json                      ← dep v0.2.3

docs/maia/06-implementacao/
  resumo-implementacao-tarefa-8-ciclo3.md  ← reescrito
  progresso-ciclo3-t8.md                   ← atualizado
```

---

## Comando de chamada (cole no Codex)

```text
Tarefa: remediar T8 conforme HANDOFF.md.

Estado: Mistral implementou no lugar errado (Producao em vez de Core) e marcou concluído sem validar. Devstral tentou e não conseguiu.

Passos: seguir as 7 Etapas do HANDOFF.md em ordem. Não pular Etapa 6 (validação). Sobrescrever resumo Mistral na Etapa 7.

Restrições críticas:
- Lógica genérica obrigatoriamente em BKPilot-Core/mobile-recording.js.
- Manter contrato dos exports existentes do Core.
- Um commit por etapa.
- npm test e grep credencial no resumo final com saída real.

Referência completa: docs/maia/02-especificacao/tarefa-8-video-logs.md (18 RFs + 12 CAs).
```

---

## Pendências fora deste handoff

- T4 — APK + estratégia farm.
- T9 — E2E completo Sauce (depende T4 + T8 remediada).
- T10 — Adaptador farm interna (descoberta via MCP quando farm subir).
- R3 — destravar smoke USB (manual).
