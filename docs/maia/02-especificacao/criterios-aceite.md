# Critérios de Aceite — Itens 1, 2, 6

**Skill:** MAIA Especificação (02)
**Data:** 2026-05-13
**Formato:** Given/When/Then por item

---

## Item 1 — Skill `/gerar-relatorio-final-mobile`

### CA1.1 — Geração básica
- **Given** cliente `<id>` com execução em `clients/<id>/resultado/<ts>/` contendo screenshots, bugs e summary
- **When** rodo `/gerar-relatorio-final-mobile --cliente <id>`
- **Then** gera `clients/<id>/resultado/<ts>/relatorio_final.md` e `relatorio_final.pdf`
- **And** `demo_summary.json` é criado com `status: ok`
- **And** todas as evidências citadas existem em disco

### CA1.2 — Consolidação web + mobile
- **Given** cliente com artefatos web em `resultado/<ts>/` e mobile em `resultado/<ts>/mobile/`
- **When** rodo skill com `--target hybrid`
- **Then** relatório contém seções "Web", "Mobile" e "Resumo Consolidado"
- **And** bugs de ambos targets aparecem em "Bugs Encontrados"

### CA1.3 — Validação de evidência ausente
- **Given** relatório referencia screenshot que não existe em disco
- **When** skill executa
- **Then** seção "Pendências" lista evidência faltante com path esperado
- **And** skill termina com exit code != 0

### CA1.4 — Performance
- **Given** cliente com 50 cenários, 100 screenshots, 5 vídeos
- **When** rodo skill
- **Then** conclusão em ≤ 60s

### CA1.5 — Layout PDF
- **Given** relatório com múltiplas seções
- **When** PDF é gerado
- **Then** nenhum título de seção aparece sozinho no fim de página (regra do projeto)

---

## Item 2 — Contrato de execução mobile por cliente

### CA2.1 — Template completo
- **Given** novo cliente criado via `./novo-cliente.sh <id>`
- **When** examino `clients/<id>/config.json`
- **Then** bloco `mobile` está presente com todos os campos: `provider`, `target`, `appiumUrl`, `username`, `accessKey`, `baseUrl`, `capabilities`, `allowedUrls`, `allowedAppPackages`, `timeouts`, `retry`, `limits`, `evidence`, `redaction`

### CA2.2 — `mobile:doctor` valida pré-requisitos
- **Given** cliente com config válida e device USB conectado
- **When** rodo `npm run mobile:doctor -- --cliente <id>`
- **Then** valida: ADB ok, device visível, Appium acessível, credenciais presentes, capabilities mínimas
- **And** retorna exit 0 com resumo verde

### CA2.3 — `mobile:doctor` falha clara
- **Given** cliente com `mobile.appiumUrl` inválido
- **When** rodo `mobile:doctor`
- **Then** erro cita campo exato (`mobile.appiumUrl`), valor recebido, valor esperado (formato)
- **And** exit code != 0
- **And** credenciais não aparecem no output

### CA2.4 — Limites Sauce respeitados
- **Given** cliente com `mobile.limits.maxMinutesPerRun: 30`
- **When** execução excede 30 minutos
- **Then** sistema aborta com erro `LIMIT_EXCEEDED`
- **And** registra duração real em `mobile_run_report.json`

### CA2.5 — Retry transiente
- **Given** provider Sauce retorna `ECONNRESET` ao criar sessão
- **When** skill tenta executar
- **Then** retry automático até `mobile.retry.maxAttempts`
- **And** log registra cada tentativa com `sessionId` e motivo

### CA2.6 — Erro de teste não retenta
- **Given** cenário com assertion fail
- **When** falha ocorre
- **Then** **não** há retry
- **And** cenário é marcado `failed` direto

### CA2.7 — Onboarding documentado
- **Given** novo cliente sem experiência prévia
- **When** segue `docs/onboarding-mobile.md`
- **Then** consegue configurar `.env`, `config.json` e rodar primeiro smoke em ≤ 30 minutos

---

## Item 6 — Mascaramento de dados sensíveis

### CA6.1 — Mascaramento em screenshot
- **Given** screenshot contém CPF visível em região `[x, y, w, h]`
- **When** mascaramento é aplicado
- **Then** região é coberta com retângulo opaco
- **And** arquivo final em disco não contém pixels originais do CPF

### CA6.2 — Mascaramento em XML
- **Given** source XML do Appium contém atributo `text="email@example.com"`
- **When** mascaramento é aplicado
- **Then** XML final contém `text="***REDACTED***"`
- **And** estrutura do XML é preservada (parseável)

### CA6.3 — Categorias padrão sempre ativas
- **Given** cliente com `mobile.redaction.enabled: true` sem lista customizada
- **When** evidência é gerada com CPF, e-mail, telefone visíveis
- **Then** os 3 são mascarados sem configuração explícita

### CA6.4 — Desabilitar requer flag auditável
- **Given** cliente tenta desabilitar mascaramento de CPF
- **When** config tem `mobile.redaction.disableCategories: ["cpf"]` **sem** `allowUnsafeDisable: true`
- **Then** skill aborta com erro `UNSAFE_REDACTION_DISABLE`

### CA6.5 — Arquivo original não persiste
- **Given** screenshot é capturado pelo Appium
- **When** processo de mascaramento roda
- **Then** apenas versão mascarada existe em `mobile/screenshots/`
- **And** versão original não existe em nenhum diretório de output

### CA6.6 — Log de mascaramento
- **Given** execução com 5 CPFs e 3 e-mails mascarados
- **When** termina
- **Then** `redaction_log.json` contém `{"cpf": 5, "email": 3}`
- **And** valores originais **não** aparecem no log

### CA6.7 — Falha de mascaramento aborta
- **Given** mascaramento lança exception ao processar screenshot
- **When** erro ocorre
- **Then** screenshot **não** é salvo no diretório final
- **And** erro é registrado como P0 em log interno

### CA6.8 — Performance
- **Given** screenshot 1MB
- **When** mascaramento roda
- **Then** completa em ≤ 500ms

---

## Critérios transversais (todos os itens)

### CAT.1 — Sem regressão
- **Given** smoke Sauce Labs (US West 1, Android+Chrome) aprovado antes da mudança
- **When** itens 1/2/6 são implementados
- **Then** smoke continua passando sem ajuste

### CAT.2 — Documentação atualizada
- **Given** itens entram em produção
- **When** examino `AGENTS.md` e `CLAUDE.md`
- **Then** novas regras (mascaramento, contrato cliente, skill relatório) estão documentadas

### CAT.3 — Sem credencial vazada
- **Given** execução de qualquer item 1/2/6
- **When** examino todos os outputs (logs, relatórios, JSONs)
- **Then** `QA_PASSWORD`, `MOBILE_FARM_ACCESS_KEY`, `MOBILE_FARM_USERNAME` não aparecem em nenhum arquivo
