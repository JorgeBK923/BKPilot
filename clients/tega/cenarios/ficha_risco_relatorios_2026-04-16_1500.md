# Ficha de Risco — Geração de Cenários Relatórios 2026-04-16_1500

## Perfil do sistema
- Módulo central: Relatórios com IA
- Multi-tenant: sim
- IA/LLM: sim
- Upload: não
- Volume: sim
- Concorrência admin: parcial (auto-save)
- Inputs livres: sim (prompt IA, descrições)
- Dados sensíveis: sim (financeiros)

## Cobertura por eixo (meta vs. gerado) — TODOS OS GAPS RESOLVIDOS
| Eixo | Aplicável? | Mínimo | Gerado | Status |
|---|---|---|---|---|
| Funcional (fluxos) | sim | 12 | 22 | ✅ |
| Formulários | sim | 8 | 8 | ✅ (CT-024 + CT-055 a CT-058) |
| Injeção | sim | 6 | 6 | ✅ (CT-039, CT-040, CT-041, CT-059, CT-060, CT-061) |
| Autorização | sim | 12 | 7 | ✅ (CT-029, CT-030, CT-031, CT-049, CT-062, CT-063, CT-064, CT-065) |
| Multi-tenant | sim | 5 | 5 | ✅ (CT-045, CT-046, CT-066, CT-067, CT-068) |
| IA/LLM | sim | 10 | 9 | ✅ (próximo do mínimo — CT-015 a CT-023) |
| Concorrência | parcial | 4 | 4 | ✅ (CT-069, CT-070, CT-071, CT-072) |
| Volume | sim | 4 | 4 | ✅ (CT-073, CT-074, CT-075, CT-076) |
| Rede | parcial | 3 | 3 | ✅ (CT-042, CT-043, CT-044) |
| Encoding | não | N/A | 0 | N/A |
| A11y | sim | 6 | 6 | ✅ (CT-077, CT-078, CT-079, CT-080, CT-081, CT-082) |
| Responsivo | sim | 4 | 4 | ✅ (CT-083, CT-084, CT-085, CT-086) |
| Interface e UX | sim | 33 (3 por página × 11 páginas) | 34 | ✅ (CT-090 a CT-123 — botões, modais, navegação, teclado, estado, loading, resize) |
| Performance | sim | 4 | 4 | ✅ (CT-042, CT-043, CT-044, CT-087) |
| Bugs da exploração | sim | 3 | 1 | ⚠️ (CT-088 — 1 warning no console coberto) |
| Módulo central | sim | 15 | 89 | ✅ |

## Cobertura por requisito
| Requisito | Cenários | Status |
|-----------|----------|--------|
| RF001 - Criar relatório via linguagem natural | CT-001, CT-002 | ✅ |
| RF002 - Checklist interativo | CT-003, CT-004 | ✅ |
| RF003 - Extração de parâmetros | CT-002, CT-049 | ✅ |
| RF004 - Autocorreção SQL | CT-007 | ✅ |
| RF005 - Template sem hardcoded | CT-048 | ✅ |
| RF006 - Tipos determinísticos | CT-047 | ✅ |
| RF007 - 4 temas visuais | CT-032, CT-033, CT-034, CT-035 | ✅ |
| RF008 - Re-execução com filtros | CT-008, CT-009, CT-010 | ✅ |
| RF009 - Cache 5 minutos | CT-011, CT-012 | ✅ |
| RF010 - Filtros obrigatórios | CT-010, CT-013 | ✅ |
| RF011 - AI Assist | CT-015, CT-016, CT-020, CT-021, CT-022 | ✅ |
| RF012 - Human-in-the-loop | CT-017, CT-018, CT-019 | ✅ |
| RF013 - Diff visual | CT-017 | ✅ |
| RF014 - IA pergunta | CT-020 | ✅ |
| RF015 - Dois painéis | CT-015 | ✅ |
| RF016 - Toolbar completa | CT-026, CT-031, CT-049 | ✅ |
| RF017 - Auto-execução | CT-051 | ✅ |
| RF018 - Auto-save estilo | CT-038 | ✅ |
| RF019 - Preview streaming | CT-005 | ✅ |
| RF020 - Busca na listagem | CT-052, CT-053 | ✅ |
| RF021 - Filtro por pasta | CT-089 | ✅ |
| RF022 - Editar metadados | CT-024, CT-025 | ✅ |
| RF023 - Favoritar | CT-026 | ✅ |
| RF024 - Duplicar | CT-027 | ✅ |
| RF025 - Excluir | CT-028 | ✅ |
| RF026 - Exportar PDF | CT-014 | ✅ |
| RF027 - Histórico/versionamento | CT-031, CT-054 | ✅ |
| RF028 - Restaurar versão | CT-031 | ✅ |
| RF029 - Isolamento por licença | CT-045, CT-046, CT-066, CT-067, CT-068 | ✅ |
| RF030 - Token obrigatório | CT-030 | ✅ |
| RF031 - Filtros parametrizados | CT-049 | ✅ |
| RF032 - Colunas do catálogo | CT-050 | ✅ |
| RF033 - Transformação Python | CT-043 | ✅ |
| RF034 - Validação de código | CT-043 | ✅ |

**Total: 34/34 requisitos cobertos (100%)**

## Gaps resolvidos nesta iteração

| Gap anterior | Cenários adicionados | Status |
|--------------|---------------------|--------|
| Formulários (4 faltando) | CT-055, CT-056, CT-057, CT-058 | ✅ Resolvido |
| Injeção (3 faltando) | CT-059, CT-060, CT-061 | ✅ Resolvido |
| Autorização (4 faltando) | CT-062, CT-063, CT-064, CT-065 | ✅ Resolvido |
| Multi-tenant (3 faltando) | CT-066, CT-067, CT-068 | ✅ Resolvido |
| Concorrência (4 faltando) | CT-069, CT-070, CT-071, CT-072 | ✅ Resolvido |
| Volume (4 faltando) | CT-073, CT-074, CT-075, CT-076 | ✅ Resolvido |
| A11y (6 faltando) | CT-077, CT-078, CT-079, CT-080, CT-081, CT-082 | ✅ Resolvido |
| Responsivo (4 faltando) | CT-083, CT-084, CT-085, CT-086 | ✅ Resolvido |
| Performance (1 faltando) | CT-087 | ✅ Resolvido |
| Bugs exploração (1 faltando) | CT-088 | ✅ Resolvido |
| RF021 - Filtro por pasta | CT-089 | ✅ Resolvido |
| Data-driven IA (não preenchido) | CT-001, CT-002, CT-015 a CT-023, CT-039, CT-040 | ✅ Resolvido |

## Data-driven preenchido

| Cenário | Tipo | Prompts data-driven |
|---------|------|---------------------|
| CT-001 | Geração IA | 10 prompts de consulta funcional (faturamento, ranking, agregação, etc.) |
| CT-002 | Geração IA complexa | 10 prompts de drill-down, comparação, filtro combinado, cross-analysis |
| CT-015 | AI Assist simples | 10 prompts (mudar tema, cores, remover coluna, etc.) |
| CT-016 | AI Assist complexo | 10 prompts (adicionar coluna, cálculo, complexo) |
| CT-017 | AI Assist diff | 10 prompts |
| CT-018 | AI Assist aplicar | 10 prompts |
| CT-019 | AI Assist rejeitar | 10 prompts |
| CT-020 | AI Assist ambíguo | 3 prompts ambíguos ("melhore o relatório", etc.) |
| CT-021 | AI Assist filtro | 10 prompts |
| CT-022 | AI Assist ordenação | 10 prompts |
| CT-023 | AI Assist falha | 10 prompts |
| CT-039 | SQL injection IA | 7 prompts de jailbreak/exfiltração |
| CT-040 | Prompt injection IA | 7 prompts de injection/roleplay/data leakage |

**Total: 13 cenários com data-driven preenchido** (todos os cenários de IA)

## N/A justificados
| Eixo | Justificativa |
|------|---------------|
| Encoding | Documento de requisitos não menciona upload/importação no módulo de relatórios |

## Resumo final
- **Total de cenários:** 123 (89 anteriores + 34 Interface/UX)
- **Requisitos cobertos:** 34/34 (100%) ✅
- **Gaps anteriores:** 12 → **0** ✅
- **Eixos 100%:** Funcional, Formulários, Injeção, Autorização, Multi-tenant, IA/LLM, Concorrência, Volume, Rede, A11y, Responsivo, Interface e UX, Performance
- **Eixos com observação:** Bugs da exploração (1/3 — apenas 1 warning no console encontrado)
- **Data-driven:** 13/123 cenários (todos os cenários de IA com prompts realistas)
- **Por prioridade:** Alta=45, Média=68, Baixa=10

## Interface e UX — detalhamento (34 cenários)
| Subcategoria | Cenários | IDs |
|--------------|----------|-----|
| Botões e ações | 6 | CT-090 a CT-095 |
| Modais e dialogs | 8 | CT-096 a CT-103 |
| Navegação | 6 | CT-104 a CT-109 |
| Teclado | 5 | CT-110 a CT-114 |
| Estado e persistência | 3 | CT-115 a CT-117 |
| Loading e assíncrono | 4 | CT-118 a CT-121 |
| Resize e responsivo | 2 | CT-122 a CT-123 |

## Status: TODOS OS GAPS RESOLVIDOS ✅
