# Plano de Execucao MAIA 03 - Ciclo 2

Data: 2026-05-13
Projeto: BKPilot-Producao + BKPilot-Core + BKPilot-Comercial
Fonte: `HANDOFF.md` Ciclo 2 e `docs/maia/02-especificacao/`

## Escopo

Executar residuais do Ciclo 1 e tarefas novas 6, 2 e 1.

## Ordem

1. R1 - fechar Core `v0.2.2`.
2. R2 - atualizar dependencia Core em Producao e Comercial.
3. Tarefa 6 - mascaramento de evidencias no Core e integracao no pipeline mobile.
4. Tarefa 2 - contrato mobile por cliente e `mobile:doctor`.
5. Tarefa 1 - `/gerar-relatorio-final-mobile`.
6. R3 - smoke USB local, condicionado a ADB/device/Appium no ambiente.

## Fase R1 - Publicacao Core

- Revisar diff do `BKPilot-Core`.
- Rodar `npm test`.
- Commitar alteracoes do Core relacionadas a `v0.2.2`.
- Criar tag `v0.2.2`.
- Push do commit e tag.

Validacao: `npm test` passa antes do commit/tag.

## Fase R2 - Dependencia Core

- Atualizar `@bugkillers/bkpilot-core` para `github:JorgeBK923/BKPilot-Core#v0.2.2` no Producao.
- Rodar `npm install` no Producao.
- Repetir atualizacao no Comercial.
- Rodar checks de sintaxe dos wrappers/scripts mobile.

Validacao: import dos wrappers e `node --check scripts/mobile-smoke.js`.

## Fase 6 - Mascaramento

- Implementar policies de dados sensiveis no Core.
- Implementar redacao de XML antes da persistencia final.
- Implementar redacao de screenshot PNG por bounding boxes configurados.
- Registrar `redaction_log.json` sem valores originais.
- Integrar `MobileAppiumClient.screenshot()` e `getState()`.
- Adicionar testes unitarios de XML, screenshot, log, config unsafe e performance.

Decisao H2: usar `pngjs` para PNG e bounding boxes configurados, sem OCR.

## Fase 2 - Contrato Mobile

- Adicionar schema/validador no Core para `mobile`.
- Criar `scripts/mobile-doctor.js` no Producao.
- Adicionar script `mobile:doctor`.
- Atualizar `novo-cliente.sh` para gerar bloco `mobile` completo.
- Atualizar exemplos `local-usb-smoke` e `sauce-mobile-smoke`.
- Criar `docs/onboarding-mobile.md`.

Decisao H3: manter defaults conservadores (`maxConcurrentSessions: 2`, `maxMinutesPerRun: 30`) como configuracao local ate existir cota Sauce contratual.

## Fase 1 - Relatorio Final Mobile

- Criar comando `/gerar-relatorio-final-mobile`.
- Criar script offline `scripts/gerar-relatorio-final-mobile.js`.
- Reusar pipeline PDF local via Playwright, alinhado ao script existente `scripts/refazer-relatorios.js`.
- Consolidar artefatos web e mobile.
- Validar evidencias em disco, registrar pendencias e exit != 0 quando faltar arquivo.
- Gerar `relatorio_final.md`, `relatorio_final.pdf` e `demo_summary.json`.

Decisao H1: reusar stack PDF com Playwright local.
Decisao H4: entrega por link assinado fica pendente; o script gera arquivos locais.

## Riscos

- R3 depende de ADB/device/Appium local e pode continuar bloqueado.
- Publicacao da tag depende de permissao Git remota.
- Screenshot com dados sensiveis sem bounding box configurado nao pode ser detectado sem OCR; a implementacao aborta para campos declarados invalidos e mascara regioes configuradas.

