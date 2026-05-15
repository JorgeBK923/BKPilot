# Checklist de Etapas MAIA 03

Data: 2026-05-13

## Tarefa 5 - Hardening Core

- [ ] Testes unit cobrem provider local.
- [ ] Testes unit cobrem provider cloud Sauce.
- [ ] Testes unit cobrem farm propria generica.
- [ ] `redact()` remove campos sensiveis em payload aninhado.
- [ ] `buildCapabilities()` cobre `target: web`.
- [ ] `buildCapabilities()` cobre `target: apk`.
- [ ] `resolveProviderConfig()` nao infere `udid` em cloud.
- [ ] Cobertura minima informada no resumo.
- [ ] `npm test` do Core executado sem regressao.

## Tarefa 7 - Parser XML

- [ ] Biblioteca escolhida e justificativa registrada.
- [ ] Contrato de `mobile.getState` preservado.
- [ ] Fixture XML Android UiAutomator2 adicionada.
- [ ] XML mal-formado nao gera exception fatal.
- [ ] Erro de parse aparece como dado estruturado.
- [ ] XML tipico de aproximadamente 50KB parseia em menos de 100ms.

## Tarefa 3 - Smoke USB Android local

- [ ] Cliente `local-usb-smoke` criado.
- [ ] Runner carrega `.env` do cliente.
- [ ] `adb devices` verificado.
- [ ] Appium local `http://localhost:4723` verificado.
- [ ] Smoke executado com `npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web` quando ambiente permitir.
- [ ] Screenshot salvo em `clients/<id>/resultado/<timestamp>/mobile/screenshots/`.
- [ ] `mobile.getState` retorna source XML, state JSON e screenshot path.
- [ ] `mobile_smoke_report.json` com `status: passed` quando device/Appium estiver disponivel.

