# LGPD Checklist — BKPilot

**Data:** 2026-05-14 | **Revisor:** GLM-5.1 (MAIA Security Skill)

---

## Checklist de Conformidade LGPD

### Base Legal e Finalidade

- [ ] **Finalidade definida?** — Parcial. Coleta de dados para testes QA esta documentada, mas nao ha politica formal de tratamento de dados.
- [ ] **Base legal identificada?** — Nao. Nao ha registro da base legal (consentimento, obrigacao legal, execucao de contrato) para processamento de dados pessoais nos testes.
- [ ] **Politica de privacidade?** — Nao existe no repositorio.

### Minimizacaoo e Necessidade

- [ ] **Dados minimos?** — Parcial. Screenshots e videos capturam toda a tela, incluindo dados alem do necessario para o teste.
- [ ] **Retencao definida?** — `retentionDays: 90` existe em config, mas **nao e implementado**. Dados acumulam-se indefinidamente.
- [ ] **Purga automatica?** — Nao existe. Remocao manual unica opcao.

### Mascaramento e Redacao

- [x] **CPF redatado em XML source?** — Sim. `mobile-redaction.js` regex `\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b`.
- [x] **CNPJ redatado?** — Sim.
- [x] **Email redatado?** — Sim.
- [x] **Telefone redatado?** — Sim (padrao BR com 8 ou 9 digitos).
- [x] **JWT/Bearer redatado em logs?** — Sim em `SECRET_PATTERNS`.
- [x] **Senhas redatadas em logs?** — Sim em `SECRET_PATTERNS`.
- [ ] **RG redatado?** — Nao. Nenhum pattern para Registro Geral.
- [ ] **PIS/PASEP redatado?** — Nao.
- [ ] **CEP redatado?** — Nao. CEP pode vincular pessoa a endereco.
- [ ] **CNH redatado?** — Nao.
- [ ] **Nome proprio redatado?** — Nao. Aparece em `text=` de elementos XML e screenshots.
- [ ] **Data de nascimento redatada?** — Nao.
- [ ] **Endereco redatado?** — Nao.
- [ ] **IP redatado?** — Nao.
- [x] **Cartao de credito redatado?** — Sim, mas regex e excessivamente amplo (falsos positivos).
- [ ] **Screenshots com PII mascarado?** — Nao. `screenshotFields: []` = nenhuma regiao coberta.
- [ ] **Videos com PII mascarado?** — Nao. Zero redacao frame a frame.
- [ ] **Logcat/Appium logs com PII redatado?** — Nao. `captureLogcat` e `captureAppiumLogs` nao aplicam redacao.
- [ ] **State JSON com PII redatado?** — Parcial. `redactWithFields` so por nome de campo, nao por conteudo.
- [ ] **Log events com URLs redatadas?** — Nao. `logEvent` escreve URLs com query strings sem redacao.

### Direitos do Titular

- [ ] **Direito de acesso?** — Nao implementado. Nao ha mecanismo para o titular solicitar seus dados.
- [ ] **Direito de eliminacao?** — Nao implementado. Retencao e manual e sem prazo.
- [ ] **Direito de portabilidade?** — Nao implementado.

### Compartilhamento com Terceiros

- [ ] **Dados enviados para IA externa?** — Sim. Appium XML, screenshots, e state JSON sao processados por LLMs (Claude, GLM, etc.).
- [ ] **Consentimento para processamento por IA?** — Nao documentado.
- [ ] **Dados de cliente em prompts de LLM?** — Sim. Config, spreadsheets, e browser state entram no contexto do LLM sem marcacao de dados nao-confiaveis.
- [ ] **Contrato de processamento de dados com provedores de IA?** — Nao verificado no escopo.

### Seguranca Tecnica

- [x] **.env protegido por .gitignore?** — Sim.
- [x] **Senhas nao hardcoded em codigo?** — Sim (somente env vars e placeholders).
- [x] **Bloqueio de senha inline?** — Sim (`env.js:6-9`).
- [ ] **HTTPS forcado para credenciais?** — Nao. Appium URLs aceitam HTTP.
- [ ] **Criptografia em repouso?** — Nao. Screenshots, videos, e logs em disco sem criptografia.
- [ ] **Controle de acesso a evidencias?** — Nao. Arquivos em disco sem protecao de acesso.

### Registro de Operacoes

- [ ] **Registro de operacoes com dados pessoais?** — Nao existe log de tratamento de dados pessoais.
- [ ] **Registro de incidentes de seguranca?** — Nao existe.

---

## Resumo

| Categoria | Aprovado | Pendente |
|---|---|---|
| Base Legal | 0 | 3 |
| Minimizacao | 1 | 2 |
| Redacao/Mascaramento | 7 | 11 |
| Direitos do Titular | 0 | 3 |
| Compartilhamento | 0 | 4 |
| Seguranca Tecnica | 3 | 3 |
| Registro | 0 | 2 |
| **Total** | **11** | **28** |

**Conformidade LGPD: INSUFICIENTE.** 28 de 39 itens pendentes. Nao e possivel processar dados pessoais reais em producao sem resolver os itens criticos de redacao, retencao e consentimento.