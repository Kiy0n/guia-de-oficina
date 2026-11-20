import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-results', 'parte3');
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
    if (res.status() >= 400) {
      diag.failedResponses.push(`${res.status()} ${res.url()}`);
    }
  });

  return diag;
}

function assertCleanDiagnostics(diag: PageDiagnostics) {
  expect(diag.consoleErrors, `console.error: ${diag.consoleErrors.join(' | ')}`).toEqual([]);
  expect(diag.pageErrors, `pageerror: ${diag.pageErrors.join(' | ')}`).toEqual([]);
  expect(diag.failedResponses, `HTTP >= 400: ${diag.failedResponses.join(' | ')}`).toEqual([]);
}

async function assertSemOverflowHorizontal(page: Page, contexto: string) {
  const medidas = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(
    medidas.scrollWidth,
    `Overflow horizontal em ${contexto}: ${medidas.scrollWidth} > ${medidas.innerWidth}`,
  ).toBeLessThanOrEqual(medidas.innerWidth);
}

async function selecionarCg160Titan(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
  await page.getByRole('button', { name: /CG 160/i }).first().click();
  await page.getByRole('button', { name: /CG 160 Titan/i }).click();
  await page.getByRole('button', { name: /2018–2024/i }).click();
  await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
  await expect(page.locator('header')).toContainText('CG 160');
}

async function selecionarCg125CarburadaTambor(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
  await page.getByRole('button', { name: /CG 125/i }).first().click();
  await page.getByRole('button', { name: /CG 125 Fan/i }).click();
  await page.getByRole('button', { name: /2009–2015/i }).click();
  await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
  await expect(page.locator('header')).toContainText('CG 125');
}

test.describe('Parte 3 — Ficha Técnica, Manual de Revisões, Iniciar Revisão e Procedimentos', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('1. Ficha Técnica — seções, busca de torques, sem undefined/NaN (CG 160 Titan Escuro e Claro)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await selecionarCg160Titan(page);

    const main = page.locator('main');
    await expect(main).toContainText('Óleo do Motor');
    await expect(main).toContainText('Folga de Válvulas');
    await expect(main).toContainText('Vela de Ignição');
    await expect(main).toContainText('Calibragem Pneus');
    await expect(main).toContainText('Kit Relação');
    await expect(main).toContainText('Fluido de Bengala');

    // Percorre todas as 4 abas técnicas garantindo ausência de undefined / NaN
    for (const aba of [
      /Motor & Fluidos/i,
      /Chassi, Freios & Transmissão/i,
      /Ignição & Elétrica/i,
      /Torques Rápidos/i,
    ]) {
      await main.getByRole('tab', { name: aba }).click();
      const texto = await main.innerText();
      expect(texto, `Texto quebrado na aba ${aba}`).not.toMatch(/\bundefined\b|\bNaN\b/);
    }

    // Busca interna de torques + alternância de unidade
    const buscaTorque = main.getByPlaceholder(/Filtrar por fixador/i);
    await buscaTorque.fill('vela');
    await expect(main).toContainText(/vela/i);

    await main.getByRole('button', { name: 'Apenas N·m', exact: true }).click();
    await main.getByRole('button', { name: 'Apenas kgf·m', exact: true }).click();
    await main.getByRole('button', { name: 'N·m + kgf·m', exact: true }).click();

    await buscaTorque.fill('fixador-que-nao-existe-xyz');
    await expect(main).toContainText('Nenhum torque encontrado');
    await buscaTorque.fill('');

    await assertSemOverflowHorizontal(page, 'Ficha Técnica CG 160 Titan Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-ficha-tecnica-cg160-escuro.png'),
      fullPage: false,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await expect(page.locator('html')).toHaveClass(/theme-sol/);
    await assertSemOverflowHorizontal(page, 'Ficha Técnica CG 160 Titan Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-ficha-tecnica-cg160-claro.png'),
      fullPage: false,
    });

    assertCleanDiagnostics(diag);
  });

  test('2. Manual de Revisões — legenda, selos, armadilhas, troca de KM e coerência de arquitetura', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);

    // --- A) Moto Injetada + Disco (CG 160 Titan 2018–2024) ---
    await selecionarCg160Titan(page);
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Manual de Revisões/i }).click();

    const main = page.locator('main');
    await expect(main).toContainText('Nível FVM vs. Oficina:');
    await expect(main.locator('.selo-dificuldade').first()).toBeVisible();
    await expect(main.locator('[role="note"]').first()).toBeVisible();

    // Alterna quilometragens (1.000 km -> 6.000 km -> 12.000 km)
    const sectionKm = main.locator('section[aria-label="Intervalos de revisão por quilometragem"]');
    await sectionKm.getByRole('button', { name: /1\.000 km/i }).click();
    await expect(main).toContainText('Progresso da Revisão de 1.000 km');

    await sectionKm.getByRole('button', { name: /6\.000 km/i }).click();
    await expect(main).toContainText('Progresso da Revisão de 6.000 km');

    await sectionKm.getByRole('button', { name: /12\.000 km/i }).click();
    await expect(main).toContainText('Progresso da Revisão de 12.000 km');
    await expect(main).toContainText(/TROCAR|REGULAR|LIMPAR|CHECAR/i);

    await assertSemOverflowHorizontal(page, 'Manual de Revisões CG 160 Titan Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-manual-revisoes-cg160-escuro.png'),
      fullPage: false,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await assertSemOverflowHorizontal(page, 'Manual de Revisões CG 160 Titan Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-manual-revisoes-cg160-claro.png'),
      fullPage: false,
    });
    // Volta para escuro
    await page.locator('header').getByRole('button', { name: /Mudar para Tema Escuro/i }).click();

    // --- B) Moto Carburada + Tambor (CG 125 Fan 2009–2015) ---
    await selecionarCg125CarburadaTambor(page);
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Manual de Revisões/i }).click();

    const sectionKm125 = main.locator('section[aria-label="Intervalos de revisão por quilometragem"]');
    for (const kmBtn of [/1\.000 km/i, /4\.000 km/i, /12\.000 km/i]) {
      const btn = sectionKm125.getByRole('button', { name: kmBtn });
      if ((await btn.count()) > 0) {
        await btn.first().click();
        const texto = await main.innerText();
        expect(texto, `CG 125 tambor não deve citar DOT 4 em ${kmBtn}`).not.toMatch(/\bDOT\s*4\b|\bDOT\s*3\b/i);
        expect(texto, `CG 125 carburada não deve citar PGM-FI/ECU em ${kmBtn}`).not.toMatch(
          /\bPGM-FI\b|\bECU\b|bico injetor/i,
        );
      }
    }

    assertCleanDiagnostics(diag);
  });

  test('3. Iniciar Revisão — Preparação, Execução passo a passo e Relatório Final (incl. @media print)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await selecionarCg160Titan(page);

    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Iniciar Revisão/i }).click();
    const main = page.locator('main');

    // --- TELA 1: PREPARAÇÃO ---
    await expect(main).toContainText('Nível FVM vs. Oficina:');
    const blocoFerramentasPrep = main.locator('.lista-ferramentas-tarefa');
    await expect(blocoFerramentasPrep).toBeVisible();
    await expect(blocoFerramentasPrep).toContainText('Ferramentas para esta revisão');

    // Confirma ausência de chips duplicados na lista consolidada
    const nomesChips = await blocoFerramentasPrep
      .locator('.ferramenta-chip > span:first-child')
      .allInnerTexts();
    expect(nomesChips.length).toBeGreaterThan(3);
    expect(new Set(nomesChips).size, `Ferramentas duplicadas: ${nomesChips.join(', ')}`).toBe(
      nomesChips.length,
    );

    // Seleciona perfil Revisão Básica (mais rápido para percorrer) e inicia
    await main.getByRole('button', { name: /Revisão Básica/i }).click();
    await main.getByRole('button', { name: /Iniciar Passo a Passo/i }).click();

    // --- TELA 2: EXECUÇÃO PASSO A PASSO ---
    await expect(main).toContainText(/Passo 1 de \d+/);
    await expect(main.locator('.selo-dificuldade').first()).toBeVisible();
    await expect(main.locator('.lista-ferramentas-tarefa')).toContainText('Ferramentas para este passo');

    // Passo 1: marca "Substituído" + peça usada + observação
    await main.getByRole('button', { name: /Substituído/i }).click();
    await main.getByPlaceholder(/Lona Cobreq/i).fill('Óleo Honda 10W-30 SL');
    await main.getByPlaceholder(/Lona traseira com 30%/i).fill('Troca feita com motor morno');
    await expect(main).toContainText(/1\/\d+ registrados/);

    await assertSemOverflowHorizontal(page, 'Iniciar Revisão - Execução Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-iniciar-revisao-execucao-escuro.png'),
      fullPage: false,
    });

    // Passo 2: avança e marca "Checado / OK"
    await main.getByRole('button', { name: /Próximo Passo/i }).click();
    await expect(main).toContainText(/Passo 2 de \d+/);
    await main.getByRole('button', { name: /Checado \/ OK/i }).click();
    await expect(main).toContainText(/2\/\d+ registrados/);

    // Passo 3: avança e marca "Trocar em Breve" com observação
    await main.getByRole('button', { name: /Próximo Passo/i }).click();
    await expect(main).toContainText(/Passo 3 de \d+/);
    await main.getByRole('button', { name: /Trocar em Breve/i }).click();
    await main.getByPlaceholder(/Lona traseira com 30%/i).fill('Atenção na próxima revisão');
    await expect(main).toContainText(/3\/\d+ registrados/);

    // --- TELA 3: RELATÓRIO FINAL ---
    await main.getByRole('button', { name: /Ver Relatório/i }).click();
    const report = main.locator('.print-report');
    await expect(report).toBeVisible();
    await expect(report).toContainText('Relatório Final de Revisão');
    await expect(report).toContainText('Óleo Honda 10W-30 SL');
    await expect(report).toContainText('Atenção na próxima revisão');
    await expect(report.locator('.lista-ferramentas-tarefa')).toBeVisible();
    await expect(report.locator('.selo-dificuldade').first()).toBeVisible();

    await assertSemOverflowHorizontal(page, 'Relatório Final Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-relatorio-final-escuro.png'),
      fullPage: true,
    });

    // Emula @media print e valida visibilidade de .print-report e ocultação de header/.no-print
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('header')).toBeHidden();
    await expect(report).toBeVisible();
    await expect(report.locator('.lista-ferramentas-tarefa')).toBeVisible();
    await expect(report.locator('.selo-dificuldade').first()).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-relatorio-final-print.png'),
      fullPage: true,
    });
    await page.emulateMedia({ media: 'screen' });

    assertCleanDiagnostics(diag);
  });

  test('4. Procedimentos — selos unificados, ListaFerramentasTarefa e coerência de arquitetura (Disco vs Tambor)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);

    // --- A) CG 160 Titan (Disco + Injeção) ---
    await selecionarCg160Titan(page);
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Procedimentos/i }).click();

    const main = page.locator('main');
    await expect(main.locator('.selo-dificuldade').first()).toBeVisible();

    await assertSemOverflowHorizontal(page, 'Procedimentos Grid CG 160 Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-procedimentos-grid-escuro.png'),
      fullPage: false,
    });

    // Abre 3 procedimentos: Filtro Centrífugo (Óleo), Regulagem de Válvulas e Pastilhas de Freio a Disco
    for (const tituloProc of [
      /Limpeza do Filtro Centrífugo/i,
      /Regulagem de Válvulas/i,
      /Troca de Pastilhas de Freio a Disco/i,
    ]) {
      await main.getByRole('button', { name: tituloProc }).first().click();
      await expect(main.locator('.lista-ferramentas-tarefa')).toBeVisible();
      await expect(main.locator('.lista-ferramentas-tarefa')).toContainText(
        'Ferramentas para separar na bancada',
      );
      await expect(main.locator('.selo-dificuldade').first()).toBeVisible();

      if (tituloProc.source.includes('Regulagem')) {
        await assertSemOverflowHorizontal(page, 'Procedimento Regulagem de Válvulas');
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, '04-procedimento-detalhe-valvulas-escuro.png'),
          fullPage: false,
        });
      }

      await main.getByRole('button', { name: /Voltar para todos os procedimentos/i }).click();
    }

    // --- B) CG 125 Fan 2009–2015 (Carburada + Somente Tambor) ---
    await selecionarCg125CarburadaTambor(page);
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Procedimentos/i }).click();

    // Com "apenas compatíveis" ativo, não deve listar Pastilhas de Disco nem Bico Injetor
    const textoGrid125 = await main.innerText();
    expect(textoGrid125).not.toContain('Troca de Pastilhas de Freio a Disco');
    expect(textoGrid125).not.toContain('Limpeza de Bico Injetor');

    // Abre Troca de Lona / Patins de Freio Traseiro e confirma que NÃO mostra "Fluido: DOT 4"
    await main.getByRole('button', { name: /Troca de Lona/i }).first().click();
    await expect(main.locator('.lista-ferramentas-tarefa')).toBeVisible();
    const textoLona125 = await main.innerText();
    expect(
      textoLona125,
      'Procedimento de freio a tambor na CG 125 não deve exibir Fluido: DOT 4',
    ).not.toMatch(/Fluido:\s*DOT\s*4/i);

    assertCleanDiagnostics(diag);
  });
});
