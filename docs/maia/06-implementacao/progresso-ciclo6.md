# Progresso - Ciclo 6 Security

Data: 2026-05-14

## Status

Remediacao SEC-01..SEC-07 implementada. SEC-08 aceito e documentado.

## Concluido

- SEC-01: politica de screenshot redaction e bypass smoke auditavel.
- SEC-02: redaction de logs Appium/logcat antes de persistencia.
- SEC-03: modulo Core `mobile-retention.js`, script `mobile:purge` e integracao opcional `mobile:smoke --purge`.
- SEC-04/05/06: hardening de `appiumUrl` contra HTTP remoto, credenciais em URL e SSRF por host nao permitido.
- SEC-07: prefacio anti-injection nos comandos e regra em `CLAUDE.md`.
- SEC-08: decisao aceita em `docs/maia/11-security/decisoes-aceitas.md`.
- Core publicado em `v0.2.5`.
- Producao e Comercial atualizados para `@bugkillers/bkpilot-core#v0.2.5`.

## Validacao

- Core `npm test`: 39/39 passou.
- `node --check`: passou nos arquivos novos/alterados.
- Grep de credencial/PII em `clients/*/resultado/*/mobile/logs/`: `matches=0`.
- Doctors: schema e politicas novas passaram; falhas restantes sao ambientais.

## Pendencias

- Executar smoke real quando ADB/Appium/Sauce estiverem disponiveis.
- Rodar QA-validacao quando `docs/maia/07-qa-validacao/` existir ou a revisao qwen for entregue.
