# HANDOFF — BKPilot-Producao → Codex CLI (Ciclo 4 — Tarefa 4)

**Data:** 2026-05-14
**Origem:** Claude (MAIA Especificação 02 concluída para T4)
**Destino:** Codex CLI
**Fluxo MAIA:** `03-maia-planejamento` → `06-maia-implementacao`
**Escopo:** **Tarefa 4** — APK local + estratégia farm Sauce Labs.

Ciclos anteriores arquivados:
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo1-tarefas-5-7-3.md`
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo2-tarefas-1-2-6.md`
- `docs/maia/handoffs/HANDOFF-2026-05-13-ciclo3-t8-mistral-falhou.md`
- `docs/maia/handoffs/HANDOFF-2026-05-14-ciclo3-t8-remediado.md`

---

## Resumo de contexto

- Monorepo lógico: `BKPilot-Core` (v0.2.3), `BKPilot-Skills` (v0.1.0), `BKPilot-Producao` (este repo), `BKPilot-Comercial`.
- Ciclos 1–3 entregues: hardening Core, parser XML, mascaramento, contrato config, skill relatório, vídeo+logs.
- Smoke Sauce Labs aprovado (Android+Chrome web mobile).
- Smoke USB segue bloqueado por ambiente (ADB ausente) — independente de T4.
- T4 destrava clientes com app nativo Android.

---

## Tarefa 4 — APK local + estratégia farm

### Objetivo
Habilitar pipeline a testar **app nativo Android** (.apk) em provider local (USB/emulador) e cloud (Sauce Labs), com whitelist de pacotes (`allowedAppPackages`) e estratégias de upload configuráveis.

### Spec completa
**Leia obrigatoriamente:** `docs/maia/02-especificacao/tarefa-4-apk-farm.md`

Contém:
- 18 RFs + 5 RNFs
- 7 RNs (whitelist, upload, versionamento, reset, falha, cliente real vs smoke, tamanho)
- 13 CAs Given/When/Then
- Hipóteses H4.1-H4.5

### Decisões já tomadas
- **Default upload:** automático (`uploadStrategy: "auto"`).
- **Pré-enviado:** opção via `uploadStrategy: "preuploaded"` + `storageFilename`.
- **Whitelist:** obrigatória em cliente real; smoke pode pular com log explícito.
- **Reset default:** `noReset: true` (mantém login entre cenários).
- **Limite APK:** > 500MB aborta; > 100MB alerta.
- **Cache URL:** download 1× por execução.

---

## Sub-tarefas (ordem sugerida)

### Etapa 1 — Core: novo módulo `mobile-apk.js`
- [ ] Criar `BKPilot-Core/mobile-apk.js` exportando:
  - `resolveApkSource(apkConfig)` — retorna `{type: "local"|"url"|"storage", path|url|filename}`
  - `uploadApkToSauce({apkPath, username, accessKey, filename, timeoutMs})` — REST `/v1/storage/upload`
  - `buildApkCapabilities({provider, apkSource, appPackage, appActivity, noReset, fullReset})`
  - `validateAllowedAppPackage(packageName, allowedList)` — throws `APP_PACKAGE_NOT_ALLOWED`
  - `validateApkFile(path, maxBytes)` — checa existência, tamanho
  - `downloadApkFromUrl(url, cacheDir)` — com cache por execução
- [ ] Exportar em `BKPilot-Core/index.js` como `mobileApk`.

### Etapa 2 — Core: testes unit
- [ ] `BKPilot-Core/test/mobile-apk.test.js`:
  - `resolveApkSource` para os 3 formatos
  - `uploadApkToSauce` mockando fetch — sucesso + 500 + timeout
  - `buildApkCapabilities` para web/apk, local/cloud
  - `validateAllowedAppPackage` — bloqueia fora da lista, permite na lista, smoke bypass
  - `validateApkFile` — existe / não existe / > 500MB
  - `downloadApkFromUrl` — cache reaproveita 2ª chamada
  - Credenciais não vazam: `redactLog` cobre `MOBILE_FARM_USERNAME`/`MOBILE_FARM_ACCESS_KEY` em logs de upload.

### Etapa 3 — Producao: integração
- [ ] `scripts/mobile-smoke.js`: detectar `target: "apk"`, chamar `mobile-apk.js`.
- [ ] `scripts/mobile-doctor.js`: adicionar validações APK (existência, tamanho, whitelist, storage Sauce).
- [ ] `novo-cliente.sh`: suporte a flag `--target apk` — gera template com bloco `mobile.apk` completo.
- [ ] Criar `clients/local-apk-smoke/config.json` + `.env.example`.
- [ ] Criar `clients/sauce-apk-smoke/config.json` + `.env.example`.

### Etapa 4 — Documentação
- [ ] Atualizar `docs/onboarding-mobile.md` com seção APK.
- [ ] Atualizar `AGENTS.md` se necessário (regra Core/Producao já estabelecida).

### Etapa 5 — Bump Core
- [ ] `BKPilot-Core/package.json` → `v0.2.4`.
- [ ] Commit por etapa (não commit gigante).
- [ ] Tag `v0.2.4` + push.

### Etapa 6 — Atualizar dependentes
- [ ] `BKPilot-Producao/package.json`: dep `v0.2.4`.
- [ ] `BKPilot-Comercial/package.json`: dep `v0.2.4`.
- [ ] `npm install` em ambos.

### Etapa 7 — Validação obrigatória (NÃO PULAR)
Executar e **incluir saídas no resumo**:
- [ ] `npm test` no Core — deve passar 100%.
- [ ] `node --check` em todos scripts novos/alterados.
- [ ] `node -e "const c=require('@bugkillers/bkpilot-core'); console.log(typeof c.mobileApk.buildApkCapabilities)"` no Producao — deve imprimir `function`.
- [ ] `npm run mobile:doctor -- --cliente local-apk-smoke` — testa validações (falhará por ambiente sem ADB, mas validações de schema devem passar).
- [ ] Grep credencial em logs de qualquer execução do upload: zero matches.
- [ ] Smoke APK local opcional — se ambiente USB pronto, rodar; senão, registrar como pendente ambiental.

### Etapa 8 — Saídas MAIA
- [ ] `docs/maia/03-planejamento/plano-execucao-ciclo4-t4.md`
- [ ] `docs/maia/03-planejamento/backlog-maia-ciclo4-t4.md`
- [ ] `docs/maia/03-planejamento/checklist-etapas-ciclo4-t4.md`
- [ ] `docs/maia/06-implementacao/resumo-implementacao-tarefa-4-ciclo4.md` — com:
  - Saídas reais das validações (output literal)
  - Decisão registrada para H4.1-H4.5
  - Sem auto-contradição "100% concluída" com pendências abertas
  - Cada RF/RNF/CA mapeado a evidência (arquivo, função, teste)
- [ ] `docs/maia/06-implementacao/progresso-ciclo4-t4.md`

---

## Restrições (NUNCA violar)

- **NUNCA** colocar lógica APK reutilizável no Producao — vai no Core.
- **NUNCA** expor `MOBILE_FARM_USERNAME`, `MOBILE_FARM_ACCESS_KEY`, `QA_PASSWORD` em log/output/relatório.
- **NUNCA** instalar pacote fora da whitelist `allowedAppPackages` em cliente real.
- **NUNCA** sobrescrever APK pré-existente no Sauce storage sem timestamp.
- **NUNCA** marcar concluído sem rodar validações da Etapa 7.
- **NUNCA** renomear funções/exports existentes do Core (manter contrato `mobileAppium`, `mobileDeviceManager`, `mobileMcp`, `mobileRedaction`, `mobileConfig`, `mobileRecording`).
- **NUNCA** baixar APK de URL múltiplas vezes na mesma execução (RF4.4 cache).
- **NUNCA** commit gigante misturando etapas.
- Não tocar T9, T10 — fora de escopo.

---

## Hipóteses a validar e registrar

Cada hipótese deve ser confirmada/rejeitada no `resumo-implementacao-tarefa-4-ciclo4.md`:

- **H4.1:** Sauce REST API aceita upload via `POST /v1/storage/upload` com basic auth.
- **H4.2:** Default `uploadStrategy: "auto"` é preferido (vs pré-enviado).
- **H4.3:** `noReset: true` seguro entre cenários (mantém login).
- **H4.4:** APK típico < 100MB (limite confortável).
- **H4.5:** Cliente entrega APK em path local; URL é opção.

---

## Saída esperada ao final

```
BKPilot-Core/
  mobile-apk.js                       ← novo
  test/mobile-apk.test.js             ← novo
  index.js                            ← exporta mobileApk
  package.json                        ← v0.2.4
  (tag v0.2.4 publicada)

BKPilot-Producao/
  package.json                        ← dep v0.2.4
  scripts/mobile-smoke.js             ← branch target: apk
  scripts/mobile-doctor.js            ← validações APK
  novo-cliente.sh                     ← suporte --target apk
  clients/local-apk-smoke/            ← novo cliente
  clients/sauce-apk-smoke/            ← novo cliente
  docs/onboarding-mobile.md           ← seção APK

BKPilot-Comercial/
  package.json                        ← dep v0.2.4

docs/maia/03-planejamento/
  plano-execucao-ciclo4-t4.md
  backlog-maia-ciclo4-t4.md
  checklist-etapas-ciclo4-t4.md

docs/maia/06-implementacao/
  resumo-implementacao-tarefa-4-ciclo4.md
  progresso-ciclo4-t4.md
```

---

## Arquivos relevantes

| Arquivo | Propósito |
|---|---|
| `docs/maia/02-especificacao/tarefa-4-apk-farm.md` | Spec completa — leitura obrigatória |
| `docs/maia/02-especificacao/requisitos.md` | Contexto T1/T2/T6 (concluídas) |
| `docs/maia/02-especificacao/tarefa-8-video-logs.md` | T8 (vídeo+logs) — integração T4 |
| `scripts/mobile-smoke.js` | Runner mobile (Producao) |
| `scripts/mobile-doctor.js` | Validador pré-execução |
| `clients/sauce-mobile-smoke/config.json` | Exemplo cloud web |
| `clients/local-usb-smoke/config.json` | Exemplo local web |
| `CLAUDE.md` | Regras globais (mascaramento, credenciais, evidência) |
| `AGENTS.md` | Regras Core/Comercial/Producao |

---

## Comando de chamada (cole no Codex)

```text
Tarefa: implementar T4 (APK local + estratégia farm Sauce Labs) conforme HANDOFF.md.

Passos: seguir as 8 Etapas do HANDOFF.md em ordem. Não pular Etapa 7 (validação). Spec completa em docs/maia/02-especificacao/tarefa-4-apk-farm.md (18 RFs + 7 RNs + 13 CAs).

Restrições críticas:
- Lógica APK reutilizável obrigatoriamente em BKPilot-Core/mobile-apk.js.
- Manter contrato dos exports existentes do Core.
- Whitelist allowedAppPackages obrigatória em cliente real.
- Default uploadStrategy: "auto"; pré-enviado é opt-in.
- Cache de URL APK por execução (não baixar N× para N cenários).
- Um commit por etapa.
- npm test, node --check e grep credencial no resumo final com saída literal.
- Registrar decisão para H4.1-H4.5.
```

---

## Pendências fora deste ciclo

- **T9** — E2E completo Sauce em cliente real (depende T4 + T8; próximo ciclo).
- **T10** — Adaptador farm interna BugKillers (descoberta via MCP quando farm estiver no ar).
- **R3** — Destravar smoke USB (manual: instalar ADB + Appium local).
- **iOS / XCUITest** — fase futura.
- **Múltiplos devices em lote** — V1+.
- **Appium Grid próprio** — V1+.
- **Limpeza automática APKs antigos no Sauce** — V1+.
- **Mobile-demo Comercial** — escopo do Comercial.
