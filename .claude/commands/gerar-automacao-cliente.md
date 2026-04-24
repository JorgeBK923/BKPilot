# /gerar-automacao-cliente - Geracao de Codigo de Automacao para Entrega ao Cliente

> **REGRA EXPRESSA - CODIGO ENTREGAVEL E AUDITAVEL**
>
> Esta skill gera **codigo-fonte para o stack escolhido pelo cliente**, nao codigo interno do framework BugKillers.
>
> **NUNCA** gere automacao diretamente "do markdown para o codigo final" sem antes produzir uma especificacao intermediaria estruturada.
>
> Todo pacote gerado **DEVE** conter:
> - especificacao intermediaria em arquivo
> - codigo-fonte no stack solicitado
> - mapeamento `cenario -> arquivo gerado`
> - cobertura implementada vs. cobertura disponivel
> - pendencias e pontos frageis documentados
>
> **REGRA DE PRODUTIVIDADE REAL:** o objetivo desta skill e acelerar o QA automatizador, nao empurrar retrabalho. Codigo com erro de sintaxe, import quebrado, estrutura invalida ou padrao inconsistente **nao conta como ganho** e deve ser tratado como falha da geracao.


## Descricao
Transforma os artefatos produzidos pelo pipeline BugKillers em um pacote de automacao exportavel para o cliente final. A skill reaproveita o conhecimento ja extraido por `/explorar`, `/gerar-cenarios`, `/testar-modulo` e skills correlatas, normaliza isso em uma especificacao unica e gera codigo no stack escolhido pelo cliente.

O objetivo desta skill e produzir uma base auditavel para posterior consolidacao em uma automacao maior que sera entregue ao cliente.

## Uso
```bash
/gerar-automacao-cliente <cliente> --stack <stack> [--modulo <nome>] [--saida <dir>] [--padrao <page-objects|screenplay|keywords>] [--idioma <pt-BR|en-US>] [--modo-rerun <sobrescrever|snapshot|abortar>]
```

## Parametros
- `<cliente>` - identificador do cliente (obrigatorio). **Deve corresponder a uma pasta existente em `clients/<cliente>/`** â€” a skill le artefatos de entrada dessa pasta e grava a saida em `clients/<cliente>/entregaveis/`
- `--stack <stack>` - stack alvo do codigo. Obrigatorio. Valores suportados inicialmente:
  - `playwright-ts`
  - `playwright-js`
  - `cypress-ts`
  - `python-pytest`
  - `selenium-java`
  - `selenium-csharp`
  - `robot-framework`
- `--modulo <nome>` - gera apenas para o modulo informado
- `--saida <dir>` - diretorio de saida do pacote. Default: `entregaveis/<cliente>/automacao/<stack>/`
- `--padrao <page-objects|screenplay|keywords>` - padrao arquitetural do codigo. Se omitido, escolher o padrao mais natural do stack
- `--idioma <pt-BR|en-US>` - idioma dos nomes e comentarios gerados. Default: `pt-BR`
- `--modo-rerun <sobrescrever|snapshot|abortar>` - comportamento quando o pacote ja existe para este par `<cliente, stack>`. Default: `snapshot` (move saida anterior para `.history/<ts>/` antes de sobrescrever). `sobrescrever` remove o anterior sem snapshot. `abortar` para a execucao e pede intervencao manual

---

## Criterios de parada negativa

Voce **NAO PODE** encerrar a skill nem imprimir o resumo final enquanto qualquer item abaixo estiver falso:

- [ ] `--stack` foi informado e pertence a lista suportada
- [ ] Os artefatos obrigatorios de entrada existem em disco
- [ ] A especificacao intermediaria foi gerada antes de qualquer arquivo de codigo
- [ ] Cada cenario aproveitado possui mapeamento para ao menos um arquivo gerado, ou foi marcado como `nao automatizado` com justificativa
- [ ] O pacote final contem `README`, cobertura, pendencias e mapa de rastreabilidade
- [ ] Todo relatorio `.md` destinado ao cliente possui `.pdf` correspondente
- [ ] O codigo gerado esta coerente com o stack escolhido pelo cliente, sem misturar conventions de outro stack
- [ ] O codigo gerado passou por validacao tecnica minima do stack: sintaxe, imports/referencias, estrutura e arquivos obrigatorios
- [ ] Os arquivos gerados nao contem placeholders enganosos, trechos quebrados ou pseudo-codigo disfarÃ§ado de implementacao
- [ ] A saida deixa claro o que esta pronto, o que esta parcial e o que ainda depende de auditoria humana

**Regra de honestidade:** nao marque um cenario como implementado se o codigo gerado ainda nao cobre a navegacao, os passos ou a validacao esperada.

**Regra de desacoplamento:** a linguagem do projeto BugKillers **nao define** a linguagem de saida. O `--stack` do cliente e soberano.

**Regra da especificacao intermediaria:** e proibido pular a fase de normalizacao. O reuso do pipeline entra na especificacao, nao em copiar codigo interno cru para a entrega do cliente.

**Regra anti-retrabalho:** se o codigo exigir correcoes obvias para ao menos compilar, interpretar ou rodar o bootstrap do stack, ele deve ser marcado como `falha na geracao`, nao como `parcial`.

**Regra de governanca interna:** metadados de autoria, agente, modelo, executor e segregacao devem ser gravados apenas em log interno. Esses dados **NAO PODEM** aparecer no pacote do cliente, no `README_automacao.md`, no `resumo_geracao.md`, no `cobertura_automacao.md` ou em qualquer relatorio entregavel.

**Regra de PDF para cliente:** todo relatorio `.md` destinado ao cliente deve ter uma versao `.pdf` correspondente antes da entrega. Ao gerar `README_automacao.md`, `mapeamento_cenarios.md`, `cobertura_automacao.md`, `pendencias.md`, `inventario_arquivos.md`, `auditoria_codigo.md` ou `resumo_geracao.md`, gerar tambem o arquivo `.pdf` equivalente.

**Regra anti-vazamento de credenciais:** o pacote entregavel **NUNCA** pode conter senhas, tokens, conteudo de `.env`, valores reais de `QA_PASSWORD`, `JIRA_TOKEN`, `GITHUB_TOKEN` ou similares. No codigo gerado, usar apenas referencias a variaveis de ambiente (`process.env.QA_PASSWORD`, `os.environ["QA_PASSWORD"]`, `System.getenv("QA_PASSWORD")`, etc). Antes de aprovar, executar grep do pacote procurando por padroes de credencial vazada (ver Fase 6.3.3). Qualquer ocorrencia de valor real **reprova automaticamente** a geracao.

**Regra de re-run:** ao reexecutar a skill para o mesmo par `<cliente, stack>`, o `--modo-rerun` determina o comportamento. Default `snapshot` preserva a geracao anterior em `.history/<ts>/` â€” nunca perder silenciosamente o trabalho de uma execucao anterior.

---

## Fase 1 - Validacao de pre-condicoes

### 1.1 Verificar existencia do cliente

Confirmar que `clients/<cliente>/` existe e contem ao menos `config.json` e `login.js`. Se ausente, PARAR e exibir:

> âŒ Cliente `<cliente>` nao encontrado em `clients/`.
> Crie a pasta do cliente antes (`clients/<cliente>/config.json`, `clients/<cliente>/login.js`).

### 1.2 Verificar artefatos de entrada

Verificar existencia dos artefatos abaixo:

- `clients/<cliente>/estado/mapa.md`
- `clients/<cliente>/estado/fluxos.md`
- `clients/<cliente>/estado/elementos.json`
- `clients/<cliente>/estado/api_endpoints.json`
- `clients/<cliente>/cenarios/cenarios.xlsx` ou outro arquivo equivalente informado pelo contexto

Se qualquer artefato estrutural estiver ausente, PARAR e exibir:

> âŒ Artefatos insuficientes para gerar automacao do cliente.
> Execute primeiro: /explorar e /gerar-cenarios para o cliente `<cliente>`.

Se `--modulo` foi informado, filtrar fluxos, elementos e cenarios apenas do modulo solicitado, mantendo os endpoints e sinais transversais relevantes.

### 1.3 Tratamento de re-run

Verificar se `entregaveis/<cliente>/automacao/<stack>/` ja existe:

- **Nao existe:** criar e seguir.
- **Existe e `--modo-rerun=snapshot` (default):** mover conteudo para `entregaveis/<cliente>/automacao/<stack>/.history/<timestamp>/` antes de sobrescrever. Registrar o snapshot em `resumo_geracao.md`.
- **Existe e `--modo-rerun=sobrescrever`:** remover conteudo anterior sem preservar. Registrar a remocao no log de governanca.
- **Existe e `--modo-rerun=abortar`:** PARAR e exibir: `âŒ Pacote anterior encontrado em entregaveis/<cliente>/automacao/<stack>/. Use --modo-rerun=snapshot ou sobrescrever para prosseguir.`

---

## Fase 2 - Leitura e consolidacao das entradas

Ler e consolidar, no minimo:

- mapa de paginas e modulos
- fluxos navegacionais
- elementos interativos relevantes
- endpoints observados
- cenarios da planilha
- bugs marcados como `Alta` ou `Critica` em `resultado/<cliente>/latest/bugs_*.md` que alterem a estrategia de automacao (bugs de severidade menor nao entram na estrategia, so em `pendencias.md`)

Durante esta fase, extrair:

- pre-condicoes por fluxo
- dados de teste declarados
- asserts esperados
- seletores candidatos
- dependencias externas
- pontos de fragilidade conhecidos

Se houver conflito entre planilha e artefatos de exploracao, registrar o conflito em `pendencias.md` e seguir com a interpretacao mais conservadora.

---

## Fase 3 - Geracao da especificacao intermediaria

Antes de gerar qualquer codigo, criar:

- `entregaveis/<cliente>/automacao/<stack>/especificacao_automacao.json`

Estrutura minima obrigatoria:

```json
{
  "cliente": "nome-ou-id",
  "stack": "playwright-ts",
  "modulo": "ou null",
  "fluxos": [],
  "cenarios": [],
  "paginas": [],
  "elementos": [],
  "dados_teste": [],
  "asserts": [],
  "pendencias": []
}
```

Cada cenario da planilha reaproveitado deve ser normalizado com:

- `id`
- `modulo`
- `fluxo`
- `url_inicial`
- `passos_normalizados`
- `resultado_esperado`
- `dependencias`
- `risco`
- `status_geracao` = `gerar`, `parcial`, ou `nao_automatizar`

Tambem gerar:

- `entregaveis/<cliente>/automacao/<stack>/mapeamento_cenarios.md`

Este arquivo deve ligar cada ID de cenario a:

- fluxo normalizado
- arquivo que sera gerado
- status de cobertura

Tambem gerar um log tecnico interno de autoria em:

- `resultado/<cliente>/<timestamp>/governanca/automacao_autoria_<stack>.json`

Conteudo minimo:

```json
{
  "geracao_id": "auto-<cliente>-<stack>-YYYY-MM-DD_HHMM",
  "cliente": "nome-ou-id",
  "stack": "playwright-ts",
  "modulo": null,
  "timestamp": "YYYY-MM-DD_HHMM",
  "executor_modelo": "<modelo>",
  "executor_agente": "<agente-ou-instancia>",
  "origem_artefatos": [
    "clients/<cliente>/estado/mapa.md",
    "clients/<cliente>/estado/fluxos.md",
    "clients/<cliente>/estado/elementos.json",
    "clients/<cliente>/estado/api_endpoints.json",
    "clients/<cliente>/cenarios/cenarios.xlsx"
  ],
  "tipo": "geracao_automacao_cliente"
}
```

Este log e **exclusivamente interno** e nao deve ser copiado para `entregaveis/<cliente>/automacao/<stack>/`.

O `geracao_id` e **rastreavel** (nao puramente deterministico â€” o timestamp muda entre runs). Ele identifica de forma unica o par `<cliente, stack, execucao>` para correlacao com `/auditar-automacao-cliente`. Exemplo:

- `auto-acme-playwright-ts-2026-04-23_2140`

---

## Fase 4 - Escolha da arquitetura por stack

Aplicar o `--stack` como contrato de saida:

### `playwright-ts`
- preferir `tests/`, `pages/`, `fixtures/`
- usar TypeScript com tipagem basica
- padrao default: `page-objects`

### `playwright-js`
- preferir estrutura equivalente a Playwright, sem tipagem TS
- padrao default: `page-objects`

### `cypress-ts`
- preferir `e2e/`, `support/`, `fixtures/`
- comandos customizados apenas quando houver repeticao real

### `python-pytest`
- preferir `tests/`, `pages/`, `conftest.py`, `fixtures/`
- padrao default: `page-objects`

### `selenium-java`
- preferir projeto Maven ou Gradle simples
- separar `pages/`, `tests/`, `data/`
- padrao default: `page-objects`

### `selenium-csharp`
- preferir estrutura de solucao simples com `Pages/`, `Tests/`, `Fixtures/`
- padrao default: `page-objects`

### `robot-framework`
- preferir `tests/`, `resources/`, `variables/`
- padrao default: `keywords`

Se `--padrao` conflitar com o stack, manter o stack como prioridade e registrar a adaptacao no `README_automacao.md`.

---

## Fase 5 - Geracao do codigo do cliente

Gerar o pacote no diretorio de saida:

- `entregaveis/<cliente>/automacao/<stack>/codigo/`

O pacote deve conter, no minimo:

- estrutura de projeto do stack
- arquivos de teste cobrindo os cenarios selecionados
- camada de pagina/componente/quebrador de passos, quando aplicavel
- fixtures ou massa de dados minima
- arquivo de configuracao basico do stack

Regras obrigatorias:

- nomes de arquivos e modulos coerentes com o stack
- sem dependencias internas do BugKillers no codigo entregue
- sem `require()` ou imports do `core/` interno dentro do pacote do cliente
- comentarios apenas quando agregarem clareza
- se um passo nao puder ser automatizado com seguranca, gerar `TODO` claro e registrar em `pendencias.md`

Se existir cobertura parcial de um cenario, isso deve ficar explicito no mapa e no codigo.

---

## Fase 6 - Validacao tecnica obrigatoria do codigo gerado

Antes de considerar o pacote auditavel, executar uma revisao tecnica do codigo produzido.

### 6.1 Checklist obrigatorio

- validar sintaxe basica de todos os arquivos gerados
- validar imports, referencias, namespaces e caminhos internos
- validar consistencia estrutural do stack escolhido
- validar se os arquivos de configuracao minima existem
- validar se nomes de classes, funcoes e arquivos nao conflitam
- validar se o codigo implementa passos reais e nao placeholders vagos

### 6.2 Regras de reprovacao imediata

Marcar a geracao como reprovada se existir qualquer um dos casos abaixo:

- import quebrado
- arquivo referenciado mas nao gerado
- metodo chamado mas nao implementado
- seletor placeholder sem marcacao explicita
- pseudo-codigo como `implementar depois`, `fazer login aqui`, `clicar no botao correto`
- mistura de stacks no mesmo pacote
- arquivo de teste sem assert util
- codigo duplicado em excesso quando um objeto reutilizavel era claramente necessario

### 6.3 Validacoes minimas por stack

Executar, quando disponivel no ambiente, validacoes compativeis com o stack:

- `playwright-ts` e `cypress-ts`:
  - validacao de TypeScript
  - validacao de imports
  - smoke review dos arquivos de configuracao
- `playwright-js`:
  - validacao de sintaxe JS
  - validacao de imports/requires
- `python-pytest`:
  - validacao de sintaxe Python
  - validacao de imports e estrutura de pacote
- `selenium-java`:
  - validacao estrutural de classes, pacotes e dependencias declaradas
- `selenium-csharp`:
  - validacao estrutural de namespaces, classes e projeto
- `robot-framework`:
  - validacao de estrutura de suites, resources e keywords

Se a ferramenta de validacao do stack nao estiver disponivel, registrar isso explicitamente em `auditoria_codigo.md` e executar revisao estrutural manual linha a linha nos pontos criticos.

### 6.3.1 Comandos executaveis de validacao

Executar, a partir da raiz do pacote gerado (`entregaveis/<cliente>/automacao/<stack>/codigo/`), o comando correspondente ao stack. O resultado de cada comando deve ser anexado a `auditoria_codigo.md`.

| Stack | Comando de validacao |
|---|---|
| `playwright-ts` | `npx tsc --noEmit --project tsconfig.json` |
| `cypress-ts` | `npx tsc --noEmit --project tsconfig.json` |
| `playwright-js` | `find . -name "*.js" -not -path "./node_modules/*" -exec node --check {} \;` |
| `python-pytest` | `python -m py_compile $(find . -name "*.py" -not -path "./.venv/*") && python -m pytest --collect-only -q` |
| `selenium-java` | `mvn compile -q` (ou `gradle compileJava -q` se Gradle) |
| `selenium-csharp` | `dotnet build --nologo -v q` |
| `robot-framework` | `robot --dryrun .` |

Se a ferramenta (`tsc`, `python`, `mvn`, `dotnet`, `robot`) nao estiver disponivel no ambiente:

- registrar ausencia em `auditoria_codigo.md` com a frase exata: `Ferramenta <X> nao disponivel no ambiente â€” validacao executavel nao realizada.`
- executar revisao manual linha a linha dos imports, assinaturas e estrutura
- **nao marcar como `aprovado`** sem ao menos a revisao manual

### 6.3.2 Grep de placeholders proibidos

Executar obrigatoriamente antes de aprovar:

```bash
grep -rEn '(TODO implementar|FIXME|XXX|\?\?\?|implementar depois|fazer login aqui|clicar no botao correto|placeholder|pseudo-codigo|not\s+implemented)' entregaveis/<cliente>/automacao/<stack>/codigo/
```

Qualquer ocorrencia encontrada deve ser:

- removida (se era codigo lixo), ou
- reclassificada como `pendencia` explicita em `pendencias.md` com rationale tecnico

Nao aprovar enquanto o grep retornar resultados nao justificados.

### 6.3.3 Grep de credenciais vazadas

Executar obrigatoriamente antes de aprovar:

```bash
grep -rEn '(QA_PASSWORD\s*=\s*["'"'"'][^"'"'"']+["'"'"']|JIRA_TOKEN\s*=|GITHUB_TOKEN\s*=|password\s*[:=]\s*["'"'"'][^"'"'"']{4,}["'"'"']|secret\s*[:=]\s*["'"'"'][^"'"'"']{4,}["'"'"']|api[_-]?key\s*[:=]\s*["'"'"'][^"'"'"']{8,}["'"'"'])' entregaveis/<cliente>/automacao/<stack>/codigo/
```

Qualquer ocorrencia de valor real de senha, token ou segredo:

- **reprova automaticamente** a geracao (status `reprovado` em `auditoria_codigo.md`)
- deve ser substituida por referencia a variavel de ambiente (`process.env.QA_PASSWORD`, `os.environ["QA_PASSWORD"]`, `System.getenv("QA_PASSWORD")`, etc)
- apos a correcao, o grep deve ser reexecutado e sair limpo antes de reaprovar

### 6.4 Artefato obrigatorio de auditoria tecnica

Gerar:

- `auditoria_codigo.md`

Este arquivo deve conter:

- stack alvo
- validacoes executadas
- validacoes nao executadas e motivo
- erros encontrados e corrigidos durante a geracao
- riscos residuais
- decisao final: `aprovado`, `aprovado com ressalvas` ou `reprovado`

---

## Fase 7 - Auditoria do pacote gerado

Gerar obrigatoriamente:

- `README_automacao.md`
- `cobertura_automacao.md`
- `pendencias.md`
- `inventario_arquivos.md`
- `auditoria_codigo.md`

### `README_automacao.md`
Deve explicar:

- stack escolhida
- estrutura do pacote
- como executar
- pre-requisitos
- convencoes adotadas

### `cobertura_automacao.md`
Deve listar, usando **exclusivamente** as quatro categorias finais abaixo (nao usar rotulos de planejamento como "disponiveis" ou "gerar"):

- `implementado` â€” cenario coberto por codigo aprovado na Fase 6
- `parcialmente_implementado` â€” cenario coberto parcialmente (algum passo automatizado, algum ainda nao)
- `nao_automatizado` â€” cenario explicitamente fora do escopo de automacao
- `falha_geracao` â€” cenario que era para ser gerado (`status_geracao=gerar`) mas reprovou na Fase 6

#### Mapeamento obrigatorio Fase 3 â†’ Fase 7

| `status_geracao` (Fase 3, planejamento) | Aprovado na Fase 6? | Categoria final em `cobertura_automacao.md` |
|---|---|---|
| `gerar` | sim | `implementado` |
| `gerar` | nao | `falha_geracao` (listado tambem em `pendencias.md` com motivo tecnico) |
| `parcial` | sim | `parcialmente_implementado` |
| `parcial` | nao | `falha_geracao` |
| `nao_automatizar` | â€” | `nao_automatizado` |

Cenarios em `falha_geracao` **nao contam como implementados** no resumo e **nao podem** ser apresentados ao cliente como cobertura entregue.

### `pendencias.md`
Deve listar:

- seletores frageis
- dependencias externas nao resolvidas
- cenario bloqueado por ambiguidade funcional
- asserts que exigem validacao humana

### `inventario_arquivos.md`
Deve mapear:

- arquivo
- finalidade
- cenarios relacionados

**Proibicao expressa:** nenhum desses artefatos de entrega pode conter identidade do modelo, do agente, da instancia autora ou referencias ao log interno de governanca.

Tambem **nao** incluir `geracao_id` em artefatos voltados ao cliente, a menos que exista uma necessidade contratual explicita e separada.

---

## Fase 8 - Resumo final

Salvar um resumo executivo em:

- `entregaveis/<cliente>/automacao/<stack>/resumo_geracao.md`

Formato esperado:

```md
# Geracao de Automacao do Cliente
Cliente: <cliente>
Stack: <stack>
Modulo: <modulo ou todos>

## Resumo
- Total de cenarios de entrada: <n>
- Implementados: <n>
- Parcialmente implementados: <n>
- Nao automatizados: <n>
- Falha de geracao: <n>

## Artefatos
- especificacao_automacao.json
- mapeamento_cenarios.md
- codigo/
- cobertura_automacao.md
- pendencias.md
- README_automacao.md
- auditoria_codigo.md

## Riscos
- <item>
- <item>

## Re-run
- Modo: <sobrescrever|snapshot|abortar>
- Snapshot anterior: <caminho ou "nenhum">
```

Resumo terminal esperado:

```text
âœ… Geracao de automacao do cliente concluida
   Cliente: <cliente>
   Stack: <stack>
   Implementados: <n>/<total>
   Parciais: <n>
   Nao automatizados: <n>
   Falha de geracao: <n>
   Auditoria tecnica: aprovado | aprovado com ressalvas | reprovado
   Pacote: entregaveis/<cliente>/automacao/<stack>/

âž¡ Proximo passo:
   1. Auditar o pacote gerado
   2. Consolidar com outros modulos
   3. Entregar para a automacao principal do cliente
```

## Encadeia para
- `/regressao`
- `/relatorio-parcial`
- `/gerar-relatorio`

## Artefatos gerados
- `resultado/<cliente>/<timestamp>/governanca/automacao_autoria_<stack>.json` (interno, nao entregar ao cliente)
- `entregaveis/<cliente>/automacao/<stack>/especificacao_automacao.json`
- `entregaveis/<cliente>/automacao/<stack>/mapeamento_cenarios.md`
- `entregaveis/<cliente>/automacao/<stack>/mapeamento_cenarios.pdf`
- `entregaveis/<cliente>/automacao/<stack>/codigo/`
- `entregaveis/<cliente>/automacao/<stack>/README_automacao.md`
- `entregaveis/<cliente>/automacao/<stack>/README_automacao.pdf`
- `entregaveis/<cliente>/automacao/<stack>/cobertura_automacao.md`
- `entregaveis/<cliente>/automacao/<stack>/cobertura_automacao.pdf`
- `entregaveis/<cliente>/automacao/<stack>/pendencias.md`
- `entregaveis/<cliente>/automacao/<stack>/pendencias.pdf`
- `entregaveis/<cliente>/automacao/<stack>/inventario_arquivos.md`
- `entregaveis/<cliente>/automacao/<stack>/inventario_arquivos.pdf`
- `entregaveis/<cliente>/automacao/<stack>/auditoria_codigo.md`
- `entregaveis/<cliente>/automacao/<stack>/auditoria_codigo.pdf`
- `entregaveis/<cliente>/automacao/<stack>/resumo_geracao.md`
- `entregaveis/<cliente>/automacao/<stack>/resumo_geracao.pdf`
- `entregaveis/<cliente>/automacao/<stack>/.history/<timestamp>/` (apenas em re-run com `--modo-rerun=snapshot`)

