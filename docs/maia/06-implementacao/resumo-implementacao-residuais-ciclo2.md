# Resumo de Implementacao - Residuais Ciclo 1

Data: 2026-05-13

## R1 - Publicar Core v0.2.2

Status: concluido.

- Core testado com `npm.cmd test`: 15/15 passou.
- Commit criado no `BKPilot-Core`.
- Tag `v0.2.2` criada e enviada ao remote.
- A tag foi movida uma vez apos o doctor revelar que campos internos do contrato ainda iam para Appium capabilities; a correcao tambem foi testada e publicada.

## R2 - Atualizar Dependencia

Status: concluido.

- Producao atualizado para `github:JorgeBK923/BKPilot-Core#v0.2.2`.
- Comercial atualizado para `github:JorgeBK923/BKPilot-Core#v0.2.2`.
- `npm install @bugkillers/bkpilot-core@github:JorgeBK923/BKPilot-Core#v0.2.2` executado nos dois repositorios.
- Import validado nos dois:
  - `validateMobileConfig`: `function`
  - Core instalado: `0.2.2`

## R3 - Smoke USB

Status: bloqueado por ambiente local.

- `npm.cmd run mobile:smoke -- --cliente local-usb-smoke --target web` executado.
- Falha controlada: `Local Android device validation failed`.
- Bloqueio: `adb` nao existe no PATH.
- Appium local tambem nao respondeu em `http://localhost:4723`.

