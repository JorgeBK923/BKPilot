// Resolve paths isolados por cliente.
//   clients/<id>/resultado/<ts>/ -> logs, screenshots, videos, summaries
//   clients/<id>/estado/         -> mapa, elementos, api_endpoints
// Cria todos os subdiretorios esperados e atualiza clients/<id>/resultado/latest.

const fs = require('fs');
const path = require('path');

function timestamp(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function resolveRunPaths({ clientId, ts = timestamp(), root = process.cwd() }) {
  if (!clientId) throw new Error('clientId obrigatorio');

  const clientDir = path.join(root, 'clients', clientId);
  const resultadoDir = path.join(clientDir, 'resultado');
  const outDir = path.join(resultadoDir, ts);
  const estadoDir = path.join(clientDir, 'estado');

  const paths = {
    clientId,
    ts,
    root,
    clientDir,
    resultadoDir,
    outDir,
    estadoDir,
    latestDir: path.join(resultadoDir, 'latest'),
    latestTxt: path.join(resultadoDir, 'latest.txt'),
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

  for (const d of [paths.clientDir, paths.resultadoDir, paths.outDir, paths.estadoDir, paths.rawDir, paths.videoDir, paths.shotDir, paths.evidDir]) {
    fs.mkdirSync(d, { recursive: true });
  }
  updateLatest(paths);
  return paths;
}

function updateLatest(paths) {
  try {
    fs.rmSync(paths.latestDir, { recursive: true, force: true });
    fs.symlinkSync(paths.outDir, paths.latestDir, 'junction');
  } catch {
    try {
      fs.writeFileSync(paths.latestTxt, paths.ts, 'utf8');
    } catch {}
  }
}

module.exports = { resolveRunPaths, timestamp };
