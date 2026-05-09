'use strict';

const { execFileSync } = require('child_process');

function runAdb(args) {
  return execFileSync('adb', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function listAndroidDevices() {
  const output = runAdb(['devices', '-l']);
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [udid, status] = line.split(/\s+/);
      const isEmulator = udid.startsWith('emulator-');
      return { udid, status, type: isEmulator ? 'emulator' : 'physical', raw: line };
    });
}

function shell(deviceUdid, command) {
  return runAdb(['-s', deviceUdid, 'shell', ...command]);
}

function getBattery(deviceUdid) {
  try {
    const output = shell(deviceUdid, ['dumpsys', 'battery']);
    const level = output.match(/level:\s*(\d+)/i);
    return level ? Number(level[1]) : null;
  } catch (_) {
    return null;
  }
}

function isScreenAwake(deviceUdid) {
  try {
    const output = shell(deviceUdid, ['dumpsys', 'power']);
    return /mWakefulness=Awake|Display Power: state=ON|state=ON/i.test(output);
  } catch (_) {
    return null;
  }
}

function hasChrome(deviceUdid) {
  try {
    const output = shell(deviceUdid, ['pm', 'list', 'packages', 'com.android.chrome']);
    return output.includes('com.android.chrome');
  } catch (_) {
    return false;
  }
}

function validateLocalAndroidDevice({ udid, target = 'web', minBattery = 15 } = {}) {
  const checks = [];
  const warnings = [];
  let devices = [];
  try {
    devices = listAndroidDevices();
  } catch (err) {
    checks.push({ name: 'adb_available', status: 'failed', details: err.message });
    return { ok: false, selected: null, devices, checks, warnings };
  }
  checks.push({ name: 'adb_available', status: 'passed', details: 'adb command available' });
  checks.push({ name: 'adb_devices', status: devices.length > 0 ? 'passed' : 'failed', details: devices });

  let selected = udid ? devices.find((d) => d.udid === udid) : null;
  if (!selected && devices.length === 1) selected = devices[0];
  if (!selected && devices.length > 1) {
    checks.push({ name: 'device_selection', status: 'failed', details: 'Multiple devices connected; pass --device/udid' });
    return { ok: false, selected: null, devices, checks, warnings };
  }
  if (!selected) {
    checks.push({ name: 'device_selection', status: 'failed', details: 'No Android device selected' });
    return { ok: false, selected: null, devices, checks, warnings };
  }

  checks.push({ name: 'device_selection', status: 'passed', details: selected });
  checks.push({ name: 'device_authorized', status: selected.status === 'device' ? 'passed' : 'failed', details: selected.status });

  const battery = getBattery(selected.udid);
  const batteryOk = battery === null || battery >= minBattery;
  checks.push({ name: 'battery_minimum', status: batteryOk ? 'passed' : 'failed', details: battery });
  if (battery === null) warnings.push('Battery level could not be read');

  const awake = isScreenAwake(selected.udid);
  checks.push({ name: 'screen_awake', status: awake === false ? 'failed' : 'passed', details: awake });
  if (awake === null) warnings.push('Screen awake state could not be read');

  if (target === 'web') {
    const chrome = hasChrome(selected.udid);
    checks.push({ name: 'chrome_installed', status: chrome ? 'passed' : 'failed', details: chrome });
  }

  return {
    ok: checks.every((check) => check.status === 'passed'),
    selected,
    devices,
    checks,
    warnings
  };
}

module.exports = {
  listAndroidDevices,
  validateLocalAndroidDevice
};
