// ffmpeg: detecção e conversão webm → mp4.
// NUNCA instala ffmpeg automaticamente — se ausente, mantém .webm e segue.

const { spawnSync } = require('child_process');
const fs = require('fs');

function hasFfmpeg() {
  try { return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0; }
  catch { return false; }
}

function convertWebmToMp4(webm, mp4) {
  if (!hasFfmpeg()) return false;
  const r = spawnSync('ffmpeg', ['-y', '-i', webm, '-c:v', 'libx264', '-crf', '23', '-preset', 'fast', mp4], { stdio: 'ignore' });
  if (r.status === 0) {
    try { fs.unlinkSync(webm); } catch {}
    return true;
  }
  return false;
}

function ffmpegHint() {
  return '⚠️  ffmpeg não encontrado. Instale manualmente:\n' +
         '   Windows:  winget install ffmpeg  ou  https://ffmpeg.org/download.html\n' +
         '   macOS:    brew install ffmpeg\n' +
         '   Linux:    sudo apt-get install ffmpeg';
}

module.exports = { hasFfmpeg, convertWebmToMp4, ffmpegHint };
