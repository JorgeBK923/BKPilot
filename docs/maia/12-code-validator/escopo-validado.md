# Escopo Validado — maia-code-validator

**Data:** 2026-05-14

---

## Escopo esperado (HANDOFF.md Ciclo 5 — Tripla Revisão)

### BKPilot-Core
| Arquivo | Existe na fonte? | Existe no git? | Status |
|---|---|---|---|
| `mobile-appium-client.js` | Sim | Sim | OK |
| `mobile-device-manager.js` | Sim | Sim | OK |
| `mobile-mcp.js` | Sim | Sim | OK |
| `mobile-redaction.js` | Sim | Sim | OK |
| `mobile-config.js` | Sim | Sim | OK |
| `mobile-recording.js` | Sim | Sim | OK |
| `mobile-apk.js` | **NÃO** | Sim (`BKPilot/BKPilot-Core/`) | **FALTA** |
| `index.js` | Sim (incompleto) | Sim (completo) | **CONTRATO INCOMPLETO** |
| `package.json` | Sim (v0.2.3) | Sim (v0.2.4) | **VERSÃO ERRADA** |
| `test/*.test.js` | 3 arquivos | 4 arquivos | **FALTA mobile-apk.test.js** |

### BKPilot-Producao (BKPilot/)
| Arquivo | Existe? | Status |
|---|---|---|
| `scripts/mobile-smoke.js` | Sim | OK |
| `scripts/mobile-doctor.js` | Sim | OK |
| `scripts/gerar-relatorio-final-mobile.js` | Sim | OK |
| `novo-cliente.sh` | Sim | OK (não validado bash -n) |
| `clients/local-usb-smoke/config.json` | Sim | OK |
| `clients/sauce-mobile-smoke/config.json` | Sim | OK |
| `clients/local-apk-smoke/config.json` | Sim | OK |
| `clients/sauce-apk-smoke/config.json` | Sim | OK |
| `.claude/commands/gerar-relatorio-final-mobile.md` | Sim | OK |

### BKPilot-Comercial
| Arquivo | Existe? | Status |
|---|---|---|
| `package.json` | Sim | OK (dep Core v0.2.4 via github) |
| `scripts/lib/mobile-appium-client.js` | Sim | OK |
| `scripts/lib/mobile-device-manager.js` | Sim | OK |
| `scripts/lib/mobile-mcp.js` | **NÃO** | **FALTA** |
| `scripts/lib/mobile-redaction.js` | **NÃO** | **FALTA** |
| `scripts/lib/mobile-config.js` | **NÃO** | **FALTA** |
| `scripts/lib/mobile-recording.js` | **NÃO** | **FALTA** |
| `scripts/lib/mobile-apk.js` | **NÃO** | **FALTA** |

---

## Alterações fora de escopo

**Nenhuma detectada.** Nenhum arquivo fora da lista HANDOFF foi modificado. Nenhuma refatoração desnecessária encontrada. Nenhum arquivo sensível (deploy, infra, CI) foi alterado.

---

## Classificação de Risco

| Área | Risco |
|---|---|
| Core (fonte) | **Alto** — fonte desatualizado, falta módulo APK |
| Core (git) | Baixo — código completo e testado |
| Producao | Baixo — scripts funcionais, configs corretos |
| Comercial | **Médio** — wrappers incompletos, mas depende de Core instalado |

---

## Recomendação

Sincronizar `BKPilot-Core/` (fonte) com `BKPilot/BKPilot-Core/` (git repo v0.2.4). Completar wrappers no Comercial. Após sync, revalidar.
