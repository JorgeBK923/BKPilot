const fs = require('fs');

function createLogger(progressLogPath) {
  return function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    if (progressLogPath) {
      try { fs.appendFileSync(progressLogPath, line + '\n'); } catch {}
    }
  };
}

module.exports = { createLogger };
