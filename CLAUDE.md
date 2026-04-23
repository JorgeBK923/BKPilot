# BugKillers QA Agent — Instruções Globais

Este arquivo contém as regras globais que se aplicam a **todas** as skills do bugkillers-qa-agent. Sempre consulte estas instruções antes de executar qualquer comando.

---

## 1. Playwright MCP

- Todas as interações com o browser devem ser realizadas via **Playwright MCP** configurado em `.claude/settings.json` **ou** via scripts Node dedicados (ver §1.1)
- Nunca instalar ou usar Selenium, Cypress ou outro framework de automação
- Usar `networkidle` como padrão de espera para páginas dinâmicas (SPA)
- Browser sempre em modo **headless** — scripts Node forçam `headless: true`; o MCP é iniciado com flag `--headless` em `.claude/settings.json`

---

## 1.1. Quando usar MCP vs Script Node (ECONOMIA DE TOKENS — CRÍTICO)

Cada chamada ao Playwright MCP consome tokens (tool call + accessibility tree de volta). Em loops longos isso escala rápido e estoura contexto. **Antes de implementar ou executar uma skill, decidir o caminho:**

### Use **script Node** (`.js` em `cenarios/` ou similar) quando:
- Loop com **N > 5 iterações determinísticas** (planilhas, listas de URLs, batch de cenários já gerados)
- Fluxo já mapeado e estável — não precisa de interpretação da página em tempo real
- Vai rodar mais de uma vez (regressão, ciclos semanais, agendado)
- Manipula arquivos estruturados (xlsx, json, csv)
- Pode rodar em background (`run_in_background: true`)
- **Regra de bolso:** se você consegue escrever o pseudocódigo sem abrir o browser, é script

Nesses casos, o LLM **apenas dispara** o script via Bash, lê o **JSON/MD de resumo** no final, e gera o relatório. Zero tokens durante a execução.

### Use **MCP Playwright** quando:
- Exploração: não se sabe o que vai aparecer na tela
- Decisão contextual ("clicar no botão que faz sentido dado X")
- Interpretação visual/semântica (heurísticas de usabilidade, julgamento de UX)
- Execução única ou de poucos passos (< 5)
- Debugging / investigação ad-hoc
- **Reteste de bug (skill `/regressao` e qualquer fluxo de validação de correção):** OBRIGATÓRIO. Reteste exige interpretar a tela em tempo real — modais de boas-vindas, ícones SVG sem label, endpoints com nome diferente do mapeado. Scripts Node travam; MCP resolve em uma sessão. Regra válida para TODAS as ICLs do ecossistema (Claude, GLM, Minimax, Kimi, MiMo, Qwen, GPT).

### Divisão por skill (referência)

| Skill | Caminho | Racional |
|---|---|---|
| `/explorar` | MCP | Exploração, desconhecido |
| `/gerar-cenarios` | LLM puro | Sem browser |
| `/testar-forms` | MCP | 13 grupos interpretativos |
| `/executar-fluxo` | MCP (1 run) / Script (`--dados`) | Híbrido por contexto |
| `/executar-planilha` | **Script** (`_executar_planilha.js`) | Batch determinístico |
| `/testar-modulo` | Híbrido | Roteiro via script, exploração livre via MCP |
| `/regressao` | **MCP Playwright** (obrigatório para reteste de bugs) | Reteste de bug exige interpretação visual: modais aparecendo em momentos imprevisíveis, ícones sem label, endpoints diferentes do mapeado. Vale para TODAS as ICLs (Claude, GLM, Minimax, Kimi, MiMo, Qwen, GPT) |
| `/acessibilidade` | Híbrido | axe-core via script, julgamento via MCP |
| `/performance` | **Script** | Lighthouse CLI / web-vitals determinístico |
| `/api-check` | **Script** | fetch/axios, sem browser |
| `/usabilidade` | MCP | Heurísticas exigem julgamento |
| `/testar-ia` | **Script** | Loop de prompts é batch |
| `/reportar-bug`, `/gerar-relatorio`, `/relatorio-parcial`, `/push-bugs` | LLM + arquivos | Sem browser |

### Padrão arquitetural para skills híbridas
- `.claude/commands/<skill>.md` — orquestra, decide, analisa resultado
- `cenarios/_<skill>.js` — executa trabalho pesado, escreve `resultado/<timestamp>/<skill>_summary.json`
- LLM lê **somente** o summary final, nunca logs brutos

---

## 2. Segurança de Credenciais

- **NUNCA** expor `QA_PASSWORD` em logs, arquivos de resultado, screenshots ou saídas de terminal
- A senha é lida exclusivamente da variável de ambiente `QA_PASSWORD` definida no arquivo `.env`
- Se `--login` contiver `:` (ex: `email:senha`), **PARAR imediatamente** e exibir erro de segurança
- Nunca commitar o `.env` — ele está protegido pelo `.gitignore`

---

## 3. Monitoramento de Console do Browser (BLOCK-B)

Toda skill que abre o browser **deve** ativar captura de mensagens do console:

```
Ao iniciar o browser, interceptar eventos de console:
- Capturar todas as mensagens: console.error, console.warning, console.log (apenas erros e avisos são reportados)
- Formato de registro por mensagem:
  { "timestamp": "ISO-8601", "level": "error|warning", "text": "mensagem", "url": "página", "lineNumber": N }
- Salvar acumulado em: resultado/<timestamp>/console_log.json
- No resultado final (.md), incluir seção "Console Errors" listando erros críticos
- Uncaught exceptions e unhandled promise rejections são sempre severidade ALTA
```

**Skills que devem implementar:** `/explorar`, `/executar-fluxo`, `/testar-forms`, `/executar-planilha`, `/testar-modulo`, `/regressao`, `/acessibilidade`, `/performance`

---

## 4. Monitoramento de Requisições de Rede (BLOCK-C)

Toda skill que abre o browser **deve** ativar interceptação de rede:

```
Ao iniciar o browser, interceptar requisições de rede:
- Registrar requisições com status >= 400 (erros HTTP)
- Registrar requisições que levaram mais de 3000ms (lentas)
- Registrar requisições que falharam (timeout, DNS, conexão recusada)
- Formato por requisição:
  { "timestamp": "ISO-8601", "method": "GET|POST|...", "url": "endpoint", "status": N, "duration_ms": N, "size_bytes": N, "error": "mensagem se falhou" }
- Salvar acumulado em: resultado/<timestamp>/network_log.json
- No resultado final (.md), incluir seção "Network Issues" com erros 5xx e requisições lentas
- Muitos erros 5xx consecutivos devem gerar alerta no resumo
```

**Skills que devem implementar:** `/explorar`, `/executar-fluxo`, `/testar-forms`, `/executar-planilha`, `/testar-modulo`, `/regressao`, `/acessibilidade`, `/performance`

---

## 5. Re-autenticação de Sessão (BLOCK-D)

Skills de longa duração **devem** monitorar expiração de sessão:

```
Durante a execução, monitorar sinais de sessão expirada:
- Redirecionamento inesperado para página de login
- Resposta HTTP 401 ou 403 em requisição autenticada
- Presença de modal ou banner de "sessão expirada" na página

Se detectado:
1. Registrar evento: { "timestamp": "ISO-8601", "url": "página atual", "motivo": "401|redirect|modal" }
2. Re-autenticar usando as credenciais originais (--login + QA_PASSWORD)
3. Retornar à página/ação onde a sessão expirou
4. Continuar execução normalmente
5. Incluir contagem de re-autenticações no resumo final
```

**Skills que devem implementar:** `/explorar`, `/executar-planilha`, `/testar-modulo`

---

## 6. Cleanup de Dados de Teste (BLOCK-E)

Skills que criam dados no sistema **devem** realizar limpeza ao final:

```
Ao final da execução, realizar cleanup dos dados criados durante os testes:
- Manter registro de cada dado criado: { "item": "descrição", "tipo": "cadastro|pedido|...", "url": "onde foi criado" }
- Tentar reverter: excluir registros via interface (botão excluir) ou API se disponível
- Registrar resultado do cleanup: { "item", "tipo", "url", "status": "limpo|pendente", "motivo": "se pendente" }
- Salvar em: resultado/<timestamp>/cleanup_log.json
- No resultado final (.md), incluir seção "Cleanup de Dados"
- Se cleanup não for possível: registrar como pendência para o QA resolver manualmente
```

**Skills que devem implementar:** `/executar-fluxo`, `/executar-planilha`, `/testar-modulo`

---

## 7. ffmpeg Cross-Platform (BLOCK-A)

A conversão de vídeo `.webm` para `.mp4` deve funcionar em qualquer SO:

```
Comando de conversão:
  ffmpeg -i <input>.webm -c:v libx264 -crf 23 -preset fast <output>.mp4

Se ffmpeg NÃO estiver disponível:
- NÃO executar instalação automaticamente (nenhum apt-get, brew, etc.)
- Exibir mensagem orientando o usuário:
    ⚠️  ffmpeg não encontrado. Instale manualmente:
       Windows:  winget install ffmpeg  OU  https://ffmpeg.org/download.html
       macOS:    brew install ffmpeg
       Linux:    sudo apt-get install ffmpeg
- Manter o arquivo .webm original como evidência alternativa
- Continuar a execução normalmente (ffmpeg ausente NÃO bloqueia a skill)

Após conversão bem-sucedida: remover o .webm original para economizar espaço.
```

---

## 7.1. 🚨 EVIDÊNCIA VISUAL OBRIGATÓRIA — REGRA EXPRESSA

**TODA skill que executa teste no browser DEVE gerar screenshot ou vídeo de CADA cenário/bug/passo validado. SEM EXCEÇÃO.**

Esta regra é **OBRIGATÓRIA e INEGOCIÁVEL** para TODAS as ICLs (Claude, GLM, Minimax, Kimi, MiMo, Qwen, GPT, Codex) e TODAS as skills abaixo:

`/explorar`, `/executar-fluxo`, `/executar-planilha`, `/testar-forms`, `/testar-modulo`, `/testar-ia`, `/regressao`, `/acessibilidade`, `/performance`, `/usabilidade`

### Regras expressas:

1. **NUNCA finalize um teste/reteste sem capturar evidência visual** — cada cenário, cada bug retestado, cada assertion crítica exige screenshot (PNG) OU vídeo (MP4).
2. **Retestes de bug (`/regressao`):** OBRIGATÓRIO um screenshot por bug retestado, nomeado `JBUG-<ID>_reteste_<descricao>.png`. Se só há relato textual (ex: "mensagem apareceu"), **o teste não está completo** — capture a tela.
3. **Cenários de planilha (`/executar-planilha`, `/testar-modulo`):** mínimo 1 screenshot por cenário falhado; vídeo para falhas críticas.
4. **Formulários (`/testar-forms`):** screenshot do estado final de cada grupo testado.
5. **Acessibilidade/Performance:** screenshot da tela analisada + JSON com métricas.
6. **Antes de marcar cenário como "Passou"/"Corrigido"/"Falhou":** verificar se o arquivo de evidência existe em disco. Se não existe, **voltar e capturar**.
7. **No relatório final (.md/.pdf):** cada bug/cenário deve citar o caminho da evidência. Se faltar, o relatório está incompleto.
8. **Em caso de impossibilidade de capturar** (ex: modal que some antes do screenshot): registrar o motivo explicitamente no relatório — silêncio não é aceitável.

### Onde salvar:

```
resultado/<timestamp>/screenshots/  ← PNGs por passo/cenário/bug
resultado/<timestamp>/videos/       ← MP4 (falhas críticas ou fluxos longos)
```

**Checklist antes de encerrar qualquer skill de teste:**
- [ ] Todos os cenários têm screenshot/vídeo correspondente em disco?
- [ ] Todos os bugs retestados têm evidência visual nomeada com o ID?
- [ ] O relatório .md/.pdf referencia cada arquivo de evidência?

Se qualquer item estiver **NÃO**, a skill não terminou. Voltar e capturar.

---

## 8. Timestamps e Organização

- Formato padrão de timestamp: `YYYY-MM-DD_HHMM` (ex: `2026-04-04_1530`)
- Sempre criar symlink `resultado/latest → resultado/<timestamp>/`
- Nomear artefatos de forma descritiva: `<tipo>_<contexto>_<timestamp>.<ext>`

---

## 9. Pipeline Order (Ordem Recomendada)

```
/explorar → /gerar-cenarios → /testar-modulo (ou /executar-planilha) → /relatorio-parcial → /reportar-bug → /gerar-relatorio
```

O `/relatorio-parcial` pode ser executado **a qualquer momento** durante o pipeline (tipicamente ao final de cada semana em projetos de longa duração). Não interfere no fluxo normal.

Skills avulsas que podem ser usadas independentemente:
- `/executar-fluxo` — fluxo E2E ad-hoc (suporta data-driven)
- `/testar-forms` — formulário específico (13 grupos de teste)
- `/regressao` — após correção de bugs (com visual-diff e detecção de flaky)
- `/acessibilidade` — auditoria WCAG 2.1 (níveis A/AA/AAA)
- `/performance` — Core Web Vitals (LCP, FCP, CLS, TTFB, INP)
- `/api-check` — testes de API (segurança, auth, payloads, rate limiting)
- `/usabilidade` — avaliação heurística de UX (10 heurísticas de Nielsen, eficiência de fluxos, scores)
- `/relatorio-parcial` — relatório de acompanhamento semanal para o cliente (PDF)

---

## 10. Estrutura de Artefatos

```
estado/
├── mapa.md                  ← mapa do sistema
├── fluxos.md                ← fluxos identificados
├── elementos.json           ← elementos interativos + console errors por página
├── api_endpoints.json       ← endpoints descobertos via network tab
└── screenshots/             ← screenshots de cada página

resultado/<timestamp>/
├── console_log.json         ← log de console do browser
├── network_log.json         ← log de requisições de rede
├── cleanup_log.json         ← log de cleanup de dados
├── parcial_semana*.pdf      ← relatórios parciais de acompanhamento
├── videos/                  ← evidências em MP4
├── screenshots/             ← capturas por passo
└── *.md                     ← resultados detalhados

resultado/
└── parciais_index.json      ← índice histórico de relatórios parciais

assets/
└── logo-bugkillers.png      ← logo para relatórios
```

---

*BugKillers — Setor de Inteligencia Artificial*
