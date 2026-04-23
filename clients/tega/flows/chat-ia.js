// TEGA — flow "chat-ia"
// Executa cenários do Assistente IA da TEGA: login, handshake "oi", envia pergunta,
// aguarda widget "Esta resposta foi útil", classifica Passou/Falhou/Pulou.
//
// Contrato de flow (esperado pelo orquestrador cenarios/_executar_planilha.js):
//   { preRun?(browser, ctx), runScenario(page, cenario, ctx) }
//
// ctx: { client, creds, log, consoleAll, networkAll, cleanupAll, paths, ts, BASE_URL }

function extrairPergunta(passos, fluxo) {
  const m = /pergunta[^:]*:\s*"([^"]+)"/i.exec(passos);
  if (m) return m[1];
  const m2 = /"([^"]{8,})"/.exec(passos);
  if (m2) return m2[1];
  return fluxo.replace(/^F\.\s*\w+\s*[—-]\s*/, '').trim();
}

async function performLogin(page, ctx) {
  return ctx.client.login(page, {
    email: ctx.creds.login,
    password: ctx.creds.password,
    config: ctx.client.config,
    log: ctx.log,
  });
}

async function closeOnboardingIfAny(page) {
  for (const sel of ['button:has-text("Pular")', 'button:has-text("Fechar")', 'button:has-text("Começar")', '[aria-label="Fechar"]']) {
    const el = await page.$(sel).catch(() => null);
    if (el) { try { await el.click({ timeout: 1500 }); await page.waitForTimeout(300); } catch {} }
  }
}

async function handleLimitModalIfPresent(page, ctx, scenarioId = 'setup') {
  let modalVisible = false;
  for (let i = 0; i < 6; i++) {
    modalVisible = await page.evaluate(() => /Limite de Chats Atingido/i.test(document.body.innerText));
    if (modalVisible) break;
    await page.waitForTimeout(500);
  }
  if (!modalVisible) return false;

  ctx.log(`  ⚠ Modal "Limite de Chats Atingido" detectado — executando cleanup`);

  const selVarios = await page.$('button:has-text("Selecionar Vários")');
  if (selVarios) { await selVarios.click(); await page.waitForTimeout(600); }

  const selTodos = await page.$('button:has-text("Selecionar Todos")');
  if (selTodos) { await selTodos.click(); await page.waitForTimeout(600); }

  let excluirBtn = null;
  let btnText = '';
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const t = ((await b.innerText().catch(() => '')) || '').trim();
    if (/^excluir\s+\d+/i.test(t)) { excluirBtn = b; btnText = t; break; }
  }
  if (!excluirBtn) {
    for (const b of allBtns) {
      const t = ((await b.innerText().catch(() => '')) || '').trim();
      if (/^excluir$/i.test(t)) { excluirBtn = b; btnText = t; break; }
    }
  }
  if (!excluirBtn) {
    ctx.cleanupAll.push({ timestamp: new Date().toISOString(), item: 'modal_limite', tipo: 'chats_em_lote', status: 'pendente', motivo: 'botao Excluir nao encontrado', cenario: scenarioId });
    ctx.log(`  ✗ Botão "Excluir" não encontrado — cleanup falhou`);
    return true;
  }

  const disabled = await excluirBtn.isDisabled().catch(() => false);
  if (disabled) {
    ctx.log(`  ✗ Botão "${btnText}" DISABLED — cleanup falhou`);
    return true;
  }

  await excluirBtn.click();
  await page.waitForTimeout(800);
  const confirm = await page.$('[role="dialog"] button:has-text("Confirmar"), [role="dialog"] button:has-text("Excluir"), button:has-text("Sim")');
  if (confirm) { try { await confirm.click({ timeout: 2000 }); } catch {} }
  await page.waitForTimeout(2500);
  ctx.cleanupAll.push({ timestamp: new Date().toISOString(), item: btnText, tipo: 'chats_em_lote', status: 'limpo', cenario: scenarioId });
  ctx.log(`  ✓ Cleanup executado: ${btnText}`);
  return true;
}

async function sendPerguntaAndWaitResponse(page, pergunta) {
  const input = page.locator('textarea, input[placeholder*="mensagem" i]').first();
  await input.waitFor({ timeout: 15000 });
  await input.click();
  await page.waitForTimeout(300);
  await input.fill(pergunta);
  await page.waitForTimeout(500);

  const beforeCount = await page.evaluate((p) => {
    return (document.body.innerText.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  }, pergunta);
  const textBefore = await page.evaluate(() => document.body.innerText);

  let enviado = false;
  for (let attempt = 0; attempt < 3 && !enviado; attempt++) {
    if (attempt > 0) {
      await input.click().catch(() => {});
      await input.fill(pergunta).catch(() => {});
      await page.waitForTimeout(300);
    }
    const sendBtn = await page.$('button[aria-label*="envi" i], button[aria-label*="send" i], button[type="submit"]:not(:has-text("Entrar"))');
    if (sendBtn) {
      await sendBtn.click().catch(() => {});
    } else {
      await input.press('Enter').catch(() => {});
    }
    await page.waitForTimeout(1200);

    const afterCount = await page.evaluate((p) => {
      return (document.body.innerText.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    }, pergunta);
    if (afterCount > beforeCount) { enviado = true; break; }
  }

  const feedbackBefore = await page.evaluate(() => {
    return (document.body.innerText.match(/Esta resposta foi [uú]til/gi) || []).length;
  });

  const TIMEOUT_MS = 180000;
  const deadline = Date.now() + TIMEOUT_MS;
  let got = false;
  let sessaoExpirou = false;
  let lastLen = 0, stableTicks = 0;
  while (Date.now() < deadline) {
    await page.waitForTimeout(2000);
    const info = await page.evaluate(() => {
      const txt = document.body.innerText;
      return {
        text: txt,
        processando: /A processar o seu pedido|Gerando resposta|Alinhando os planetas|Pensando\.\.\.|Processando\.\.\.|Carregando\.\.\./i.test(txt),
        sessaoExpirou: /sess[aã]o expirou|fa[çc]a login novamente/i.test(txt),
        feedbackCount: (txt.match(/Esta resposta foi [uú]til/gi) || []).length
      };
    }).catch(() => ({ text: '', processando: false, sessaoExpirou: false, feedbackCount: 0 }));
    if (info.sessaoExpirou) { sessaoExpirou = true; break; }
    if (info.feedbackCount > feedbackBefore && !info.processando) {
      if (info.text.length === lastLen) { stableTicks++; if (stableTicks >= 2) { got = true; break; } }
      else { stableTicks = 0; lastLen = info.text.length; }
    }
  }
  const finalText = await page.evaluate(() => document.body.innerText).catch(() => '');
  return { got, sessaoExpirou, textBefore, finalText };
}

async function preRun(browser, ctx) {
  ctx.log('=== Pre-cleanup: verificando limite de chats ===');
  const contextBrowser = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await contextBrowser.newPage();
  try {
    await performLogin(page, ctx);
    await closeOnboardingIfAny(page);
    try {
      await page.waitForFunction(() => !/Carregando conversas/i.test(document.body.innerText), { timeout: 30000 });
    } catch {}
    await page.waitForTimeout(800);
    try {
      await page.waitForFunction(() => {
        const b = Array.from(document.querySelectorAll('button')).find(x => /nova conversa/i.test(x.innerText));
        return b && !b.disabled;
      }, { timeout: 15000 });
    } catch {}
    const nova = await page.$('button:has-text("Nova Conversa"):not([disabled])');
    if (nova) { await nova.click(); await page.waitForTimeout(1800); }
    const tratado = await handleLimitModalIfPresent(page, ctx, 'pre-cleanup');
    if (tratado) ctx.log('  Pre-cleanup concluido — chats antigos removidos.');
    else ctx.log('  Sem limite atingido — nada a limpar.');
  } catch (e) {
    ctx.log(`  Pre-cleanup falhou: ${e.message}`);
  } finally {
    await contextBrowser.close();
  }
}

async function runScenario(page, cenario, ctx) {
  const id = String(cenario['ID']);
  const fluxo = cenario['Fluxo'] || '';
  const passos = cenario['Passos'] || '';
  const urlRel = cenario['URL'] || '/';
  const pergunta = extrairPergunta(passos, fluxo);
  const startUrl = ctx.BASE_URL + (urlRel.startsWith('/') ? urlRel : '/' + urlRel);

  let status = 'Falhou';
  let observacoes = '';

  try {
    await performLogin(page, ctx);
    await closeOnboardingIfAny(page);
    await handleLimitModalIfPresent(page, ctx, id);

    if (urlRel && urlRel !== '/' && urlRel !== '') {
      await page.goto(startUrl, { waitUntil: 'commit', timeout: 30000 }).catch(() => {});
      await closeOnboardingIfAny(page);
    }

    try {
      await page.waitForFunction(() => !/Carregando conversas/i.test(document.body.innerText), { timeout: 20000 });
    } catch {}
    try {
      await page.waitForFunction(() => {
        const b = Array.from(document.querySelectorAll('button')).find(x => /nova conversa/i.test(x.innerText));
        return b && !b.disabled;
      }, { timeout: 15000 });
    } catch {}

    const nova = await page.$('button:has-text("Nova Conversa"):not([disabled])');
    if (nova) { await nova.click(); await page.waitForTimeout(1200); }

    const modalTratado = await handleLimitModalIfPresent(page, ctx, id);
    if (modalTratado) {
      await page.waitForTimeout(800);
      const nova2 = await page.$('button:has-text("Nova Conversa"):not([disabled])');
      if (nova2) { await nova2.click(); await page.waitForTimeout(1000); }
      const ainda = await page.evaluate(() => /Limite de Chats Atingido/i.test(document.body.innerText));
      if (ainda) {
        return { status: 'Pulou', observacoes: 'Limite de chats nao pode ser liberado' };
      }
    }

    let warm = null;
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      ctx.log(`  → Handshake (tentativa ${tentativa}): enviando "oi"`);
      warm = await sendPerguntaAndWaitResponse(page, 'oi');
      if (warm.sessaoExpirou) {
        return { status: 'Falhou', observacoes: 'Sessao expirou no handshake' };
      }
      if (warm.got) break;
      ctx.log(`  ⚠ Handshake tentativa ${tentativa} falhou`);
    }
    if (!warm.got) {
      return { status: 'Falhou', observacoes: 'IA nao respondeu ao handshake "oi" em 2 tentativas (360s)' };
    }
    ctx.log('  ✓ Handshake OK, enviando pergunta real');
    await page.waitForTimeout(1000);

    const r = await sendPerguntaAndWaitResponse(page, pergunta);
    if (r.sessaoExpirou) { status = 'Falhou'; observacoes = 'IA retornou "sessao expirou"'; }
    else if (r.got) { status = 'Passou'; }
    else { status = 'Falhou'; observacoes = 'Sem resposta da IA em 180s (timeout)'; }
  } catch (e) {
    status = 'Falhou';
    observacoes = ('Erro: ' + (e.message || String(e))).slice(0, 400);
  }

  return { status, observacoes };
}

module.exports = { preRun, runScenario };
