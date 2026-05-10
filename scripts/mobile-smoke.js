#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const {
  ROOT,
  MobileAppiumClient,
  buildCapabilities,
  loadClientMobileConfig,
  resolveProviderConfig,
  redact
} = require('./lib/mobile-appium-client');
const { validateLocalAndroidDevice } = require('./lib/mobile-device-manager');

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  if (args.cliente && !args.clientId) args.clientId = args.cliente;
  if (args.client && !args.clientId) args.clientId = args.client;
  if (args.device && !args.deviceName) args.deviceName = args.device;
  args._ = positional;
  return args;
}

function printUsage() {
  console.log(`
Uso:
  node scripts/mobile-smoke.js --cliente <id> [--target web|apk] [--device <serial>] [--url <url>] [--app <apk|remote-id>]
  npm run mobile:smoke -- --cliente <id> [--target web|apk]

Exemplos:
  npm run mobile:smoke -- --cliente acme --target web
  npm run mobile:smoke -- --cliente acme --target apk --app clients/acme/app/app-release.apk

Config:
  Lê clients/<id>/config.json em mobile.*
  Suporta Appium local e farms remotos via mobile.appiumUrl, mobile.username, mobile.accessKey,
  mobile.capabilities e mobile.options.
`);
}

function writeReport(resultDir, report) {
  const reportsDir = path.join(resultDir, 'mobile', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const filePath = path.join(reportsDir, 'mobile_smoke_report.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
  return filePath;
}

function durationSeconds(startedAt) {
  return Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
}

function addCheck(checks, name, passed, details) {
  checks.push({ name, status: passed ? 'passed' : 'failed', details: details || null });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printUsage();
    process.exit(0);
  }
  if (!args.clientId) {
    printUsage();
    process.exit(1);
  }

  if (args.url && !args.baseUrl) args.baseUrl = args.url;
  if (args.target) args.target = String(args.target).toLowerCase();

  const loaded = loadClientMobileConfig(args);
  const provider = resolveProviderConfig({ ...args, clientId: loaded.clientId });
  const capabilities = buildCapabilities({ ...args, clientId: loaded.clientId, target: args.target || loaded.target });

  console.log('Mobile smoke starting');
  console.log(`Client: ${loaded.clientId}`);
  console.log(`Target: ${args.target || loaded.target}`);
  console.log(`Provider: ${provider.provider}`);
  console.log(`Appium URL: ${provider.appiumUrl.replace(/\/\/[^/@]+@/, '//[redacted]@')}`);
  console.log(`Capabilities: ${JSON.stringify(redact(capabilities), null, 2)}`);

  const client = new MobileAppiumClient();
  const startedAt = new Date().toISOString();
  const checks = [];
  const warnings = [];
  const errors = [];
  let report;
  try {
    if (provider.provider === 'local') {
      const deviceValidation = validateLocalAndroidDevice({
        udid: args.udid || args.device || loaded.mobile.udid || loaded.mobile.device,
        target: args.target || loaded.target
      });
      for (const check of deviceValidation.checks) checks.push(check);
      warnings.push(...deviceValidation.warnings);
      if (!deviceValidation.ok) throw new Error('Local Android device validation failed');
    } else {
      addCheck(checks, 'device_manager_cloud', true, 'Cloud device validation is performed by remote Appium session creation');
    }

    try {
      const status = await client.status(provider);
      addCheck(checks, 'appium_status', true, status?.build || status);
    } catch (err) {
      addCheck(checks, 'appium_status', false, err.message);
      throw err;
    }

    const session = await client.startSession({ ...args, clientId: loaded.clientId, target: args.target || loaded.target });
    addCheck(checks, 'session_created', Boolean(session.sessionId), session.sessionId);
    addCheck(checks, 'target_resolved', Boolean(session.target), session.target);

    const evidence = await client.captureEvidence({ name: 'mobile_smoke', includeState: true });
    addCheck(checks, 'state_collected', Boolean(evidence.state?.rawPath), evidence.state?.rawPath);
    addCheck(checks, 'screenshot_saved', Boolean(evidence.screenshot && fs.existsSync(path.join(ROOT, evidence.screenshot))), evidence.screenshot);
    addCheck(checks, 'source_saved', Boolean(evidence.state?.evidence?.source && fs.existsSync(path.join(ROOT, evidence.state.evidence.source))), evidence.state?.evidence?.source);
    if (session.target === 'web') {
      addCheck(checks, 'url_or_context_available', Boolean(evidence.state?.url || evidence.state?.context), evidence.state?.url || evidence.state?.context);
      const finalUrl = evidence.state?.url || '';
      addCheck(checks, 'web_not_blank', Boolean(finalUrl && finalUrl !== 'about:blank'), finalUrl || 'no url');
    } else {
      addCheck(checks, 'activity_or_source_available', Boolean(evidence.state?.activity || evidence.state?.elements?.length), evidence.state?.activity || `${evidence.state?.elements?.length || 0} elements`);
      const activity = evidence.state?.activity || '';
      addCheck(checks, 'apk_not_launcher_only', !/launcher/i.test(activity) || Boolean(evidence.state?.elements?.length), activity || 'no activity');
    }
    addCheck(checks, 'elements_present', (evidence.state?.summary?.totalElements || evidence.state?.elements?.length || 0) > 0, evidence.state?.summary || `${evidence.state?.elements?.length || 0} elements`);

    await client.endSession();
    addCheck(checks, 'session_ended', true, session.sessionId);
    const failedChecks = checks.filter((check) => check.status !== 'passed');
    if (failedChecks.length > 0) {
      throw new Error(`Smoke checks failed: ${failedChecks.map((check) => check.name).join(', ')}`);
    }

    report = {
      status: 'passed',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationSeconds: durationSeconds(startedAt),
      clientId: loaded.clientId,
      target: session.target,
      provider: session.provider,
      device: capabilities['appium:udid'] || capabilities['appium:deviceName'] || capabilities['appium:options']?.udid || capabilities['appium:options']?.deviceName || null,
      sessionId: session.sessionId,
      resultDir: session.resultDir,
      artifacts: {
        screenshot: evidence.screenshot,
        state: evidence.state?.rawPath,
        source: evidence.state?.evidence?.source,
        appiumLog: session.target === 'web' ? 'mobile_web_log.json' : 'mobile_apk_log.json'
      },
      checks,
      warnings,
      errors,
      capabilities: redact(session.capabilities)
    };
    const reportPath = writeReport(path.join(ROOT, session.resultDir), report);
    console.log(`Smoke passed: ${path.relative(ROOT, reportPath)}`);
    console.log(`Screenshot: ${evidence.screenshot}`);
  } catch (err) {
    errors.push(err.message);
    try {
      const ended = await client.endSession();
      addCheck(checks, 'session_ended', Boolean(ended.ok), ended);
    } catch (_) {}
    const resultDir = client.resultDir || path.join(ROOT, 'clients', loaded.clientId, 'resultado', 'mobile_smoke_failed');
    fs.mkdirSync(resultDir, { recursive: true });
    report = {
      status: 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      clientId: loaded.clientId,
      target: args.target || loaded.target,
      provider: provider.provider,
      durationSeconds: durationSeconds(startedAt),
      checks,
      warnings,
      errors,
      error: err.message,
      capabilities: redact(capabilities)
    };
    const reportPath = writeReport(resultDir, report);
    console.error(`Smoke failed: ${err.message}`);
    console.error(`Report: ${path.relative(ROOT, reportPath)}`);
    process.exit(1);
  }
}

main();
