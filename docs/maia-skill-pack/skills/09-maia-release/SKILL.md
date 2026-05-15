# Skill: MAIA Release

## Objetivo
Preparar entrega controlada, changelog e plano de rollback.

## Quando usar
Use antes de publicar uma versão, hotfix ou entrega oficial.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Consolidar mudanças
2. Gerar changelog
3. Definir checklist de deploy
4. Definir rollback
5. Confirmar evidências

## Saídas obrigatórias
- release-notes.md
- checklist-deploy.md
- rollback.md

## Prompt de chamada rápida
```text
Use a skill MAIA Release para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

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
