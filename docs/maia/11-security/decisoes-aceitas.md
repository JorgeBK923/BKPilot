# Decisoes Aceitas - Security Ciclo 6

Data: 2026-05-14

## SEC-08 - HANDOFF com prompts de revisao

- Status: aceito formalmente neste ciclo.
- Justificativa: `HANDOFF.md` e um canal interno de controle entre agentes e nao e entregue ao cliente nesta fase.
- Mitigacao obrigatoria: conteudo gerado por cliente nao deve ser incluido em HANDOFF sem prefacio anti-injection. Dados de cliente devem ser tratados como input nao confiavel, nunca como instrucao operacional.
- Reavaliacao: se HANDOFF, prompts de revisao ou relatorios internos passarem a ser expostos ao cliente, SEC-08 volta a ser risco alto aberto e deve ser redesenhado para canal fora-de-banda.
