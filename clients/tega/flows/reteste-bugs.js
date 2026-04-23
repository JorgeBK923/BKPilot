// TEGA — flow "reteste-bugs"
// Reteste automatizado de bugs Jira específicos da TEGA.
// Contrato: { retestarBug(context, bug, ctx) } — retorna objeto de resultado.
//
// ctx: { client, creds, log, paths, BASE_URL }

const path = require('path');

async function performLogin(page, ctx) {
  return ctx.client.login(page, {
    email: ctx.creds.login,
    password: ctx.creds.password,
    config: ctx.client.config,
    log: ctx.log,
  });
}

async function retestarAssistenteIA(context, bug, ctx) {
  const { log, paths, BASE_URL } = ctx;
  const page = await context.newPage();
  const result = {
    id: bug.id, titulo: bug.titulo, fluxo: 'assistente_ia',
    status_atual: 'Inconclusivo', observacoes: [],
    evidencia_texto: null, screenshot: null,
    console_errors_durante: 0, network_errors_durante: 0
  };
  const consoleErr = [];
  const netErr = [];
  page.on('console', m => { if (m.type() === 'error') consoleErr.push({ t: new Date().toISOString(), text: m.text(), url: page.url() }); });
  page.on('response', r => { if (r.status() >= 400) netErr.push({ t: new Date().toISOString(), status: r.status(), url: r.url() }); });

  const finalize = () => {
    result.console_errors_durante = consoleErr.length;
    result.network_errors_durante = netErr.length;
    return result;
  };

  try {
    await performLogin(page, ctx);
    log(`  [${bug.id}] login ok`);

    await page.goto(BASE_URL + '/charts/gallery', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pencilCount = btns.filter(b => {
        const d = b.querySelector('svg > path')?.getAttribute('d') || '';
        return d.startsWith('M227.31,73.37') && !b.innerText?.trim();
      }).length;
      return pencilCount >= 1;
    }, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(paths.shotDir, `${bug.id}_1_galeria.png`), fullPage: true });

    const clickPencil = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const pencils = [];
      for (const b of buttons) {
        if (b.innerText?.trim()) continue;
        const d = b.querySelector('svg > path')?.getAttribute('d') || '';
        if (d.startsWith('M227.31,73.37')) pencils.push(b);
      }
      if (pencils.length === 0) {
        const allPaths = buttons.slice(0, 30).map(b => {
          const d = b.querySelector('svg > path')?.getAttribute('d') || '';
          return { text: (b.innerText||'').trim().slice(0,30), d: d.slice(0,35) };
        }).filter(x => x.d);
        return { ok: false, dump: allPaths };
      }
      pencils[0].scrollIntoView({ block: 'center' });
      pencils[0].click();
      return { ok: true, count: pencils.length };
    });
    if (!clickPencil.ok) {
      result.observacoes.push('Ícone lápis não encontrado — dump: ' + JSON.stringify(clickPencil.dump).slice(0, 800));
      return finalize();
    }
    log(`    lápis clicado (${clickPencil.count} candidatos)`);
    await page.waitForSelector('textarea', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(paths.shotDir, `${bug.id}_2_modal_editar.png`), fullPage: true });

    const ta = page.locator('textarea').last();
    const taCount = await ta.count().catch(() => 0);
    if (taCount === 0) {
      result.observacoes.push('Textarea do Assistente IA não localizada no modal');
      return finalize();
    }

    const AI_ENDPOINTS = /\/conversations(\?|$|\/[^\/]+\/(queries|messages))/;
    await context.route(/jclaback\.sistemastega\.com\.br.*/i, route => {
      const req = route.request();
      if (req.method() === 'POST' && AI_ENDPOINTS.test(req.url())) {
        log(`    [route] BLOQUEADO ${req.method()} ${req.url()}`);
        return route.abort('failed');
      }
      return route.continue();
    });
    log(`  [${bug.id}] route ativa — query IA irá falhar`);

    await ta.fill('Qual o total de vendas do mês?');
    await page.keyboard.press('Enter');
    log(`  [${bug.id}] query enviada — aguardando mensagem de erro (até 5min)`);

    const errorRegexPt = /(erro de rede|verifique sua conex|falha na conex|tente novamente|conex[ãa]o)/i;
    const errorRegexEn = /(network error|please check|failed|try again|connection lost)/i;
    const deadline = Date.now() + 5 * 60 * 1000;
    let linhasRecentes = '';
    let encontrou = null;
    while (Date.now() < deadline) {
      await page.waitForTimeout(5000);
      const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
      linhasRecentes = bodyText.split('\n').slice(-60).join('\n');
      if (errorRegexPt.test(linhasRecentes) || errorRegexEn.test(linhasRecentes)) {
        encontrou = true;
        break;
      }
    }
    await page.screenshot({ path: path.join(paths.shotDir, `${bug.id}_3_erro_ia.png`), fullPage: true });
    result.evidencia_texto = linhasRecentes;
    if (!encontrou) {
      result.observacoes.push('Timeout 5min sem mensagem de erro clara — IA pode não ter respondido ou idioma não detectado');
    }

    const temIngles = errorRegexEn.test(linhasRecentes);
    const temPortugues = errorRegexPt.test(linhasRecentes);

    if (temIngles && !temPortugues) {
      result.status_atual = 'Persiste';
      result.observacoes.push('Mensagem de erro detectada em inglês — bug ainda presente');
    } else if (temPortugues && !temIngles) {
      result.status_atual = 'Corrigido';
      result.observacoes.push('Mensagem de erro em português — bug parece corrigido');
    } else if (temIngles && temPortugues) {
      result.status_atual = 'Corrigido';
      result.observacoes.push('Ambos idiomas detectados — parcialmente corrigido; revisar manualmente');
    } else {
      result.status_atual = 'Inconclusivo';
      result.observacoes.push('Nenhuma mensagem de erro clara capturada no offline — revisar screenshot');
    }

    await context.unroute(/jclaback\.sistemastega\.com\.br.*/i).catch(() => {});
    result.screenshot = `${bug.id}_3_erro_ia.png`;

  } catch (e) {
    result.observacoes.push('Exceção: ' + e.message);
  }

  return finalize();
}

async function retestarBug(context, bug, ctx) {
  if (bug.url_hint === 'charts' && /Assistente IA|Editar Gr[áa]fico/i.test(bug.titulo + bug.descricao)) {
    return retestarAssistenteIA(context, bug, ctx);
  }
  const page = await context.newPage();
  try {
    await performLogin(page, ctx);
    await page.screenshot({ path: path.join(ctx.paths.shotDir, `${bug.id}_home.png`) });
  } catch {}
  return {
    id: bug.id, titulo: bug.titulo, fluxo: 'nao_suportado',
    status_atual: 'Inconclusivo',
    observacoes: ['Fluxo de reteste automatizado não implementado para este tipo de bug — reteste manual necessário'],
    evidencia_texto: null, screenshot: `${bug.id}_home.png`,
    console_errors_durante: 0, network_errors_durante: 0
  };
}

function extrairUrlHint(desc) {
  if (/Editar Gr[áa]fico|Assistente IA|gr[áa]fico/i.test(desc)) return 'charts';
  if (/relat[óo]rio/i.test(desc)) return 'reports';
  return null;
}

module.exports = { retestarBug, extrairUrlHint };
