# Perfil de Risco — Módulo de Relatórios
Gerado em: 2026-04-16_1000
Módulo: Relatórios
Fonte de requisitos: `docs/requisitos/modulo de relatórios (revisado).md`

---

## 1. Questionário de Risco (8 perguntas)

### 1. Multi-tenant?
**Sim.**
Evidência: Requisitos §7.1 — "Cada usuário acessa apenas os relatórios da sua empresa (identificada por um código de licença). Não é possível acessar ou visualizar relatórios de outra empresa, mesmo conhecendo o identificador do relatório." Confirmado pela arquitetura geral: `licenses/{id}` em `api_endpoints.json`, licença "Gralha Azul" com `license_id` implícito em toda chamada (ver mapa.md: "Licença: Gralha Azul — 12/50 usuários").

### 2. Tem IA/LLM?
**Sim — intensamente.**
Evidência: Requisitos §2 — Geração de relatório usa IA intensamente; AI Assist usa IA moderadamente. A IA interpreta linguagem natural para gerar SQL, templates visuais, e propor edições. O checklist interativo (§3.1) é gerado pela IA com inferência automática. A transformação de dados (§7.4) executa código Python gerado pela IA.

### 3. Processa uploads de terceiros?
**Não diretamente no módulo de Relatórios.**
Evidência: O módulo de relatórios não tem upload próprio. Porém, o módulo de Importação de Dados (`/data-import`) alimenta as tabelas que o relatório consulta. A transformação de dados (§7.4) executa código Python, que é input indireto do usuário. Classificação: **Parcial** (input indireto via prompt → código gerado).

### 4. Tem volume grande?
**Parcial.**
Evidência: Requisitos mencionam listagem de "Meus Relatórios" com busca, filtro por pasta, paginação implícita. A exploração mostrou lista vazia (`fluxos.md`: "lista vazia"). O volume dependerá do uso, mas a consulta de dados pode retornar grandes volumes do banco (5 tabelas, 130 colunas, tabela de faturamento com potencialmente milhares de registros). O cache de 5 min (§4.1) indica preocupação com volume.

### 5. Tem concorrência de admin?
**Parcial.**
Evidência: Requisitos não mencionam edição colaborativa, mas o AI Assist (§5) pode ser usado simultaneamente por dois admins no mesmo relatório (fork é independente, mas edição direta não tem lock mencionado). Auto-save de estilo (§6.2) pode colidir. O histórico/versionamento (§7.3) pode ter conflitos de restauração.

### 6. Tem inputs de usuário livre?
**Sim — extensivamente.**
Evidência: Requisitos §3 — prompt de linguagem natural para gerar relatório; §5 — instruções de edição em linguagem natural via AI Assist; §3.2 — filtros de texto livre; §6.3 — busca por nome/descrição/tag; nome/descrição/tags do relatório (§6.3). Esses inputs vão para: prompt → IA → SQL query, render de template, e busca local.

### 7. Processa dados sensíveis?
**Sim.**
Evidência: O sistema é um BI corporativo para ERP (Gralha Azul Estofados / Solar Moveis Eirelli). As tabelas contêm dados de faturamento (`vw_bifaturamento_base`), estoque, produtos. A consulta gerada pela IA acessa diretamente o banco `gold_gralha`. Relatórios exportados como PDF podem conter dados financeiros sensíveis.

### 8. Depende de integrações externas?
**Parcial.**
Evidência: A IA depende de um pipeline de orquestração (bug de "sessão expirada" em `mapa.md` referencia pipeline IA). O cache usa Redis (§8: "Cache indisponível — Redis fora do ar"). A transformação de dados executa Python em sandbox. Cloudflare como CDN/WAF (scripts terceiros). Não há webhooks ou integrações externas explícitas no módulo de relatórios.

---

## 2. Classificação

### Módulo central do sistema
**Relatórios** é o módulo alvo desta geração. Dentro do sistema JCLA BI como um todo, o Chat é o módulo central (proposta de valor = BI conversacional). Porém, para esta geração focada em `--modulo Relatórios`, tratamos **Relatórios como módulo central** com mínimo de 15 cenários.

### Eixos de risco aplicáveis

| Eixo | Aplicável? | Justificativa | Orçamento mínimo |
|---|---|---|---|
| Funcional (fluxos) | Sim | 7 fluxos no requisito: geração, execução, AI Assist, listagem, favoritar, duplicar, excluir, histórico | 1 positivo + 2-4 negativos por fluxo = ~28 |
| Funcional (formulários) | Sim | Checklist (5 campos), Filtros (6 tipos), Modal criação, Modal edição metadados, Busca, Estilo | 1 válido + 4 parametrizados por form = ~24 |
| Injeção | Sim | Prompts de linguagem natural → IA → SQL; busca; nome/descrição/tags | 3 por campo livre ≥ 15 |
| Autorização | Sim | Endpoints mutativos previstos: POST/PUT/DELETE /reports, POST /reports/{id}/execute, POST /reports/{id}/ai-assist | 4 por endpoint ≥ 20 |
| Multi-tenant | Sim | Isolamento por licença explícito (§7.1) | 5 |
| IA/LLM | Sim | Geração com IA, AI Assist, checklist inferido, SQL gerado, código Python | 10 |
| Concorrência | Parcial | Auto-save, edição simultânea possível, histórico/restauração | 4 |
| Volume | Parcial | Listagem de relatórios, dados retornados por consulta, exportação | 4 |
| Rede | Sim | Streaming de preview (§6.2), geração longa, cache Redis | 3 |
| Encoding | Parcial | Nome/descrição com acentos, dados do banco com encoding BR, exportação PDF | 4 |
| A11y | Sim | Editor split-pane, modais, tabs, toolbars, busca | 7 (por componente) + 3 globais |
| Responsivo | Sim | Editor com dois painéis (chat + preview) | 5 |
| Performance | Sim | Geração longa, cache 5min, streaming, PDF | 3 |
| Bugs da exploração | Sim | 5 bugs distintos (CORS, 404 auditoria, 500 chart, sessão IA, cleanup pendente) — nem todos são do módulo de relatórios, mas os transversais (CORS, sessão) afetam | 3 × 2 bugs transversais = 6 |

**Total orçamento mínimo estimado: ~133 cenários** (antes da segunda passada adversarial).

---

## 3. Sinais da Exploração

### 3.1 Console Errors (console_log.json)
Classificação por grupo:

| # | Grupo | Erros | Classificação | Impacto no módulo Relatórios |
|---|---|---|---|---|
| C1 | Auth pré-login (401) | auth/me, auth/refresh, licenses, palette | Auth esperada | Baixo — pré-login normal |
| C2 | CORS telemetry | POST /api/telemetry blocked | CORS config | Médio — telemetria pode afetar tracking de uso de relatórios |
| C3 | Cloudflare 405 | POST _spark/loaded | 3rd party | Baixo — Cloudflare interno |
| C4 | Auditoria 404 | /api/logs/recent, /api/logs/stats/summary | Backend incompleto | Alto — se relatórios usa auditoria de acesso, pode falhar |
| C5 | Chart data 500 | /conversations/charts/{id}/data | Backend bug | Alto — relatórios geram gráficos que podem usar mesmo endpoint |
| C6 | Cloudflare ERR_ABORTED | POST cdn-cgi/rum | 3rd party | Baixo |

**Bugs que geram família de cenários para Relatórios:**
- **C2 (CORS)**: reprodução no contexto de relatórios (telemetria ao gerar/executar), variação (com/sem bloqueador de ads), regressão
- **C5 (500 chart data)**: reprodução (relatório com gráfico que usa mesmo endpoint), variação (gráfico com dados válidos vs inválidos), regressão
- **Sessão IA expirada** (mapa.md bug crítico #1): reprodução (gerar relatório com IA após sessão longa), variação (AI Assist após inatividade), regressão

### 3.2 Network Errors (network_log.json)
Mesmos grupos que console. Adicionalmente:
- Múltiplas chamadas 401 antes do login são padrão (SPA tentando refresh token)
- POST /api/telemetry com status 0 (CORS block) — recorrente

### 3.3 Endpoints Mutativos (api_endpoints.json)
Endpoints mutativos **existentes** que afetam Relatórios:

| Endpoint | Método | Cenários de autorização |
|---|---|---|
| POST /auth/login | POST | Bypass, token inválido |
| PUT /auth/me | PUT | IDOR (editar perfil de outro), mass assignment |
| POST /admin/users | POST | Privilege escalation (usuário Comum cria Admin) |
| PUT /admin/users/{id} | PUT | IDOR, mass assignment |
| DELETE /admin/users/{id} | DELETE | IDOR |
| POST /conversations | POST | IDOR (conversa em outra licença) |
| POST /api/import/upload | POST | Upload malicioso |
| POST /api/import/validate-table | POST | Injection via nome de tabela |
| POST /api/telemetry | POST | CORS bypass |

**Endpoints mutativos PREVISTOS pelo requisito (não descobertos na exploração):**
O módulo de relatórios ainda não foi totalmente exercitado na exploração (lista vazia). Os seguintes endpoints são esperados baseado nos requisitos:

| Endpoint esperado | Método | Operação |
|---|---|---|
| POST /reports | POST | Criar relatório (geração com IA) |
| PUT /reports/{id} | PUT | Editar metadados do relatório |
| DELETE /reports/{id} | DELETE | Excluir relatório |
| POST /reports/{id}/execute | POST | Executar relatório com filtros |
| POST /reports/{id}/ai-assist | POST | AI Assist — propor alteração |
| POST /reports/{id}/ai-assist/apply | POST | Aplicar proposta da IA |
| POST /reports/{id}/duplicate | POST | Duplicar (fork) relatório |
| PUT /reports/{id}/favorite | PUT | Favoritar/desfavoritar |
| POST /reports/{id}/export/pdf | POST | Exportar PDF |
| POST /reports/{id}/versions/{v}/restore | POST | Restaurar versão |

Cada um desses endpoints previstos receberá cenários de autorização (bypass, IDOR, escalation, mass assignment).

### 3.4 Cleanup Pendentes (cleanup_log.json)
- 3 conversas pendentes com status "pendente" — bug de sessão IA. Não são do módulo de relatórios, mas indicam que o pipeline de IA tem instabilidade que pode afetar a geração de relatórios.

---

## 4. Segunda Passada Adversarial
*(Será preenchida na Fase 4)*

