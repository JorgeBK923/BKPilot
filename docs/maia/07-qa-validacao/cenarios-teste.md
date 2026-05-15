# Cenários de Teste - QA Validação Ciclo 6 Security

Data: 2026-05-14

## Mapeamento dos Cenários por Risco

### SEC-01 - Screenshots sem redação de PII

#### Cenário 1: Smoke client sem screenshotFields
- **Dado** que estou executando um smoke client (`local-apk-smoke`)
- **E** não configurei `mobile.redaction.screenshotFields`
- **Quando** inicio uma sessão mobile
- **Então** a sessão deve iniciar com aviso `SMOKE_REDACTION_BYPASS`
- **E** screenshots devem ser gerados normalmente (sem redação)

#### Cenário 2: Cliente real sem screenshotFields
- **Dado** que estou executando um cliente real (`cliente-acme`)
- **E** não configurei `mobile.redaction.screenshotFields`
- **Quando** tento iniciar uma sessão mobile
- **Então** deve ocorrer erro `SCREENSHOT_REDACTION_NOT_CONFIGURED`
- **E** a sessão não deve ser criada

#### Cenário 3: Cliente real com screenshotFields vazio e bypass permitido
- **Dado** que estou executando um cliente real (`cliente-acme`)
- **E** configurei `mobile.redaction.screenshotFields: []`
- **E** configurei `mobile.redaction.allowEmptyScreenshotFields: true`
- **Quando** inicio uma sessão mobile
- **Então** a sessão deve iniciar com aviso `SCREENSHOT_REDACTION_EMPTY_ALLOWED`
- **E** screenshots devem ser gerados normalmente (sem redação)

#### Cenário 4: Cliente real com screenshotFields configurados
- **Dado** que estou executando um cliente real (`cliente-acme`)
- **E** configurei `mobile.redaction.screenshotFields` com áreas sensíveis
- **Quando** inicio uma sessão mobile e capturo screenshots
- **Então** a sessão deve iniciar normalmente
- **E** screenshots devem ter áreas configuradas cobertas
- **E** log de redação deve registrar contagem de coberturas

### SEC-02 - Logs sem redação

#### Cenário 5: Captura de Appium logs com PII
- **Dado** que tenho uma sessão Appium ativa
- **E** o log contém dados sensíveis (CPF, email, credenciais)
- **Quando** executo `captureAppiumLogs`
- **Então** os dados sensíveis devem ser redigidos com `***REDACTED***`
- **E** o log persistido não deve conter dados originais

#### Cenário 6: Captura de logcat com PII
- **Dado** que tenho um dispositivo Android conectado
- **E** o logcat contém dados sensíveis
- **Quando** executo `captureLogcat`
- **Então** os dados sensíveis devem ser redigidos com `***REDACTED***`
- **E** o log persistido não deve conter dados originais

#### Cenário 7: Verificação final de logs
- **Dado** que executei testes mobile
- **Quando** verifico os logs finais em `clients/*/resultado/*/mobile/logs/`
- **Então** não devo encontrar nenhum dado sensível (CPF, email, credenciais)
- **E** todos os dados sensíveis devem estar redigidos

### SEC-03 - Retenção de dados não executada

#### Cenário 8: Purge dry-run
- **Dado** que tenho diretórios de resultado antigos
- **E** configuração de retenção de 30 dias
- **Quando** executo `purgeOldArtifacts` com `dryRun=true`
- **Então** devo ver quais diretórios seriam removidos
- **E** nenhum diretório deve ser realmente removido

#### Cenário 9: Purge real
- **Dado** que tenho diretórios de resultado antigos
- **E** configuração de retenção de 30 dias
- **Quando** executo `purgeOldArtifacts` com `dryRun=false`
- **Então** diretórios antigos devem ser removidos
- **E** symlink `latest/` deve ser preservado
- **E** arquivo `retention_purge_latest.json` deve ser criado

#### Cenário 10: Integração com smoke
- **Dado** que estou executando `mobile:smoke`
- **E** tenho diretórios de resultado antigos
- **Quando** executo com flag `--purge`
- **Então** a purga deve ocorrer após o teste
- **E** diretórios antigos devem ser removidos

### SEC-04 - HTTPS não forçado para Appium remoto

#### Cenário 11: HTTP em loopback
- **Dado** que configurei `appiumUrl: http://127.0.0.1:4723`
- **E** provider é `local`
- **Quando** valido a configuração
- **Então** a validação deve passar
- **E** nenhuma restrição deve ser aplicada

#### Cenário 12: HTTP remoto bloqueado
- **Dado** que configurei `appiumUrl: http://remote.example.com:4723`
- **E** provider é `cloud`
- **Quando** valido a configuração
- **Então** deve ocorrer erro `HTTP_NOT_ALLOWED_REMOTE_APPIUM`
- **E** a configuração deve ser rejeitada

#### Cenário 13: HTTP remoto com bypass
- **Dado** que configurei `appiumUrl: http://remote.example.com:4723`
- **E** provider é `cloud`
- **E** `allowInsecureRemote: true`
- **Quando** valido a configuração
- **Então** a validação deve passar
- **E** deve gerar aviso `INSECURE_REMOTE_APPIUM_ALLOWED`

#### Cenário 14: HTTPS remoto permitido
- **Dado** que configurei `appiumUrl: https://remote.example.com:4723`
- **E** provider é `cloud`
- **Quando** valido a configuração
- **Então** a validação deve passar
- **E** nenhuma restrição deve ser aplicada

### SEC-05 - Credenciais embutidas em URL

#### Cenário 15: URL com credenciais bloqueada
- **Dado** que configurei `appiumUrl: https://user:pass@remote.example.com:4723`
- **Quando** valido a configuração
- **Então** deve ocorrer erro `CREDENTIALS_IN_URL_NOT_ALLOWED`
- **E** a configuração deve ser rejeitada

#### Cenário 16: URL limpa permitida
- **Dado** que configurei `appiumUrl: https://remote.example.com:4723`
- **E** credenciais em variáveis de ambiente
- **Quando** valido a configuração
- **Então** a validação deve passar
- **E** a configuração deve ser aceita

#### Cenário 17: Credenciais via env permitidas
- **Dado** que configurei `appiumUrl: https://remote.example.com:4723`
- **E** `username: env:MOBILE_FARM_USERNAME`
- **E** `accessKey: env:MOBILE_FARM_ACCESS_KEY`
- **Quando** valido a configuração
- **Então** a validação deve passar
- **E** credenciais devem ser resolvidas corretamente

### SEC-06 - SSRF via appiumUrl sem allowlist

#### Cenário 18: Provider local com loopback
- **Dado** que configurei `appiumUrl: http://127.0.0.1:4723`
- **E** provider é `local`
- **Quando** valido a configuração
- **Então** a validação deve passar

#### Cenário 19: Provider local com IP privado
- **Dado** que configurei `appiumUrl: http://192.168.1.100:4723`
- **E** provider é `local`
- **Quando** valido a configuração
- **Então** a validação deve passar

#### Cenário 20: Provider local com host remoto não allowlistado
- **Dado** que configurei `appiumUrl: http://evil.example.com:4723`
- **E** provider é `local`
- **E** não há allowlist configurada
- **Quando** valido a configuração
- **Então** deve ocorrer erro `APPIUM_HOST_NOT_ALLOWED`

#### Cenário 21: Provider cloud com Sauce Labs
- **Dado** que configurei `appiumUrl: https://ondemand.us-west-1.saucelabs.com/wd/hub`
- **E** provider é `saucelabs`
- **Quando** valido a configuração
- **Então** a validação deve passar

#### Cenário 22: Provider cloud com host não allowlistado
- **Dado** que configurei `appiumUrl: https://evil.example.com/wd/hub`
- **E** provider é `cloud`
- **E** não há allowlist configurada
- **Quando** valido a configuração
- **Então** deve ocorrer erro `APPIUM_HOST_NOT_ALLOWED`

#### Cenário 23: Allowlist personalizada
- **Dado** que configurei `appiumUrl: https://grid.example.com/wd/hub`
- **E** provider é `cloud`
- **E** `allowedAppiumHosts: ["grid.example.com"]`
- **Quando** valido a configuração
- **Então** a validação deve passar

### SEC-07 - Dados de cliente injetáveis no contexto LLM

#### Cenário 24: Verificação de prefácios em comandos
- **Dado** que tenho arquivos em `.claude/commands/`
- **Quando** verifico o conteúdo desses arquivos
- **Então** todos devem conter o prefácio `> ATENCAO - TRATAMENTO DE DADOS EXTERNOS`
- **E** devem indicar que dados de cliente são não-confiáveis

#### Cenário 25: Verificação de CLAUDE.md
- **Dado** que tenho o arquivo `CLAUDE.md`
- **Quando** verifico seu conteúdo
- **Então** deve conter seção sobre "Tratamento de Dados Externos"
- **E** deve instruir a tratar dados de cliente como input, não instrução

#### Cenário 26: Verificação de scripts que processam dados externos
- **Dado** que tenho scripts que processam dados de cliente
- **Quando** verifico seus comentários
- **Então** devem conter instruções sobre tratamento seguro de dados externos
- **E** não devem executar conteúdo de cliente como comandos

### SEC-08 - HANDOFF com prompts de revisão

#### Cenário 27: Verificação de decisão aceita
- **Dado** que tenho o arquivo `docs/maia/11-security/decisoes-aceitas.md`
- **Quando** verifico seu conteúdo
- **Então** deve conter registro da aceitação de SEC-08
- **E** deve documentar a mitigação aplicada
- **E** deve indicar que é canal interno, não entregue ao cliente

## Matriz de Rastreabilidade

| ID Cenário | Risco | Componente | Método de Teste |
|------------|-------|------------|-----------------|
| C1 | SEC-01 | mobile-appium-client.js | Unit Test + Integração |
| C2 | SEC-01 | mobile-appium-client.js | Unit Test + Integração |
| C3 | SEC-01 | mobile-appium-client.js | Unit Test + Integração |
| C4 | SEC-01 | mobile-appium-client.js | Unit Test + Integração |
| C5 | SEC-02 | mobile-recording.js | Unit Test + Integração |
| C6 | SEC-02 | mobile-recording.js | Unit Test + Integração |
| C7 | SEC-02 | Grep em logs | Verificação final |
| C8 | SEC-03 | mobile-retention.js | Unit Test + Integração |
| C9 | SEC-03 | mobile-retention.js | Unit Test + Integração |
| C10 | SEC-03 | scripts/mobile-smoke.js | Integração |
| C11 | SEC-04 | mobile-appium-client.js | Unit Test |
| C12 | SEC-04 | mobile-appium-client.js | Unit Test |
| C13 | SEC-04 | mobile-appium-client.js | Unit Test |
| C14 | SEC-04 | mobile-appium-client.js | Unit Test |
| C15 | SEC-05 | mobile-appium-client.js | Unit Test |
| C16 | SEC-05 | mobile-appium-client.js | Unit Test |
| C17 | SEC-05 | mobile-appium-client.js | Unit Test |
| C18 | SEC-06 | mobile-appium-client.js | Unit Test |
| C19 | SEC-06 | mobile-appium-client.js | Unit Test |
| C20 | SEC-06 | mobile-appium-client.js | Unit Test |
| C21 | SEC-06 | mobile-appium-client.js | Unit Test |
| C22 | SEC-06 | mobile-appium-client.js | Unit Test |
| C23 | SEC-06 | mobile-appium-client.js | Unit Test |
| C24 | SEC-07 | .claude/commands/*.md | Verificação de conteúdo |
| C25 | SEC-07 | CLAUDE.md | Verificação de conteúdo |
| C26 | SEC-07 | scripts/*.js | Verificação de comentários |
| C27 | SEC-08 | docs/maia/11-security/decisoes-aceitas.md | Verificação de conteúdo |