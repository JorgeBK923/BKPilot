# Backlog MAIA 03 - Ciclo 2

Data: 2026-05-13

## R1 - Publicar Core v0.2.2

- R1.1 Revisar status do `BKPilot-Core`.
- R1.2 Rodar `npm test`.
- R1.3 Commitar alteracoes do Core.
- R1.4 Criar tag `v0.2.2`.
- R1.5 Fazer push do commit e tag.

## R2 - Atualizar Core nos consumidores

- R2.1 Atualizar dependencia no Producao.
- R2.2 Rodar `npm install` no Producao.
- R2.3 Atualizar dependencia no Comercial.
- R2.4 Rodar `npm install` no Comercial.
- R2.5 Validar imports e sintaxe.

## Tarefa 6 - Mascaramento

- T6.1 Criar modulo Core de redacao mobile.
- T6.2 Definir regex/policies padrao: CPF, CNPJ, email, telefone, cartao, token/JWT, senha.
- T6.3 Redigir XML preservando estrutura parseavel.
- T6.4 Redigir PNG com retangulos opacos por bounding box.
- T6.5 Escrever `redaction_log.json`.
- T6.6 Integrar em `screenshot()` e `getState()`.
- T6.7 Testar unsafe disable sem flag.
- T6.8 Medir performance.

## Tarefa 2 - Contrato e Doctor

- T2.1 Criar validador Core para bloco `mobile`.
- T2.2 Expor validador em `mobile-appium-client.js`.
- T2.3 Criar `scripts/mobile-doctor.js`.
- T2.4 Adicionar `mobile:doctor` ao `package.json`.
- T2.5 Atualizar `novo-cliente.sh`.
- T2.6 Atualizar exemplos de config mobile.
- T2.7 Criar `docs/onboarding-mobile.md`.
- T2.8 Adicionar verificacao de limite `maxMinutesPerRun` no smoke.

## Tarefa 1 - Relatorio Final Mobile

- T1.1 Criar `.claude/commands/gerar-relatorio-final-mobile.md`.
- T1.2 Criar script `scripts/gerar-relatorio-final-mobile.js`.
- T1.3 Resolver `latest` para timestamp real.
- T1.4 Coletar summaries web/mobile, bugs e evidencias.
- T1.5 Validar existencia de evidencias.
- T1.6 Gerar markdown.
- T1.7 Gerar PDF offline via Playwright.
- T1.8 Gerar `demo_summary.json`.
- T1.9 Exit code != 0 quando houver evidencia faltante.

## R3 - Smoke USB

- R3.1 Verificar ADB no PATH.
- R3.2 Verificar Appium local.
- R3.3 Executar smoke quando ambiente permitir.
- R3.4 Registrar resultado.

