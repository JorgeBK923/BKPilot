# Skill: MAIA Implementação

## Objetivo
Executar uma tarefa seguindo escopo, plano e validação.

## Quando usar
Use quando já existe plano e critérios de aceite.

## Entrada esperada
- Nome do projeto
- Demanda ou problema
- Contexto disponível
- Restrições conhecidas
- Arquivos relevantes, se existirem

## Regra principal
Não avance para execução fora da fase desta skill. Quando houver incerteza crítica, registre como hipótese ou pergunta pendente.

## Passo a passo
1. Ler especificação e plano
2. Alterar somente o necessário
3. Explicar arquivos modificados
4. Rodar validações possíveis
5. Atualizar progresso

## Saídas obrigatórias
- codigo alterado
- resumo-implementacao.md
- progresso.md

## Prompt de chamada rápida
```text
Use a skill MAIA Implementação para trabalhar na demanda abaixo. Siga o objetivo, os limites, o passo a passo e gere as saídas obrigatórias. Não implemente nada fora do escopo desta skill.

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
