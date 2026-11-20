import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-results', 'parte4');
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

async function selecionarCg160Versao(page: Page, versao: 'CG 160 Titan' | 'CG 160 Start') {
  await page.goto('/');
  await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
  await page.getByRole('button', { name: /CG 160/i }).first().click();
  await page.getByRole('button', { name: new RegExp(versao, 'i') }).click();
  await page.getByRole('button', { name: /2018–2024/i }).click();
  await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
}

async function selecionarCg125Carburada(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
  await page.getByRole('button', { name: /CG 125/i }).first().click();
  await page.getByRole('button', { name: /CG 125 Fan/i }).click();
  await page.getByRole('button', { name: /2009–2015/i }).click();
  await expect(page.locator('aside[aria-label="Menu lateral"]')).toBeVisible();
}

test.describe('Parte 4 — Elétrica & Injeção, Diagnóstico Corretivo e Manuais PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('1. Elétrica & Injeção — Multímetro, Armadilhas, Cores de Fios e Coerência Injetada vs Carburada', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);

    // --- A) Moto Injetada (CG 160 Titan 2018–2024) ---
    await selecionarCg160Versao(page, 'CG 160 Titan');
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Elétrica & Injeção/i }).click();

    const main = page.locator('main');
    await expect(main).toContainText('Injeção Eletrônica · PGM-FI');
    // Aba 1 (Códigos FI) ativa por padrão para moto injetada
    await expect(main).toContainText('Como Ler Piscadas e Resetar');

    // Busca de código FI
    const buscaCodigo = main.getByPlaceholder(/Filtrar código ou sintoma/i);
    await buscaCodigo.fill('TPS');
    await expect(main).toContainText(/TPS/i);
    await buscaCodigo.fill('');

    // Aba 2: Testes no Multímetro (selos + armadilhas de polaridade/retificador)
    await main.getByRole('tab', { name: /2\. Testes no Multímetro/i }).click();
    await expect(main.locator('.selo-dificuldade').first()).toBeVisible();
    await expect(main.locator('[role="note"]').first()).toBeVisible();
    await expect(main).toContainText(/Bateria|Retificador|Estator/i);

    await assertSemOverflowHorizontal(page, 'Elétrica Multímetro CG 160 Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-eletrica-multimetro-escuro.png'),
      fullPage: false,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await assertSemOverflowHorizontal(page, 'Elétrica Multímetro CG 160 Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-eletrica-multimetro-claro.png'),
      fullPage: false,
    });
    await page.locator('header').getByRole('button', { name: /Mudar para Tema Escuro/i }).click();

    // Aba 3: Guia de Cores de Fios + busca
    await main.getByRole('tab', { name: /3\. Guia de Cores de Fios/i }).click();
    const buscaFio = main.getByPlaceholder(/Buscar circuito ou cor/i);
    await buscaFio.fill('terra');
    await expect(main).toContainText(/Padrão Honda/i);

    // --- B) Moto Carburada (CG 125 Fan 2009–2015) ---
    await selecionarCg125Carburada(page);
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Elétrica & Injeção/i }).click();

    await expect(main).toContainText('Ignição CDI/TCI · Carburada');
    // Abre direto na aba Multímetro sem testes exclusivos de injeção
    const textoMult125 = await main.innerText();
    expect(textoMult125).not.toContain('Apenas motos com injeção eletrônica');

    // Ao visitar aba 1 (Códigos FI), NÃO exibe tabela de códigos PGM-FI por padrão
    await main.getByRole('tab', { name: /1\. Códigos de Falha/i }).click();
    await expect(main).toContainText('é 100% Carburada');
    await expect(main).not.toContainText('Como Ler Piscadas e Resetar');

    assertCleanDiagnostics(diag);
  });

  test('2. Diagnóstico Corretivo — cenários, eliminação, selos, armadilhas e sem undefined/overflow', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await selecionarCg160Versao(page, 'CG 160 Titan');
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Diagnóstico Corretivo/i }).click();

    const main = page.locator('main');
    await expect(main).toContainText('Checklist de Eliminação');
    await expect(main.locator('.selo-dificuldade').first()).toBeVisible();
    await expect(main.locator('[role="note"]').first()).toBeVisible();

    // Marca etapa 1 como Teste OK e etapa 2 como Achei Defeito
    await main.getByRole('button', { name: 'Teste OK' }).first().click();
    await main.getByRole('button', { name: 'Achei Defeito' }).nth(1).click();
    await expect(main).toContainText('1 falha(s)');

    // Troca para outro cenário na coluna esquerda
    await main.getByRole('button', { name: /Cenário|Bateria|Morre|Falhando/i }).nth(1).click();
    const textoDiag = await main.innerText();
    expect(textoDiag).not.toMatch(/\bundefined\b|\bNaN\b/);

    await assertSemOverflowHorizontal(page, 'Diagnóstico Corretivo Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-diagnostico-escuro.png'),
      fullPage: false,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await assertSemOverflowHorizontal(page, 'Diagnóstico Corretivo Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-diagnostico-claro.png'),
      fullPage: false,
    });

    assertCleanDiagnostics(diag);
  });

  test('3. Biblioteca de Manuais PDF — 78 PDFs, busca full-text, modo leitura e isolamento CG 160 Start vs Titan', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);

    // --- A) CG 160 Titan 2018–2024 ---
    await selecionarCg160Versao(page, 'CG 160 Titan');
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Manuais PDF/i }).click();

    const main = page.locator('main');
    // Aguarda carregar lista de manuais e confirma isolamento (sem "start")
    await expect(main.getByRole('button', { name: /Ver toda a biblioteca de PDFs \(78\)/i })).toBeVisible();
    const textoFiltradoTitan = await main.innerText();
    expect(textoFiltradoTitan.toLowerCase()).not.toContain('cg-160-start');

    // Alterna para biblioteca completa (78 PDFs)
    await main.getByRole('button', { name: /Ver toda a biblioteca de PDFs \(78\)/i }).click();
    await expect(main).toContainText('Acervo Completo de Manuais PDF (78 de 78)');

    // Volta para filtro da moto atual
    await main.getByRole('button', { name: /Filtrar por CG 160/i }).click();

    // Testa busca full-text dentro do manual usando o atalho "Óleo"
    const inputBuscaManual = main.getByLabel('Pesquisar palavra-chave dentro do manual PDF');
    await expect(inputBuscaManual).toBeEnabled();
    await main.getByRole('button', { name: 'Óleo', exact: true }).click();

    // Aguarda resultados reais de ocorrência
    await expect(main).toContainText(/\d+\s+ocorrênci/i, { timeout: 15_000 });

    // Alterna para Modo Leitura (Texto) e valida carregamento do texto da página
    await main.getByRole('button', { name: /Modo Leitura \(Texto\)/i }).click();
    await expect(main).toContainText(/Página\s+\d+/i, { timeout: 15_000 });

    await assertSemOverflowHorizontal(page, 'Manuais PDF Modo Leitura Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-manuais-pdf-leitura-escuro.png'),
      fullPage: false,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await assertSemOverflowHorizontal(page, 'Manuais PDF Modo Leitura Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-manuais-pdf-leitura-claro.png'),
      fullPage: false,
    });

    // --- B) Isolamento inverso: CG 160 Start 2018–2024 ---
    await selecionarCg160Versao(page, 'CG 160 Start');
    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Manuais PDF/i }).click();
    await expect(main).toContainText(/CG 160 Start/i);
    await expect(main).toContainText(/public\/manuals\/honda\/cg-160-start/i);

    assertCleanDiagnostics(diag);
  });
});
