// Carrega .env e valida credenciais de QA.
// Regra de segurança: --login nunca pode conter ':' (impede passar senha inline).
// Ordem de carregamento: root .env (integrações globais) → clients/<id>/.env (credenciais do cliente).

const path = require('path');
require('dotenv').config();

function loadCredentials({ login, envVar = 'QA_PASSWORD', clientDir } = {}) {
  if (!login) throw new Error('login obrigatório (--login <email>)');
  if (login.includes(':')) {
    throw new Error(
      'ERRO DE SEGURANÇA: a senha não deve ser passada inline. ' +
      'Use --login <email> e configure a senha em clients/<id>/.env via ' + envVar
    );
  }

  // Carrega .env do cliente por cima do root, sobrescrevendo variáveis de mesmo nome.
  if (clientDir) {
    require('dotenv').config({ path: path.join(clientDir, '.env'), override: true });
  }

  const password = process.env[envVar];
  if (!password) {
    const location = clientDir ? `clients/<id>/.env` : `.env`;
    throw new Error(`${envVar} ausente em ${location}`);
  }
  return { login, password, envVar };
}

module.exports = { loadCredentials };
