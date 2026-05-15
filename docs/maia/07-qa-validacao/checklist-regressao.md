# Checklist de Regressão - QA Validação Ciclo 6 Security

Data: 2026-05-14

## Objetivo
Garantir que as correções de segurança implementadas não quebraram funcionalidades existentes e que todos os aspectos de segurança foram validados.

## Checklist de Regressão Mínima

### Funcionalidades Core Não Afetadas

#### [ ] Navegação e Autenticação
- [ ] Login via `--login` continua funcionando
- [ ] Re-autenticação automática em caso de sessão expirada
- [ ] Navegação por páginas do sistema
- [ ] Manipulação de cookies/sessão

#### [ ] Captura de Evidências
- [ ] Screenshots são gerados corretamente
- [ ] Vídeos são gravados e convertidos
- [ ] Console logs são capturados
- [ ] Network logs são capturados

#### [ ] Integração com Appium
- [ ] Criação de sessão Appium
- [ ] Comandos básicos (tap, type, swipe, back)
- [ ] Captura de estado da aplicação
- [ ] Localizadores funcionam corretamente

#### [ ] Configuração de Clientes
- [ ] `clients/<id>/.env` é lido corretamente
- [ ] `clients/<id>/config.json` é interpretado
- [ ] `clients/<id>/login.js` executa normalmente
- [ ] Variáveis de ambiente são resolvidas

### Validações de Segurança

#### [ ] SEC-01 - Screenshots sem redação de PII
- [ ] Smoke clients podem bypassar redação com aviso auditável
- [ ] Clientes reais exigem `screenshotFields` configurados
- [ ] `allowEmptyScreenshotFields: true` permite bypass controlado
- [ ] Áreas configuradas são cobertas em screenshots reais

#### [ ] SEC-02 - Logs sem redação
- [ ] Appium logs passam por `redactLog()` e `redactText()`
- [ ] Logcat logs passam por `redactLog()` e `redactText()`
- [ ] Nenhum dado sensível persiste em logs finais
- [ ] Testes unitários validam redação correta

#### [ ] SEC-03 - Retenção de dados
- [ ] `purgeOldArtifacts()` remove diretórios antigos corretamente
- [ ] `latest/` symlink nunca é removido
- [ ] `mobile:smoke --purge` integra purga automaticamente
- [ ] Configuração `retentionDays` é respeitada

#### [ ] SEC-04 - HTTPS não forçado para Appium remoto
- [ ] HTTP permitido em loopback (127.0.0.1, localhost)
- [ ] HTTP bloqueado para hosts remotos
- [ ] `allowInsecureRemote: true` permite bypass auditável
- [ ] HTTPS sempre permitido

#### [ ] SEC-05 - Credenciais embutidas em URL
- [ ] URLs com `user:pass@host` são bloqueadas
- [ ] Credenciais via `env:` funcionam corretamente
- [ ] `.env` do cliente é lido para credenciais
- [ ] Nenhuma credencial aparece em logs ou erros

#### [ ] SEC-06 - SSRF via appiumUrl sem allowlist
- [ ] Provider `local` aceita loopback e IPs privados
- [ ] Provider `cloud` aceita Sauce Labs por padrão
- [ ] Hosts não allowlistados são bloqueados
- [ ] `allowedAppiumHosts` personalizável funciona

#### [ ] SEC-07 - Dados de cliente injetáveis no contexto LLM
- [ ] Todos `.claude/commands/*.md` têm prefácio de segurança
- [ ] `CLAUDE.md` tem seção de tratamento de dados externos
- [ ] Scripts que processam dados externos têm comentários
- [ ] Nenhum dado de cliente é executado como comando

#### [ ] SEC-08 - HANDOFF com prompts de revisão
- [ ] `docs/maia/11-security/decisoes-aceitas.md` existe
- [ ] SEC-08 está documentado como aceito
- [ ] Mitigação está claramente especificada

### Testes Técnicos

#### [ ] Core Tests
- [ ] `npm test` no BKPilot-Core → 39/39 passando
- [ ] `node --check` em todos os arquivos alterados → exit 0

#### [ ] Grep de Credenciais/PII
- [ ] `grep -r "QA_PASSWORD\|MOBILE_FARM_ACCESS_KEY\|MOBILE_FARM_USERNAME\|cpf\|email" clients/*/resultado/*/mobile/logs/` → matches=0

#### [ ] Mobile Doctors
- [ ] `mobile:doctor` em smoke clients → schema e políticas novas passam
- [ ] Avisos ambientais são esperados e documentados

#### [ ] Versionamento
- [ ] Core publicado como `v0.2.5`
- [ ] Producao e Comercial atualizados para `@bugkillers/bkpilot-core#v0.2.5`
- [ ] Imports verificados e funcionando

### Evidências Obrigatórias

#### [ ] Console e Network Logs
- [ ] `clients/<id>/resultado/<timestamp>/console_log.json` existe e não-vazio
- [ ] `clients/<id>/resultado/<timestamp>/network_log.json` existe e não-vazio
- [ ] Nenhum erro de console contém credenciais
- [ ] Nenhuma requisição com erro 4xx/5xx contém credenciais

#### [ ] Artefatos de Redação
- [ ] `clients/<id>/resultado/<timestamp>/mobile/redaction_log.json` existe
- [ ] Contém apenas contagens, nunca valores originais
- [ ] Registra coberturas de screenshots e XML

#### [ ] Artefatos de Retenção
- [ ] `clients/<id>/resultado/<timestamp>/retention_purge_latest.json` existe (se purga executada)
- [ ] Registra quais diretórios foram removidos
- [ ] `latest/` symlink permanece intacto

#### [ ] Evidências Visuais
- [ ] Screenshots gerados para cada cenário executado
- [ ] Vídeos gerados quando configurado
- [ ] Nenhum dado sensível visível nas evidências
- [ ] Áreas configuradas cobertas em screenshots

### Integração com Pipeline

#### [ ] Próximos Passos Documentados
- [ ] `/reportar-bug` é o próximo comando sugerido
- [ ] Caminho para `clients/<id>/resultado/latest/` está claro
- [ ] Estrutura de artefatos segue padrão multi-tenant

#### [ ] Artefatos Gerados
- [ ] `clients/<id>/resultado/<timestamp>/` contém todos os artefatos
- [ ] `clients/<id>/resultado/latest/` aponta para execução correta
- [ ] Nenhum artefato sensível foi persistido

## Critérios de Aceitação Final

A regressão mínima é aprovada quando:
- [ ] Todos os itens acima estão verdes
- [ ] Nenhum item crítico está vermelho
- [ ] Avisos ambientais são esperados e documentados
- [ ] Nenhuma funcionalidade existente foi quebrada
- [ ] Todas as correções de segurança estão funcionando
- [ ] Documentação necessária está completa e correta