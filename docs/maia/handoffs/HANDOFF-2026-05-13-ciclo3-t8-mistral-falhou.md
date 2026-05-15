# HANDOFF — BKPilot-Producao → Mistral CLI (Ciclo 3 — Tarefa 8)

**Data:** 2026-05-13
**Origem:** Claude (MAIA Especificação 02 concluída para T8)
**Destino:** Mistral CLI
**Fluxo MAIA:** `03-maia-planejamento` → `06-maia-implementacao`
**Escopo deste ciclo:** **somente Tarefa 8** (vídeo + logs).

Ciclos anteriores arquivados:
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo1-tarefas-5-7-3.md`
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo2-tarefas-1-2-6.md`

---

## Resumo de contexto (não precisa ler doc original)

- Monorepo lógico: `BKPilot-Core` (v0.2.2, runtime mobile), `BKPilot-Skills`, `BKPilot-Producao` (este repo), `BKPilot-Comercial`.
- Mobile mascaramento (T6), contrato config (T2) e skill relatório (T1) **já entregues** no Ciclo 2.
- Smoke Sauce Labs já aprovado.
- Smoke USB local segue bloqueado por ambiente (ADB ausente) — **não bloqueia T8**.

---

## Tarefa 8 — Vídeo + logs

### Objetivo
Capturar vídeo e logs de cada execução mobile, salvar localmente em formato padronizado, referenciar no relatório final.

### Escopo
- Captura vídeo provider local (Appium USB/emulador) via `startRecordingScreen`/`stopRecordingScreen`.
- Download vídeo provider Sauce Labs via REST API.
- Captura logs: `appium.log`, `adb logcat`, stdout runner.
- Conversão webm→MP4 via ffmpeg (BLOCK-A já documentado em `CLAUDE.md`).
- Index JSON (`videos_index.json`, `logs_index.json`).
- Integração no relatório final (T1) — adicionar leitura dos index.
- Flag on/off via `mobile.evidence.videoEnabled` + override CLI `--video=on|off`.

### Fora de escopo
- Farm interna BugKillers (sem doc, projeto antigo entrando no ar — descobrir via MCP em fase futura).
- Mascaramento de quadros de vídeo (só metadado nesta fase).
- Edição/corte de vídeo.
- Captura de áudio.

### Especificação completa
**Leia obrigatoriamente:** `docs/maia/02-especificacao/tarefa-8-video-logs.md`

Contém:
- 18 RFs + 5 RNFs
- 7 RNs (default, formato, fallback ffmpeg, farm interna, consentimento, retenção, tamanho)
- 12 CAs Given/When/Then
- Hipóteses H8.1-H8.4

### Decisões já tomadas
- **Vídeo default:** `true` (gravar sempre, cliente desabilita se quiser).
- **Formato final:** MP4 obrigatório.
- **Override CLI:** `--video=on|off` sobrescreve config.
- **Farm interna:** pular com aviso, não tentar.
- **Falha de captura:** não aborta cenário, só registra pendência no relatório.

### Validação obrigatória
- [ ] `npm test` no Core sem regressão.
- [ ] `node --check` em todo script novo/alterado.
- [ ] Grep por credenciais em todo log gerado retorna zero matches.
- [ ] `videos_index.json` validado contra schema (estrutura listada em RF8.11).
- [ ] Cenário smoke executado pelo menos uma vez gerando vídeo MP4 real.

---

## Como executar — passo a passo (Mistral)

### Passo 1 — Ler skills MAIA
Antes de qualquer coisa, ler:
- `docs/maia-skill-pack/skills/03-maia-planejamento/SKILL.md`
- `docs/maia-skill-pack/skills/06-maia-implementacao/SKILL.md`

Cada skill define objetivo, passo-a-passo e saídas obrigatórias. Seguir literalmente.

### Passo 2 — MAIA Planejamento (03)
Gerar:
- `docs/maia/03-planejamento/plano-execucao-ciclo3-t8.md`
- `docs/maia/03-planejamento/backlog-maia-ciclo3-t8.md`
- `docs/maia/03-planejamento/checklist-etapas-ciclo3-t8.md`

Quebrar T8 em sub-tarefas pequenas. Definir ordem, dependências, validação por etapa.

### Passo 3 — MAIA Implementação (06)
Executar sub-tarefas na ordem definida no plano. Para cada sub-tarefa:
1. Ler especificação (`docs/maia/02-especificacao/tarefa-8-video-logs.md`).
2. Alterar somente o necessário.
3. Rodar validação (npm test, node --check, grep por credenciais).
4. Atualizar `docs/maia/06-implementacao/progresso-ciclo3-t8.md`.

Saídas obrigatórias:
- Código alterado em `BKPilot-Core` (lógica genérica) e `BKPilot-Producao` (integração).
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-8-ciclo3.md`
- `docs/maia/06-implementacao/progresso-ciclo3-t8.md`

---

## Restrições (NUNCA violar)

- **NUNCA** colocar lógica mobile compartilhada no Producao — vai no Core.
- **NUNCA** commitar `.env` raiz ou `clients/*/.env`.
- **NUNCA** expor `QA_PASSWORD`, `MOBILE_FARM_USERNAME`, `MOBILE_FARM_ACCESS_KEY` em log/output/vídeo/relatório.
- **NUNCA** renomear funções já existentes do Core sem motivo declarado (manter contrato).
- **NUNCA** instalar ffmpeg automaticamente — só orientar instalação manual (BLOCK-A).
- **NUNCA** fazer commit gigante misturando sub-tarefas — um commit por sub-tarefa.
- Não tocar em T4, T9, T10 — fora deste handoff.

---

## Hipóteses a validar e registrar

Cada hipótese deve ser confirmada/rejeitada no `resumo-implementacao-tarefa-8-ciclo3.md`:

- **H8.1:** Sauce REST API permite download de vídeo via `/rest/v1/<user>/jobs/<jobId>/assets/video.mp4`.
- **H8.2:** Sauce gera MP4 nativamente.
- **H8.3:** `appium:startRecordingScreen` retorna base64 do vídeo no `stopRecordingScreen` (Android UiAutomator2).
- **H8.4:** Farm interna não impacta T8 (pular com aviso).

---

## Saída esperada ao final

Estrutura completa:

```
docs/maia/03-planejamento/
  plano-execucao-ciclo3-t8.md
  backlog-maia-ciclo3-t8.md
  checklist-etapas-ciclo3-t8.md

docs/maia/06-implementacao/
  resumo-implementacao-tarefa-8-ciclo3.md
  progresso-ciclo3-t8.md

BKPilot-Core/
  mobile-recording.js              ← novo módulo (startRecording/stopRecording/convertWebmToMp4)
  mobile-appium-client.js          ← integração no fluxo de sessão
  test/mobile-recording.test.js    ← testes unit
  package.json                     ← bump pra v0.2.3 + tag

BKPilot-Producao/
  scripts/mobile-smoke.js                       ← integra captura
  scripts/gerar-relatorio-final-mobile.js       ← lê videos_index.json
  clients/<id>/resultado/<ts>/mobile/videos/    ← saída
  clients/<id>/resultado/<ts>/mobile/logs/      ← saída
  clients/<id>/resultado/<ts>/mobile/videos_index.json
  clients/<id>/resultado/<ts>/mobile/logs_index.json
```

---

## Arquivos relevantes

| Arquivo | Propósito |
|---|---|
| `docs/maia/02-especificacao/tarefa-8-video-logs.md` | Spec completa — leitura obrigatória |
| `docs/maia/02-especificacao/requisitos.md` | Contexto T1/T2/T6 (já entregues) |
| `docs/maia/02-especificacao/regras-negocio.md` | RN gerais (válidas) |
| `scripts/mobile-smoke.js` | Runner mobile (Producao) |
| `scripts/gerar-relatorio-final-mobile.js` | Skill relatório (T1, integrar leitura de índices) |
| `clients/sauce-mobile-smoke/config.json` | Cliente teste cloud |
| `clients/local-usb-smoke/config.json` | Cliente teste local |
| `CLAUDE.md` §7 (BLOCK-A) | Regra ffmpeg |

---

## Comando de chamada (cole no Mistral)

```text
Leia HANDOFF.md na raiz do BKPilot-Producao. Execute apenas a Tarefa 8 (vídeo + logs).

Passos:
1. Ler docs/maia-skill-pack/skills/03-maia-planejamento/SKILL.md e seguir a skill.
2. Ler especificação completa em docs/maia/02-especificacao/tarefa-8-video-logs.md.
3. Gerar saídas obrigatórias da MAIA Planejamento em docs/maia/03-planejamento/ com sufixo "-ciclo3-t8".
4. Após plano gerado, avançar para docs/maia-skill-pack/skills/06-maia-implementacao/SKILL.md.
5. Implementar sub-tarefas na ordem definida. Um commit por sub-tarefa.
6. Validar: npm test no Core, node --check em scripts novos, grep por credenciais em logs.
7. Gerar resumo-implementacao-tarefa-8-ciclo3.md e progresso-ciclo3-t8.md em docs/maia/06-implementacao/.
8. Registrar decisão para hipóteses H8.1 a H8.4 no resumo.

Restrições:
- Lógica genérica vai no BKPilot-Core (irmão), integração no BKPilot-Producao.
- Nunca expor credenciais em log/vídeo.
- Nunca instalar ffmpeg automaticamente.
- Não tocar em T4, T9, T10.
- Não renomear funções existentes do Core.
```

---

## Pendências fora deste ciclo

- **T4** — APK local + estratégia farm (próximo ciclo, Codex provavelmente).
- **T9** — E2E completo Sauce (depende T4 + T8).
- **T10** — Adaptador farm interna BugKillers (descoberta via MCP quando farm estiver no ar — sem doc atualmente).
- **R3 ambiente** — instalar ADB + Appium local para destravar smoke USB (manual, fora do escopo de IA).
- **iOS** — fase futura.
- **Mobile-demo Comercial** — escopo do Comercial.
