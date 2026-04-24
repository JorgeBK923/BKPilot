# BKPilot

## MVP — Front-end para Demonstração Comercial

**Arquitetura, Proposta Técnica e Plano de Implementação**

Documento gerado para o time comercial e técnico — guia de referência para a construção do produto mínimo viável de demonstração.

**BugKillers — Setor de Inteligência Artificial**

Abril 2026 | Documento Confidencial

---

## 1. Resumo Executivo

O BKPilot é uma plataforma de QA automatizado baseada em Inteligência Artificial. Hoje opera inteiramente via linha de comando — ideal para times técnicos, mas inviável para demonstrações comerciais a clientes não técnicos.

Este documento descreve a proposta de criação de um MVP (Produto Mínimo Viável) com interface web que esconde toda a complexidade técnica, expondo apenas três campos e um botão para o usuário final.

---

## 2. O Problema Atual

### Como funciona hoje

O operador abre o terminal e executa os comandos na seguinte ordem:

```
/plano-automacao    -> avalia viabilidade e estima investimento
/explorar           -> mapeia o sistema alvo
/gerar-cenarios     -> cria os cenarios de teste
/testar-modulo      -> executa os testes
/reportar-bug       -> documenta os bugs encontrados
/gerar-relatorio    -> gera o relatorio PDF final
```

Cada skill é um passo do trabalho de QA. O operador precisa conhecer os comandos, entender o output técnico e tomar decisões durante o processo. Isso torna a demonstração comercial impraticável — o cliente veria apenas código rolando na tela.

---

## 3. A Solução Proposta

### 3.1 Skill `/pipeline-completo`

Uma nova skill que encadeia todos os passos em sequência automaticamente. O front-end envia apenas três dados:

- URL do site a ser testado
- Usuário de login
- Senha de acesso

E ela executa sozinha: plano de automação → explorar → gerar cenários → testar → reportar bugs → gerar PDF. É o equivalente a um botão "Fazer Tudo" que substitui os comandos manuais.

### 3.2 Front-end Web (a casca bonita)

Uma tela web simples acessada pelo navegador. O cliente vê apenas um formulário limpo, uma barra de progresso e um botão de download do relatório. Toda a complexidade do Claude Code + skills fica completamente oculta.

---

## 4. Arquitetura na VPS

### Três serviços rodando no servidor

```
+-------------------------------------------------------------+
|                          SUA VPS                            |
|                                                             |
|  +------------+    +------------+    +-----------------+    |
|  |  CAIXA 1   |    |  CAIXA 2   |    |    CAIXA 3      |    |
|  |  Front-end | -> |    API     | -> |     Motor       |    |
|  |  (a tela)  | <- | (o garcom) | <- |  Claude Code    |    |
|  |  Next.js   |    |  Node.js   |    |  + Playwright   |    |
|  |  :3000     |    |   :8080    |    |  (background)   |    |
|  +------------+    +------------+    +-----------------+    |
+-------------------------------------------------------------+
          ^
          | internet
     +----+----+
     | Vendedor|  (abre no browser)
     +---------+
```

#### Caixa 1 — Front-end (a tela)

- Tecnologia: Next.js ou React
- Exibe: formulário (URL, login, senha), barra de progresso, botão "Baixar PDF"
- Acesso: https://demo.bugkillers.com.br

#### Caixa 2 — API (o garçom)

- Tecnologia: Node.js com Express ou Fastify (~200 linhas de código)
- Recebe pedidos do front-end e repassa ao motor

**Três endpoints expostos:**

| Endpoint | Método | Descrição |
|---|---|---|
| `/executar` | POST | recebe URL+login+senha, inicia teste, retorna `{ id }` |
| `/status/:id` | GET | consultado a cada 2s, retorna `{ etapa, progresso }` |
| `/relatorio/:id` | GET | ao terminar, retorna o PDF para download |

#### Caixa 3 — Motor (Claude Code rodando escondido)

- A API cria um processo filho do Claude Code em modo headless (sem interface)
- Roda a skill `/pipeline-completo` em background
- Escreve resultados em `resultado/<timestamp>/` — exatamente como hoje
- A API monitora essa pasta para reportar progresso ao front-end

---

## 5. Fluxo de uma Demonstração

Passo a passo do que acontece quando o vendedor usa o sistema:

1. **Vendedor abre o browser**, preenche os 3 campos e clica "Testar"
2. **Front-end envia:** `POST /executar { url, login, senha }`
3. **API responde:** `{ id: "abc123" }` e dispara Claude Code em background
4. **Front-end consulta a cada 2s:** `GET /status/abc123`
   - `{ etapa: "Avaliando viabilidade de automacao...", progresso: 10 }`
   - `{ etapa: "Explorando o sistema...", progresso: 25 }`
   - `{ etapa: "Gerando cenarios de teste...", progresso: 45 }`
   - `{ etapa: "Executando testes...", progresso: 70 }`
   - `{ etapa: "Gerando relatorio...", progresso: 90 }`
5. **Quando termina:** `{ etapa: "Concluido", progresso: 100 }`
6. **Aparece botão** "Baixar Relatorio PDF"
7. `GET /relatorio/abc123` → download do PDF gerado

---

## 6. Flexibilidade de Motor

A API foi pensada para ser "agnóstica" — não sabe qual motor está rodando por baixo. Hoje é Claude Code. Amanhã pode ser outro. O front-end nunca muda. As pastas `dist/claude/`, `dist/codex/` e `dist/opencode/` já existem no projeto, confirmando que as skills foram preparadas para múltiplos motores.

| CLI / Motor | Como funciona | Vantagem | Desvantagem |
|---|---|---|---|
| Claude Code (atual) | Roda Opus/Sonnet Anthropic | Skills prontas, melhor qualidade | Custo por token |
| Codex CLI (OpenAI) | Roda GPT-5 | Alternativa de custo | Skills precisam adaptação |
| OpenCode | Open-source, qualquer modelo | Flexível, troca sem mudar código | Menos polido |
| Agent SDK direto | Node.js + API Anthropic | Controle total, sem CLI | Reimplementa orquestração |
| Modelo local (Ollama) | Roda na própria VPS | Custo zero por uso | Qualidade inferior |

**Analogia:** é como um carro elétrico. O motorista dirige o carro (front-end). O motor pode ser bateria da Tesla, BYD ou CATL — o painel é o mesmo. Você troca o motor sem refazer a tela.

---

## 7. Infraestrutura na VPS

### Requisitos mínimos de hardware

- **RAM:** mínimo 4 GB (Playwright + Chromium headless consomem memória)
- **CPU:** 2 vCPUs
- **Disco:** 20 GB (logs, screenshots, PDFs gerados)
- **Sistema operacional:** Ubuntu 22.04 LTS recomendado

### Stack de infraestrutura

- **PM2** — mantém front-end e API vivos, reinicia automaticamente em caso de falha
- **Nginx** — HTTPS na frente, roteia `/` → front-end e `/api` → API
- **Certbot** — certificado SSL gratuito via Let's Encrypt
- **Arquivo `.env`** — chaves da API Anthropic e credenciais QA, nunca no repositório

### Configuração Nginx (resumo)

```nginx
server {
    server_name demo.bugkillers.com.br;
    location /api/ {
        proxy_pass http://localhost:8080;
    }
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

---

## 8. Plano de Implementação — MVP em 2 Semanas

### Semana 1

- **Dias 1–2:** criar skill `/pipeline-completo` encadeando as 6 skills existentes
- **Dias 3–4:** criar API Node.js com os 3 endpoints e integração com Claude Code
- **Dia 5:** testes de integração API ↔ Claude Code na VPS

### Semana 2

- **Dias 6–8:** front-end (formulário, barra de progresso, download PDF)
- **Dia 9:** configurar Nginx + PM2 + HTTPS na VPS
- **Dia 10:** testes end-to-end + ajustes de UX para demo

### Estimativa de esforço por componente

| Componente | Esforço |
|---|---|
| Skill `/pipeline-completo` | 1–2 dias |
| API Node.js | 2–3 dias (~200 linhas de código) |
| Front-end | 4–5 dias (~500 linhas de código) |
| Configuração de VPS | 1 dia |
| **Total** | **~2 semanas com 1 desenvolvedor** |

---

## 9. As 19 Skills do BKPilot

O framework BKPilot opera com **19 skills principais** cobrindo todo o pipeline de QA:

### Pipeline principal

| Skill | Função |
|---|---|
| `/plano-automacao` | Consultoria de viabilidade técnica antes de investir em automação |
| `/explorar` | Mapeamento completo do sistema alvo |
| `/gerar-cenarios` | Geração de cenários estruturados (suporta Gherkin) |
| `/testar-modulo` | Execução por módulo com roteiro + exploração livre |
| `/executar-planilha` | Execução em lote com retry e circuit breaker |
| `/reportar-bug` | Consolidação de falhas em bug cards |
| `/gerar-relatorio` | Relatório final em PDF ou DOCX |
| `/relatorio-parcial` | Acompanhamento semanal em projetos longos |

### Skills de automação do cliente

| Skill | Função |
|---|---|
| `/gerar-automacao-cliente` | Gera pacote de código no stack do cliente |
| `/auditar-automacao-cliente` | Auditoria independente com remediação obrigatória |

### Skills avulsas

| Skill | Função |
|---|---|
| `/executar-fluxo` | Fluxo E2E ad-hoc (suporta data-driven) |
| `/testar-forms` | Formulário específico (13 grupos de teste) |
| `/regressao` | Reteste após correção (visual-diff + detecção de flaky) |
| `/acessibilidade` | Auditoria WCAG 2.1 (níveis A/AA/AAA) |
| `/performance` | Core Web Vitals (LCP, FCP, CLS, TTFB, INP) |
| `/api-check` | Testes de API (segurança, auth, payloads, rate limiting) |
| `/usabilidade` | Avaliação heurística de UX (10 heurísticas de Nielsen) |
| `/testar-ia` | Testes em fluxos de IA (jailbreak, hallucination, guardrails) |
| `/push-bugs` | Publicação de bugs em Jira/GitHub Issues |

---

## 10. Analogias para o Time Comercial

### Analogia do Uber

Por baixo do Uber existe algoritmo de roteamento, cálculo de preço dinâmico, GPS em tempo real e sistema de pagamento — tudo extremamente complexo. Mas o usuário só vê: "para onde vai?" e "pedir carro". O BKPilot MVP funciona da mesma forma: toda a complexidade fica escondida atrás de 3 campos e 1 botão.

### Analogia do Carro Elétrico

O motorista dirige o carro (front-end). O motor pode ser bateria da Tesla, da BYD ou da CATL — tanto faz para quem dirige. O painel é exatamente o mesmo. Na nossa solução, a API é o "painel": você troca o motor (Claude Code → outro modelo) sem precisar reescrever a tela.

---

## 11. Próximos Passos

- [ ] Validar escopo do MVP com o time comercial
- [ ] Definir URL de demo (ex: demo.bugkillers.com.br)
- [ ] Iniciar desenvolvimento da skill `/pipeline-completo`
- [ ] Desenvolver API Node.js
- [ ] Desenvolver front-end web
- [ ] Deploy na VPS + configuração de HTTPS
- [ ] Sessão de testes com o time de vendas antes da primeira demonstração

---

*BugKillers — Setor de Inteligência Artificial*
*Documento Confidencial*
