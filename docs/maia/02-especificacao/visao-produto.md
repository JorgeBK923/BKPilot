# Visão de Produto — Itens 1, 2, 6 do BKPilot-Producao

**Data:** 2026-05-13
**Skill:** MAIA Especificação (02)
**Origem:** desbloqueio de ambiguidades apontadas pela MAIA Diagnóstico (01)

---

## Escopo desta especificação

Três entregas distintas mas relacionadas para a Release 0.1 do BKPilot-Producao mobile:

1. **Skill `/gerar-relatorio-final-mobile`** — consolida evidências web + mobile em `.md` + `.pdf`.
2. **Contrato de execução mobile por cliente** — template `config.json`, critérios de aceite, governança, retry/timeouts, limites Sauce Labs.
3. **Mascaramento de dados sensíveis em evidências** — screenshots e XML/source.

## Por que agora

- Smoke real Sauce Labs aprovado; próximo passo é E2E real com clientes.
- Sem contrato por cliente, cada onboarding vira customização manual.
- Sem mascaramento, evidência vira risco LGPD e bloqueio comercial.
- Sem relatório consolidado, entrega ao cliente fica incompleta.

## Usuários

- **QA operacional (interno BugKillers)** — executa skills, lê relatórios.
- **Cliente final** — recebe relatório `.pdf`, não acessa logs brutos.
- **Gestor BugKillers** — aprova entregas, audita evidências.
- **Engenheiro de plataforma** — mantém Core/Skills, atualiza policies.

## Fora de escopo desta especificação

- iOS (fase futura documentada).
- Mobile-demo do Comercial (escopo do Comercial).
- Upload automático de APK (V1-candidato, depende de adaptador).
- Appium Grid próprio (infra futura).
- Suporte a múltiplos devices em lote.

## Hipóteses (não validadas)

- **H1:** PDF será gerado via pipeline já existente do BugKillers (mesma stack do `/gerar-relatorio`).
- **H2:** Mascaramento de imagem usa OpenCV/sharp + lista de bounding boxes por seletor, não OCR.
- **H3:** Sauce Labs tem cota mensal definida em contrato — número exato desconhecido neste momento.
- **H4:** Cliente final aceita receber evidências por link assinado (S3/Drive) e não por anexo direto.

Hipóteses devem ser validadas antes de implementação ou viram perguntas pendentes.
