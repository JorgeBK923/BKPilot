# Dependency Audit — BKPilot

**Data:** 2026-05-14 | **Revisor:** GLM-5.1 (MAIA Security Skill)

---

## BKPilot-Core

**`npm audit` resultado: 0 vulnerabilidades**

### Dependencias Diretas (package.json v0.2.4)

| Pacote | Versao | Risco | Observacao |
|---|---|---|---|
| `fast-xml-parser` | ^4.x | Baixo | Parser XML. Versao 4.x nao tem vulnerabilidades conhecidas. |
| `dotenv` | ^16.x | Baixo | Carregador de env vars. Sem risco conhecido. |

### Dependencias de Desenvolvimento/Teste

| Pacote | Versao | Risco | Observacao |
|---|---|---|---|
| `node:assert` | Built-in | Nenhum | Modulo nativo do Node |
| `node:test` | Built-in | Nenhum | Modulo nativo do Node |

### Fonte de Instalacao

- `@bugkillers/bkpilot-core` e instalado via GitHub (`git+https://github.com/...`), nao via npm registry.
- **Risco medio:** Dependencias de GitHub nao tem verificacao de integridade (sem `integrity` hash no lockfile). Um commit force-push poderia alterar o codigo sem deteccao.
- **Recomendacao:** Migrar para npm registry com `npm publish` e usar `package-lock.json` com `integrity` hashes.

## BKPilot-Producao

### Dependencias Diretas (package.json v1.0.0)

| Pacote | Versao | Risco | Observacao |
|---|---|---|---|
| `@bugkillers/bkpilot-core` | ^0.2.4 | Medio | Instalacao via GitHub, sem integrity hash |
| `playwright` | ^1.x | Baixo | Framework de automacao. Mantido pela Microsoft. |
| `dotenv` | ^16.x | Baixo | Sem risco conhecido |
| `marked` | ^15.x | Baixo | Parser Markdown. Sem vuln conhecida. |
| `xlsx` | ^0.18.x | Medio | SheetJS versao gratuita. Versao 0.18.x e a ultima community edition; versoes mais recentes sao pagas. Verificar CVEs periodicos. |
| `puppeteer` | (indireto) | Baixo | Usado indiretamente por scripts de geracao |

### Scripts Shell

| Arquivo | Risco | Observacao |
|---|---|---|
| `novo-cliente.sh` | Baixo | Cria estrutura de diretorios e copia `.env.example`. Sem comandos perigosos. |

### Lockfile

- `package-lock.json` existe no repo raiz.
- **Nao verificado no escopo:** BKPilot-Core pode nao ter lockfile (instalacao via GitHub).

## BKPilot-Comercial

- `scripts/lib/mobile-*.js` sao thin wrappers que re-exportam de `@bugkillers/bkpilot-core`.
- Sem dependencias adicionais alem das ja listadas.

---

## Resumo de Dependencias

| Criticidade | Quantidade | Pacotes |
|---|---|---|
| Critica | 0 | — |
| Alta | 0 | — |
| Media | 2 | `@bugkillers/bkpilot-core` (GitHub install), `xlsx` (0.18.x) |
| Baixa | 4 | `fast-xml-parser`, `dotenv`, `playwright`, `marked` |

---

## Recomendacoes

1. **Corrigir antes de producao:** Publicar `@bugkillers/bkpilot-core` em npm registry com integrity hashes, em vez de instalar via GitHub.
2. **Corrigir antes de producao:** Verificar CVEs periodicas para `xlsx` 0.18.x — a versao community nao recebe patches de seguranca.
3. **Melhoria futura:** Adicionar `npm audit` ao pipeline CI/CD.
4. **Melhoria futura:** Adicionar `lockfile-lint` para verificar integrity hashes.
5. **Melhoria futura:** Considerar alternativa ao `xlsx` (ex: `exceljs`) para suporte continuo de seguranca.