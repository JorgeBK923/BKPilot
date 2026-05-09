#!/usr/bin/env node
'use strict';

const { MobileAppiumClient } = require('./lib/mobile-appium-client');

const client = new MobileAppiumClient();

const tools = {
  startSession: {
    description: 'Start an Appium session for mobile web or APK using client config and optional capabilities.',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        target: { type: 'string', enum: ['web', 'apk'] },
        provider: { type: 'string' },
        mode: { type: 'string', enum: ['observe', 'explore', 'execute'] },
        device: { type: 'string' },
        udid: { type: 'string' },
        appiumUrl: { type: 'string' },
        username: { type: 'string' },
        accessKey: { type: 'string' },
        baseUrl: { type: 'string' },
        app: { type: 'string' },
        capabilities: { type: 'object' },
        options: { type: 'object' }
      }
    },
    handler: (args) => client.startSession(args)
  },
  getState: {
    description: 'Return current Appium source, URL/activity when available, screenshot path, and raw state artifact.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, screenshot: { type: 'boolean' }, includeAll: { type: 'boolean' }, topK: { type: 'number' }, screenName: { type: 'string' } } },
    handler: (args) => client.getState(args)
  },
  tap: {
    description: 'Tap an element by id, accessibility id, xpath, text, selector, or elementId.',
    inputSchema: { type: 'object', properties: { selector: { type: 'string' }, id: { type: 'string' }, accessibilityId: { type: 'string' }, xpath: { type: 'string' }, text: { type: 'string' }, elementId: { type: 'string' } } },
    handler: (args) => client.tap(args)
  },
  type: {
    description: 'Type into an element by locator.',
    inputSchema: { type: 'object', properties: { selector: { type: 'string' }, id: { type: 'string' }, accessibilityId: { type: 'string' }, xpath: { type: 'string' }, text: { type: 'string' }, value: { type: 'string' }, clear: { type: 'boolean' } } },
    handler: (args) => client.typeText(args)
  },
  swipe: {
    description: 'Swipe on the current screen.',
    inputSchema: { type: 'object', properties: { direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] }, duration: { type: 'number' } } },
    handler: (args) => client.swipe(args)
  },
  back: {
    description: 'Press Android/iOS back navigation where supported.',
    inputSchema: { type: 'object', properties: {} },
    handler: () => client.back()
  },
  waitFor: {
    description: 'Wait for an element locator.',
    inputSchema: { type: 'object', properties: { selector: { type: 'string' }, id: { type: 'string' }, accessibilityId: { type: 'string' }, xpath: { type: 'string' }, text: { type: 'string' }, timeoutMs: { type: 'number' } } },
    handler: (args) => client.waitFor(args)
  },
  captureEvidence: {
    description: 'Capture screenshot and optionally state artifacts.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, includeState: { type: 'boolean' } } },
    handler: (args) => client.captureEvidence(args)
  },
  endSession: {
    description: 'End the current Appium session.',
    inputSchema: { type: 'object', properties: {} },
    handler: () => client.endSession()
  }
};

function contentResult(value) {
  return {
    content: [{
      type: 'text',
      text: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }]
  };
}

async function handleRequest(message) {
  if (message.method === 'initialize') {
    return {
      protocolVersion: message.params?.protocolVersion || '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'bkpilot-mobile-appium-mcp', version: '0.1.0' }
    };
  }
  if (message.method === 'tools/list') {
    return {
      tools: Object.entries(tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  }
  if (message.method === 'tools/call') {
    const name = message.params?.name;
    const args = message.params?.arguments || {};
    const tool = tools[name];
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return contentResult(await tool.handler(args));
  }
  if (message.method === 'notifications/initialized') {
    return undefined;
  }
  throw new Error(`Unsupported method: ${message.method}`);
}

function sendResponse(id, result, error) {
  if (id === undefined || id === null) return;
  const response = error
    ? { jsonrpc: '2.0', id, error: { code: -32000, message: error.message || String(error) } }
    : { jsonrpc: '2.0', id, result };
  const body = JSON.stringify(response);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`);
}

let buffer = Buffer.alloc(0);
process.stdin.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;
    const header = buffer.slice(0, headerEnd).toString('utf8');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.slice(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const bodyStart = headerEnd + 4;
    if (buffer.length < bodyStart + length) return;
    const raw = buffer.slice(bodyStart, bodyStart + length).toString('utf8');
    buffer = buffer.slice(bodyStart + length);
    let message;
    try {
      message = JSON.parse(raw);
    } catch (err) {
      sendResponse(null, null, err);
      continue;
    }
    handleRequest(message)
      .then((result) => sendResponse(message.id, result))
      .catch((err) => {
        client.logEvent('error', { method: message.method, message: err.message });
        sendResponse(message.id, null, err);
      });
  }
});

process.on('SIGINT', async () => {
  try {
    await client.endSession();
  } finally {
    process.exit(0);
  }
});
