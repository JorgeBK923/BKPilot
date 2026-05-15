# Plano de Testes - QA Validação Ciclo 6 Security

Data: 2026-05-14

## Objetivo
Validar tecnicamente as correções de segurança implementadas no Ciclo 6, conforme HANDOFF.md e risk-register.md.

## Escopo
Testar os 7 achados corrigidos (SEC-01 a SEC-07) + aceite documentado de SEC-08.

## Critérios de Aceitação
- Todos os testes devem passar
- Nenhuma credencial ou PII deve vazar em logs, screenshots ou outputs
- As políticas de segurança devem ser aplicadas corretamente
- A retenção de dados deve funcionar conforme configurado

## Casos de Teste

### SEC-01 - Screenshots sem redação de PII

**Pré-condições:**
- Cliente real configurado com `mobile.redaction.screenshotFields`
- Smoke client configurado

**Passos:**
1. Executar smoke client sem `screenshotFields` → deve permitir com aviso `SMOKE_REDACTION_BYPASS`
2. Executar cliente real sem `screenshotFields` → deve bloquear com `SCREENSHOT_REDACTION_NOT_CONFIGURED`
3. Executar cliente real com `screenshotFields` vazio e `allowEmptyScreenshotFields: true` → deve permitir com aviso
4. Executar cliente real com `screenshotFields` preenchido → deve funcionar normalmente

**Evidências esperadas:**
- Logs com aviso `SMOKE_REDACTION_BYPASS` para smoke clients
- Erro `SCREENSHOT_REDACTION_NOT_CONFIGURED` para cliente real sem configuração
- Screenshots gerados com áreas cobertas quando `screenshotFields` preenchido

### SEC-02 - Logs sem redação

**Pré-condições:**
- Logs contendo PII (CPF, email, credenciais)

**Passos:**
1. Executar `captureAppiumLogs` com conteúdo contendo PII → verificar redação antes de persistir
2. Executar `captureLogcat` com conteúdo contendo PII → verificar redação antes de persistir
3. Verificar logs finais em disco → não devem conter PII

**Evidências esperadas:**
- Logs capturados com `***REDACTED***` no lugar de dados sensíveis
- Nenhum match de PII nos logs finais (grep)
- Testes unitários passando

### SEC-03 - Retenção de dados não executada

**Pré-condições:**
- Diretórios de resultado com timestamps antigos
- Configuração de `retentionDays`

**Passos:**
1. Executar `purgeOldArtifacts` com `dryRun=true` → verificar quais diretórios seriam removidos
2. Executar `purgeOldArtifacts` com `dryRun=false` → verificar remoção real
3. Verificar que `latest/` symlink nunca é removido
4. Executar `mobile:smoke --purge` → verificar integração

**Evidências esperadas:**
- Diretórios antigos removidos corretamente
- `latest/` symlink preservado
- Arquivo `retention_purge_latest.json` com registro das remoções
- Testes unitários passando

### SEC-04 - HTTPS não forçado para Appium remoto

**Pré-condições:**
- Configurações de `appiumUrl` variadas (HTTP/HTTPS, loopback/remoto)

**Passos:**
1. Testar `appiumUrl` HTTP em loopback → deve permitir
2. Testar `appiumUrl` HTTP remoto → deve bloquear com `HTTP_NOT_ALLOWED_REMOTE_APPIUM`
3. Testar `appiumUrl` HTTP remoto com `allowInsecureRemote: true` → deve permitir com aviso
4. Testar `appiumUrl` HTTPS remoto → deve permitir

**Evidências esperadas:**
- Bloqueio correto de HTTP remoto
- Permissão de HTTP em loopback
- Aviso `INSECURE_REMOTE_APPIUM_ALLOWED` quando bypass usado
- Testes unitários passando

### SEC-05 - Credenciais embutidas em URL

**Pré-condições:**
- URLs com credenciais embutidas

**Passos:**
1. Testar `appiumUrl` com `user:pass@host` → deve bloquear com `CREDENTIALS_IN_URL_NOT_ALLOWED`
2. Testar `appiumUrl` sem credenciais → deve permitir
3. Testar uso de `env:` para credenciais → deve permitir

**Evidências esperadas:**
- Bloqueio correto de URLs com credenciais embutidas
- Permissão de URLs limpas
- Permissão de variáveis de ambiente para credenciais
- Testes unitários passando

### SEC-06 - SSRF via appiumUrl sem allowlist

**Pré-condições:**
- URLs variadas para `appiumUrl`

**Passos:**
1. Testar provider `local` com host loopback → deve permitir
2. Testar provider `local` com IP privado → deve permitir
3. Testar provider `local` com host remoto não allowlistado → deve bloquear
4. Testar provider `cloud` com Sauce Labs → deve permitir
5. Testar provider `cloud` com host não allowlistado → deve bloquear
6. Testar com `allowedAppiumHosts` personalizado → deve respeitar allowlist

**Evidências esperadas:**
- Bloqueio correto de hosts não permitidos
- Permissão de hosts seguros (loopback, IPs privados, Sauce)
- Respeito à allowlist personalizada
- Testes unitários passando

### SEC-07 - Dados de cliente injetáveis no contexto LLM

**Pré-condições:**
- Arquivos de comando com prefácios de segurança
- Arquivos de configuração com conteúdo potencialmente malicioso

**Passos:**
1. Verificar que todos os `.claude/commands/*.md` têm o prefácio anti-injection
2. Verificar que `CLAUDE.md` tem a seção de tratamento de dados externos
3. Verificar que scripts que processam dados externos têm comentários de segurança
4. Verificar que dados de cliente são tratados como input, não como instrução

**Evidências esperadas:**
- Prefácio `> ATENCAO - TRATAMENTO DE DADOS EXTERNOS` em todos os comandos
- Seção em `CLAUDE.md` sobre tratamento de dados externos
- Comentários de segurança nos scripts relevantes
- Nenhum dado de cliente sendo executado como comando

### SEC-08 - HANDOFF com prompts de revisão

**Pré-condições:**
- Documento de decisão aceita em `docs/maia/11-security/decisoes-aceitas.md`

**Passos:**
1. Verificar conteúdo de `docs/maia/11-security/decisoes-aceitas.md`
2. Confirmar que SEC-08 está marcado como aceito
3. Verificar que mitigação está documentada

**Evidências esperadas:**
- Documento de decisões aceitas existente
- SEC-08 marcado como aceito
- Mitigação claramente documentada

## Validações Técnicas

### Core Tests
- `npm test` no BKPilot-Core → todos os 39 testes devem passar
- `node --check` em todos os scripts alterados → exit 0

### Grep de Credenciais
- `grep -r "QA_PASSWORD\|MOBILE_FARM_ACCESS_KEY\|MOBILE_FARM_USERNAME\|cpf\|email" clients/*/resultado/*/mobile/logs/` → zero matches

### Mobile Doctors
- `mobile:doctor` em todos os smoke clients → schema e políticas novas devem passar

### Versionamento
- Core publicado como `v0.2.5`
- Producao e Comercial atualizados para usar `@bugkillers/bkpilot-core#v0.2.5`

## Aprovação Técnica

A saída é aprovada tecnicamente quando:
- [ ] Todos os casos de teste acima passam
- [ ] Nenhuma credencial ou PII vaza
- [ ] As políticas de segurança estão corretamente implementadas
- [ ] A documentação necessária está completa
- [ ] Os testes unitários passam (39/39)
- [ ] O código não tem erros de sintaxe (`node --check`)
- [ ] Não há vazamento de credenciais/PII nos logs