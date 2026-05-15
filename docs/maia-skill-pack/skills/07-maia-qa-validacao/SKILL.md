# Skill: MAIA QA Validação

## Objetivo
Validar entrega com cenários, regressão e riscos de qualidade.

## Quando usar
Use após implementação, hotfix, release ou mudança relevante.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Mapear impacto funcional
2. Gerar cenários de teste
3. Definir regressão mínima
4. Listar evidências esperadas
5. Aprovar ou reprovar tecnicamente

## Saídas obrigatórias
- plano-testes.md
- cenarios-teste.md
- checklist-regressao.md
- riscos-qa.md

## Prompt de chamada rápida
```text
Use a skill MAIA QA Validação para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

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
