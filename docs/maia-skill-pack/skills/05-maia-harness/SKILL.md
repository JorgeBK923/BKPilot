# Skill: MAIA Harness

## Objetivo
Preparar o ambiente para a IA trabalhar com segurança e previsibilidade.

## Quando usar
Use antes de liberar implementação por agentes/CLIs.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Criar estrutura de documentação
2. Definir instruções para agentes
3. Criar arquivos de progresso e decisões
4. Definir comandos de validação
5. Criar limites de atuação

## Saídas obrigatórias
- docs/maia/contexto.md
- docs/maia/progresso.md
- docs/maia/decisions.md
- AGENTS.md ou equivalente

## Prompt de chamada rápida
```text
Use a skill MAIA Harness para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

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
