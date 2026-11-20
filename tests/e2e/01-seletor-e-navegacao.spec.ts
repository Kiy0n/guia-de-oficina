import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-results', 'parte1');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedResponses: string[];
}

function attachDiagnostics(page: Page): PageDiagnostics {
  const diag: PageDiagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedResponses: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      diag.consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    diag.pageErrors.push(err.message);
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      diag.failedResponses.push(`${status} ${res.url()}`);
    }
  });

  return diag;
}

function assertCleanDiagnostics(diag: PageDiagnostics) {
  expect(diag.consoleErrors, `Erros de console encontrados: ${diag.consoleErrors.join(' | ')}`).toEqual([]);
  expect(diag.pageErrors, `Exceções não tratadas: ${diag.pageErrors.join(' | ')}`).toEqual([]);
  expect(
    diag.failedResponses,
    `Requisições HTTP 4xx/5xx inesperadas: ${diag.failedResponses.join(' | ')}`,
  ).toEqual([]);
}

async function assertSemOverflowHorizontal(page: Page, contexto: string) {
  const medidas = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    medidas.scrollWidth,
    `Overflow horizontal em ${contexto}: scrollWidth=${medidas.scrollWidth} > innerWidth=${medidas.innerWidth}`,
  ).toBeLessThanOrEqual(medidas.innerWidth);
}

async function assertSidebarSemSobreposicaoOuCorte(page: Page, contexto: string) {
  const problemas = await page.evaluate(() => {
    const issues: string[] = [];
    const aside = document.querySelector('aside[aria-label="Menu lateral"]');
    if (!aside) return ['Sidebar desktop não encontrada'];

    const asideRect = aside.getBoundingClientRect();
    const botoes = Array.from(aside.querySelectorAll('nav[aria-label="Seções"] button'));
    if (botoes.length === 0) return ['Nenhum item de navegação encontrado na sidebar'];

    let prevBottom = -Infinity;
    for (const btn of botoes) {
      const rect = btn.getBoundingClientRect();
      const label = btn.textContent?.trim() ?? '(sem texto)';
      if (rect.width <= 0 || rect.height <= 0) {
        issues.push(`Botão invisível na sidebar: ${label}`);
      }
      if (rect.right > asideRect.right + 1) {
        issues.push(`Botão ultrapassa largura da sidebar: ${label} (${rect.right} > ${asideRect.right})`);
      }
      if (rect.top < prevBottom - 1) {
        issues.push(`Sobreposição vertical na sidebar em: ${label}`);
      }
      prevBottom = rect.bottom;
    }

    // Verifica os 3 botões de controle rápido no topo da sidebar (Tela Acesa, Bancada, Tema)
    const controles = Array.from(aside.querySelectorAll(':scope > div > div.grid button'));
    for (const ctrl of controles) {
      const rect = ctrl.getBoundingClientRect();
      const label = ctrl.textContent?.trim() ?? '(sem texto)';
      if (ctrl.scrollWidth > ctrl.clientWidth + 2) {
        issues.push(`Texto cortado no controle "${label}" (scrollWidth=${ctrl.scrollWidth} > clientWidth=${ctrl.clientWidth})`);
      }
      if (rect.right > asideRect.right + 1) {
        issues.push(`Controle "${label}" ultrapassa a sidebar`);
      }
    }

    return issues;
  });

  expect(problemas, `Problemas visuais na sidebar (${contexto}): ${problemas.join('; ')}`).toEqual([]);
}

async function assertHeaderSemSobreposicao(page: Page, contexto: string) {
  const problemas = await page.evaluate(() => {
    const issues: string[] = [];
    const header = document.querySelector('header');
    if (!header) return ['Header não encontrado'];
    const headerRect = header.getBoundingClientRect();
    if (header.scrollWidth > header.clientWidth + 1) {
      issues.push(`Header com overflow interno (${header.scrollWidth} > ${header.clientWidth})`);
    }
    const items = Array.from(header.querySelectorAll('button, [data-slot="badge"]')).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.right > headerRect.right + 1) {
        issues.push(`Elemento do header fora da viewport: "${el.textContent?.trim()}"`);
      }
    }
    return issues;
  });

  expect(problemas, `Problemas visuais no header (${contexto}): ${problemas.join('; ')}`).toEqual([]);
}

test.describe('Parte 1 — Seletor de Motos, Modo Universal e AppShell', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('1. Carregamento inicial limpo (0 console.error, 0 pageerror, 0 HTTP 4xx/5xx)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Qual moto está na bancada?' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Selecionar fabricante Honda/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Selecionar fabricante Yamaha/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Selecionar fabricante Suzuki/i })).toBeVisible();

    await assertSemOverflowHorizontal(page, 'Wizard inicial 1366x768');
    await assertHeaderSemSobreposicao(page, 'Wizard inicial 1366x768');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'seletor-1366x768-escuro.png'),
      fullPage: true,
    });

    assertCleanDiagnostics(diag);
  });

  test('2. Fluxo do Seletor em 3 perfis distintos + Trocar Moto', async ({ page }) => {
    const diag = attachDiagnostics(page);
    await page.goto('/');

    // --- Perfil 1: Honda com ramificação de versão (CG 160 -> Start -> 2018–2024) ---
    await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
    await expect(page.getByRole('heading', { name: 'Escolha o modelo' })).toBeVisible();

    await page.getByRole('button', { name: /CG 160/i }).first().click();
    await expect(page.getByRole('heading', { name: /CG 160: qual versão\?/i })).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'seletor-versao-cg160-1366x768.png'),
      fullPage: true,
    });

    await page.getByRole('button', { name: /CG 160 Start/i }).click();
    await expect(page.getByRole('heading', { name: /CG 160 Start: qual ano\?/i })).toBeVisible();

    await page.getByRole('button', { name: /2018–2024/i }).click();
    await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
    // Garante que o workspace abre no topo da página (sem título escondido sob o header fixo)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
    await expect(page.locator('header')).toContainText('CG 160 Start');
    await expect(page.locator('header')).toContainText('2018–2024');
    await expect(page.locator('main')).toContainText(/CG 160 Start/i);

    // Trocar moto pelo botão do header
    await page.locator('header').getByRole('button', { name: /Trocar Moto/i }).click();
    await expect(page.getByRole('heading', { name: 'Qual moto está na bancada?' })).toBeVisible();

    // --- Perfil 2: Yamaha com ramificação (Fazer 150 -> FZ15 Fazer ABS -> 2023–2026) ---
    await page.getByRole('button', { name: /Selecionar fabricante Yamaha/i }).click();
    await expect(page.getByRole('heading', { name: 'Escolha o modelo' })).toBeVisible();

    await page.getByRole('button', { name: /Fazer 150/i }).first().click();
    await expect(page.getByRole('heading', { name: /Fazer 150: qual versão\?/i })).toBeVisible();

    await page.getByRole('button', { name: /FZ15 Fazer ABS/i }).click();
    await expect(page.getByRole('heading', { name: /FZ15 Fazer ABS: qual ano\?/i })).toBeVisible();

    await page.getByRole('button', { name: /2023–2026/i }).click();
    await expect(page.locator('header')).toContainText('Fazer 150');
    await expect(page.locator('header')).toContainText('2023–2026');

    // Trocar moto novamente
    await page.locator('header').getByRole('button', { name: /Trocar Moto/i }).click();
    await expect(page.getByRole('heading', { name: 'Qual moto está na bancada?' })).toBeVisible();

    // --- Perfil 3: Moto carburada / tambor (Honda CG 125 -> Fan -> 2009–2015) ---
    await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
    await page.getByRole('button', { name: /CG 125/i }).first().click();
    await expect(page.getByRole('heading', { name: /CG 125: qual versão\?/i })).toBeVisible();

    await page.getByRole('button', { name: /CG 125 Fan/i }).click();
    await expect(page.getByRole('heading', { name: /CG 125 Fan: qual ano\?/i })).toBeVisible();

    await page.getByRole('button', { name: /2009–2015/i }).click();
    await expect(page.locator('header')).toContainText('CG 125');
    await expect(page.locator('header')).toContainText('2009–2015');
    await expect(page.locator('main')).toContainText(/Carburador/i);

    assertCleanDiagnostics(diag);
  });

  test('3. Modo Universal — acessar Fundamentos (FVM) direto sem selecionar moto', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await page.goto('/');

    await page.locator('header').getByRole('button', { name: /Fundamentos/i }).click();

    await expect(page.locator('header')).toContainText('Fundamentos · Universal');
    await expect(page.locator('aside[aria-label="Menu lateral"]')).toContainText('Modo Universal');
    await expect(page.locator('main')).toContainText(/Fundamentos/i);

    await assertSemOverflowHorizontal(page, 'Modo Universal 1366x768');
    await assertSidebarSemSobreposicaoOuCorte(page, 'Modo Universal 1366x768');

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'modo-universal-1366x768.png'),
      fullPage: false,
    });

    // Botão Selecionar Moto retorna ao wizard
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Selecionar Moto/i }).click();
    await expect(page.getByRole('heading', { name: 'Qual moto está na bancada?' })).toBeVisible();

    assertCleanDiagnostics(diag);
  });

  test('4. Validação Visual, Tema Claro/Escuro e Layout em 1366×768 e 1920×1080', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await page.goto('/');

    // Seleciona CG 160 Start 2018–2024 para inspecionar AppShell completo
    await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
    await page.getByRole('button', { name: /CG 160/i }).first().click();
    await page.getByRole('button', { name: /CG 160 Start/i }).click();
    await page.getByRole('button', { name: /2018–2024/i }).click();
    await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
    // Garante que o workspace abre no topo da página (sem título escondido sob o header fixo)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

    for (const vp of [
      { width: 1366, height: 768, label: '1366x768' },
      { width: 1920, height: 1080, label: '1920x1080' },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Garante Tema Escuro ativo inicialmente
      const html = page.locator('html');
      if (!(await html.evaluate((el) => el.classList.contains('dark')))) {
        await page.locator('header').getByRole('button', { name: /Mudar para Tema Escuro/i }).click();
      }
      await expect(html).toHaveClass(/dark/);

      await assertSemOverflowHorizontal(page, `Workspace Escuro ${vp.label}`);
      await assertSidebarSemSobreposicaoOuCorte(page, `Workspace Escuro ${vp.label}`);
      await assertHeaderSemSobreposicao(page, `Workspace Escuro ${vp.label}`);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `workspace-${vp.label}-escuro.png`),
        fullPage: false,
      });

      // Alterna para Tema Claro
      await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
      await expect(html).toHaveClass(/theme-sol/);
      await expect(html).not.toHaveClass(/\bdark\b/);

      await assertSemOverflowHorizontal(page, `Workspace Claro ${vp.label}`);
      await assertSidebarSemSobreposicaoOuCorte(page, `Workspace Claro ${vp.label}`);
      await assertHeaderSemSobreposicao(page, `Workspace Claro ${vp.label}`);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `workspace-${vp.label}-claro.png`),
        fullPage: false,
      });
    }

    assertCleanDiagnostics(diag);
  });
});
