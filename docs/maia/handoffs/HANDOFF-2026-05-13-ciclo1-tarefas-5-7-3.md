# HANDOFF - BKPilot-Producao -> Codex CLI

**Data:** 2026-05-13
**Origem:** Claude (MAIA Diagnostico concluido)
**Destino:** Codex CLI
**Fluxo MAIA:** pular `02-especificacao` -> entrar em `03-maia-planejamento` -> `06-maia-implementacao`
**Escopo deste handoff:** 3 tarefas paralelas: hardening Core (5), parser XML (7), smoke USB Android local (3).

---

## Status Atualizado Pelo Codex

### Resumo

- MAIA Planejamento (03) executado.
- MAIA Implementacao (06) executada para as tarefas 5, 7 e 3.
- Tarefas 5 e 7 implementadas no repositorio irmao `BKPilot-Core`.
- Tarefa 3 preparada no `BKPilot-Producao`, mas o smoke USB real ficou bloqueado pelo ambiente local:
  - `adb` nao existe no PATH.
  - Appium local nao respondeu em `http://localhost:4723/status`.
- Producao ainda consome `@bugkillers/bkpilot-core#v0.2.1`; falta publicar/taguear Core `v0.2.2` e atualizar a dependencia.

### Artefatos MAIA Criados

- `docs/maia/03-planejamento/plano-execucao.md`
- `docs/maia/03-planejamento/backlog-maia.md`
- `docs/maia/03-planejamento/checklist-etapas.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-3.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-5.md`
- `docs/maia/06-implementacao/resumo-implementacao-tarefa-7.md`
- `docs/maia/06-implementacao/progresso.md`

### Mudancas No BKPilot-Core

Arquivos alterados/criados:

- `mobile-appium-client.js`
- `package.json`
- `package-lock.json`
- `test/mobile-appium-client.test.js`
- `test/fixtures/android-uiautomator2.xml`

Implementado:

- Parser regex de XML substituido por `fast-xml-parser`.
- `XMLValidator.validate()` usado para XML mal-formado.
- `parseElementsFromSource(source, { withMeta: true })` retorna `elements`, `durationMs` e `error` estruturado.
- `mobile.getState` preserva contrato e adiciona `summary.sourceParse`.
- `resolveProviderConfig()` resolve `env:` tambem em `appiumUrl`.
- `buildCapabilities()` aceita `appPackage` e `appActivity` vindos de argumentos CLI.
- `package.json` do Core ajustado para versao `0.2.2`.
- Script `"test": "node --test"` adicionado.
- Dependencia `fast-xml-parser` adicionada.

Validacao Core:

- `npm.cmd test`: 9 testes, 9 passaram.
- `node --test --experimental-test-coverage`: 9 testes, 9 passaram.
- Cobertura em `mobile-appium-client.js`:
  - Linhas: 42,57%
  - Branches: 70,00%
  - Funcoes: 28,89%
- Performance parser XML: XML de aproximadamente 50KB parseado em 34,40ms, abaixo do limite de 100ms.

### Mudancas No BKPilot-Producao

Arquivos alterados/criados:

- `scripts/mobile-smoke.js`
- `clients/local-usb-smoke/config.json`
- `clients/local-usb-smoke/.env.example`
- `clients/local-usb-smoke/.env` criado localmente e ignorado pelo Git via `clients/*/.env`.

Implementado:

- `scripts/mobile-smoke.js` carrega `clients/<id>/.env` antes de resolver provider/capabilities.
- Se `APPIUM_URL` vier do `.env` do cliente, o runner passa o valor explicitamente ao Core.
- O runner loga se o env do cliente foi encontrado sem expor valores sensiveis.
- Cliente `local-usb-smoke` criado para Appium local Android Chrome.

Validacao Producao:

- `node --check scripts/mobile-smoke.js`: passou.
- `adb devices -l`: falhou com `adb` nao encontrado no PATH.
- Check HTTP de `http://localhost:4723/status`: falhou, Appium local sem resposta.
- `npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web`: executou e gerou report de falha controlada.
- Report gerado: `clients/local-usb-smoke/resultado/mobile_smoke_failed/mobile/reports/mobile_smoke_report.json`.
- Resultado do report:
  - `status: failed`
  - check bloqueante: `adb_available` falhou com `spawnSync adb ENOENT`
  - sessao Appium nao foi criada.

### Proximos Passos

1. No `BKPilot-Core`, revisar diff e publicar/taguear `v0.2.2`.
2. No `BKPilot-Producao`, atualizar `@bugkillers/bkpilot-core` para `github:JorgeBK923/BKPilot-Core#v0.2.2`.
3. Rodar `npm install` no Producao apos atualizar a dependencia.
4. Instalar/colocar ADB no PATH.
5. Conectar e autorizar um Android USB.
6. Subir Appium local em `http://localhost:4723`.
7. Reexecutar:

```bash
npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web
```

---

## Contexto Original

- Monorepo logico em 4 partes:
  - `BKPilot-Core`: runtime JS compartilhado.
  - `BKPilot-Skills`: skills reutilizaveis, `v0.1.0`.
  - `BKPilot-Producao`: este repo, execucao operacional.
  - `BKPilot-Comercial`: demos.
- Producao consome Core via `"@bugkillers/bkpilot-core": "github:JorgeBK923/BKPilot-Core#v0.2.1"`.
- Wrappers finos no Producao ja chamam Core:
  - `scripts/lib/mobile-appium-client.js`
  - `scripts/lib/mobile-device-manager.js`
  - `scripts/mobile-mcp-server.js`
- Smoke real Sauce Labs US West 1 ja aprovado (Android + Chrome, alocacao dinamica).
- Toda logica nova mobile vai no `BKPilot-Core`, nao nos wrappers do Producao.

---

## Tarefa 5 - Hardening Core: Testes Unitarios

**Objetivo:** cobertura de testes unit em funcoes criticas do runtime mobile do Core.

**Funcoes-alvo no `BKPilot-Core`:**

- `buildCapabilities()`
- `resolveProviderConfig()`
- `redact()`
- Policies de seguranca: campos internos a remover, `allowedUrls`, `allowedAppPackages`

**Criterios de aceite:**

- [x] Testes unit cobrem provider local, cloud Sauce e farm propria generica.
- [x] `redact()` testado com payload contendo campos sensiveis.
- [x] `buildCapabilities()` testado para `target: web` e `target: apk`.
- [x] `resolveProviderConfig()` testado quando `udid` nao deve ser inferido em cloud.
- [x] Cobertura minima informada no resumo.
- [x] `npm test` no Core sem regressao.

**Repositorio:** `BKPilot-Core`.
**Tag esperada:** `v0.2.2` apos review/publicacao.

---

## Tarefa 7 - Trocar Parser XML Regex Por Biblioteca

**Objetivo:** substituir parser regex de XML do Appium page source por biblioteca dedicada.

**Local:** modulo no `BKPilot-Core` que processa `source` retornado por `mobile.getState`.

**Criterios de aceite:**

- [x] Lib escolhida e justificada: `fast-xml-parser`.
- [x] Substituicao nao quebra contrato de `mobile.getState`.
- [x] Testes unit com fixture Android UiAutomator2.
- [x] Parser sobrevive a XML mal-formado sem exception fatal, retornando erro estruturado.
- [x] Performance: parse de XML tipico de aproximadamente 50KB em menos de 100ms.

**Repositorio:** `BKPilot-Core`.

**Observacao:** a fixture adicionada e representativa de dump UiAutomator2 do Chrome mobile. Substituir por fixture real capturada em proximo smoke Sauce/USB quando houver sessao disponivel.

---

## Tarefa 3 - Smoke USB Android Local

**Objetivo:** validar pipeline mobile com device Android conectado via USB, sem farm.

**Pre-requisitos no ambiente:**

- ADB instalado e device visivel (`adb devices`).
- Appium local rodando (`appium --port 4723`).
- Chromedriver compativel com versao do Chrome do device.
- `.env` do cliente de teste com `APPIUM_URL=http://localhost:4723`.

**Validar:**

- [ ] Criacao de sessao Appium local.
- [ ] Navegacao basica em Chrome mobile (`baseUrl` do cliente).
- [ ] Captura de screenshot salva em `clients/<id>/resultado/<timestamp>/mobile/screenshots/`.
- [ ] `mobile.getState` retorna contrato esperado: source XML, state JSON e screenshot path.
- [x] Smoke roda com:

```bash
npm.cmd run mobile:smoke -- --cliente <id> --target web
```

- [ ] Resultado em `clients/<id>/resultado/<timestamp>/mobile/reports/mobile_smoke_report.json` com `status: passed`.

**Repositorio:** `BKPilot-Producao`.
**Cliente criado:** `clients/local-usb-smoke/`.

**Status Codex:** runner executado com `local-usb-smoke`, mas `status: passed` esta bloqueado por ambiente local sem ADB no PATH e sem Appium respondendo em `localhost:4723`.

---

## Restricoes

- Nunca colocar logica mobile compartilhada no Producao; vai no Core.
- Nunca commitar `.env` da raiz ou `clients/*/.env`.
- Nunca expor `QA_PASSWORD`, `MOBILE_FARM_USERNAME`, `MOBILE_FARM_ACCESS_KEY` em log/output.
- Browser sempre headless quando aplicavel.
- Nao tocar nas tarefas 1, 2, 4, 6, 8, 9 do plano Producao neste ciclo.

---

## Pendencias Fora Deste Handoff

Estas ficam para proximo ciclo, bloqueadas por especificacao:

- Tarefa 1: skill relatorio final, falta spec do schema.
- Tarefa 2: params obrigatorios por cliente, falta criterio de aceite por sub-item.
- Tarefa 6: mascaramento sensiveis, falta definicao de dado sensivel.

Proxima skill MAIA para desbloquear: `02-maia-especificacao`.

