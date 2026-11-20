import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-results', 'parte2');
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

async function abrirFundamentosUniversal(page: Page) {
  await page.goto('/');
  await page.locator('header').getByRole('button', { name: /Fundamentos/i }).click();
  await expect(page.getByRole('heading', { name: 'Fundamentos', exact: true })).toBeVisible();
}

test.describe('Parte 2 — Fundamentos (4 sub-abas: Modo Universal e Com Moto)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Limpa apenas na primeira carga da sessão de teste (preserva em page.reload())
      if (!window.sessionStorage.getItem('__pw_clean_init__')) {
        window.localStorage.clear();
        window.sessionStorage.setItem('__pw_clean_init__', '1');
      }
    });
  });

  test('1. Sub-aba 1 — Guias de Instrumentos (4 SVGs, Multímetro Interativo e Pausar/Reproduzir)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await abrirFundamentosUniversal(page);

    // Verifica que os 4 SVGs renderizam com dimensões válidas e sem corte fora do viewBox
    const svgs = page.locator('main svg[role="img"]');
    await expect(svgs).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      const box = await svgs.nth(i).boundingBox();
      expect(box, `SVG #${i + 1} sem boundingBox`).not.toBeNull();
      expect(box!.width).toBeGreaterThan(200);
      expect(box!.height).toBeGreaterThan(100);
    }

    const checkMultimetroBBox = async (modoLabel: string) => {
      const textoCortado = await multimetroSvg.evaluate((svg) => {
        const problemas: string[] = [];
        for (const t of Array.from(svg.querySelectorAll('text'))) {
          const bbox = t.getBBox();
          if (bbox.x + bbox.width > 346) {
            problemas.push(`"${t.textContent?.trim()}" (x+w=${(bbox.x + bbox.width).toFixed(1)} > 346)`);
          }
        }
        return problemas;
      });
      expect(
        textoCortado,
        `Texto ultrapassando o painel no Multímetro (${modoLabel}): ${textoCortado.join('; ')}`,
      ).toEqual([]);
    };

    // Multímetro Interativo: 3 modos (DCV 20V, Ω 200 / 2k, Bip / Diodo)
    const multimetroSvg = page.locator('main svg[role="img"]').nth(1);
    await expect(multimetroSvg).toContainText('12.6 V');
    await expect(multimetroSvg).toContainText('DCV 20V (Bateria/Carga)');
    await checkMultimetroBBox('DCV 20V');

    await page.getByRole('button', { name: 'Ω 200 / 2k' }).click();
    await expect(multimetroSvg).toContainText('220 Ω');
    await expect(multimetroSvg).toContainText('Ω (Resistência/Bobinas)');
    await expect(page.locator('main')).toContainText('Sempre desconecte a peça do chicote');
    await checkMultimetroBBox('Ω 200 / 2k');

    await page.getByRole('button', { name: 'Bip / Diodo' }).click();
    await expect(multimetroSvg).toContainText('000 · BIP');
    await expect(multimetroSvg).toContainText('Bip (Continuidade/Fusíveis)');
    await expect(page.locator('main')).toContainText('Desligue a ignição ao testar continuidade');
    await checkMultimetroBBox('Bip / Diodo');

    await page.getByRole('button', { name: 'DCV 20V' }).click();
    await expect(multimetroSvg).toContainText('12.6 V');

    // Controle de Animações: Pausar -> aplica .anim-pausada; Reproduzir -> remove
    await expect(page.locator('.anim-pausada')).toHaveCount(0);
    await page.getByRole('button', { name: /Pausar animações/i }).click();
    await expect(page.locator('.anim-pausada')).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Reproduzir animações/i })).toBeVisible();

    await page.getByRole('button', { name: /Reproduzir animações/i }).click();
    await expect(page.locator('.anim-pausada')).toHaveCount(0);

    await assertSemOverflowHorizontal(page, 'Fundamentos - Instrumentos Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-instrumentos-1366x768-escuro.png'),
      fullPage: true,
    });

    // Alterna para Tema Claro e captura evidência
    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await expect(page.locator('html')).toHaveClass(/theme-sol/);
    await assertSemOverflowHorizontal(page, 'Fundamentos - Instrumentos Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-instrumentos-1366x768-claro.png'),
      fullPage: true,
    });

    assertCleanDiagnostics(diag);
  });

  test('2. Sub-aba 2 — Glossário Técnico (26 termos, busca, estado vazio e filtros combinados)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await abrirFundamentosUniversal(page);

    await page.getByRole('tab', { name: /2\. Glossário \(26\)/i }).click();

    const painelAtivo = page.locator('[role="tabpanel"][data-state="active"]');

    // Verifica 26 termos carregados inicialmente
    const cardsGlossario = painelAtivo.locator('.grid > [data-slot="card"]');
    await expect(cardsGlossario).toHaveCount(26);

    const busca = page.getByPlaceholder(/Buscar sigla ou termo/i);

    // Busca por PMS
    await busca.fill('PMS');
    await expect(cardsGlossario.first()).toContainText('Ponto Morto Superior');

    // Busca por DOT
    await busca.fill('DOT');
    await expect(cardsGlossario).toHaveCount(1);
    await expect(cardsGlossario.first()).toContainText('DOT 3 vs DOT 4');

    // Busca por JASO
    await busca.fill('JASO');
    await expect(cardsGlossario).toHaveCount(1);
    await expect(cardsGlossario.first()).toContainText('JASO MA / MA2');

    // Busca sem resultado -> estado vazio amigável
    await busca.fill('termo-inexistente-xyz-999');
    await expect(painelAtivo).toContainText(
      'Nenhum termo encontrado para “termo-inexistente-xyz-999”.',
    );

    // Limpa busca e testa filtros por categoria
    await busca.fill('');
    await expect(cardsGlossario).toHaveCount(26);

    await page.getByRole('button', { name: /^Motor \(\d+\)$/ }).click();
    await expect(cardsGlossario).toHaveCount(8);

    await page.getByRole('button', { name: /^Injeção\/Elétrica \(\d+\)$/ }).click();
    await expect(cardsGlossario).toHaveCount(6);

    await page.getByRole('button', { name: /^Chassi\/Freios \(\d+\)$/ }).click();
    await expect(cardsGlossario).toHaveCount(7);

    await page.getByRole('button', { name: /^Fluidos \(\d+\)$/ }).click();
    await expect(cardsGlossario).toHaveCount(5);

    // Filtro de categoria combinado com busca
    await busca.fill('DOT');
    await expect(cardsGlossario).toHaveCount(1);

    await page.getByRole('button', { name: /^Motor \(\d+\)$/ }).click();
    await expect(painelAtivo).toContainText('Nenhum termo encontrado');

    // Restaura tudo para screenshot
    await busca.fill('');
    await page.getByRole('button', { name: /^Todas \(26\)$/ }).click();
    await expect(cardsGlossario).toHaveCount(26);

    await assertSemOverflowHorizontal(page, 'Fundamentos - Glossário');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-glossario-1366x768-escuro.png'),
      fullPage: false,
    });

    assertCleanDiagnostics(diag);
  });

  test('3. Sub-aba 3 — Olho Clínico (4 velas, coroa/pinhão, TWI/freios nos Temas Escuro e Claro)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await abrirFundamentosUniversal(page);

    await page.getByRole('tab', { name: /3\. Olho Clínico/i }).click();

    // 4 estados da vela
    for (const titulo of [
      'Queima Ideal',
      'Mistura Rica (Excesso)',
      'Mistura Pobre / Superaquecimento',
      'Passagem de Óleo',
    ]) {
      await expect(page.getByRole('heading', { name: titulo })).toBeVisible();
    }

    // 4 SVGs de vela + 2 de coroa + 3 de pneu/freios = 9 SVGs
    const svgs = page.locator('[role="tabpanel"] svg[role="img"]');
    await expect(svgs).toHaveCount(9);
    for (let i = 0; i < 9; i++) {
      const box = await svgs.nth(i).boundingBox();
      expect(box, `SVG #${i + 1} do Olho Clínico sem dimensões`).not.toBeNull();
      expect(box!.width).toBeGreaterThan(80);
      expect(box!.height).toBeGreaterThan(60);
    }

    await assertSemOverflowHorizontal(page, 'Fundamentos - Olho Clínico Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-olho-clinico-1366x768-escuro.png'),
      fullPage: true,
    });

    // Alterna para Tema Claro e verifica contraste do título dos 3 cards escuros de Pneu/Freios
    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await expect(page.locator('html')).toHaveClass(/theme-sol/);

    const corTituloTwiClaro = await page
      .getByText('1. Pneu — Ressalto TWI (1,6 mm)')
      .evaluate((el) => getComputedStyle(el).color);
    // Texto sobre bg-zinc-950 precisa ser claro (oklch L > 0.7 ou rgb > 180)
    const isClaro = (() => {
      const oklch = corTituloTwiClaro.match(/oklch\(([\d.]+)/);
      if (oklch) return Number(oklch[1]) > 0.7;
      const rgb = corTituloTwiClaro.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
      return rgb[0]! > 180 && rgb[1]! > 180 && rgb[2]! > 180;
    })();
    expect(
      isClaro,
      `Contraste baixo no título TWI no Tema Claro: color=${corTituloTwiClaro}`,
    ).toBe(true);

    await assertSemOverflowHorizontal(page, 'Fundamentos - Olho Clínico Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-olho-clinico-1366x768-claro.png'),
      fullPage: true,
    });

    assertCleanDiagnostics(diag);
  });

  test('4. Sub-aba 4 — Conversor Rápido + Caderneta de Manutenção (CRUD, persistência, desfazer, JSON e pré-preenchimento)', async ({
    page,
  }) => {
    const diag = attachDiagnostics(page);
    await abrirFundamentosUniversal(page);

    await page.getByRole('tab', { name: /4\. Utilitários de Bancada/i }).click();

    // --- A) CONVERSOR DE BANCADA ---
    const conversor = page.locator('section[aria-label="Conversor Rápido de Oficina"]');
    const inputNm = conversor.getByPlaceholder('Ex.: 24');
    const inputKgfm = conversor.getByPlaceholder('Ex.: 2,45');
    const inputLbfft = conversor.getByPlaceholder('Ex.: 17,7');
    const inputPsi = conversor.getByPlaceholder('Ex.: 29');
    const inputBar = conversor.getByPlaceholder('Ex.: 2,00');
    const inputKpa = conversor.getByPlaceholder('Ex.: 200');

    // Vírgula e ponto produzem o mesmo resultado
    await inputNm.fill('24,5');
    const kgfmVirgula = await inputKgfm.inputValue();
    const lbfftVirgula = await inputLbfft.inputValue();
    expect(kgfmVirgula).toBe('2,5');

    await inputNm.fill('24.5');
    expect(await inputKgfm.inputValue()).toBe(kgfmVirgula);
    expect(await inputLbfft.inputValue()).toBe(lbfftVirgula);

    // Atalhos de Torque
    for (const [preset, esperadoKgfm] of [
      ['12 N·m', '1,22'],
      ['24 N·m', '2,45'],
      ['59 N·m', '6,02'],
      ['88 N·m', '8,97'],
    ] as const) {
      await conversor.getByRole('button', { name: preset, exact: true }).click();
      await expect(inputKgfm).toHaveValue(esperadoKgfm);
    }

    // Atalhos de Pressão PSI
    for (const [preset, esperadoBar, esperadoKpa] of [
      ['25 PSI', '1,72', '172'],
      ['29 PSI', '2', '200'],
      ['33 PSI', '2,28', '228'],
      ['36 PSI', '2,48', '248'],
    ] as const) {
      await conversor.getByRole('button', { name: preset, exact: true }).click();
      await expect(inputBar).toHaveValue(esperadoBar);
      await expect(inputKpa).toHaveValue(esperadoKpa);
    }

    // Entradas vazias e inválidas -> nunca NaN nem Infinity
    for (const invalido of ['', 'abc', '-10', '1e500']) {
      await inputNm.fill(invalido);
      const textoConversor = await conversor.innerText();
      expect(textoConversor).not.toMatch(/\bNaN\b|\bInfinity\b/);
      await expect(inputKgfm).toHaveValue('');
      await expect(inputLbfft).toHaveValue('');
    }
    await conversor.getByRole('button', { name: '24 N·m', exact: true }).click();

    // --- B) CADERNETA DE MANUTENÇÃO (MODO UNIVERSAL) ---
    const caderneta = page.locator('section[aria-label="Caderneta de Manutenção Local"]');
    const inputMoto = caderneta.getByPlaceholder('Ex.: Honda CG 160 Fan (2024)');
    const inputKm = caderneta.getByPlaceholder('Ex.: 12450');
    const inputDesc = caderneta.getByPlaceholder(/Troca de óleo 10W-30/i);
    const inputObs = caderneta.getByPlaceholder(/Mobil 10W-30/i);

    // No modo universal, campo moto começa vazio
    await expect(inputMoto).toHaveValue('');

    // Registro 1 (Óleo)
    await inputMoto.fill('Honda CG 160 Fan 2022');
    await inputKm.fill('15000');
    await inputDesc.fill('Troca de óleo 10W-30 + limpeza tela');
    await inputObs.fill('Bujão 24 N·m');
    await caderneta.getByRole('button', { name: /Salvar na Caderneta/i }).click();
    await expect(caderneta).toContainText('Troca de óleo 10W-30 + limpeza tela');
    await expect(caderneta).toContainText('15.000 km');

    // Registro 2 (Freios, outra moto — habilita filtro por moto)
    await inputMoto.fill('Yamaha Fazer 150 2023');
    await inputKm.fill('8200');
    await caderneta.locator('form').getByRole('button', { name: 'Freios', exact: true }).click();
    await inputDesc.fill('Troca de pastilha dianteira + sangria DOT 4');
    await caderneta.getByRole('button', { name: /Salvar na Caderneta/i }).click();
    await expect(caderneta).toContainText('Troca de pastilha dianteira + sangria DOT 4');

    // Persistência após reload
    await page.reload();
    await page.locator('header').getByRole('button', { name: /Fundamentos/i }).click();
    await page.getByRole('tab', { name: /4\. Utilitários de Bancada/i }).click();
    await expect(caderneta).toContainText('Troca de óleo 10W-30 + limpeza tela');
    await expect(caderneta).toContainText('Troca de pastilha dianteira + sangria DOT 4');

    // Filtros por categoria e por moto
    await caderneta.getByRole('button', { name: /^Freios \(1\)$/ }).click();
    await expect(caderneta).toContainText('Exibindo 1 de 2');
    await caderneta.getByRole('button', { name: 'Todas', exact: true }).click();
    await expect(caderneta).toContainText('Exibindo 2 de 2');

    const selectMoto = caderneta.getByLabel('Filtrar histórico por moto');
    await selectMoto.selectOption('Honda CG 160 Fan 2022');
    await expect(caderneta).toContainText('Exibindo 1 de 2');
    await selectMoto.selectOption('TODAS');
    await expect(caderneta).toContainText('Exibindo 2 de 2');

    // Exclusão inline + Desfazer no toast
    await caderneta
      .getByRole('button', { name: 'Excluir registro Troca de óleo 10W-30 + limpeza tela' })
      .click();
    await caderneta.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(caderneta).toContainText('Exibindo 1 de 1');

    // Clica em Desfazer no toast
    await page.getByRole('button', { name: /Desfazer/i }).click();
    await expect(caderneta).toContainText('Exibindo 2 de 2');
    await expect(caderneta).toContainText('Troca de óleo 10W-30 + limpeza tela');

    // Importar JSON inválido -> erro amigável sem corromper localStorage
    const fileInput = caderneta.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'corrompido.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{json-invalido', 'utf-8'),
    });
    await expect(page.getByText('Não foi possível ler o arquivo JSON')).toBeVisible();
    await expect(caderneta).toContainText('Exibindo 2 de 2');

    // Importar JSON válido -> adiciona novo registro
    const jsonValido = JSON.stringify({
      app: 'Guia de Oficina',
      versaoSchema: 1,
      registros: [
        {
          id: 'import-qa-001',
          moto: 'Suzuki Intruder 125 (2012)',
          data: '2026-10-15',
          km: 34500,
          categoria: 'Válvulas',
          descricao: 'Regulagem de válvulas motor frio (importado QA)',
          criadoEm: '2026-10-15T12:00:00.000Z',
        },
      ],
    });
    await fileInput.setInputFiles({
      name: 'backup-valido.json',
      mimeType: 'application/json',
      buffer: Buffer.from(jsonValido, 'utf-8'),
    });
    await expect(caderneta).toContainText('Regulagem de válvulas motor frio (importado QA)');
    await expect(caderneta).toContainText('Exibindo 3 de 3');

    await assertSemOverflowHorizontal(page, 'Fundamentos - Utilitários Escuro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-utilitarios-1366x768-escuro.png'),
      fullPage: true,
    });

    await page.locator('header').getByRole('button', { name: /Mudar para Tema Claro/i }).click();
    await assertSemOverflowHorizontal(page, 'Fundamentos - Utilitários Claro');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-utilitarios-1366x768-claro.png'),
      fullPage: true,
    });

    // --- C) COM MOTO SELECIONADA: campo Moto pré-preenchido automaticamente ---
    await page.locator('header').getByRole('button', { name: /Selecionar Moto/i }).click();
    await page.getByRole('button', { name: /Selecionar fabricante Honda/i }).click();
    await page.getByRole('button', { name: /CG 160/i }).first().click();
    await page.getByRole('button', { name: /CG 160 Start/i }).click();
    await page.getByRole('button', { name: /2018–2024/i }).click();

    await page.locator('aside[aria-label="Menu lateral"]').getByRole('button', { name: /Fundamentos/i }).click();
    await page.getByRole('tab', { name: /4\. Utilitários de Bancada/i }).click();

    await expect(caderneta.getByPlaceholder('Ex.: Honda CG 160 Fan (2024)')).toHaveValue(
      'Honda CG 160 Start (2018–2024)',
    );

    assertCleanDiagnostics(diag);
  });
});
