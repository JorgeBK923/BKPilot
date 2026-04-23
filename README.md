# BugKillers QA Agent

Sistema de automação de QA baseado em Claude Code + Playwright MCP.
16 comandos slash que cobrem o pipeline completo: exploração → cenários → execução → bugs → relatório + auditorias avulsas de acessibilidade, performance, API e usabilidade.

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

Edite o arquivo `.env` com a senha do usuário de QA:

```
QA_PASSWORD=sua_senha_aqui
```

> ⚠️ Nunca commite o `.env`. Ele já está no `.gitignore`.

---

## Uso

```bash
claude
```

O Claude Code reconhece automaticamente os comandos na pasta `.claude/commands/`.

---

## Os 16 Comandos

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
```

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

# Relatório parcial de acompanhamento (semanal, para projetos longos)
/relatorio-parcial --cliente "Nome do Cliente" --semana 1 --notas "Observações da semana"
```

---

## Estrutura de Pastas

```
bugkillers-qa-agent/
├─ .claude/
│  ├─ commands/          ← os 14 arquivos .md das skills
│  └─ settings.json      ← configuração do Playwright MCP
├─ assets/
│  └─ logo-bugkillers.png  ← logo para relatórios
├─ estado/               ← artefatos intermediários (gerados pelo /explorar)
│  ├─ mapa.md
│  ├─ fluxos.md
│  ├─ elementos.json
│  ├─ api_endpoints.json
│  └─ screenshots/
├─ resultado/            ← saídas de execução com timestamp
│  ├─ 2026-03-28_1430/
│  │  ├─ videos/         ← evidências em MP4
│  │  ├─ screenshots/    ← capturas de tela por passo
│  │  ├─ graficos/       ← gráficos do relatório
│  │  ├─ visual-diff/    ← diffs visuais (regressão)
│  │  ├─ console_log.json
│  │  ├─ network_log.json
│  │  ├─ cleanup_log.json
│  │  └─ parcial_semana*.pdf  ← relatórios parciais de acompanhamento
│  └─ latest -> ...      ← symlink para a execução mais recente
├─ cenarios/             ← planilhas de teste
│  └─ historico/         ← versões anteriores
├─ CLAUDE.md             ← instruções globais para todas as skills
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
- Use apenas `--login email@exemplo.com` — a senha é lida de `QA_PASSWORD` no `.env`
- O `.env` está no `.gitignore` e nunca deve ser commitado
- Se `--login` contiver `:` (email:senha), a execução é bloqueada com erro de segurança

---

*BugKillers — Setor de Inteligência Artificial · v2.2 · Abril 2026*
