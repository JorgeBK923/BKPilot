# Skill: MAIA Review

## Objetivo
Revisar qualidade técnica, escopo, segurança e documentação.

## Quando usar
Use antes de merge, entrega para cliente ou deploy.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Revisar diffs
2. Conferir aderência ao escopo
3. Checar riscos e segurança
4. Checar documentação
5. Emitir parecer

## Saídas obrigatórias
- review.md
- pendencias-review.md
- parecer-final.md

## Prompt de chamada rápida
```text
Use a skill MAIA Review para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

Demanda:
[cole aqui a demanda]

Contexto:
[cole aqui links, arquivos, prints ou descrição]
```

## Checklist de aprovação
- [ ] A saída respeita a fase da skill
- [ ] As hipóteses foram separadas dos fatos
- [ ] Os arquivos obrigatórios foram criados ou atualizados
- [ ] Os riscos foram registrados
- [ ] O próximo passo ficou claro
