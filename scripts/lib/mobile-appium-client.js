'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_APPIUM_URL = process.env.APPIUM_URL || 'http://127.0.0.1:4723';
const DESTRUCTIVE_WORDS = [
  'excluir',
  'deletar',
  'delete',
  'enviar',
  'aprovar',
  'finalizar',
  'cancelar',
  'confirmar pagamento',
  'alterar senha'
];

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function toAbs(p) {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function safeName(name) {
  return String(name || 'evidence')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'evidence';
}

function resolveSecret(value) {
  if (!value || typeof value !== 'string') return value;
  if (value.startsWith('env:')) return process.env[value.slice(4)] || '';
  return value;
}

function redact(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (/token|key|secret|password|access/i.test(key)) {
      out[key] = val ? '[redacted]' : val;
    } else {
      out[key] = redact(val);
    }
  }
  return out;
}

function redactWithFields(value, sensitiveFields = []) {
  const fieldSet = new Set([
    'password',
    'pwd',
    'senha',
    'token',
    'access_token',
    'accesskey',
    'access_key',
    'secret',
    'authorization',
    ...sensitiveFields.map((field) => String(field).toLowerCase())
  ]);
  function visit(input) {
    if (!input || typeof input !== 'object') return input;
    if (Array.isArray(input)) return input.map(visit);
    const out = {};
    for (const [key, val] of Object.entries(input)) {
      const normalized = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
      out[key] = fieldSet.has(normalized) || /token|secret|password|senha|accesskey/i.test(key)
        ? (val ? '[redacted]' : val)
        : visit(val);
    }
    return out;
  }
  return visit(value);
}

function isRemoteAppRef(value) {
  if (!value || typeof value !== 'string') return false;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value)
    || /^[a-z][a-z0-9+.-]*:/i.test(value)
    || value.startsWith('storage:')
    || value.startsWith('bs://');
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function attrValue(attrs, name) {
  const match = attrs.match(new RegExp(`${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function boolAttr(attrs, name) {
  return attrValue(attrs, name) === 'true';
}

function parseBounds(value) {
  const match = String(value || '').match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  return match ? match.slice(1).map(Number) : null;
}

function locatorCandidates(element) {
  const candidates = [];
  if (element.resourceId) candidates.push({ type: 'id', value: element.resourceId, confidence: 0.95 });
  if (element.contentDesc) candidates.push({ type: 'accessibility id', value: element.contentDesc, confidence: 0.9 });
  if (element.text) candidates.push({ type: 'text', value: element.text, confidence: 0.65 });
  if (element.className && element.bounds) {
    candidates.push({ type: 'class+bounds', value: `${element.className}@${element.bounds.join(',')}`, confidence: 0.35 });
  }
  return candidates;
}

function elementScore(element) {
  let score = 0;
  if (element.visible) score += 3;
  if (element.enabled) score += 2;
  if (element.clickable) score += 4;
  if (element.resourceId) score += 4;
  if (element.contentDesc) score += 3;
  if (element.text) score += 2;
  if (element.bounds) score += 1;
  return score;
}

function compactElements(elements, { includeAll = false, topK = 30 } = {}) {
  const scored = elements.map((element) => ({ ...element, score: elementScore(element) }));
  if (includeAll) return scored;
  return scored
    .filter((element) => element.visible || element.enabled || element.clickable || element.locatorCandidates.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Number(topK || 30));
}

function parseElementsFromSource(source) {
  if (!source || typeof source !== 'string') return [];
  const elements = [];
  const tagPattern = /<([a-zA-Z0-9_.-]+)\s+([^>]*?)(?:\/>|>)/g;
  let match;
  let index = 0;
  while ((match = tagPattern.exec(source)) && elements.length < 1000) {
    const attrs = match[2] || '';
    const resourceId = attrValue(attrs, 'resource-id') || attrValue(attrs, 'resourceId');
    const text = attrValue(attrs, 'text');
    const contentDesc = attrValue(attrs, 'content-desc') || attrValue(attrs, 'contentDescription');
    const className = attrValue(attrs, 'class') || match[1];
    const bounds = parseBounds(attrValue(attrs, 'bounds'));
    const element = {
      elementId: attrValue(attrs, 'elementId') || `source-${index++}`,
      resourceId,
      text,
      contentDesc,
      className,
      clickable: boolAttr(attrs, 'clickable'),
      enabled: attrValue(attrs, 'enabled') === '' ? true : boolAttr(attrs, 'enabled'),
      visible: attrValue(attrs, 'displayed') === '' ? true : boolAttr(attrs, 'displayed'),
      bounds
    };
    element.locatorCandidates = locatorCandidates(element);
    if (resourceId || text || contentDesc || element.clickable || className) elements.push(element);
  }
  return elements;
}

function normalizeTarget(target) {
  if (target === 'web') return 'mobile-web';
  if (target === 'apk') return 'mobile-apk';
  return target || 'mobile';
}

function requestJson(method, urlString, body, auth) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const payload = body === undefined ? null : JSON.stringify(body);
    const transport = url.protocol === 'https:' ? https : http;
    const urlAuth = url.username ? {
      username: decodeURIComponent(url.username),
      accessKey: decodeURIComponent(url.password || '')
    } : null;
    const effectiveAuth = auth || urlAuth;
    const req = transport.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method,
      headers: {
        Accept: 'application/json',
        ...(effectiveAuth ? { Authorization: `Basic ${Buffer.from(`${effectiveAuth.username}:${effectiveAuth.accessKey}`).toString('base64')}` } : {}),
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let parsed = {};
        if (raw) {
          try {
            parsed = JSON.parse(raw);
          } catch (err) {
            reject(new Error(`Invalid JSON from Appium (${res.statusCode}): ${raw.slice(0, 300)}`));
            return;
          }
        }
        if (res.statusCode >= 400 || parsed.error) {
          reject(new Error(`Appium ${method} ${url.pathname} failed: ${JSON.stringify(parsed.value || parsed).slice(0, 600)}`));
          return;
        }
        resolve(parsed.value !== undefined ? parsed.value : parsed);
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function loadClientMobileConfig(args) {
  const clientId = args.clientId || args.cliente || args.client;
  const configPath = toAbs(args.configPath || (clientId ? `clients/${clientId}/config.json` : null));
  const fileConfig = configPath && fs.existsSync(configPath) ? readJson(configPath) : {};
  const mobile = fileConfig.mobile || {};
  return {
    clientId,
    configPath,
    mobile,
    target: args.target || mobile.target || (mobile.browserName ? 'web' : 'apk')
  };
}

function resolveProviderConfig(args) {
  const { mobile } = loadClientMobileConfig(args);
  const provider = args.provider || mobile.provider || 'local';
  const appiumUrl = args.appiumUrl || mobile.appiumUrl || process.env.APPIUM_URL || DEFAULT_APPIUM_URL;
  const username = resolveSecret(args.username || mobile.username || mobile.user || process.env.MOBILE_FARM_USERNAME);
  const accessKey = resolveSecret(args.accessKey || mobile.accessKey || mobile.key || process.env.MOBILE_FARM_ACCESS_KEY);
  const auth = username && accessKey ? { username, accessKey } : null;
  return { provider, appiumUrl, auth };
}

function buildCapabilities(args) {
  const { mobile, target } = loadClientMobileConfig(args);
  const vendorOptions = {
    ...(mobile.options || {}),
    ...(args.options || {})
  };
  const raw = {
    platformName: mobile.platformName || (mobile.platform === 'ios' ? 'iOS' : 'Android'),
    automationName: mobile.automationName || 'UiAutomator2',
    ...(mobile.capabilities || {}),
    ...mobile,
    ...(args.capabilities || {})
  };

  delete raw.target;
  delete raw.baseUrl;
  delete raw.provider;
  delete raw.appiumUrl;
  delete raw.username;
  delete raw.user;
  delete raw.accessKey;
  delete raw.key;
  delete raw.capabilities;
  delete raw.options;

  if (args.deviceName) raw.deviceName = args.deviceName;
  if (args.device) raw.deviceName = args.device;
  if (args.udid) raw.udid = args.udid;
  if (!raw.udid && raw.device) raw.udid = raw.device;
  if (!raw.udid && raw.deviceName && /^[A-Za-z0-9._:-]+$/.test(String(raw.deviceName))) raw.udid = raw.deviceName;
  if (args.app) raw.app = args.app;
  if (raw.app && !isRemoteAppRef(raw.app)) raw.app = toAbs(raw.app);
  delete raw.platform;
  delete raw.browser;
  delete raw.device;

  if (target === 'web') {
    raw.browserName = raw.browserName || raw.browser || args.browserName || 'Chrome';
    delete raw.app;
    delete raw.appPackage;
    delete raw.appActivity;
  }

  const appiumOptions = {};
  const alwaysMatch = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null || value === '') continue;
    if (key === 'platformName' || key === 'browserName') {
      alwaysMatch[key] = value;
    } else if (key.includes(':')) {
      alwaysMatch[key] = value;
    } else {
      alwaysMatch[`appium:${key}`] = value;
    }
  }
  if (Object.keys(appiumOptions).length > 0) {
    alwaysMatch['appium:options'] = appiumOptions;
  }
  for (const [namespace, options] of Object.entries(vendorOptions)) {
    if (options && typeof options === 'object') {
      alwaysMatch[namespace.includes(':') ? namespace : `${namespace}:options`] = options;
    }
  }
  return alwaysMatch;
}

function resolveResultDirs(args) {
  const clientId = args.clientId || args.cliente || args.client;
  if (!clientId) throw new Error('clientId/cliente is required');
  const ts = args.timestamp || timestamp();
  const resultDir = toAbs(args.resultDir || `clients/${clientId}/resultado/${ts}`);
  const evidenceDir = toAbs(args.evidenceDir || path.join(resultDir, 'screenshots'));
  const videoDir = toAbs(args.videoDir || path.join(resultDir, 'videos'));
  const mobileDir = toAbs(args.mobileDir || path.join(resultDir, 'mobile'));
  ensureDir(resultDir);
  ensureDir(evidenceDir);
  ensureDir(videoDir);
  ensureDir(mobileDir);
  ensureDir(path.join(mobileDir, 'screenshots'));
  ensureDir(path.join(mobileDir, 'sources'));
  ensureDir(path.join(mobileDir, 'logs'));
  ensureDir(path.join(mobileDir, 'states'));
  ensureDir(path.join(mobileDir, 'reports'));
  ensureDir(path.join(resultDir, 'dados_brutos'));
  return { clientId, timestamp: ts, resultDir, evidenceDir, videoDir, mobileDir };
}

class MobileAppiumClient {
  constructor() {
    this.appiumUrl = DEFAULT_APPIUM_URL;
    this.provider = 'local';
    this.auth = null;
    this.sessionId = null;
    this.capabilities = null;
    this.clientId = null;
    this.target = null;
    this.resultDir = null;
    this.evidenceDir = null;
    this.videoDir = null;
    this.mobileDir = null;
    this.sourceDir = null;
    this.stateDir = null;
    this.reportDir = null;
    this.mode = 'explore';
    this.security = {};
    this.sensitiveFields = [];
    this.log = [];
  }

  appiumPath(suffix) {
    return `${this.appiumUrl.replace(/\/$/, '')}${suffix}`;
  }

  async appium(method, suffix, body) {
    return requestJson(method, this.appiumPath(suffix), body, this.auth);
  }

  logEvent(type, data = {}) {
    const event = { timestamp: new Date().toISOString(), type, ...data };
    this.log.push(event);
    if (this.resultDir) {
      const fileName = this.target === 'web' ? 'mobile_web_log.json' : 'mobile_apk_log.json';
      fs.writeFileSync(path.join(this.resultDir, fileName), JSON.stringify(this.log, null, 2), 'utf8');
    }
  }

  async startSession(args) {
    if (this.sessionId) await this.endSession();
    const loaded = loadClientMobileConfig(args);
    const providerConfig = resolveProviderConfig({ ...args, clientId: loaded.clientId });
    const dirs = resolveResultDirs({ ...args, clientId: loaded.clientId });
    this.appiumUrl = providerConfig.appiumUrl;
    this.provider = providerConfig.provider;
    this.auth = providerConfig.auth;
    this.clientId = loaded.clientId;
    this.target = loaded.target;
    this.resultDir = dirs.resultDir;
    this.evidenceDir = dirs.evidenceDir;
    this.videoDir = dirs.videoDir;
    this.mobileDir = dirs.mobileDir;
    this.sourceDir = path.join(dirs.mobileDir, 'sources');
    this.stateDir = path.join(dirs.mobileDir, 'states');
    this.reportDir = path.join(dirs.mobileDir, 'reports');
    this.mode = args.mode || loaded.mobile.mode || 'explore';
    this.security = loaded.mobile.security || {};
    this.sensitiveFields = asArray(loaded.mobile.sensitiveFields || this.security.sensitiveFields);
    this.log = [];
    this.validateStartPolicy(loaded.mobile, args);

    const capabilities = buildCapabilities({ ...args, clientId: loaded.clientId, target: loaded.target });
    const value = await this.appium('POST', '/session', { capabilities: { alwaysMatch: capabilities, firstMatch: [{}] } });
    this.sessionId = value.sessionId || value.session_id;
    this.capabilities = value.capabilities || capabilities;
    if (!this.sessionId) throw new Error(`Appium did not return sessionId: ${JSON.stringify(value).slice(0, 600)}`);

    this.logEvent('startSession', {
      sessionId: this.sessionId,
      provider: this.provider,
      appiumUrl: this.appiumUrl.replace(/\/\/[^/@]+@/, '//[redacted]@'),
      target: this.target,
      capabilities: redact(this.capabilities)
    });

    const baseUrl = args.baseUrl || loaded.mobile.baseUrl;
    if (this.target === 'web' && baseUrl) {
      await this.appium('POST', `/session/${this.sessionId}/url`, { url: baseUrl });
      this.logEvent('navigate', { url: baseUrl });
    }

    return {
      sessionId: this.sessionId,
      target: this.target,
      provider: this.provider,
      resultDir: path.relative(ROOT, this.resultDir),
      evidenceDir: path.relative(ROOT, this.evidenceDir),
      capabilities: this.capabilities
    };
  }

  validateStartPolicy(mobile, args) {
    const baseUrl = args.baseUrl || mobile.baseUrl;
    const allowedUrls = asArray(this.security.allowedUrls || mobile.allowedUrls);
    if (baseUrl && allowedUrls.length > 0 && !allowedUrls.some((allowed) => String(baseUrl).startsWith(String(allowed)))) {
      throw new Error(`URL not allowed by mobile security policy: ${baseUrl}`);
    }
    if (baseUrl && allowedUrls.length === 0) {
      this.logEvent('securityWarning', { warning: 'No allowedUrls configured for mobile web; allowing with warning', url: baseUrl });
    }
    const appPackage = args.appPackage || mobile.appPackage;
    const allowedPackages = asArray(this.security.allowedAppPackages || mobile.allowedAppPackages);
    if (appPackage && allowedPackages.length > 0 && !allowedPackages.includes(appPackage)) {
      throw new Error(`appPackage not allowed by mobile security policy: ${appPackage}`);
    }
    if (this.target === 'apk' && appPackage && allowedPackages.length === 0) {
      throw new Error(`allowedAppPackages is required for APK appPackage execution: ${appPackage}`);
    }
  }

  assertInteractionAllowed(action, args = {}) {
    if (this.mode === 'observe' && ['tap', 'type', 'swipe', 'back'].includes(action)) {
      throw new Error(`Action "${action}" blocked in observe mode`);
    }
    const label = `${args.selector || ''} ${args.id || ''} ${args.text || ''} ${args.accessibilityId || ''}`.toLowerCase();
    const destructive = DESTRUCTIVE_WORDS.some((word) => label.includes(word));
    if (destructive && this.mode !== 'execute' && args.confirm !== true) {
      throw new Error(`Potential destructive action blocked in ${this.mode} mode: ${label.trim()}`);
    }
  }

  requireSession() {
    if (!this.sessionId) throw new Error('No active Appium session. Call mobile.startSession first.');
  }

  async getOptional(suffix) {
    try {
      return await this.appium('GET', `/session/${this.sessionId}${suffix}`);
    } catch (_) {
      return null;
    }
  }

  async status() {
    return requestJson('GET', `${this.appiumUrl.replace(/\/$/, '')}/status`, undefined, this.auth);
  }

  async screenshot(name) {
    this.requireSession();
    const base64 = await this.appium('GET', `/session/${this.sessionId}/screenshot`);
    const fileName = `${safeName(name)}_${Date.now()}.png`;
    const filePath = path.join(this.evidenceDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    fs.copyFileSync(filePath, path.join(this.mobileDir, 'screenshots', fileName));
    this.logEvent('screenshot', { path: path.relative(ROOT, filePath) });
    return filePath;
  }

  async getState(args = {}) {
    this.requireSession();
    const source = await this.appium('GET', `/session/${this.sessionId}/source`);
    const currentUrl = await this.getOptional('/url');
    const activity = await this.getOptional('/appium/device/current_activity');
    const orientation = await this.getOptional('/orientation');
    const contexts = await this.getOptional('/contexts');
    const currentContext = await this.getOptional('/context');
    const screenshotPath = args.screenshot === false ? null : await this.screenshot(args.name || 'state');
    const name = safeName(args.name || 'state');
    const sourcePath = path.join(this.sourceDir, `${name}_${Date.now()}.xml`);
    fs.writeFileSync(sourcePath, source, 'utf8');
    const allElements = parseElementsFromSource(source);
    const elements = compactElements(allElements, { includeAll: args.includeAll === true, topK: args.topK || args.limit });
    const stateJson = {
      platform: this.capabilities?.platformName || this.capabilities?.platform || 'unknown',
      udid: this.capabilities?.['appium:udid'] || this.capabilities?.udid || this.capabilities?.deviceName || null,
      target: normalizeTarget(this.target),
      provider: this.provider,
      sessionId: this.sessionId,
      context: currentContext,
      contexts,
      url: currentUrl,
      activity,
      orientation,
      screenName: args.screenName || null,
      elements,
      summary: {
        totalElements: allElements.length,
        returnedElements: elements.length,
        compacted: args.includeAll !== true
      },
      evidence: {
        screenshot: screenshotPath ? path.relative(ROOT, screenshotPath) : null,
        source: path.relative(ROOT, sourcePath)
      }
    };
    const rawPath = path.join(this.stateDir, `${name}_${Date.now()}.json`);
    fs.writeFileSync(rawPath, JSON.stringify(redactWithFields(stateJson, this.sensitiveFields), null, 2), 'utf8');
    this.logEvent('getState', { rawPath: path.relative(ROOT, rawPath) });
    return { ...redactWithFields(stateJson, this.sensitiveFields), rawPath: path.relative(ROOT, rawPath) };
  }

  locatorFromArgs(args = {}) {
    if (args.elementId) return { elementId: args.elementId };
    const selector = args.selector || args.id || args.text || args.accessibilityId || args.xpath;
    if (!selector) throw new Error('selector, id, text, accessibilityId, xpath or elementId is required');
    if (args.id) return { using: 'id', value: args.id };
    if (args.accessibilityId) return { using: 'accessibility id', value: args.accessibilityId };
    if (args.xpath) return { using: 'xpath', value: args.xpath };
    if (args.text) return { using: 'xpath', value: `//*[@text=${JSON.stringify(args.text)} or @content-desc=${JSON.stringify(args.text)} or contains(., ${JSON.stringify(args.text)})]` };
    if (typeof selector === 'object') return selector;
    const s = String(selector);
    if (s.startsWith('id=')) return { using: 'id', value: s.slice(3) };
    if (s.startsWith('accessibility=')) return { using: 'accessibility id', value: s.slice(14) };
    if (s.startsWith('a11y=')) return { using: 'accessibility id', value: s.slice(5) };
    if (s.startsWith('xpath=')) return { using: 'xpath', value: s.slice(6) };
    if (s.startsWith('//') || s.startsWith('(')) return { using: 'xpath', value: s };
    return { using: 'id', value: s };
  }

  async findElement(args) {
    this.requireSession();
    const locator = this.locatorFromArgs(args);
    if (locator.elementId) return locator.elementId;
    const value = await this.appium('POST', `/session/${this.sessionId}/element`, locator);
    const elementId = value['element-6066-11e4-a52e-4f735466cecf'] || value.ELEMENT;
    if (!elementId) throw new Error(`Element not found for locator ${JSON.stringify(locator)}`);
    return elementId;
  }

  async tap(args) {
    this.assertInteractionAllowed('tap', args);
    const elementId = await this.findElement(args);
    await this.appium('POST', `/session/${this.sessionId}/element/${elementId}/click`, {});
    this.logEvent('tap', { selector: args.selector || args.id || args.text || args.accessibilityId || args.xpath, elementId });
    return { ok: true, elementId };
  }

  async typeText(args) {
    this.assertInteractionAllowed('type', args);
    const text = args.text ?? args.value;
    if (text === undefined) throw new Error('text/value is required');
    const elementId = await this.findElement(args);
    if (args.clear !== false) {
      try {
        await this.appium('POST', `/session/${this.sessionId}/element/${elementId}/clear`, {});
      } catch (_) {}
    }
    await this.appium('POST', `/session/${this.sessionId}/element/${elementId}/value`, { text: String(text), value: [...String(text)] });
    this.logEvent('type', { selector: args.selector || args.id || args.text || args.accessibilityId || args.xpath, elementId });
    return { ok: true, elementId };
  }

  async swipe(args) {
    this.requireSession();
    this.assertInteractionAllowed('swipe', args);
    const direction = args.direction || 'up';
    const rect = await this.appium('GET', `/session/${this.sessionId}/window/rect`);
    const x = Math.round(rect.width / 2);
    const yStart = Math.round(rect.height * (direction === 'down' ? 0.30 : 0.75));
    const yEnd = Math.round(rect.height * (direction === 'down' ? 0.75 : 0.30));
    const xStart = Math.round(rect.width * (direction === 'right' ? 0.25 : direction === 'left' ? 0.75 : 0.5));
    const xEnd = Math.round(rect.width * (direction === 'right' ? 0.75 : direction === 'left' ? 0.25 : 0.5));
    await this.appium('POST', `/session/${this.sessionId}/actions`, {
      actions: [{
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: xStart || x, y: yStart },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: args.duration || 500, x: xEnd || x, y: yEnd },
          { type: 'pointerUp', button: 0 }
        ]
      }]
    });
    this.logEvent('swipe', { direction });
    return { ok: true, direction };
  }

  async back() {
    this.requireSession();
    this.assertInteractionAllowed('back');
    await this.appium('POST', `/session/${this.sessionId}/back`, {});
    this.logEvent('back');
    return { ok: true };
  }

  async waitFor(args) {
    const timeout = Number(args.timeoutMs || args.timeout || 10000);
    const started = Date.now();
    let lastError = null;
    while (Date.now() - started <= timeout) {
      try {
        const elementId = await this.findElement(args);
        this.logEvent('waitFor', { selector: args.selector || args.id || args.text || args.accessibilityId || args.xpath, elementId });
        return { ok: true, elementId, elapsedMs: Date.now() - started };
      } catch (err) {
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, Number(args.pollMs || 500)));
      }
    }
    throw new Error(`waitFor timed out after ${timeout}ms: ${lastError ? lastError.message : 'not found'}`);
  }

  async captureEvidence(args) {
    const filePath = await this.screenshot(args.name || 'evidence');
    const currentState = args.includeState === false ? null : await this.getState({ name: args.name || 'evidence', screenshot: false });
    return { screenshot: path.relative(ROOT, filePath), state: currentState };
  }

  async endSession() {
    if (!this.sessionId) return { ok: true, ended: false };
    const sessionId = this.sessionId;
    try {
      await this.appium('DELETE', `/session/${sessionId}`);
    } finally {
      this.logEvent('endSession', { sessionId });
      this.sessionId = null;
    }
    return { ok: true, ended: true, sessionId };
  }
}

module.exports = {
  ROOT,
  MobileAppiumClient,
  buildCapabilities,
  loadClientMobileConfig,
  resolveProviderConfig,
  redact,
  timestamp
};
