// Carrega config e login do pack do cliente em clients/<id>/.
// Contrato mínimo: config.json + login.js.

const fs = require('fs');
const path = require('path');

function loadClient(clientId, root = process.cwd()) {
  if (!clientId) throw new Error('clientId obrigatório (ex: --cliente tega)');
  const dir = path.join(root, 'clients', clientId);
  if (!fs.existsSync(dir)) {
    throw new Error(`Cliente não encontrado: ${dir}`);
  }

  const configPath = path.join(dir, 'config.json');
  const loginPath = path.join(dir, 'login.js');
  if (!fs.existsSync(configPath)) throw new Error(`Faltando: ${configPath}`);
  if (!fs.existsSync(loginPath)) throw new Error(`Faltando: ${loginPath}`);

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const login = require(loginPath);
  if (typeof login !== 'function') {
    throw new Error(`${loginPath} deve exportar uma função (module.exports = async function login(page, ctx) {...})`);
  }

  const selectorsPath = path.join(dir, 'selectors.json');
  const selectors = fs.existsSync(selectorsPath)
    ? JSON.parse(fs.readFileSync(selectorsPath, 'utf8'))
    : {};

  return { id: clientId, dir, config, login, selectors };
}

function loadFlow(client, flowName, { requires = [] } = {}) {
  const name = flowName || client.config.defaultFlow;
  if (!name) throw new Error(`Nenhum flow especificado e cliente ${client.id} não tem defaultFlow em config.json`);
  const flowPath = path.join(client.dir, 'flows', `${name}.js`);
  if (!fs.existsSync(flowPath)) {
    throw new Error(`Flow não encontrado: ${flowPath}`);
  }
  const flow = require(flowPath);
  if (!flow) throw new Error(`${flowPath} não exportou nada`);
  for (const fn of requires) {
    if (typeof flow[fn] !== 'function') {
      throw new Error(`${flowPath} deve exportar função "${fn}"`);
    }
  }
  return { name, path: flowPath, ...flow };
}

module.exports = { loadClient, loadFlow };
