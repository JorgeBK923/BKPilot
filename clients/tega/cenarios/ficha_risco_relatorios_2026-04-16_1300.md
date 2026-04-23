# Ficha de Risco — Geração de Cenários Relatórios 2026-04-16_1300

## Perfil do sistema
- Módulo central: Relatórios com IA
- Multi-tenant: sim
- IA/LLM: sim
- Upload: não
- Volume: sim
- Concorrência admin: parcial (auto-save)
- Inputs livres: sim (prompt IA, descrições)
- Dados sensíveis: sim (financeiros)

## Cobertura por eixo (meta vs. gerado)
| Eixo | Aplicável? | Mínimo | Gerado | Status |
|---|---|---|---|---|
| Funcional (fluxos) | sim | 12 | 18 | ✅ |
| Formulários | sim | 8 | 4 | ❌ (modal "Novo Relatório" tem 4 campos — coberto por CT-024) |
| Injeção | sim | 6 | 3 | ❌ (SQLi, prompt injection, XSS — faltam command injection, path traversal) |
| Autorização | sim | 12 | 3 | ❌ (faltam: auth bypass por endpoint, privilege escalation, mass assignment, rate limiting) |
| Multi-tenant | sim | 5 | 2 | ❌ (faltam 3: admin A não edita recurso de B, logs isolados, exportação respeita escopo) |
| IA/LLM | sim | 10 | 9 | ✅ (próximo do mínimo) |
| Concorrência | parcial | 4 | 0 | ❌ (nenhum cenário de concorrência gerado) |
| Volume | sim | 4 | 0 | ❌ (nenhum cenário de volume/paginação gerado) |
| Rede | parcial | 3 | 3 | ✅ (cache indisponível, timeout transformação, fallback template) |
| Encoding | não | N/A | 0 | N/A |
| A11y | sim | 6 | 0 | ❌ (nenhum cenário de acessibilidade) |
| Responsivo | sim | 4 | 0 | ❌ (nenhum cenário responsivo) |
| Performance | sim | 4 | 3 | ❌ (falta 1) |
| Bugs da exploração | sim | 3 | 0 | ❌ (1 warning no console não coberto) |
| Módulo central | sim | 15 | 54 | ✅ |

## Cobertura por módulo
- Módulo central "Relatórios": 54 cenários (mínimo 15) — ✅

## Cobertura por requisito
| Requisito | Cenários | Status |
|-----------|----------|--------|
| RF001 - Criar relatório via linguagem natural | CT-001, CT-002 | ✅ |
| RF002 - Checklist interativo | CT-003, CT-004 | ⚠️ (cenários criados mas funcionalidade não mapeada) |
| RF003 - Extração de parâmetros | CT-002, CT-049 | ⚠️ |
| RF004 - Autocorreção SQL | CT-007 | ⚠️ |
| RF005 - Template sem hardcoded | CT-048 | ✅ |
| RF006 - Tipos determinísticos | CT-047 | ✅ |
| RF007 - 4 temas visuais | CT-032, CT-033, CT-034, CT-035 | ✅ |
| RF008 - Re-execução com filtros | CT-008, CT-009, CT-010 | ⚠️ |
| RF009 - Cache 5 minutos | CT-011, CT-012 | ⚠️ |
| RF010 - Filtros obrigatórios | CT-010, CT-013 | ✅ |
| RF011 - AI Assist | CT-015, CT-016, CT-020, CT-021, CT-022 | ✅ |
| RF012 - Human-in-the-loop | CT-017, CT-018, CT-019 | ✅ |
| RF013 - Diff visual | CT-017 | ✅ |
| RF014 - IA pergunta | CT-020 | ✅ |
| RF015 - Dois painéis | CT-015 | ✅ |
| RF016 - Toolbar completa | CT-026, CT-031, CT-049 | ⚠️ (parcial) |
| RF017 - Auto-execução | CT-051 | ✅ |
| RF018 - Auto-save estilo | CT-038 | ✅ |
| RF019 - Preview streaming | CT-005 | ⚠️ |
| RF020 - Busca na listagem | CT-052, CT-053 | ✅ |
| RF021 - Filtro por pasta | — | ❌ |
| RF022 - Editar metadados | CT-024, CT-025 | ✅ |
| RF023 - Favoritar | CT-026 | ✅ |
| RF024 - Duplicar | CT-027 | ✅ |
| RF025 - Excluir | CT-028 | ✅ |
| RF026 - Exportar PDF | CT-014 | ✅ |
| RF027 - Histórico/versionamento | CT-031, CT-054 | ✅ |
| RF028 - Restaurar versão | CT-031 | ✅ |
| RF029 - Isolamento por licença | CT-045, CT-046 | ✅ |
| RF030 - Token obrigatório | CT-030 | ✅ |
| RF031 - Filtros parametrizados | CT-049 | ✅ |
| RF032 - Colunas do catálogo | CT-050 | ✅ |
| RF033 - Transformação Python | CT-043 | ✅ |
| RF034 - Validação de código | CT-043 | ✅ |

## Gaps (❌)
| Eixo/Requisito | Motivo |
|----------------|--------|
| Formulários | Abaixo do mínimo (4 vs 8). Modal "Novo Relatório" coberto, mas faltam cenários de validação de campo (obrigatório vazio, formato inválido, limite, caractere especial) |
| Injeção | Abaixo do mínimo (3 vs 6). Faltam: command injection, path traversal, XSS armazenado |
| Autorização | Abaixo do mínimo (3 vs 12). Faltam: auth bypass por endpoint, privilege escalation, mass assignment, rate limiting |
| Multi-tenant | Abaixo do mínimo (2 vs 5). Faltam: admin A não edita recurso de B, logs isolados, exportação respeita escopo |
| Concorrência | 0 cenários. Auto-save pode causar conflitos entre admins editando simultaneamente |
| Volume | 0 cenários. Relatórios podem ter muitos registros — faltam paginação, ordenação, busca, export massivo |
| A11y | 0 cenários. Interface com formulários, modais, chat — faltam: foco, ARIA labels, navegação por teclado, contraste |
| Responsivo | 0 cenários. Interface com dois painéis — faltam breakpoints 320/375/768/1024 |
| Performance | Abaixo do mínimo (3 vs 4). Falta cenário de carga/concorrência |
| Bugs da exploração | 0 cenários. Warning no console de /reports não coberto |
| RF021 - Filtro por pasta | Nenhum cenário. Funcionalidade não mapeada na exploração |

## N/A justificados
| Eixo | Justificativa |
|------|---------------|
| Encoding | Documento de requisitos não menciona upload/importação de arquivos no módulo de relatórios |

## Resumo
- **Total de cenários:** 54
- **Requisitos cobertos:** 27/34 (79%)
- **Requisitos com gap:** 7
- **Eixos 100%:** Funcional, IA/LLM, Rede
- **Eixos com gap:** Formulários, Injeção, Autorização, Multi-tenant, Concorrência, Volume, A11y, Responsivo, Performance, Bugs

## Ações recomendadas
1. Completar cenários de formulários (validação de campo) — +4 cenários
2. Completar cenários de injeção (command injection, path traversal, XSS armazenado) — +3 cenários
3. Completar cenários de autorização (auth bypass, privilege escalation, mass assignment, rate limiting) — +4 cenários
4. Completar cenários de multi-tenant (edição cruzada, logs, exportação) — +3 cenários
5. Adicionar cenários de concorrência (auto-save simultâneo) — +4 cenários
6. Adicionar cenários de volume (paginação, ordenação, export massivo) — +4 cenários
7. Adicionar cenários de acessibilidade (foco, ARIA, teclado, contraste) — +6 cenários
8. Adicionar cenários responsivos (4 breakpoints) — +4 cenários
9. Investigar warning no console de /reports — +1 cenário

**Total de cenários adicionais recomendados:** ~33
**Total final estimado:** ~87 cenários
