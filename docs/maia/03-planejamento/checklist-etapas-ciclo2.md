# Checklist de Etapas MAIA 03 - Ciclo 2

Data: 2026-05-13

## Residuais

- [ ] Core `v0.2.2` com testes passando.
- [ ] Commit/tag/push do Core.
- [ ] Producao consumindo `@bugkillers/bkpilot-core#v0.2.2`.
- [ ] Comercial consumindo `@bugkillers/bkpilot-core#v0.2.2`.
- [ ] Smoke USB reexecutado se ADB/device/Appium existirem.

## Tarefa 6

- [ ] Screenshot redigido por retangulo opaco.
- [ ] XML redigido com `***REDACTED***` e parseavel.
- [ ] Categorias padrao ativas sem config explicita.
- [ ] Disable unsafe exige `allowUnsafeDisable: true`.
- [ ] Original nao-mascarado nao persiste no output final.
- [ ] `redaction_log.json` sem valores originais.
- [ ] Falha de redacao aborta evidencia.
- [ ] Performance XML 50KB <= 100ms e PNG ~1MB <= 500ms.

## Tarefa 2

- [ ] `novo-cliente.sh` gera `mobile` completo.
- [ ] `mobile:doctor` valida config e prerequisitos.
- [ ] Validacao <= 5s em falha local.
- [ ] Erros citam campo exato e valor esperado.
- [ ] Credenciais nao aparecem no output.
- [ ] Limite `maxMinutesPerRun` gera `LIMIT_EXCEEDED`.
- [ ] Retry transiente documentado/configurado.
- [ ] `docs/onboarding-mobile.md` criado.

## Tarefa 1

- [ ] Comando `/gerar-relatorio-final-mobile` criado.
- [ ] `.md` e `.pdf` gerados.
- [ ] Bugs mobile viram cards com evidencia.
- [ ] Evidencias citadas sao validadas.
- [ ] Evidencia faltante aparece em Pendencias e exit != 0.
- [ ] `demo_summary.json` contem status, provider, target, cenarios, bugs, screenshots, paths e duracao.
- [ ] Execucao offline.

