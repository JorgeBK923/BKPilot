# Auditoria T8 Ciclo 3 - Etapa 1

Data: 2026-05-13

## Arquivos auditados

- `scripts/mobile-smoke.js`
- `scripts/gerar-relatorio-final-mobile.js`
- `scripts/gerar-indices.js`
- `docs/maia/02-especificacao/tarefa-8-video-logs.md`
- `HANDOFF.md`

## Funcoes genericas encontradas no Producao

Estas funcoes pertencem ao Core e devem sair de `scripts/mobile-smoke.js`:

- `captureSauceVideo`
- `captureLocalVideo`
- `captureLogs`
- `saveVideoBuffer`
- `convertWebmToMp4`
- `saveLogFile`
- `redactLog`
- `generateIndices`

Tambem existe import antecipado de `@bugkillers/bkpilot-core/mobile-recording`, mas o modulo ainda nao existe no Core publicado.

## `scripts/gerar-indices.js`

Existe e e redundante. Ele gera `videos_index.json` e `logs_index.json` varrendo diretorios, mas:

- usa `sessionId` fixo (`session_20260513_1530`);
- usa `cenario` fixo (`smoke_test`);
- estima `durationMs` por tamanho de arquivo;
- duplica responsabilidade que deve ficar no Core (`buildVideosIndex`, `buildLogsIndex`).

Decisao de remediacao: remover o arquivo apos mover a logica generica para o Core.

## `scripts/gerar-relatorio-final-mobile.js`

O arquivo tenta ler `videos_index.json` e `logs_index.json`, mas a auditoria encontrou trechos de string quebrados:

- `rel()` contem escape invalido em `.replace(/\/g, '/')`.
- `renderList()` produz template literal invalido.
- secao de bugs/pendencias contem interpolacao quebrada.

Decisao de remediacao: corrigir o script para ler os indices gerados pelo Core, validar paths existentes e citar videos/logs no markdown/PDF.

## Ordem de remediacao

1. Criar `BKPilot-Core/mobile-recording.js` e testes.
2. Refatorar `scripts/mobile-smoke.js` para usar somente helpers do Core.
3. Corrigir `scripts/gerar-relatorio-final-mobile.js`.
4. Remover `scripts/gerar-indices.js`.
5. Bump/tag Core `v0.2.3`.
6. Atualizar Producao e Comercial.
7. Rodar validacoes obrigatorias e sobrescrever resumo.

