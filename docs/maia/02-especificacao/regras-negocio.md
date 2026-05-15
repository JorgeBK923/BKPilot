# Regras de Negócio — Itens 1, 2, 6

**Skill:** MAIA Especificação (02)
**Data:** 2026-05-13

---

## RN1 — Entrega ao cliente

- **RN1.1** Cliente recebe apenas `.pdf` final + bug cards. Logs brutos, JSON de governança, identidade de modelo/agente **não** vão para cliente.
- **RN1.2** Todo `.md` destinado a cliente tem `.pdf` correspondente obrigatório.
- **RN1.3** Relatório que cite evidência inexistente em disco é considerado inválido — bloqueia entrega.
- **RN1.4** Bug card sem evidência visual é considerado bug incompleto — bloqueia push para issue tracker.

## RN2 — Identidade de execução

- **RN2.1** Cada execução mobile gera `sessionId` único rastreável em logs.
- **RN2.2** Cada evidência (screenshot, vídeo, XML) deve poder ser vinculada a: cliente, cenário, timestamp, device, provider, sessionId.
- **RN2.3** Naming de arquivo deve refletir vínculo: `<cenario>_<timestamp>_<sessionId>.<ext>` mínimo.

## RN3 — Provider e fallback

- **RN3.1** Se Sauce Labs indisponível, ordem de fallback: farm própria → USB local → resultado gravado (snapshot demo apenas).
- **RN3.2** Fallback automático **não** se aplica a execução em cliente real — apenas demo comercial.
- **RN3.3** Cliente real: falha de provider gera bloqueio explícito, não tenta fallback silencioso.

## RN4 — Limites Sauce Labs

- **RN4.1** Execução por cliente não pode exceder `mobile.limits.maxMinutesPerRun` configurado.
- **RN4.2** Sessões paralelas por cliente limitadas a `mobile.limits.maxConcurrentSessions` (default sugerido: 2; **hipótese**, validar com contrato Sauce).
- **RN4.3** Ao atingir 80% do limite mensal de minutos Sauce, sistema deve alertar antes de aceitar nova execução.
- **RN4.4** Ao atingir 100% do limite, novas execuções são bloqueadas com erro claro — não há fallback automático para farm própria sem aprovação.

## RN5 — Retry e flakiness

- **RN5.1** Erros transientes (timeout de criação de sessão, `ECONNRESET`, erro 5xx do provider) são retentáveis.
- **RN5.2** Erros de teste (assertion fail, elemento não encontrado após `findElement` timeout) **não** são retentáveis.
- **RN5.3** Máximo de retentativas: `mobile.retry.maxAttempts` (default sugerido: 2).
- **RN5.4** Cenário marcado como `flaky` exige 3 execuções; se 2 passarem, considera-se aprovado com flag.

## RN6 — Mascaramento

- **RN6.1** Categorias padrão (CPF, CNPJ, e-mail, telefone, cartão, token, senha) são **sempre** mascaradas — cliente não pode desabilitar sem flag `mobile.redaction.allowUnsafeDisable: true` auditável.
- **RN6.2** Arquivo original não-mascarado é considerado vazamento — pipeline aborta antes de persistir.
- **RN6.3** Falha de mascaramento gera bug interno P0 — não silencia.
- **RN6.4** Lista de campos sensíveis adicionais por cliente fica em `clients/<id>/config.json`, nunca commitada em código compartilhado.
- **RN6.5** `redaction_log.json` registra contagem e tipo de campo mascarado, **nunca** o valor original.

## RN7 — Retenção de artefatos

- **RN7.1** Artefatos em `clients/<id>/resultado/<timestamp>/` são mantidos por `mobile.evidence.retentionDays` (default sugerido: 90 dias).
- **RN7.2** Symlink `latest/` sempre aponta para execução mais recente.
- **RN7.3** Limpeza de artefatos antigos é manual nesta fase — automação fica para fase futura.

## RN8 — Governança Core vs Producao

- **RN8.1** Lógica de mascaramento (regex, policies) fica no `BKPilot-Core`, não no Producao.
- **RN8.2** Cliente só pode adicionar campos extras via configuração, não pode sobrescrever lógica.
- **RN8.3** Atualização de policies do Core exige bump de versão e validação em smoke antes de uso em cliente.
