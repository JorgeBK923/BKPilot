# Backlog MAIA - Ciclo 4 T4

## Concluido

- Core `mobile-apk.js`: origem local/URL/storage, upload Sauce, capabilities, whitelist, validacao de arquivo e cache de download.
- Testes Core para RFs de APK e redaction de credenciais Sauce.
- Integracao Producao em `scripts/mobile-smoke.js` e `scripts/mobile-doctor.js`.
- Templates `clients/local-apk-smoke` e `clients/sauce-apk-smoke`.
- `novo-cliente.sh --target apk`.
- Documentacao operacional.
- Core publicado em `v0.2.4` e dependentes atualizados.

## Pendencias Ambientais

- Smoke APK local real: pendente por ADB ausente.
- Appium local: pendente no ambiente atual (`ECONNREFUSED 127.0.0.1:4723`).
- Smoke Sauce APK real: depende credenciais Sauce e APK real do cliente.

## Fora de Escopo

- T9 E2E Sauce em cliente real.
- T10 farm interna BugKillers.
- iOS/IPA.
- Limpeza automatica de APKs antigos no Sauce.
