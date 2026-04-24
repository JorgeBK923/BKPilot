# BugKillers QA Agent

Sistema de automação de QA baseado em Claude Code + Playwright MCP.
19 comandos slash que cobrem o pipeline completo: exploração → cenários → execução → bugs → relatório, planejamento/geração/auditoria de automação e auditorias avulsas de acessibilidade, performance, API e usabilidade.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Instalação |
|------------|---------------|------------|
| Node.js | 18+ | https://nodejs.org |
| Claude Code | latest | `npm install -g @anthropic-ai/claude-code` |
| ffmpeg | qualquer | Windows: `winget install ffmpeg` / macOS: `brew install ffmpeg` / Linux: `sudo apt-get install ffmpeg` |

> ffmpeg é opcional — se ausente, os vídeos permanecem em `.webm` e a execução continua normalmente.

---

## Instalação

```bash
git clone <repo> bugkillers-qa-agent
cd bugkillers-qa-agent
bash setup.sh
```

O script `setup.sh` verifica os pré-requisitos, instala o Playwright MCP e os browsers, cria a estrutura de pastas e configura o `.env`.

---

## Configuração

Cada cliente tem suas próprias credenciais isoladas em `clients/<id>/.env`:

```bash
cp clients/.env.example clients/<id>/.env
# editar clients/<id>/.env com a senha do ambiente
```

```
QA_PASSWORD=sua_senha_aqui
```

O `.env` da raiz é reservado para integrações globais (Jira, GitHub Issues):

```bash
cp .env.example .env
# preencher JIRA_URL, JIRA_TOKEN, GITHUB_TOKEN etc. se necessário
```

> ⚠️ Nunca commite nenhum `.env`. Tanto `.env` quanto `clients/*/.env` já estão no `.gitignore`.

---

## Uso

```bash
claude
```

O Claude Code reconhece automaticamente os comandos na pasta `.claude/commands/`.

---

## Os 19 Comandos

### Pipeline completo (ordem recomendada)

```bash
# 1. Mapear o sistema
/explorar https://app.cliente.com.br --login qa@bug.com --max-depth 4

# 2. Gerar cenários BDD
/gerar-cenarios --formato gherkin

# 3. Executar por módulo (roteiro + exploração livre)
/testar-modulo Login cenarios.xlsx --login qa@bug.com

# 4. (Opcional) Gerar relatório parcial de acompanhamento semanal
/relatorio-parcial --cliente "Nome do Cliente" --semana 1

# 5. Reportar bugs
/reportar-bug --fonte resultado/latest/

# 6. Gerar relatório final para entrega
/gerar-relatorio --cliente "Nome do Cliente" --formato pdf

# 7. Planejar automação de entrega ao cliente
/plano-automacao https://app.cliente.com.br --login qa@bug.com --horas-base 150

# 8. Gerar automação exportável para o cliente
/gerar-automacao-cliente cliente-id --stack playwright-ts

# 9. Auditar independentemente o pacote gerado
/auditar-automacao-cliente cliente-id --stack playwright-ts
```

> **Nota:** `/plano-automacao` é a porta de entrada para decisões de investimento em automação. Execute-a antes de `/gerar-automacao-cliente` para avaliar se o sistema está pronto para automação e obter uma estimativa fundamentada.

### Entrega de automação ao cliente

As skills `/gerar-automacao-cliente` e `/auditar-automacao-cliente` produzem um pacote em:

```text
entregaveis/<cliente>/automacao/<stack>/
```

Esse pacote pode ser enviado ao cliente após revisão. Ele contém `codigo/`, especificação, rastreabilidade, cobertura, pendências, inventário, auditoria técnica, auditoria independente, correções de auditoria quando existirem e resumo da geração.

Regra obrigatória: todo relatório `.md` destinado ao cliente deve ter também um `.pdf` correspondente antes da entrega. Exemplos: `README_automacao.md` e `README_automacao.pdf`, `auditoria_independente.md` e `auditoria_independente.pdf`, `correcoes_auditoria.md` e `correcoes_auditoria.pdf`.

Não envie ao cliente a pasta `resultado/<timestamp>/governanca/`, arquivos `.env`, tokens, `automacao_autoria_<cliente>_<stack>.json`, `auditoria_interna_<cliente>_<stack>.md`, identidade de modelo/agente/executor ou `geracao_id`.

### Uso avulso

```bash
# Executar um fluxo específico (suporta data-driven)
/executar-fluxo "login → dashboard → criar pedido" --login qa@bug.com --dados dados.json

# Testar formulário específico (13 grupos de teste)
/testar-forms https://app.cliente.com.br/cadastro

# Executar planilha inteira ou filtrada (com retry e circuit breaker)
/executar-planilha cenarios.xlsx --prioridade Alta --retry 2 --max-falhas 5

# Retestar após correção de bugs (com visual diff)
/regressao --planilha cenarios/cenarios_resultado_2026-03-28_1430.xlsx --bugs BUG-042,BUG-053 --visual-diff

# Auditoria de acessibilidade WCAG 2.1
/acessibilidade https://app.cliente.com.br --nivel AA

# Análise de performance e Core Web Vitals
/performance https://app.cliente.com.br --throttle 4g

# Testes de API (segurança, auth, payloads)
/api-check https://app.cliente.com.br --endpoints auto

# Avaliação de usabilidade (10 heurísticas de Nielsen)
/usabilidade https://app.cliente.com.br --fluxos "login → dashboard;cadastro → confirmação"

# Testes especializados em módulos de IA/Chat (jailbreak, hallucination, guardrails)
/testar-ia --url https://app.cliente.com.br --login qa@bug.com --dominio "assistente de atendimento"

# Relatório parcial de acompanhamento (semanal, para projetos longos)
/relatorio-parcial --cliente "Nome do Cliente" --semana 1 --notas "Observações da semana"
```

---

## Estrutura de Pastas

```
bugkillers-qa-agent/
├─ .claude/
│  ├─ commands/          ← os 19 arquivos .md das skills
│  ├─ settings.json      ← configuração do Playwright MCP (--headless)
│  └─ settings.local.json  ← permissões granulares (gitignored)
├─ core/                 ← utilitários compartilhados entre scripts
│  ├─ browser.js         ← launchBrowser com captura de console/rede embutida
│  ├─ client.js          ← suporte multi-tenant (loadClient, loadFlow)
│  ├─ env.js             ← leitura segura de credenciais
│  ├─ evidence.js        ← conversão .webm → .mp4
│  ├─ logger.js          ← progress log
│  └─ paths.js           ← geração de timestamps e estrutura de pastas
├─ cenarios/             ← scripts Node de execução em lote e planilhas
│  ├─ _executar_planilha.js  ← orquestrador batch (multi-cliente)
│  ├─ _gerar_planilha_ia.js
│  ├─ _md_to_pdf.js
│  ├─ _retestar_bug.js
│  └─ _validar_ia.js
├─ clients/              ← configuração por cliente (multi-tenant)
│  ├─ .env.example       ← template de credenciais por cliente
│  └─ <id>/
│     ├─ config.json     ← baseUrl, envPassword, defaultFlow
│     ├─ login.js        ← função de login do cliente
│     ├─ flows/          ← implementação customizada de runScenario
│     ├─ cenarios/       ← planilhas e fichas de risco do cliente
│     └─ .env            ← credenciais do cliente (nunca commitar)
├─ assets/
│  └─ logo-bugkillers.png  ← logo para relatórios
├─ estado/               ← artefatos intermediários (gerados pelo /explorar)
│  ├─ mapa.md
│  ├─ fluxos.md
│  ├─ elementos.json
│  ├─ api_endpoints.json
│  └─ screenshots/
├─ resultado/            ← saídas de execução com timestamp
│  ├─ <cliente>/
│  │  ├─ YYYY-MM-DD_HHMM/
│  │  │  ├─ videos/         ← evidências em MP4
│  │  │  ├─ screenshots/    ← capturas de tela por passo
│  │  │  ├─ console_log.json
│  │  │  ├─ network_log.json
│  │  │  ├─ cleanup_log.json
│  │  │  └─ parcial_semana*.pdf
│  │  └─ latest -> ...   ← symlink para a execução mais recente
├─ entregaveis/          ← pacotes de automação gerados para clientes
│  └─ <cliente>/automacao/<stack>/
│     ├─ codigo/
│     ├─ *.md
│     └─ *.pdf
├─ documentacao_projeto/ ← arquitetura, especificação técnica e guias
├─ CLAUDE.md             ← instruções globais para todas as skills
├─ AGENTS.md             ← quick reference e regras de reteste
├─ .env                  ← credenciais (nunca commitar)
├─ .env.example          ← modelo de credenciais
├─ .gitignore
└─ setup.sh              ← script de instalação
```

---

## Evidências geradas

Cada execução gera automaticamente:
- **Vídeo MP4** por cenário (obrigatório nas entregas BugKillers)
- **Screenshots** por passo ou grupo de teste
- **Arquivo `.md`** com resultado detalhado
- **Relatório parcial PDF** de acompanhamento semanal (via `/relatorio-parcial`)
- **Planilha `.xlsx`** atualizada com status, screenshot e vídeo de cada cenário
- **Console log** (JSON) — erros e warnings do browser
- **Network log** (JSON) — requisições com erro e lentas
- **Cleanup log** (JSON) — dados de teste criados e removidos

---

## Monitoramento automático (todas as skills de browser)

| Recurso | Descrição |
|---------|-----------|
| Console errors | Captura automática de `console.error` e `console.warning` |
| Network issues | Interceptação de requisições 4xx/5xx e lentas (>3s) |
| Re-autenticação | Detecção de sessão expirada com re-login automático |
| Cleanup de dados | Limpeza de registros criados durante os testes |
| ffmpeg cross-platform | Conversão .webm → .mp4 sem bloqueio se ffmpeg ausente |

---

## Segurança

- A senha **nunca** é passada como argumento de linha de comando
- Use apenas `--login email@exemplo.com` — a senha é lida de `QA_PASSWORD` em `clients/<id>/.env`
- Cada cliente tem seu próprio `.env` isolado em `clients/<id>/` — sem mistura de credenciais
- O `.env` da raiz é exclusivo para tokens de integrações globais (Jira, GitHub)
- Todos os `.env` estão no `.gitignore` e nunca devem ser commitados
- Se `--login` contiver `:` (email:senha), a execução é bloqueada com erro de segurança

---

*BugKillers — Setor de Inteligência Artificial · v2.2 · Abril 2026*
