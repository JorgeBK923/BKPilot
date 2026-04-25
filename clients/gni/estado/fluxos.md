# Fluxos Críticos — GNIweb

**Data:** 2026-04-24_2228

---

## Fluxo 1: Login

1. Acessar `/gni`
2. Preencher campo `Usuário` (`#vUSUARIOLOGIN`)
3. Preencher campo `Senha` (`#vSENHA`)
4. Clicar em `CONFIRMAR` (`#BTNENTER`)
5. Redirecionamento para `/paginaprincipal`

**Seletores principais:**
- Usuário: `#vUSUARIOLOGIN`
- Senha: `#vSENHA`
- Botão entrar: `#BTNENTER`

---

## Fluxo 2: Navegação para Módulo

1. Dashboard `/paginaprincipal` exibe grid de 18 módulos
2. Cada módulo é clicável via link `<a href="hescolhaopcaosistema?ID,NOME">`
3. Navegação para tela de escolha de opções do módulo

**Seletores principais:**
- Módulos: links dentro de `tr[id^="Grid1ContainerRow"] td a`
- Nome do módulo: `input[id^="vNOMEMODULO_"]`

---

## Fluxo 3: Cadastro de Pedido de Vendas (CORE)

1. Dashboard → clicar em **Comercial**
2. Tela `GESTÃO COMERCIAL` → expandir árvore YUI **Cadastros**
3. Clicar em **Cadastro de Pedidos de VENDAS**
4. Navegação para `/wwpedidovendanovo`
5. Tela de listagem com filtros dinâmicos e grid de dados

**Seletores principais:**
- Filtro Empresa: `#vDYNAMICFILTERSOPERATOREMPRESAPEDIDOID`, `#vEMPRESAPEDIDOID`
- Filtro Tipo Pedido: `#vDYNAMICFILTERSOPERATORTIPOPEDIDOID`, `#vTIPOPEDIDOID`
- Filtro Nro.Pedido: `#vDYNAMICFILTERSOPERATORPEDIDOID`, `#vPEDIDOID`
- Filtro Cliente: `#vCLIENTENOME1`
- Checkbox Faturado: `#vPEDIDOFATURADO`
- Checkbox Cancelado: `#vPEDIDOCANCELADO`
- Status Pedido: `#vPEDIDOSTATUSPEDIDO`

**Complexidade:** Alto — múltiplos filtros, grid com paginação, múltiplas ações por linha

---

## Fluxo 4: Liberação de Pedidos

1. Dashboard → **Comercial**
2. Expandir árvore → clicar em **Liberação de Pedidos - 751**
3. Tela de liberação/workflow de pedidos

---

## Fluxo 5: Consulta de Estoque

1. Dashboard → **Estoque**
2. Expandir árvore → acessar consultas/cadastros de estoque

---

## Fluxo 6: Emissão de Relatório Fiscal

1. Dashboard → **Fiscal**
2. Expandir árvore → selecionar relatório desejado
3. Preencher parâmetros e gerar

---

## Observações sobre Fluxos

- Todos os fluxos dependem de navegação via YUI TreeView (expandir nós, clicar em folhas)
- O sistema não usa rotas SPA — cada ação gera postback e recarregamento completo
- Estado da sessão é mantido via cookies/GXState
- Filtros dinâmicos presentes em telas de listagem (prefixo `vDYNAMICFILTERS*`)
