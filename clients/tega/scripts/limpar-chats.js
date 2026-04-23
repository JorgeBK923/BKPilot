// TEGA — script de manutenção: limpa todos os chats da conta antes de batches IA-Chat
// Uso: node clients/tega/scripts/limpar-chats.js [--login <email>]
// Default login: adminteste2
// Credenciais via QA_PASSWORD no .env

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const { loadClient } = require('../../../core/client');
const { loadCredentials } = require('../../../core/env');

function parseArgs(argv) {
  const out = {};
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--login') out.login = rest[++i];
    else if (!out.login && !rest[i].startsWith('--')) out.login = rest[i];
  }
  return out;
}

const ARGS = parseArgs(process.argv);
const client = loadClient('tega');
const creds = loadCredentials({ login: ARGS.login || 'adminteste2', envVar: client.config.envPassword || 'QA_PASSWORD' });
const BASE_URL = client.config.baseUrl;
const SHOT_DIR = path.resolve('clients', 'tega', 'scripts', '_limpar_chats_debug');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const now = () => new Date().toISOString().slice(11, 19);
const log = (m) => console.log(`[${now()}] ${m}`);
const shot = async (page, tag) => {
  try { await page.screenshot({ path: path.join(SHOT_DIR, `${tag}.png`), fullPage: true }); } catch {}
};

async function waitSidebar(page) {
  try {
    await page.waitForFunction(() => !/Carregando conversas/i.test(document.body.innerText), { timeout: 30000 });
  } catch {}
  await page.waitForTimeout(800);
}

async function contaChats(page) {
  return page.evaluate(() => {
    const m = /Recentes\s*\n?\s*(\d+)/i.exec(document.body.innerText);
    if (m) return parseInt(m[1], 10);
    return -1;
  });
}

async function abrirModalLimite(page) {
  const nova = await page.$('button:has-text("Nova Conversa"):not([disabled])');
  if (!nova) return false;
  await nova.click().catch(() => {});
  try {
    await page.waitForFunction(() => /Limite de Chats Atingido/i.test(document.body.innerText), { timeout: 6000 });
    return true;
  } catch { return false; }
}

async function tentarLimpezaEmLote(page, iter) {
  const modalAberto = await abrirModalLimite(page);
  if (!modalAberto) { log(`iter${iter}: modal de limite nao abriu (pode ter <50 chats)`); return false; }

  const selVarios = await page.$('button:has-text("Selecionar Vários")');
  if (!selVarios) { log(`iter${iter}: botao "Selecionar Vários" nao achado`); await shot(page, `iter${iter}_no_sel_varios`); return false; }
  await selVarios.click();
  await page.waitForTimeout(600);
  await shot(page, `iter${iter}_after_sel_varios`);

  let selTodos = await page.$('button:has-text("Selecionar Todos")');
  if (!selTodos) selTodos = await page.$('button:has-text("Selecionar todos")');
  if (!selTodos) selTodos = await page.$('button:has-text("Marcar Todos")');
  if (selTodos) {
    await selTodos.click();
    await page.waitForTimeout(600);
    log(`iter${iter}: Selecionar Todos clicado`);
  } else {
    log(`iter${iter}: "Selecionar Todos" nao achado — seguindo direto pro Excluir`);
  }
  await shot(page, `iter${iter}_after_sel_todos`);

  const excluirBtns = await page.$$('button');
  let excluirBtn = null;
  for (const b of excluirBtns) {
    const txt = ((await b.innerText().catch(() => '')) || '').trim();
    if (/^excluir\b/i.test(txt) && !/^excluir$/i.test(txt)) {
      excluirBtn = b;
      log(`iter${iter}: achou "${txt}"`);
      break;
    }
  }
  if (!excluirBtn) {
    for (const b of excluirBtns) {
      const txt = ((await b.innerText().catch(() => '')) || '').trim();
      if (/^excluir$/i.test(txt)) { excluirBtn = b; log(`iter${iter}: achou "Excluir"`); break; }
    }
  }
  if (!excluirBtn) { log(`iter${iter}: botao Excluir nao achado`); await shot(page, `iter${iter}_no_excluir`); return false; }

  const disabled = await excluirBtn.isDisabled().catch(() => false);
  if (disabled) { log(`iter${iter}: botao Excluir DISABLED`); await shot(page, `iter${iter}_excluir_disabled`); return false; }

  await excluirBtn.click();
  await page.waitForTimeout(800);
  await shot(page, `iter${iter}_after_excluir`);

  const confirmBtn = await page.$('button:has-text("Confirmar"), [role="dialog"] button:has-text("Excluir"), button:has-text("Sim")');
  if (confirmBtn) { await confirmBtn.click().catch(() => {}); log(`iter${iter}: confirmado`); }
  await page.waitForTimeout(2000);
  await shot(page, `iter${iter}_final`);
  return true;
}

async function tentarDelecaoIndividual(page, iter) {
  const modalAberto = await abrirModalLimite(page);
  if (!modalAberto) { log(`iter${iter} ind: modal nao abriu`); return false; }
  const trashCount = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    const btns = Array.from(dialog.querySelectorAll('button'));
    const trashes = btns.filter(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      if (/excluir|delete|remove|lixeira/.test(aria)) return true;
      const svg = b.querySelector('svg');
      if (!svg) return false;
      const cls = (b.className || '').toString();
      return /red|destruct|danger/i.test(cls);
    });
    return trashes.length;
  });
  log(`iter${iter} ind: ${trashCount} lixeiras detectadas`);
  if (trashCount === 0) return false;

  const clicked = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    const btns = Array.from(dialog.querySelectorAll('button'));
    const trash = btns.find(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      if (/excluir|delete|remove|lixeira/.test(aria)) return true;
      const svg = b.querySelector('svg');
      if (!svg) return false;
      const cls = (b.className || '').toString();
      return /red|destruct|danger/i.test(cls);
    });
    if (trash) { trash.click(); return true; }
    return false;
  });
  if (!clicked) return false;
  await page.waitForTimeout(800);
  const confirm = await page.$('button:has-text("Confirmar"), button:has-text("Sim"), [role="dialog"] button:has-text("Excluir")');
  if (confirm) { await confirm.click().catch(() => {}); }
  await page.waitForTimeout(1500);
  return true;
}

(async () => {
  log(`=== LIMPAR CHATS (TEGA) — login=${creds.login} ===`);
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  try {
    await client.login(page, { email: creds.login, password: creds.password, config: client.config, log });
    await waitSidebar(page);
    await shot(page, '00_home');

    let n0 = await contaChats(page);
    log(`inicial: ${n0} chats`);

    let iter = 0;
    while (iter < 10) {
      iter++;
      const before = await contaChats(page);
      if (before === 0) { log(`iter${iter}: zero chats — done`); break; }
      log(`iter${iter}: ${before} chats → tentando limpeza em lote`);

      const ok = await tentarLimpezaEmLote(page, iter);
      if (!ok) {
        log(`iter${iter}: limpeza em lote falhou, tentando individual`);
        const ok2 = await tentarDelecaoIndividual(page, iter);
        if (!ok2) { log(`iter${iter}: individual tambem falhou — abortando`); break; }
      }

      await waitSidebar(page);
      await page.waitForTimeout(1500);
      const after = await contaChats(page);
      log(`iter${iter}: depois = ${after} chats`);
      if (after === before) { log(`iter${iter}: contagem nao mudou — abortando`); break; }
      if (after <= 0) { log(`iter${iter}: zerou`); break; }
    }

    const fim = await contaChats(page);
    log(`=== FIM — restantes: ${fim} ===`);
    await shot(page, '99_final');
    process.exitCode = fim > 0 ? 2 : 0;
  } catch (e) {
    log(`ERRO: ${e.message}`);
    await shot(page, 'err');
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
