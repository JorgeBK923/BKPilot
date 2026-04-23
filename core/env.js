// Carrega .env e valida credenciais de QA.
// Regra de segurança: --login nunca pode conter ':' (impede passar senha inline).

require('dotenv').config();

function loadCredentials({ login, envVar = 'QA_PASSWORD' } = {}) {
  if (!login) throw new Error('login obrigatório (--login <email>)');
  if (login.includes(':')) {
    throw new Error(
      'ERRO DE SEGURANÇA: a senha não deve ser passada inline. ' +
      'Use --login <email> e configure a senha em .env via ' + envVar
    );
  }
  const password = process.env[envVar];
  if (!password) {
    throw new Error(`${envVar} ausente no .env`);
  }
  return { login, password, envVar };
}

module.exports = { loadCredentials };
