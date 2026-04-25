# Mapa do Sistema — GNIweb

**URL Base:** `https://dev.sistemastega.com.br/gniweb/`
**Cliente:** 21-AMAILDO QUADRI - ME
**Plataforma:** GeneXus (TEGA Sistemas)
**Data do Mapeamento:** 2026-04-24_2228

---

## 1. Páginas Principais

| # | Página | URL | Tipo |
|---|---|---|---|
| 1 | Login | `/gni` | Autenticação |
| 2 | Dashboard Principal | `/paginaprincipal` | Menu de Módulos |
| 3 | Escolha de Opções (Módulo) | `/hescolhaopcaosistema?<id>,<nome>` | Menu Interno do Módulo |
| 4 | Cadastro Pedido de Vendas | `/wwpedidovendanovo` | Listagem/Grid |

---

## 2. Módulos Mapeados (18 total)

A tela inicial apresenta 18 ícones de módulos organizados em grid. Cada módulo navega para `hescolhaopcaosistema?<id>,<nome>`.

| # | Módulo | ID | URL |
|---|---|---|---|
| 1 | Atendimento | 34 | `hescolhaopcaosistema?34,GEST%C3%83O+DE+ATENDIMENTO` |
| 2 | Lojas | 918 | `hescolhaopcaosistema?918,GEST%C3%83O+DE+LOJAS` |
| 3 | CEPP | 105 | `hescolhaopcaosistema?105,GEST%C3%83O+CEPP` |
| 4 | CRM | 100 | `hescolhaopcaosistema?100,GEST%C3%83O+CRM` |
| 5 | Comercial | 15 | `hescolhaopcaosistema?15,GEST%C3%83O+COMERCIAL` |
| 6 | Compras | 16 | `hescolhaopcaosistema?16,GEST%C3%83O+DE+COMPRAS` |
| 7 | Contábil | 12 | `hescolhaopcaosistema?12,GEST%C3%83O+CONTABIL` |
| 8 | Custos | 17 | `hescolhaopcaosistema?17,GEST%C3%83O+DE+CUSTOS` |
| 9 | Estoque | 186 | `hescolhaopcaosistema?186,GEST%C3%83O+DE+ESTOQUE` |
| 10 | Financeiro | 18 | `hescolhaopcaosistema?18,GEST%C3%83O+FINANCEIRA` |
| 11 | Fiscal | 13 | `hescolhaopcaosistema?13,GEST%C3%83O+FISCAL` |
| 12 | Industrial | 14 | `hescolhaopcaosistema?14,GEST%C3%83O+INDUSTRIAL` |
| 13 | Manutenção | 455 | `hescolhaopcaosistema?455,GEST%C3%83O+DE+MANUTEN%C3%87%C3%83O` |
| 14 | Entidades | 87 | `hescolhaopcaosistema?87,GEST%C3%83O+DE+ENTIDADES` |
| 15 | Suporte | 9 | `hescolhaopcaosistema?9,GEST%C3%83O+DE+SUPORTE` |
| 16 | Transporte | 19 | `hescolhaopcaosistema?19,GEST%C3%83O+DE+TRANSPORTE` |
| 17 | Qualidade | 1252 | `hescolhaopcaosistema?1252,GEST%C3%83O+DE+QUALIDADE` |
| 18 | Gerencial | 3064 | `hescolhaopcaosistema?3064,GEST%C3%83O+GERENCIAL` |

---

## 3. Estrutura de Navegação

```
Login (/) → Dashboard (/paginaprincipal)
  ├── Módulo X → hescolhaopcaosistema?id,NOME
  │   └── Menu YUI TreeView (expandível)
  │       ├── Submenu/Configurações
  │       ├── Cadastros
  │       ├── Relatórios
  │       └── ...
  └── Outros módulos
```

Cada módulo possui uma tela de escolha de opções (`hescolhaopcaosistema`) que contém uma árvore de navegação (YUI TreeView) com diversas opções categorizadas.

---

## 4. Tecnologias Identificadas

- **Framework:** GeneXus (GXState, classes `gx-tab-*`, `gx-invisible`)
- **UI Library:** YUI (Yahoo! User Interface) — TreeView
- **Backend:** ASP.NET / GeneXus gerado
- **Arquitetura:** Server-rendered, postbacks tradicionais (não SPA)
- **Frontend:** Tabelas HTML aninhadas para layout

---

## 5. Observações Críticas

- Nenhum `data-testid` ou `data-qa` encontrado em todo o sistema
- IDs seguem padrão GeneXus (`vNOMEMODULO_0001`, `Grid1ContainerRow_0001`, `TABLE1_0001`) — previsíveis mas não semânticos
- Sistema utiliza tabelas aninhadas extensivamente para layout
- Navegação baseada em postbacks e recarregamento de página completa
- Menu principal é grid de ícones; menu interno é árvore YUI
