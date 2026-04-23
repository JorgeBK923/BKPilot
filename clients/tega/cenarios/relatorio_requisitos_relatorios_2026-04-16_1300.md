# Relatório de Requisitos — Módulo de Relatórios

**Gerado em:** 2026-04-16_1300  
**Documento fonte:** `docs/requisitos/modulo de relatórios (revisado).md`  
**Tipo:** DOCX (extraído via mammoth)  
**Versão do documento:** 1.0 (Julho 2025)

---

## Documento Fonte

| Atributo | Valor |
|----------|-------|
| Arquivo | `docs/requisitos/modulo de relatórios (revisado).docx` |
| Tipo | DOCX |
| Versão | 1.0 |
| Classificação | Uso interno — Time de QA |
| Última atualização | Julho 2025 |
| Seções | 10 |
| Requisitos extraídos | 42 |

---

## Requisitos Funcionais

| ID | Descrição | Cenários | Cobertura no mapa | Status |
|----|-----------|----------|-------------------|--------|
| RF001 | Criar relatório do zero via linguagem natural | CT-001, CT-002 | /reports + modal "Novo Relatório" encontrados | ✅ |
| RF002 | Checklist interativo com 5 pontos de confirmação | CT-003, CT-004 | ⚠️ Não mapeado na exploração | ⚠️ Gap |
| RF003 | Extração automática de parâmetros/filtros | CT-002, CT-049 | ⚠️ Não mapeado explicitamente | ⚠️ Gap |
| RF004 | Geração e validação dos dados com autocorreção | CT-007 | ⚠️ Não mapeado | ⚠️ Gap |
| RF005 | Geração do visual (template) sem valores hardcoded | CT-048 | ⚠️ Não verificável no mapa | ⚠️ Gap |
| RF006 | Tipos de coluna determinísticos pelo banco | CT-047 | ⚠️ Não verificável no mapa | ⚠️ Gap |
| RF007 | 4 temas visuais (Corporate, Modern, Minimal, Classic) | CT-032, CT-033, CT-034, CT-035 | Apenas "Corporativo" encontrado no modal Estilo | ⚠️ Parcial |
| RF008 | Re-execução com filtros (sem IA) | CT-008, CT-009, CT-010 | ⚠️ Botão "Executar" não mapeado | ⚠️ Gap |
| RF009 | Cache de 5 minutos transparente | CT-011, CT-012 | ⚠️ Comportamento backend não verificável | ⚠️ Gap |
| RF010 | Validação de filtros obrigatórios | CT-010, CT-013 | ⚠️ Não mapeado | ⚠️ Gap |
| RF011 | AI Assist - edição assistida por IA | CT-015, CT-016, CT-020, CT-021, CT-022 | Área "Assistente" encontrada, mas AI Assist não testado | ⚠️ Parcial |
| RF012 | Human-in-the-loop (IA propõe, usuário confirma) | CT-017, CT-018, CT-019 | ⚠️ Não mapeado | ⚠️ Gap |
| RF013 | Diff visual (linhas verdes/vermelhas) | CT-017 | ⚠️ Não mapeado | ⚠️ Gap |
| RF014 | IA pergunta quando precisa de mais informações | CT-020 | ⚠️ Não mapeado | ⚠️ Gap |
| RF015 | Editor com dois painéis (Chat + Preview) | CT-015 | Painéis Assistente e Preview encontrados | ✅ |
| RF016 | Toolbar: Executar, Filtros, Estilo, Template, Histórico, Código, Favoritar | CT-026, CT-031, CT-049 | Apenas "Estilo" e "Ações" mapeados | ⚠️ Parcial |
| RF017 | Auto-execução na abertura do editor | CT-051 | ⚠️ Comportamento não testado | ⚠️ Gap |
| RF018 | Auto-save de estilo após 1.5s | CT-038 | ⚠️ Comportamento não testado | ⚠️ Gap |
| RF019 | Preview via streaming durante geração | CT-005 | Área Preview existe mas sem conteúdo | ⚠️ Parcial |
| RF020 | Listagem com busca por nome/descrição/tag | CT-052, CT-053 | Campo de busca encontrado | ✅ |
| RF021 | Filtro por pasta na listagem | CT-024 | ⚠️ Não mapeado | ⚠️ Gap |
| RF022 | Editar metadados (nome, descrição, pasta, tags) | CT-024, CT-025 | Modal "Novo Relatório" com 4 campos encontrado | ✅ |
| RF023 | Favoritar relatório | CT-026 | ⚠️ Botão não mapeado | ⚠️ Gap |
| RF024 | Duplicar (fork) relatório | CT-027 | "Criar cópia" encontrado no menu Ações | ✅ |
| RF025 | Excluir relatório | CT-028 | "Excluir" encontrado no menu Ações | ✅ |
| RF026 | Exportação para PDF | CT-014 | "Exportar PDF" encontrado (disabled) | ✅ |
| RF027 | Histórico e versionamento de relatórios | CT-031, CT-054 | "Histórico de versões" encontrado no menu Ações | ✅ |
| RF028 | Restaurar versão anterior | CT-031 | ⚠️ Não testado | ⚠️ Gap |
| RF029 | Isolamento por licença (multi-tenant) | CT-045, CT-046 | ⚠️ Não verificável no mapa | ⚠️ Gap |
| RF030 | Requisições sem token são rejeitadas | CT-030 | ⚠️ Não testado | ⚠️ Gap |
| RF031 | Filtros usam valores parametrizados (não concatenados) | CT-049 | ⚠️ Não verificável no mapa | ⚠️ Gap |
| RF032 | Consulta só referencia colunas do catálogo | CT-050 | ⚠️ Não verificável no mapa | ⚠️ Gap |
| RF033 | Transformação de dados via Python (avançado) | CT-043 | ⚠️ Não mapeado | ⚠️ Gap |
| RF034 | Código de transformação validado antes da execução | CT-043 | ⚠️ Não mapeado | ⚠️ Gap |

---

## Requisitos Não Funcionais

| ID | Tipo | Descrição | Cenários |
|----|------|-----------|----------|
| RNF001 | Performance | Cache com duração de 5 minutos | CT-011, CT-012 |
| RNF002 | Performance | Auto-correção automática de SQL (1 tentativa) | CT-007 |
| RNF003 | Performance | Preview via streaming durante geração | CT-005 |
| RNF004 | Performance | Transformação timeout 30s com fallback | CT-043 |
| RNF005 | Performance | Fallback de template para tabular simples | CT-044 |
| RNF006 | Performance | Cache Redis indisponível → consulta direta ao banco | CT-042 |
| RNF007 | Segurança | Isolamento por licença (multi-tenant) | CT-045, CT-046 |
| RNF008 | Segurança | Autenticação obrigatória | CT-030 |
| RNF009 | Segurança | SQL injection sanitizado | CT-039 |
| RNF010 | Segurança | Prompt injection ignorado | CT-040 |
| RNF011 | Segurança | XSS sanitizado em nome/descrição | CT-041 |
| RNF012 | Segurança | Filtros parametrizados (não concatenados) | CT-049 |
| RNF013 | Estilo | 4 temas visuais disponíveis | CT-032, CT-033, CT-034, CT-035 |
| RNF014 | Estilo | Auto-save de estilo após 1.5s | CT-038 |

---

## Gaps de Implementação

| # | Requisito | Gap | Impacto |
|---|-----------|-----|---------|
| 1 | RF002 - Checklist interativo | Não encontrado no mapa. A exploração não navegou pelo fluxo de criação completo. | Alto — funcionalidade central |
| 2 | RF003 - Extração automática de filtros | Não mapeado explicitamente. | Médio |
| 3 | RF004 - Autocorreção de SQL | Não mapeado. Comportamento backend. | Alto — afeta confiabilidade |
| 4 | RF008 - Botão "Executar" | Não encontrado no mapa. Apenas abas "Estilo" e "Ações" mapeadas. | Alto — funcionalidade central |
| 5 | RF012 - Human-in-the-loop | Não mapeado. Regra de negócio crítica. | Alto — segurança |
| 6 | RF013 - Diff visual | Não mapeado. | Médio |
| 7 | RF014 - IA faz perguntas | Não mapeado. | Médio |
| 8 | RF016 - Toolbar completa | Apenas "Estilo" e "Ações" mapeados. Faltam: Executar, Filtros, Template, Código, Favoritar. | Alto |
| 9 | RF017 - Auto-execução na abertura | Comportamento não testado. | Baixo |
| 10 | RF018 - Auto-save de estilo | Comportamento não testado. | Médio |
| 11 | RF021 - Filtro por pasta | Não mapeado. | Baixo |
| 12 | RF023 - Favoritar | Botão não mapeado. | Baixo |
| 13 | RF028 - Restaurar versão | Não testado. | Médio |
| 14 | RF029 - Isolamento por licença | Não verificável no mapa. | Alto — segurança |
| 15 | RF033/034 - Transformação Python | Não mapeado. | Baixo — funcionalidade avançada |

**Total de gaps:** 15

---

## Funcionalidades no Mapa sem Requisito

| Funcionalidade | Requisito correspondente | Observação |
|----------------|-------------------------|------------|
| Menu "Ações" com "Limpar cache" | Não mencionado nos requisitos | Funcionalidade adicional não documentada |
| Campo de busca "Buscar relatórios..." | RF020 (busca por nome/descrição/tag) | ✅ Coberto |
| Relatório "hhh" (Rascunho) | RF001 (criar relatório) | ✅ Coberto |

---

## Resumo

| Métrica | Valor |
|---------|-------|
| Requisitos funcionais extraídos | 34 |
| Requisitos não funcionais extraídos | 14 |
| **Total de requisitos** | **42** |
| Requisitos com cobertura no mapa | 14 |
| Requisitos com cobertura parcial | 8 |
| Requisitos com gap (sem cobertura) | 20 |
| Funcionalidades no mapa sem requisito | 1 |
| Cenários gerados | 54 |
| Cenários Alta prioridade | 25 |
| Cenários Média prioridade | 27 |
| Cenários Baixa prioridade | 2 |

---

## Recomendações

1. **Explorar o fluxo de criação completo** — o checklist interativo (RF002) não foi mapeado. Navegar pelo modal "Novo Relatório" até o assistente IA para capturar o checklist.
2. **Mapear a toolbar completa** — botões Executar, Filtros, Template, Código e Favoritar não foram encontrados.
3. **Testar AI Assist end-to-end** — a área "Assistente" existe mas o fluxo completo (pergunta → proposta → diff → aplicar/rejeitar) não foi testado.
4. **Validar isolamento por licença** — requisito de segurança crítico (RF029) não verificável via exploração superficial.
5. **Atualizar documento de requisitos** — o menu "Ações" tem item "Limpar cache" não documentado nos requisitos.

---

*Relatório gerado automaticamente pela skill /gerar-cenarios em modo requirements-driven*
