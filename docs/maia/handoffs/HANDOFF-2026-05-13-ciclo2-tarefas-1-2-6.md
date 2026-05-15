# HANDOFF - BKPilot-Producao -> Codex CLI (Ciclo 2)

**Data:** 2026-05-13
**Origem:** Claude (MAIA Especificacao 02 concluida para itens 1, 2, 6)
**Destino:** Codex CLI
**Fluxo MAIA:** `03-maia-planejamento` -> `06-maia-implementacao`
**Escopo:** residuais do Ciclo 1 + tarefas 6, 2 e 1.

---

## Status Atualizado Pelo Codex

### Planejamento MAIA 03

Criado:

- `docs/maia/03-planejamento/plano-execucao-ciclo2.md`
- `docs/maia/03-planejamento/backlog-maia-ciclo2.md`
- `docs/maia/03-planejamento/checklist-etapas-ciclo2.md`

### Implementacao MAIA 06

Criado:

- `docs/maia/06-implementacao/resumo-implementacao-residuais-ciclo2.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-6-ciclo2.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-2-ciclo2.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-1-ciclo2.md`
- `docs/maia/06-implementacao/progresso-ciclo2.md`

### Residuais Ciclo 1

- R1 concluido: `BKPilot-Core` commitado, tagueado e enviado como `v0.2.2`.
- R2 concluido: `BKPilot-Producao` e `BKPilot-Comercial` atualizados para `@bugkillers/bkpilot-core#v0.2.2`.
- R3 bloqueado por ambiente: `adb` nao esta no PATH e Appium local nao responde em `http://localhost:4723`.

### Tarefa 6 - Mascaramento

Status: implementada.

Core:

- `mobile-redaction.js`
- `mobile-config.js`
- `mobile-appium-client.js`
- `test/mobile-redaction-config.test.js`

Implementado:

- Redacao XML/texto com `***REDACTED***`.
- Categorias padrao: CPF, CNPJ, email, telefone, cartao, token/JWT e senha.
- Redacao PNG por bounding boxes com `pngjs`.
- `redaction_log.json` com contagens, sem valores originais.
- Bloqueio `UNSAFE_REDACTION_DISABLE` sem `allowUnsafeDisable: true`.
- Integracao antes de persistir screenshots e XML no `MobileAppiumClient`.

Decisao H2: usar `pngjs` + bounding boxes configurados, sem OCR nesta fase.

### Tarefa 2 - Contrato Mobile Por Cliente

Status: implementada.

Producao:

- `scripts/mobile-doctor.js`
- script `mobile:doctor`
- `novo-cliente.sh` com bloco `mobile` completo
- `docs/onboarding-mobile.md`
- configs `clients/local-usb-smoke/config.json` e `clients/sauce-mobile-smoke/config.json` atualizados

Core:

- `validateMobileConfig()` exposto em `mobile-appium-client.js`.

Decisao H3: manter defaults conservadores ate existir cota Sauce formal:

- `maxConcurrentSessions: 2`
- `maxMinutesPerRun: 30`
- `maxScenariosPerRun: 50`

### Tarefa 1 - Skill `/gerar-relatorio-final-mobile`

Status: implementada.

Criado:

- `.claude/commands/gerar-relatorio-final-mobile.md`
- `scripts/gerar-relatorio-final-mobile.js`
- script `mobile:report`

Saidas:

- `clients/<id>/resultado/<ts>/relatorio_final.md`
- `clients/<id>/resultado/<ts>/relatorio_final.pdf`
- `clients/<id>/resultado/<ts>/demo_summary.json`

Decisoes:

- H1: reusar pipeline PDF local com Playwright.
- H4: link assinado fica pendente; esta entrega gera artefatos locais.

---

## Validacoes Executadas

- Core `npm.cmd test`: 15 testes, 15 passaram.
- Producao `node --check scripts/mobile-smoke.js`: passou.
- Producao `node --check scripts/mobile-doctor.js`: passou.
- Producao `node --check scripts/gerar-relatorio-final-mobile.js`: passou.
- Producao `npm run mobile:doctor -- --cliente local-usb-smoke`: executou em 27ms; schema passou; falhou por ADB/Appium locais.
- Producao `npm run mobile:smoke -- --cliente local-usb-smoke --target web`: executou; falhou de forma controlada por ADB ausente.
- Producao `npm run mobile:report -- --cliente local-usb-smoke --timestamp mobile_smoke_failed --target hybrid`: passou e gerou `.md`, `.pdf`, `demo_summary.json`.
- Comercial importou Core `0.2.2` e `validateMobileConfig` como `function`.

---

## Proximos Passos

1. Instalar Android Platform Tools e garantir `adb` no PATH.
2. Conectar device Android USB e autorizar debug.
3. Subir Appium local em `http://localhost:4723`.
4. Reexecutar:

```bash
npm.cmd run mobile:doctor -- --cliente local-usb-smoke
npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web
```

---

## Fora Deste Ciclo

- Tarefa 4: APK local + estrategia farm.
- Tarefa 8: estrategia video/logs.
- Tarefa 9: E2E completo Sauce.
- iOS.
- Mobile-demo Comercial.

