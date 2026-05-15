# Backlog MAIA 03

Data: 2026-05-13

## Tarefa 5 - Hardening Core

- P5.1 Criar infraestrutura minima de testes no BKPilot-Core com `node --test`.
- P5.2 Exportar ou testar indiretamente funcoes de politica necessarias sem quebrar contrato publico.
- P5.3 Adicionar casos de `buildCapabilities()` para local, Sauce e farm propria.
- P5.4 Adicionar casos web/apk e garantir remocao de campos internos.
- P5.5 Adicionar casos de `resolveProviderConfig()` para cloud sem inferencia de `udid`.
- P5.6 Adicionar casos de `redact()` com payload sensivel aninhado.

Dependencias: nenhuma externa alem do proprio Core.

## Tarefa 7 - Parser XML

- P7.1 Adicionar `fast-xml-parser` ao BKPilot-Core.
- P7.2 Substituir `parseElementsFromSource()` regex por parser estruturado.
- P7.3 Adicionar fixture Android UiAutomator2.
- P7.4 Testar contrato de elementos retornados por `getState`/parser.
- P7.5 Retornar erro estruturado no resumo quando XML estiver mal-formado.
- P7.6 Medir parse de XML expandido para ~50KB em menos de 100ms.

Dependencias: instalacao da dependencia `fast-xml-parser`.

## Tarefa 3 - Smoke USB Android local

- P3.1 Carregar `clients/<id>/.env` no runner antes da resolucao mobile.
- P3.2 Criar `clients/local-usb-smoke/config.json`.
- P3.3 Criar exemplo seguro de `.env` sem segredo real.
- P3.4 Executar prechecks de ADB e Appium local.
- P3.5 Executar smoke local se ambiente fisico estiver disponivel.
- P3.6 Registrar versoes/precondicoes no resumo.

Dependencias: Android USB conectado, ADB instalado, Appium local rodando e Chromedriver compativel.

