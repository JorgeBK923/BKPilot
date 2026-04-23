// Setup Playwright com BLOCK-B (console) e BLOCK-C (network) plugados por padrão.
// Retorna { browser, context, page, consoleAll, networkAll, close }.

const { chromium } = require('playwright');

async function launchBrowser({ videoDir = null, headless = true, viewport = { width: 1440, height: 900 } } = {}) {
  const browser = await chromium.launch({ headless });
  const contextOpts = { viewport };
  if (videoDir) contextOpts.recordVideo = { dir: videoDir, size: viewport };
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  const consoleAll = [];
  const networkAll = [];

  page.on('console', (msg) => {
    const level = msg.type();
    if (level !== 'error' && level !== 'warning') return;
    consoleAll.push({
      timestamp: new Date().toISOString(),
      level,
      text: msg.text(),
      url: page.url(),
    });
  });

  page.on('pageerror', (err) => {
    consoleAll.push({
      timestamp: new Date().toISOString(),
      level: 'error',
      text: `Uncaught: ${err.message}`,
      url: page.url(),
      severity: 'alta',
    });
  });

  // network monitoring — registra >=400, falhas, e lentas (>3000ms)
  const pendingRequests = new Map();
  page.on('request', (req) => {
    pendingRequests.set(req, Date.now());
  });
  page.on('requestfailed', (req) => {
    const start = pendingRequests.get(req) || Date.now();
    networkAll.push({
      timestamp: new Date().toISOString(),
      method: req.method(),
      url: req.url(),
      status: 0,
      duration_ms: Date.now() - start,
      error: req.failure()?.errorText || 'request failed',
    });
    pendingRequests.delete(req);
  });
  page.on('response', async (res) => {
    const req = res.request();
    const start = pendingRequests.get(req) || Date.now();
    const duration = Date.now() - start;
    pendingRequests.delete(req);
    const status = res.status();
    if (status >= 400 || duration > 3000) {
      let size = 0;
      try { const body = await res.body(); size = body.length; } catch {}
      networkAll.push({
        timestamp: new Date().toISOString(),
        method: req.method(),
        url: req.url(),
        status,
        duration_ms: duration,
        size_bytes: size,
      });
    }
  });

  async function close() {
    try { await context.close(); } catch {}
    try { await browser.close(); } catch {}
  }

  return { browser, context, page, consoleAll, networkAll, close };
}

module.exports = { launchBrowser };
