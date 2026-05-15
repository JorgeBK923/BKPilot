# HANDOFF — BKPilot-Producao (Ciclo 5 — Tripla Revisão MAIA)

**Data:** 2026-05-14
**Origem:** Claude
**Destinos:** **3 LLMs paralelos**, cada um com escopo isolado.
**Fluxo MAIA:** `12-maia-code-validator` + `07-maia-qa-validacao` + `11-maia-security`
**Escopo:** revisão de todo código entregue por Codex nos Ciclos 1–4 antes de avançar para release.

Ciclos anteriores arquivados em `docs/maia/handoffs/`.

---

## Contexto

- Codex entregou: T5 (hardening Core), T7 (parser XML), T6 (mascaramento), T2 (contrato cliente), T1 (skill relatório), T8 (vídeo+logs, remediado), T4 (APK + farm).
- Codex **não pode revisar** o próprio código.
- 3 revisões independentes executadas em paralelo, cada uma com LLM distinto, focada em uma lente.
- Saídas são **somente relatórios** — nenhuma LLM revisora pode escrever/alterar código.

---

## Atribuições

| Revisão | Skill MAIA | LLM | Foco |
|---|---|---|---|
| **Validação de código** | `12-maia-code-validator` | **DeepSeek V4 Pro** | Sintaxe, contratos, escopo, alucinação, regressão |
| **QA-validação** | `07-maia-qa-validacao` | **qwen3-coder** | Cobertura, edge cases, cenários faltantes, regressão de teste |
| **Revisão segurança** | `11-maia-security` | **GLM-5.1** | Credenciais, LGPD, endpoints, dependências, IA agents |

---

## Escopo de código a revisar

### `BKPilot-Core` (todos os módulos mobile)
- `mobile-appium-client.js`
- `mobile-device-manager.js`
- `mobile-mcp.js`
- `mobile-redaction.js`
- `mobile-config.js`
- `mobile-recording.js`
- `mobile-apk.js`
- `index.js` (contrato de exports)
- `package.json` (versão 0.2.4)
- `test/*.test.js` (todos)
- `test/fixtures/*`

### `BKPilot-Producao` (scripts integração)
- `scripts/mobile-smoke.js`
- `scripts/mobile-doctor.js`
- `scripts/gerar-relatorio-final-mobile.js`
- `novo-cliente.sh`
- `clients/local-usb-smoke/config.json`
- `clients/sauce-mobile-smoke/config.json`
- `clients/local-apk-smoke/config.json`
- `clients/sauce-apk-smoke/config.json`
- `.claude/commands/gerar-relatorio-final-mobile.md`

### `BKPilot-Comercial`
- `package.json` (dep Core v0.2.4)
- Wrappers `scripts/lib/mobile-*.js` (devem espelhar Producao)

---

## Restrições comuns (TODAS as 3 LLMs)

- **NUNCA** escrever, editar ou criar código.
- **NUNCA** rodar `git commit`, `git push`, npm install, ou qualquer comando destrutivo.
- Apenas leitura + execução de validação (npm test, node --check, grep).
- **NUNCA** expor credenciais encontradas — mascarar valores na resposta.
- **NUNCA** marcar APROVADO sem citar evidência concreta (arquivo:linha).
- Se faltar contexto, registrar como dúvida — não inventar.

---

## Saídas esperadas por revisão

Cada LLM gera **somente** sua skill em `docs/maia/`:

### DeepSeek V4 Pro → `docs/maia/12-code-validator/`
- `relatorio-validacao-codigo.md`
- `escopo-validado.md`
- `contratos-quebrados.md` (se houver)
- `alucinacoes-detectadas.md` (se houver)
- `decisao-final.md` (APROVADO / APROVADO COM RESSALVAS / BLOQUEADO)

### qwen3-coder → `docs/maia/07-qa-validacao/`
- `relatorio-qa-validacao.md`
- `cobertura-testes.md` (cobertura linha/branch/função por módulo)
- `cenarios-faltantes.md`
- `edge-cases-nao-cobertos.md`
- `decisao-final.md`

### GLM-5.1 → `docs/maia/11-security/`
- `relatorio-security.md`
- `risk-register.md`
- `secrets-audit.md`
- `lgpd-checklist.md`
- `dependency-audit.md`
- `decisao-final.md`

---

## Comandos de chamada (cole o respectivo no LLM)

### Para DeepSeek V4 Pro — Validação de código

```text
Leia docs/maia-skill-pack/skills/12-maia-code-validator/maia-code-validator.md e siga literalmente.

Tarefa: validar tecnicamente TODO o código entregue por Codex nos Ciclos 1-4 do BKPilot-Producao. Codex escreveu este código; você revisa de fora.

Escopo de leitura:
- BKPilot-Core: mobile-appium-client.js, mobile-device-manager.js, mobile-mcp.js, mobile-redaction.js, mobile-config.js, mobile-recording.js, mobile-apk.js, index.js, package.json, test/*.test.js
- BKPilot-Producao: scripts/mobile-smoke.js, scripts/mobile-doctor.js, scripts/gerar-relatorio-final-mobile.js, novo-cliente.sh, clients/*/config.json
- BKPilot-Comercial: package.json, scripts/lib/mobile-*.js

Validar:
1. Escopo: alterações dentro do que foi pedido em cada HANDOFF (ver docs/maia/handoffs/).
2. Sintaxe: rodar `node --check` em cada .js novo/alterado. Listar exit codes.
3. Contratos: exports do Core (mobileAppium, mobileDeviceManager, mobileMcp, mobileRedaction, mobileConfig, mobileRecording, mobileApk) preservados.
4. Imports: nenhum quebrado.
5. Testes: rodar `npm test` no Core. Citar contagem (passa/falha/skip).
6. Alucinação: verificar se funções/módulos/comandos citados nos resumos existem de fato.
7. Regressão: comparar com tags v0.2.1, v0.2.2, v0.2.3, v0.2.4 — não houve renomeação silenciosa.
8. Código morto: identificar exports não usados, vars não usadas.

Restrições:
- NÃO altere código. Apenas leia.
- NÃO rode git/npm install/comandos destrutivos.
- Mascare credenciais se encontrar.

Saídas em docs/maia/12-code-validator/:
- relatorio-validacao-codigo.md
- escopo-validado.md
- contratos-quebrados.md (se houver)
- alucinacoes-detectadas.md (se houver)
- decisao-final.md (APROVADO / APROVADO COM RESSALVAS / BLOQUEADO + justificativa)

Referência: docs/maia/handoffs/ contém escopo de cada Ciclo.
```

### Para qwen3-coder — QA-validação

```text
Leia docs/maia-skill-pack/skills/07-maia-qa-validacao/SKILL.md e siga literalmente.

Tarefa: validar cobertura de teste e cenários do código entregue por Codex nos Ciclos 1-4 do BKPilot-Producao.

Escopo:
- BKPilot-Core/test/*.test.js (toda a suite)
- Funções públicas em BKPilot-Core/*.js
- Comandos do BKPilot-Producao: mobile:smoke, mobile:doctor, mobile:report
- Especificações em docs/maia/02-especificacao/ (compare CAs Given/When/Then com testes existentes)

Validar:
1. Cobertura: rodar `node --test --experimental-test-coverage` no Core. Citar % linha/branch/função por módulo.
2. CAs cobertos: para cada CA (CA4.1-CA4.13 em tarefa-4-apk-farm.md; CA8.1-CA8.12 em tarefa-8-video-logs.md; CA1.x/CA2.x/CA6.x em criterios-aceite.md), apontar se há teste correspondente.
3. Edge cases: identificar entradas não testadas (null, undefined, vazio, > limite, < 0, unicode, etc.).
4. Regressão: testes do Ciclo 1 ainda passam após mudanças do Ciclo 4? Confirmar.
5. Cenários faltantes: listar funcionalidades sem teste algum.
6. Mocks vs real: testes que mockam fetch/spawn — são fiéis ao comportamento real?
7. Performance: testes citam tempos (ex: parser <100ms, redaction <500ms). Foram medidos ou só assumidos?

Restrições:
- NÃO altere código nem testes. Apenas leia e analise.
- NÃO rode git/npm install.
- Pode rodar `npm test` e `node --test --experimental-test-coverage`.

Saídas em docs/maia/07-qa-validacao/:
- relatorio-qa-validacao.md
- cobertura-testes.md (tabela por módulo)
- cenarios-faltantes.md
- edge-cases-nao-cobertos.md
- decisao-final.md (APROVADO / APROVADO COM RESSALVAS / BLOQUEADO + justificativa)
```

### Para GLM-5.1 — Revisão de segurança

```text
Leia docs/maia-skill-pack/skills/11-maia-security/maia-security.md e siga literalmente.

Tarefa: revisão de segurança completa do código entregue por Codex nos Ciclos 1-4 do BKPilot-Producao.

Escopo:
- TODO código JS em BKPilot-Core e BKPilot-Producao
- Arquivos .env.example (NÃO ler .env reais)
- clients/*/config.json (verificar se credenciais não estão hardcoded)
- package.json (dependências)
- .claude/commands/*.md
- scripts/ (shell scripts)

Avaliar conforme escopo da skill:
1. Credenciais e segredos: hardcoded? Em log? Em prints/relatórios?
2. Dados sensíveis e LGPD: redaction efetiva? CPF/email/telefone mascarados antes de persistir?
3. Autenticação/autorização: endpoints de Sauce/farm interna usam basic auth correto?
4. APIs/webhooks: rate limit, validação payload, exposição de mensagem de erro?
5. Dependências: `npm audit` no Core. Listar high/critical.
6. Infraestrutura: VPS/Docker/Nginx — pular se não houver código relevante neste ciclo.
7. Segurança em agentes IA: HANDOFF.md expõe prompt mestre? Skills MAIA têm prompt injection risk?
8. Logs/evidências: grep recursivo por `QA_PASSWORD|MOBILE_FARM_USERNAME|MOBILE_FARM_ACCESS_KEY` em clients/*/resultado/. Deve retornar zero.

Restrições:
- NUNCA exiba tokens/senhas completos. Mascare valores encontrados.
- NÃO altere código.
- NÃO rode git/npm install.
- Pode rodar `npm audit`, grep, ls.

Saídas em docs/maia/11-security/:
- relatorio-security.md (resumo executivo)
- risk-register.md (tabela: ID, Risco, Severidade, Onde ocorre, Impacto, Correção)
- secrets-audit.md
- lgpd-checklist.md
- dependency-audit.md
- decisao-final.md (APROVADO / APROVADO COM RESSALVAS / BLOQUEADO)
- ações em 3 grupos: corrigir agora / corrigir antes de produção / melhorias futuras

Severidade: Crítico / Alto / Médio / Baixo conforme skill.
Bloqueio: existe risco Crítico ou Alto aberto.
```

---

## Após as 3 revisões

Cada LLM produz `decisao-final.md`. Consolidar em:

- Todas APROVADAS → release autorizado.
- Alguma BLOQUEADO → Codex remedia pontos específicos (handoff de remediação).
- APROVADO COM RESSALVAS → triagem manual.

---

## Pendências fora deste ciclo

- **T1** iteração futura (segunda atividade conforme plano).
- **T2, T3** bloqueadas.
- **T4** futuro (não, T4 entregue Ciclo 4 — mas iteração futura paralelo).
- **T9** E2E completo (próximo após revisões aprovadas).
- **T10** Adaptador farm interna (espera farm subir).
- **R3** ambiente USB (manual).
- **Governança operacional** (donos, matriz, checklist go/no-go).
