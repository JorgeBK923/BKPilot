# Skill: MAIA Diagnóstico

## Objetivo
Entender o estado atual de um projeto antes de propor mudança.

## Quando usar
Use quando receber um projeto novo, legado, bug crítico, documentação confusa ou demanda sem contexto.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Mapear objetivo do projeto
2. Ler arquivos principais
3. Identificar stack, riscos, lacunas e pendências
4. Separar fatos de hipóteses
5. Gerar diagnóstico acionável

## Saídas obrigatórias
- diagnostico.md
- riscos-iniciais.md
- perguntas-pendentes.md

## Prompt de chamada rápida
```text
Use a skill MAIA Diagnóstico para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

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
