# Sauce Labs Mobile Smoke

## Objetivo

Validar o primeiro smoke real Appium em device farm usando Sauce Labs, sem salvar credenciais no repositorio.

## Credenciais

Defina as variaveis no PowerShell antes de rodar:

```powershell
$env:MOBILE_FARM_USERNAME="seu_usuario_sauce"
$env:MOBILE_FARM_ACCESS_KEY="sua_access_key_sauce"
```

Nao coloque usuario, access key ou token dentro de `config.json`, comandos ou documentos commitados.

## Regiao Sauce Labs

O client pack inicial usa US West:

```text
https://ondemand.us-west-1.saucelabs.com/wd/hub
```

Se sua conta estiver em EU Central, trocar para:

```text
https://ondemand.eu-central-1.saucelabs.com/wd/hub
```

Se sua conta estiver em US East 4, trocar para:

```text
https://ondemand.us-east-4.saucelabs.com/wd/hub
```

Observacao: a propria Sauce informa que Virtual Device Testing nao esta disponivel em US East 4. Para mobile web, prefira US West ou EU Central quando possivel.

## Client pack criado

```text
clients/sauce-mobile-smoke/config.json
```

Default atual:

- provider: `saucelabs`
- target: `web`
- browser: `Chrome`
- platform: `Android`
- device: `Google Pixel 7 Pro`
- platformVersion: `14`
- Appium: `latest`
- baseUrl: `https://example.com`

Antes de usar em sistema real, trocar `baseUrl` e `allowedUrls` para o dominio correto.

## Comando

```powershell
npm.cmd run mobile:smoke -- --cliente sauce-mobile-smoke --target web
```

## Evidencias esperadas

```text
clients/sauce-mobile-smoke/resultado/<timestamp>/mobile/reports/mobile_smoke_report.json
clients/sauce-mobile-smoke/resultado/<timestamp>/mobile/screenshots/
clients/sauce-mobile-smoke/resultado/<timestamp>/mobile/sources/
clients/sauce-mobile-smoke/resultado/<timestamp>/mobile/states/
```

## Referencias oficiais

- Data Center Endpoints: https://docs.saucelabs.com/basics/data-center-endpoints/
- Test Configuration Options: https://docs.saucelabs.com/dev/test-configuration-options/
- Appium Versions: https://docs.saucelabs.com/mobile-apps/automated-testing/appium/appium-versions/
