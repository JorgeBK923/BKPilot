# Relatório de QA — Validação BKPilot-Core Ciclos 1-6

**Data:** 2026-05-15
**Skill:** MAIA QA Validação
**Escopo:** Revisão externa do código entregue por Codex nos Ciclos 1-6
**Versão Core:** 0.2.5

---

## 1. Sumário Executivo

| Indicador | Valor |
|---|---|
| Testes totais | 39 |
| Passaram | 39 (100%) |
| Falharam | 0 |
| Cobertura linha | 65.39% |
| Cobertura branch | 59.86% |
| Cobertura função | 66.67% |
| Módulos sem teste | 1 (`mobile-device-manager.js`) |
| CA cobertos (de 48) | 19 (39.6%) |
| CA sem cobertura | 22 (45.8%) |
| Edge cases não testados | 109 |
| Funcionalidades especificadas não implementadas | 5 |

---

## 2. Regressão (CAT.1)

**Resultado: APROVADO.** Suite completa (39/39) executada com `node --test` — todas passam. Nenhuma regressão detectada nos módulos do Ciclo 1 (mobile-appium-client, mobile-config, mobile-redaction) após mudanças dos Ciclos 4-6 (mobile-apk, mobile-recording, mobile-retention).

```
39 tests
0 fail
0 skipped
duration_ms 1264
```

---

## 3. Análise de Cobertura Real

### Módulos críticos (VERMELHO — <70% linha)

| Módulo | Linha % | Problema principal |
|---|---|---|
| `mobile-appium-client.js` | 52.85 | Classe MobileAppiumClient (~300 linhas) sem teste de instância |
| `mobile-recording.js` | 66.50 | `downloadSauceVideo` (46 linhas) completamente sem teste |
| `mobile-device-manager.js` | 0.00 | Sem arquivo de teste |

### Módulos aceitáveis (AMARELO — 70-89% linha)

| Módulo | Linha % | Problema principal |
|---|---|---|
| `mobile-apk.js` | 87.74 | `requestBuffer` não testado, branches de erro do upload |
| `mobile-config.js` | 88.89 | Branches de validação de tipo não exercitados |
| `mobile-redaction.js` | 80.12 | `mergeCounts`, bounds alternativos, xmlFields custom |
| `mobile-retention.js` | 87.50 | Path traversal check, negative retention |

### Sem módulo VERDE (>=90% linha, >=80% branch, >=90% função)

---

## 4. Mapeamento CA → Testes (Resumo)

| Tarefa | Total CA | Coberto | Parcial | Sem cobertura |
|---|---|---|---|---|
| T4 (APK Farm) | 13 | 7 | 4 | 2 |
| T8 (Vídeo/Logs) | 12 | 4 | 1 | 7 |
| Item 1 (Relatório) | 5 | 0 | 0 | 5 |
| Item 2 (Contrato) | 7 | 0 | 1 | 6 |
| Item 6 (Mascaramento) | 8 | 6 | 0 | 2 |
| Transversais (CAT) | 3 | 2 | 0 | 0 |

Ver detalhamento completo em `mapeamento-ca-testes.md`.

---

## 5. Mock vs Real — Análise de Fidelidade

### 5.1 `uploadApkToSauce` — mock de `global.fetch`

**Código (mobile-apk.js:121-132):** Usa `FormData`, `Blob`, `Buffer.from` para auth Basic.

**Mock (teste linha 44-54):** Substitui `global.fetch`, verifica URL, método, header Authorization, e body.

**Divergências:**
- `FormData` e `Blob` não são nativos no Node.js < 21. Em Node 18/20, o código em produção falharia com `ReferenceError: FormData is not defined`. O mock não expõe esse problema porque o fetch é substituído antes de chegar no `new FormData()`.
- O mock não verifica se `form.append` foi chamado com os argumentos corretos (payload com Blob, name).
- `Buffer.from(`${username}:${accessKey}`).toString('base64')` — o mock só verifica que o header começa com `Basic `, não valida o conteúdo base64.

**Risco:** ALTO. Código usa APIs Web (FormData, Blob) que exigem polyfill em Node. Teste não revela.

### 5.2 `downloadApkFromUrl` — mock de `global.fetch`

**Código (mobile-apk.js:190-192):** Usa `res.arrayBuffer()` e converte com `Buffer.from()`.

**Mock (teste linha 173-179):** Retorna `{ arrayBuffer: async () => Buffer.from('cached-apk') }`.

**Divergências:**
- `fetch` real retorna `ArrayBuffer`, não `Buffer`. `Buffer.from(arrayBuffer)` funciona, mas o mock retorna Buffer direto — nunca testa a conversão real.
- Caminho alternativo `requestBuffer` (linha 193-194) usa `http`/`https` nativo — completamente fora do mock.

**Risco:** MÉDIO. Caminho principal funciona. Caminho alternativo (`fetch: false`) nunca testado.

### 5.3 `captureAppiumLogs` — injeção de `fetch`

**Código (mobile-apk.js:108-124):** Usa `options.fetch || global.fetch` para chamar endpoint de log.

**Mock (teste linha 64-69):** Injeta fetch customizado que retorna `{ value: [{ timestamp, level, message }] }`.

**Divergências:**
- Appium real pode retornar formato diferente de log (ex: `{ value: { log: '...' } }` em versões antigas).
- `AbortSignal.timeout()` usado no código (linha 115) — mock ignora o signal.

**Risco:** BAIXO. Formato Appium é estável em versões recentes.

### 5.4 `captureLogcat` — injeção de `execFileSync`

**Código (mobile-recording.js:126-129):** Usa `execFileSync('adb', ['-s', deviceId, 'logcat', '-d'])`.

**Mock (teste linha 75-77):** Substitui `execFileSync` por função síncrona que retorna string.

**Divergências:**
- `execFileSync` real lança exceção se ADB não está no PATH. Mock nunca falha.
- Encoding e stdio options são passados mas mock os ignora.

**Risco:** MÉDIO. Teste não cobre ausência de ADB.

### 5.5 `convertWebmToMp4` — injeção de `spawnSync`

**Código (mobile-recording.js:97):** Usa `spawnSync('ffmpeg', [...])`.

**Mock (teste linha 89):** Injeta `spawnSync` que retorna `{ error: { code: 'ENOENT' } }`.

**Divergências:**
- Só testa ausência de ffmpeg. Conversão real (spawn bem-sucedido, exit 0) nunca testada.
- `spawnSync` real com timeout pode ter comportamento diferente.

**Risco:** MÉDIO. Caminho de sucesso não validado.

---

## 6. Performance — Medido vs Assumido

| CA | Claim | Status | Evidência |
|---|---|---|---|
| CA6.8 | Mascaramento ≤500ms (PNG 1MB) | ✅ Medido | Teste `redaction performance` (mobile-redaction-config.test.js:80) mede `durationMs` real de `process.hrtime.bigint()` |
| — | Parser XML <100ms (50KB) | ✅ Medido | Teste `parseElementsFromSource parses typical 50KB source under 100ms` (mobile-appium-client.test.js:237) |
| CA8.12 | Conversão ≤2× duração | ❌ Não medido | Sem teste de conversão real |
| CA1.4 | Relatório ≤60s (50 cenários) | ❌ Não medido | Fora do escopo do Core |
| RNF4.1 | Upload ≤5min (100MB, 50Mbps) | ❌ Não medido | Mock de fetch não mede tempo real |
| RNF8.1 | Conversão ≤2× duração | ❌ Não medido | Sem teste de ffmpeg |

**Conclusão:** Apenas 2 claims de performance são medidas. Demais são assumidas ou delegadas a ambiente externo.

---

## 7. Segurança — Verificação de Credenciais (CAT.3)

| Verificação | Resultado |
|---|---|
| `QA_PASSWORD` em logs de teste | ✅ Zero ocorrências |
| `MOBILE_FARM_ACCESS_KEY` em outputs | ✅ Redacted em todos os testes |
| `MOBILE_FARM_USERNAME` em outputs | ✅ Redacted em todos os testes |
| Credenciais em URL Appium | ✅ Bloqueado por `validateAppiumEndpointPolicy` |
| Hardcoded secrets no código | ✅ Nenhum encontrado |

Testes de redação cobrem `redact`, `redactLog`, `redactMobileLog`, `captureAppiumLogs`, `captureLogcat` — redundância positiva em segurança.

---

## 8. Funcionalidades Especificadas Não Implementadas

| ID | Funcionalidade | Especificação | Status |
|---|---|---|---|
| CA2.4 | `LIMIT_EXCEEDED` | RN do Item 2 | Não implementado |
| CA2.5 | Retry transiente | RN do Item 2 | Não implementado |
| CA8.11 | `videoConsentDocumented` | Tarefa 8 RN8.5 | Não implementado |
| CA8.9 | Farm interna skip de vídeo | Tarefa 8 | Provider aceito mas sem lógica de skip |
| CA4.12 | Integração APK → vídeo Sauce | Tarefa 4 | Sem implementação |

---

## 9. Conclusão

A suite de testes do BKPilot-Core tem 39 testes, todos passando, sem regressão. A cobertura de linha em 65.39% está abaixo do aceitável para um módulo core de pipeline de QA. Os gaps críticos são:

1. **`mobile-device-manager.js` sem testes** — 109 linhas de código de validação de dispositivo sem cobertura.
2. **`MobileAppiumClient` sem testes de instância** — ~300 linhas de métodos essenciais (startSession, screenshot, getState, interações) nunca exercitados em teste.
3. **`downloadSauceVideo` sem teste** — 46 linhas, função core para CA8.1/CA8.8/CA4.12.
4. **5 funcionalidades da especificação não implementadas** no código.
5. **Mock de `FormData`/`Blob`** esconde incompatibilidade com Node.js < 21.
6. **109 edge cases** sem cobertura (null, undefined, vazio, limites, unicode, path traversal).

Ver decisão final em `decisao-final.md`.
