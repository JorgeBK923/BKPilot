// Resolve paths isolados por cliente.
//   resultado/<client>/<ts>/   → logs, screenshots, vídeos, summaries
//   estado/<client>/           → mapa, elementos, api_endpoints
// Cria todos os subdiretórios esperados.

const fs = require('fs');
const path = require('path');

function timestamp(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function resolveRunPaths({ clientId, ts = timestamp(), root = process.cwd() }) {
  if (!clientId) throw new Error('clientId obrigatório');
  const outDir = path.join(root, 'resultado', clientId, ts);
  const estadoDir = path.join(root, 'estado', clientId);

  const paths = {
    clientId,
    ts,
    root,
    outDir,
    estadoDir,
    rawDir: path.join(outDir, 'videos', '_raw'),
    videoDir: path.join(outDir, 'videos'),
    shotDir: path.join(outDir, 'screenshots'),
    evidDir: path.join(outDir, 'evidencias_anteriores'),
    consoleLog: path.join(outDir, 'console_log.json'),
    networkLog: path.join(outDir, 'network_log.json'),
    cleanupLog: path.join(outDir, 'cleanup_log.json'),
    reauthLog: path.join(outDir, 'reauth.json'),
    progressLog: path.join(outDir, 'progress.log'),
  };

  for (const d of [paths.outDir, paths.estadoDir, paths.rawDir, paths.videoDir, paths.shotDir, paths.evidDir]) {
    fs.mkdirSync(d, { recursive: true });
  }
  return paths;
}

module.exports = { resolveRunPaths, timestamp };
