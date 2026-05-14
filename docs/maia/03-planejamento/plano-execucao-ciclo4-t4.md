# Plano de Execucao - Ciclo 4 T4

Data: 2026-05-14
Escopo: APK local + estrategia farm Sauce Labs.

## Objetivo

Habilitar `mobile.target: "apk"` para Android nativo em provider local e Sauce Labs, mantendo logica reutilizavel no `BKPilot-Core`.

## Etapas

1. Core: criar `mobile-apk.js` e export `mobileApk`.
2. Core: adicionar testes unitarios para fontes APK, upload Sauce, whitelist, tamanho, cache e redaction.
3. Producao: integrar `mobile-smoke`, `mobile-doctor`, `novo-cliente.sh` e templates smoke APK.
4. Documentacao: atualizar onboarding e regras operacionais em `AGENTS.md`.
5. Core: publicar `v0.2.4`.
6. Dependentes: atualizar Producao e Comercial para `BKPilot-Core#v0.2.4`.
7. Validacao: rodar `npm test`, `node --check`, import smoke, doctor e grep de credenciais.
8. Saidas MAIA: registrar plano, backlog, checklist, resumo e progresso.

## Decisoes

- Upload padrao: `auto`.
- Pre-enviado: opt-in via `preuploaded` + `storageFilename`.
- Whitelist: obrigatoria em cliente real; bypass somente para smoke com `WHITELIST_BYPASS_SMOKE`.
- Reset: `noReset: true` por padrao.
- Limites: alerta acima de 100MB; bloqueio acima de 500MB.
- Cache: URL APK baixada uma vez por processo/execucao.
