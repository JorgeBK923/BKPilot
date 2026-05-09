# Resumo da sessao - BKPilot Mobile Appium MCP

## Objetivo da sessao

Criar a base mobile do BKPilot para testar:

1. sistemas web abertos em navegador real de celular;
2. APKs/apps nativos em celulares ou device farms.

A decisao principal foi usar Appium para tudo que roda em device real ou device farm. Playwright continua apenas no fluxo web atual do BKPilot.

## Decisoes tomadas

### 1. Separacao entre mobile web e mobile APK

Foram criadas skills separadas para evitar confusao operacional:

Web mobile:

- `/explorar-mobile-web`
- `/gerar-cenarios-mobile-web`
- `/testar-modulo-mobile-web`
- `/executar-planilha-mobile-web`

APK/app nativo:

- `/explorar-mobile-apk`
- `/gerar-cenarios-mobile-apk`
- `/testar-modulo-mobile-apk`
- `/executar-planilha-mobile-apk`

Motivo: web mobile e APK usam Appium, mas os riscos, seletores, fluxos e evidencias sao diferentes.

### 2. Appium obrigatorio na camada mobile

Foi decidido que:

- mobile web em celular real usa Appium;
- APK/app nativo usa Appium;
- device farm online usa Appium/WebDriver remoto;
- Playwright nao entra na camada mobile.

### 3. Comercial e Producao devem usar as mesmas skills

As skills mobile devem estar disponiveis no BKPilot Comercial e no BKPilot Producao.

A logica reutilizavel deve ir futuramente para `@bugkillers/bkpilot-core`.

Este repositorio fica com:

- skills;
- regras operacionais;
- integracoes especificas de Producao.

## Skills criadas

As 8 skills foram criadas como fonte canonica em:

```text
src/
```

Arquivos:

```text
src/explorar-mobile-web.md
src/explorar-mobile-apk.md
src/gerar-cenarios-mobile-web.md
src/gerar-cenarios-mobile-apk.md
src/testar-modulo-mobile-web.md
src/testar-modulo-mobile-apk.md
src/executar-planilha-mobile-web.md
src/executar-planilha-mobile-apk.md
```

Depois foram distribuidas pelo conversor para:

```text
dist/claude/
dist/codex/
dist/opencode/
.claude/commands/
```

Importante: o projeto ja tinha um conversor multi-target. A fonte correta e `src/`, nao editar tres agentes manualmente.

Comando usado para gerar distribuicoes:

```bash
node converter/render.js --build-all
```

## Conversor multi-target

Foi confirmado que o projeto usa:

```text
converter/
```

para transformar uma unica skill canonica em distribuicoes para:

- Claude;
- Codex;
- OpenCode.

Foi atualizado:

```text
converter/tools_map.yaml
```

para reconhecer o contrato mobile:

- `mobile.startSession`
- `mobile.getState`
- `mobile.tap`
- `mobile.type`
- `mobile.swipe`
- `mobile.back`
- `mobile.waitFor`
- `mobile.captureEvidence`
- `mobile.endSession`

## MCP Mobile/Appium

Foi implementado um servidor MCP local:

```text
scripts/mobile-mcp-server.js
```

Ele roda por stdio. Ou seja, ele nao precisa de porta propria.

Quem precisa de porta e o Appium Server, normalmente:

```text
http://127.0.0.1:4723
```

O MCP foi registrado em:

```text
.claude/settings.json
```

Servidor:

```json
"mobile": {
  "command": "node",
  "args": ["scripts/mobile-mcp-server.js"]
}
```

Script npm criado:

```bash
npm run mobile:mcp
```

## Cliente Appium reutilizavel

A logica comum foi extraida para:

```text
scripts/lib/mobile-appium-client.js
```

Essa camada e usada por:

- MCP Mobile;
- smoke test mobile.

Ela prepara a futura migracao para `@bugkillers/bkpilot-core`.

## Device Manager

Foi criado:

```text
scripts/lib/mobile-device-manager.js
```

Para Android local/USB, ele deve:

- listar devices via `adb devices`;
- identificar fisico/emulador;
- validar se o device esta autorizado;
- bloquear se houver multiplos devices sem selecao;
- validar bateria minima;
- validar tela acordada quando possivel;
- validar Chrome instalado para mobile web.

Para device farm online, a validacao acontece pela criacao de sessao remota.

## Smoke test mobile

Foi criado:

```text
scripts/mobile-smoke.js
```

Script npm:

```bash
npm run mobile:smoke
```

Como o PowerShell pode bloquear `npm.ps1`, tambem funciona direto:

```bash
node scripts/mobile-smoke.js --cliente acme --target web
```

Para APK:

```bash
node scripts/mobile-smoke.js --cliente acme --target apk --app clients/acme/app/app-release.apk
```

O smoke:

- le `clients/<id>/config.json`;
- valida Appium `/status`;
- valida device local quando `provider` e `local`;
- cria sessao Appium;
- abre URL no web mobile;
- captura screenshot;
- salva source XML;
- salva state JSON;
- encerra sessao;
- gera relatorio.

Relatorio:

```text
clients/<id>/resultado/<timestamp>/mobile/reports/mobile_smoke_report.json
```

O smoke tambem evita falso positivo:

- rejeita `about:blank`;
- rejeita source sem elementos;
- rejeita APK preso no launcher quando detectavel.

## Estrutura de evidencias mobile

O padrao antigo continua:

```text
clients/<id>/resultado/<timestamp>/screenshots/
clients/<id>/resultado/<timestamp>/videos/
```

Foi adicionada estrutura mobile:

```text
clients/<id>/resultado/<timestamp>/mobile/
  screenshots/
  sources/
  logs/
  states/
  reports/
```

Na Release Tecnica 0.1, evidencias obrigatorias:

- screenshot;
- source XML;
- state JSON.

Video ficou como best-effort.

## Contrato forte do `mobile.getState`

`mobile.getState` foi tratado como a ferramenta mais importante.

Ele deve retornar:

- `sessionId`;
- `target`;
- `provider`;
- `platform`;
- `udid`;
- `context`;
- `contexts`;
- `url`;
- `activity`;
- `orientation`;
- `screenName`;
- `elements`;
- `locatorCandidates`;
- `evidence.screenshot`;
- `evidence.source`;
- `rawPath`.

Importante: screenshot e auxiliar. A fonte confiavel para automacao e a arvore de elementos do Appium.

Para reduzir custo e contexto, `getState` agora retorna payload compacto por padrao:

- top-K elementos relevantes;
- XML completo salvo em arquivo;
- state completo salvo em arquivo.

Para diagnostico completo:

```json
{
  "includeAll": true
}
```

## Config amigavel e capabilities reais

O QA pode usar config simples:

```json
{
  "mobile": {
    "target": "web",
    "platform": "android",
    "device": "R58N123ABC",
    "browser": "chrome",
    "baseUrl": "https://app.cliente.com"
  }
}
```

O MCP converte internamente para capabilities Appium:

```json
{
  "platformName": "Android",
  "browserName": "Chrome",
  "appium:automationName": "UiAutomator2",
  "appium:udid": "R58N123ABC"
}
```

Para Android fisico, `udid` e o campo principal.

`deviceName` fica opcional/descritivo.

## Modos de execucao

Foram definidos tres modos:

```text
observe
explore
execute
```

`observe`:

- apenas le estado;
- captura evidencias;
- bloqueia tap/type/swipe/back.

`explore`:

- permite navegacao;
- bloqueia acoes destrutivas sem confirmacao.

`execute`:

- usado para executar roteiro/cenario;
- permite acoes com maior controle.

Exemplos:

```bash
/explorar-mobile-web --cliente acme --mode explore
/testar-modulo-mobile-apk --cliente acme --mode execute
```

## Seguranca operacional

Foi definido:

- web mobile sem `allowedUrls`: permitido com warning;
- APK com `appPackage` sem `allowedAppPackages`: bloqueado;
- tokens, senhas, access keys e secrets devem sofrer redaction;
- campos sensiveis por cliente podem ser declarados em `mobile.sensitiveFields`;
- acoes destrutivas sao bloqueadas fora de `execute` ou sem confirmacao.

Exemplos de acoes destrutivas:

- excluir;
- enviar;
- aprovar;
- finalizar;
- cancelar;
- confirmar pagamento;
- alterar senha.

## Device farm online

Foi decidido preparar o BKPilot para qualquer farm online compativel com Appium/WebDriver, nao apenas Sauce Labs.

Exemplos de providers possiveis:

- Sauce Labs;
- BrowserStack;
- LambdaTest;
- Kobiton;
- Appium Grid proprio.

A configuracao generica usa:

```json
{
  "mobile": {
    "provider": "cloud",
    "target": "web",
    "appiumUrl": "https://hub.exemplo-device-farm.com/wd/hub",
    "username": "env:MOBILE_FARM_USERNAME",
    "accessKey": "env:MOBILE_FARM_ACCESS_KEY",
    "baseUrl": "https://app.cliente.com",
    "capabilities": {
      "platformName": "Android",
      "browserName": "Chrome",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "Android Device"
    },
    "options": {
      "vendor:options": {
        "projectName": "BKPilot",
        "buildName": "mobile-web-smoke"
      }
    }
  }
}
```

Na Release Tecnica 0.1, device farm fica experimental ate passar smoke real em pelo menos um provider.

## Upload automatico de APK para farm

Foi decidido que isso NAO fica para Release 0.2.

Release Tecnica 0.1 deve suportar:

1. APK remoto ja enviado ao provider;
2. APK local com upload automatico.

Exemplo de APK remoto:

```json
{
  "mobile": {
    "provider": "cloud",
    "target": "apk",
    "app": "storage:app-release.apk"
  }
}
```

Exemplo de APK local com upload automatico:

```json
{
  "mobile": {
    "provider": "saucelabs",
    "target": "apk",
    "app": "clients/acme/app/app-release.apk",
    "allowExternalUpload": true
  }
}
```

Foi definido o componente:

```text
Mobile Farm Upload Manager
  -> uploadApp(provider, apkPath, config)
  -> remoteAppId
```

Regras:

- se `app` ja for remoto, nao faz upload;
- se `app` for local e provider for cloud, exige `allowExternalUpload: true`;
- calcula hash do APK;
- envia usando adaptador do provider;
- retorna `remoteAppId`;
- usa `remoteAppId` em `appium:app`;
- salva `mobile/reports/mobile_upload_report.json`;
- se o provider nao tiver adaptador, falha com erro claro pedindo app remoto ja existente.

Importante: upload de APK nao e padronizado pelo Appium. Cada farm tem sua propria API.

## VPS sem GPU

Foi discutido que a VPS atual nao tem GPU.

Conclusao:

- nao vale tentar emular Android pesado nessa VPS;
- a VPS pode ser orquestradora;
- o executor pode ser device farm online;
- ou um host fisico com celular USB conectado.

Arquitetura recomendada para host fisico:

```text
VPS BKPilot
  -> MCP mobile
  -> Appium remoto via VPN
  -> mini PC/notebook com celular USB
```

Arquitetura recomendada para farm:

```text
VPS BKPilot
  -> MCP mobile
  -> Appium/WebDriver remoto do farm
  -> device real/emulador do provider
```

## Video

Foi discutido se video deveria sair da Release 0.1.

Decisao final:

- video nao foi removido da visao do produto;
- mas na Release Tecnica 0.1 ele e best-effort;
- evidencia obrigatoria e screenshot + source XML + state JSON;
- video depende do device/provider;
- farm online pode fornecer video por API propria no futuro.

Motivo: video em Appium varia muito entre Android local, web mobile e farms online.

## Skill Runner

Foi registrado que as skills mobile nao criam um runner paralelo.

O modelo continua:

```text
src/*.md
  -> converter/
  -> dist/claude
  -> dist/codex
  -> dist/opencode
  -> .claude/commands
```

O que muda e o conjunto de tools MCP disponiveis:

- skills web usam Playwright MCP;
- skills mobile usam Mobile/Appium MCP;
- skills documentais nao precisam de executor de browser/device.

## Arquivos principais criados ou alterados

Documentos:

```text
docs/arquitetura/BKPilot-Mobile-Appium-MCP.md
docs/arquitetura/Mobile-Appium-MCP-Setup.md
docs/arquitetura/Resumo-Sessao-Mobile-Appium-MCP.md
```

Scripts:

```text
scripts/mobile-mcp-server.js
scripts/mobile-smoke.js
scripts/lib/mobile-appium-client.js
scripts/lib/mobile-device-manager.js
```

Config:

```text
.claude/settings.json
package.json
converter/tools_map.yaml
```

Skills canonicas:

```text
src/*-mobile-*.md
```

Distribuicoes:

```text
dist/claude/*-mobile-*.md
dist/codex/*-mobile-*.md
dist/opencode/*-mobile-*.md
.claude/commands/*-mobile-*.md
```

## Validacoes feitas

Foram executadas validacoes de sintaxe:

```bash
node --check scripts/lib/mobile-appium-client.js
node --check scripts/lib/mobile-device-manager.js
node --check scripts/mobile-smoke.js
node --check scripts/mobile-mcp-server.js
```

Foi validado o conversor:

```bash
node converter/render.js --lint
node converter/render.js --build-all
```

Foi validado handshake MCP:

```text
initialize
tools/list
```

O MCP listou as tools mobile corretamente.

## O que ficou pronto

Pronto nesta sessao:

- arquitetura mobile web/APK;
- 8 skills mobile;
- distribuicao Claude/Codex/OpenCode;
- MCP Mobile/Appium por stdio;
- suporte Appium local/remoto;
- suporte generico a device farm;
- smoke test mobile;
- Device Manager local;
- Evidence Manager basico;
- contrato forte de `mobile.getState`;
- modes `observe/explore/execute`;
- politica inicial de seguranca;
- documentacao de setup;
- matriz de compatibilidade;
- criterios de aceite;
- decisao de upload automatico de APK na Release 0.1.

## O que ficou de fora

Ainda nao foi implementado:

- smoke real contra Sauce Labs, BrowserStack, LambdaTest ou outro farm;
- smoke real contra celular Android USB;
- adaptador real de upload de APK para provider especifico;
- download de videos/logs do provider;
- gravacao local de video via Appium `startRecordingScreen`;
- mascaramento visual de dados sensiveis em screenshot;
- parser XML robusto com biblioteca dedicada;
- extracao completa para `@bugkillers/bkpilot-core`;
- execucao real das planilhas mobile ponta a ponta;
- relatorio final cliente com artefatos mobile consolidados;
- suporte iOS;
- suporte a multiplos devices em lote;
- Appium Grid proprio;
- testes automatizados unitarios para o MCP.

## Proximo passo recomendado

1. Escolher o primeiro provider real.
2. Criar `clients/mobile-demo/config.json`.
3. Configurar credenciais:

```bash
set MOBILE_FARM_USERNAME=...
set MOBILE_FARM_ACCESS_KEY=...
```

4. Rodar smoke web:

```bash
node scripts/mobile-smoke.js --cliente mobile-demo --target web
```

5. Implementar o primeiro adaptador real do Mobile Farm Upload Manager.
6. Rodar smoke APK com upload automatico.
7. So depois rodar `/explorar-mobile-web` ou `/explorar-mobile-apk`.

## Observacao sobre a skill PDF

Ao final da sessao, foi instalada a skill `pdf` do repositorio `openai/skills` em:

```text
C:\Users\Jorge\.codex\skills\pdf
```

Comando executado via helper da skill-installer.

Para carregar a skill, e necessario reiniciar o Codex.
