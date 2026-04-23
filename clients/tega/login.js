// TEGA — fluxo de login.
// Chamado pela engine via core/auth.js. Recebe page (Playwright) e contexto.
// Deve retornar quando a sessão estiver autenticada.

module.exports = async function login(page, { email, password, config, log = () => {} }) {
  const baseUrl = config.baseUrl;
  const maxAttempts = config.loginMaxAttempts || 3;
  const postLoginSelector = config.postLoginSelector || 'button:has-text("Nova Conversa"), textarea';

  const usuario = page.getByPlaceholder('Digite seu usuário');
  const senha = page.getByPlaceholder('Digite sua senha');

  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt === 1) {
        await page.goto(baseUrl + '/', { waitUntil: 'commit', timeout: 45000 });
      } else {
        log(`  ↻ Login retry ${attempt}: reload`);
        await page.reload({ waitUntil: 'commit', timeout: 45000 })
          .catch(async () => {
            await page.goto(baseUrl + '/', { waitUntil: 'commit', timeout: 45000 });
          });
      }
      await usuario.waitFor({ timeout: 30000 });
      await usuario.fill(email);
      await senha.fill(password);
      await page.getByRole('button', { name: /entrar/i }).click();
      await page.waitForSelector(postLoginSelector, { timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      return;
    } catch (e) {
      lastErr = e;
      log(`  ⚠ Login tentativa ${attempt} falhou: ${(e.message || '').slice(0, 80)}`);
    }
  }
  throw lastErr || new Error(`Login TEGA falhou em ${maxAttempts} tentativas`);
};
