# Plano de Execucao MAIA 03

Data: 2026-05-13
Projeto: BKPilot-Producao + BKPilot-Core
Origem: HANDOFF.md

## Escopo

Executar somente as tarefas 5, 7 e 3 descritas no handoff.

## Fase 1 - Planejamento e alinhamento

- Confirmar limites arquiteturais: logica mobile compartilhada no BKPilot-Core; Producao fica com wrappers, runner operacional e cliente local de smoke.
- Separar entregas documentais MAIA em `docs/maia/03-planejamento/`.
- Definir validacoes possiveis sem depender de dispositivo USB real.

## Fase 2 - Tarefa 5: hardening Core

- Adicionar suite `node:test` no BKPilot-Core para funcoes criticas do runtime mobile.
- Cobrir `buildCapabilities()` em provider local, cloud Sauce, farm propria generica, target web e target apk.
- Cobrir `resolveProviderConfig()` garantindo que `udid` nao seja inferido em cloud.
- Cobrir `redact()` e remocao de campos internos/sensiveis antes do envio ao Appium.

## Fase 3 - Tarefa 7: parser XML

- Substituir parser regex por biblioteca dedicada no BKPilot-Core.
- Escolha recomendada: `fast-xml-parser`, por funcionar em CommonJS, ser leve, rapido e permitir preservar atributos com prefixo controlado.
- Adicionar fixtures XML Android UiAutomator2 e testes de contrato de `mobile.getState`.
- Garantir fallback estruturado para XML mal-formado, sem exception fatal.
- Medir performance de XML tipico expandido para aproximadamente 50KB.

## Fase 4 - Tarefa 3: smoke USB local

- Ajustar o runner do Producao para carregar `.env` do cliente antes de resolver `APPIUM_URL`.
- Criar cliente operacional `clients/local-usb-smoke/` sem commitar segredos.
- Validar precondicoes locais: `adb devices`, Appium local em `http://localhost:4723`, Chrome/Chromedriver.
- Executar `npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web` quando ambiente estiver disponivel.

## Fase 5 - Validacao e registro

- Rodar `npm test` no BKPilot-Core.
- Rodar checks de sintaxe nos scripts alterados do Producao.
- Rodar smoke USB se houver device e Appium local; caso contrario, documentar bloqueio real com checks executados.
- Gerar resumos em `docs/maia/06-implementacao/` e atualizar `progresso.md`.

