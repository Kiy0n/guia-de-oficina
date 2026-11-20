import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://dev:3001';

interface ManualPdfItem {
  id: string;
  marca: string;
  modeloSlug: string;
  anoOuFaixa: string | null;
  nomeArquivo: string;
  tituloAmigavel: string;
  tamanhoBytes: number;
  url: string;
}

test.describe('Parte 1 — Auditoria de APIs e Servidor Local (Express)', () => {
  let primeiroManual: ManualPdfItem | null = null;

  test('GET /api/health retorna status ok e contrato JSON completo', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    expect(res.headers()['x-powered-by']).toBeUndefined();

    const body = await res.json();
    expect(body).toMatchObject({
      status: 'ok',
      app: 'Guia de Oficina',
    });
    expect(['development', 'production']).toContain(body.env);
    expect(typeof body.uptime).toBe('number');
    expect(typeof body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  test('GET /api/manuais lista biblioteca e valida contrato ManualPdfItem', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/manuais`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(typeof body.total).toBe('number');
    expect(typeof body.totalBiblioteca).toBe('number');
    expect(body.total).toBe(body.totalBiblioteca);
    expect(Array.isArray(body.manuais)).toBe(true);

    if (body.manuais.length > 0) {
      const item = body.manuais[0] as ManualPdfItem;
      primeiroManual = item;
      expect(typeof item.id).toBe('string');
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.marca).toBe('string');
      expect(typeof item.modeloSlug).toBe('string');
      expect(item.anoOuFaixa === null || typeof item.anoOuFaixa === 'string').toBe(true);
      expect(typeof item.nomeArquivo).toBe('string');
      expect(item.nomeArquivo.toLowerCase()).toMatch(/\.pdf$/);
      expect(typeof item.tituloAmigavel).toBe('string');
      expect(typeof item.tamanhoBytes).toBe('number');
      expect(item.tamanhoBytes).toBeGreaterThan(0);
      expect(item.url).toMatch(/^\/manuals\//);
    }
  });

  test('GET /api/manuais aplica filtros válidos e isola CG 160 Start de CG 160 Fan/Titan', async ({
    request,
  }) => {
    const resCg160 = await request.get(
      `${API_URL}/api/manuais?marca=Honda&modelo=cg-160&anoInicio=2018&anoFim=2024`,
    );
    expect(resCg160.status()).toBe(200);
    const dataCg160 = await resCg160.json();
    for (const m of dataCg160.manuais as ManualPdfItem[]) {
      expect(m.marca).toBe('Honda');
      expect(m.modeloSlug.toLowerCase()).not.toContain('start');
    }

    const resStart = await request.get(
      `${API_URL}/api/manuais?marca=Honda&modelo=cg-160-start&anoInicio=2018&anoFim=2024`,
    );
    expect(resStart.status()).toBe(200);
    const dataStart = await resStart.json();
    for (const m of dataStart.manuais as ManualPdfItem[]) {
      expect(m.marca).toBe('Honda');
      expect(m.modeloSlug.toLowerCase()).toContain('start');
    }

    const resYamaha = await request.get(`${API_URL}/api/manuais?marca=Yamaha&modelo=fazer-150`);
    expect(resYamaha.status()).toBe(200);
    const dataYamaha = await resYamaha.json();
    for (const m of dataYamaha.manuais as ManualPdfItem[]) {
      expect(m.marca).toBe('Yamaha');
    }
  });

  test('GET /api/manuais lida com filtros inválidos, vazios e inexistentes sem erro 500', async ({
    request,
  }) => {
    const resInexistente = await request.get(`${API_URL}/api/manuais?marca=MarcaInexistente999`);
    expect(resInexistente.status()).toBe(200);
    const dataInexistente = await resInexistente.json();
    expect(dataInexistente.total).toBe(0);
    expect(dataInexistente.manuais).toEqual([]);

    const resAnoInvalido = await request.get(`${API_URL}/api/manuais?anoInicio=abc&anoFim=xyz`);
    expect(resAnoInvalido.status()).toBe(200);
    const dataAnoInvalido = await resAnoInvalido.json();
    expect(dataAnoInvalido.total).toBe(dataAnoInvalido.totalBiblioteca);

    // Caso de borda: query string vazia (anoInicio=&anoFim=) não deve filtrar como ano 0
    const resAnoVazio = await request.get(`${API_URL}/api/manuais?anoInicio=&anoFim=`);
    expect(resAnoVazio.status()).toBe(200);
    const dataAnoVazio = await resAnoVazio.json();
    expect(dataAnoVazio.total).toBe(dataAnoVazio.totalBiblioteca);
  });

  test('GET /api/manuais/:id/indice — válido, inexistente e tentativas de path traversal', async ({
    request,
  }) => {
    if (!primeiroManual) {
      const list = await (await request.get(`${API_URL}/api/manuais`)).json();
      primeiroManual = list.manuais[0] ?? null;
    }
    test.skip(!primeiroManual, 'Nenhum PDF disponível em public/manuals/');

    const idEncoded = encodeURIComponent(primeiroManual!.id);
    const resOk = await request.get(`${API_URL}/api/manuais/${idEncoded}/indice`);
    expect(resOk.status()).toBe(200);
    const indice = await resOk.json();
    expect(indice.manualId).toBe(primeiroManual!.id);
    expect(typeof indice.totalPaginas).toBe('number');
    expect(indice.totalPaginas).toBeGreaterThan(0);
    expect(typeof indice.temTextoPesquisavel).toBe('boolean');
    expect(typeof indice.extraidoEm).toBe('string');

    // ID inexistente -> 404
    const res404 = await request.get(`${API_URL}/api/manuais/nao-existe-xyz.pdf/indice`);
    expect(res404.status()).toBe(404);
    const err404 = await res404.json();
    expect(typeof err404.error).toBe('string');

    // Path traversal em :id -> nunca 200 nem 500
    for (const payload of [
      encodeURIComponent('../../package.json'),
      encodeURIComponent('../../../etc/passwd'),
      encodeURIComponent('..\\..\\package.json'),
    ]) {
      const resTrav = await request.get(`${API_URL}/api/manuais/${payload}/indice`);
      expect(resTrav.status()).toBe(404);
    }
  });

  test('GET /api/manuais/:id/buscar — válido, query curta/ausente e ID inexistente', async ({
    request,
  }) => {
    if (!primeiroManual) {
      const list = await (await request.get(`${API_URL}/api/manuais`)).json();
      primeiroManual = list.manuais[0] ?? null;
    }
    test.skip(!primeiroManual, 'Nenhum PDF disponível em public/manuals/');

    const idEncoded = encodeURIComponent(primeiroManual!.id);

    // Query válida
    const resOk = await request.get(`${API_URL}/api/manuais/${idEncoded}/buscar?q=oleo`);
    expect(resOk.status()).toBe(200);
    const body = await resOk.json();
    expect(body.manualId).toBe(primeiroManual!.id);
    expect(body.query).toBe('oleo');
    expect(typeof body.temTextoPesquisavel).toBe('boolean');
    expect(typeof body.totalPaginas).toBe('number');
    expect(typeof body.totalOcorrencias).toBe('number');
    expect(Array.isArray(body.resultados)).toBe(true);

    // Query < 2 caracteres -> 400
    const resCurta = await request.get(`${API_URL}/api/manuais/${idEncoded}/buscar?q=a`);
    expect(resCurta.status()).toBe(400);

    // Sem parâmetro q -> 400
    const resSemQ = await request.get(`${API_URL}/api/manuais/${idEncoded}/buscar`);
    expect(resSemQ.status()).toBe(400);

    // ID inexistente -> 404
    const res404 = await request.get(`${API_URL}/api/manuais/inexistente.pdf/buscar?q=oleo`);
    expect(res404.status()).toBe(404);
  });

  test('GET /api/manuais/:id/pagina/:numero — válida, fora do intervalo e parâmetros inválidos', async ({
    request,
  }) => {
    if (!primeiroManual) {
      const list = await (await request.get(`${API_URL}/api/manuais`)).json();
      primeiroManual = list.manuais[0] ?? null;
    }
    test.skip(!primeiroManual, 'Nenhum PDF disponível em public/manuals/');

    const idEncoded = encodeURIComponent(primeiroManual!.id);

    // Página 1 válida
    const resP1 = await request.get(`${API_URL}/api/manuais/${idEncoded}/pagina/1`);
    expect(resP1.status()).toBe(200);
    const p1 = await resP1.json();
    expect(p1.manualId).toBe(primeiroManual!.id);
    expect(p1.pagina).toBe(1);
    expect(typeof p1.totalPaginas).toBe('number');
    expect(typeof p1.temTextoPesquisavel).toBe('boolean');
    expect(typeof p1.texto).toBe('string');

    // Números inválidos -> 400
    for (const invalido of ['0', '-1', 'abc', '1.5', '999999']) {
      const resInv = await request.get(`${API_URL}/api/manuais/${idEncoded}/pagina/${invalido}`);
      expect(resInv.status(), `página=${invalido}`).toBe(400);
    }

    // ID inexistente -> 404
    const res404 = await request.get(`${API_URL}/api/manuais/inexistente.pdf/pagina/1`);
    expect(res404.status()).toBe(404);
  });

  test('GET /manuals/* — serve PDF inline e bloqueia path traversal', async ({ request }) => {
    if (!primeiroManual) {
      const list = await (await request.get(`${API_URL}/api/manuais`)).json();
      primeiroManual = list.manuais[0] ?? null;
    }
    test.skip(!primeiroManual, 'Nenhum PDF disponível em public/manuals/');

    const resPdf = await request.get(`${API_URL}${primeiroManual!.url}`);
    expect(resPdf.status()).toBe(200);
    expect(resPdf.headers()['content-type']).toContain('application/pdf');
    expect(resPdf.headers()['content-disposition']).toContain('inline');
    const buf = await resPdf.body();
    expect(buf.subarray(0, 4).toString('ascii')).toBe('%PDF');

    // Path traversal em /manuals/ -> bloqueado (nunca 200 nem conteúdo de package.json)
    for (const urlMaliciosa of [
      '/manuals/../../package.json',
      '/manuals/%2e%2e/%2e%2e/package.json',
      '/manuals/..%2f..%2fpackage.json',
    ]) {
      const resTrav = await request.get(`${API_URL}${urlMaliciosa}`);
      expect([400, 403, 404]).toContain(resTrav.status());
      const texto = await resTrav.text();
      expect(texto).not.toContain('"guia-de-oficina"');
    }

    // PDF inexistente -> 404
    const resMissing = await request.get(`${API_URL}/manuals/nao-existe-12345.pdf`);
    expect(resMissing.status()).toBe(404);

    // Hardening: arquivos não-PDF (ex.: README.md) devem ser bloqueados com 404
    const resReadme = await request.get(`${API_URL}/manuals/README.md`);
    expect(resReadme.status()).toBe(404);
  });

  test('Rotas inexistentes e JSON malformado retornam 4xx sem derrubar o servidor', async ({
    request,
  }) => {
    const res404 = await request.get(`${API_URL}/api/rota-inexistente-qa`);
    expect(res404.status()).toBe(404);
    const body404 = await res404.json();
    expect(body404).toHaveProperty('error');

    // JSON malformado -> deve retornar 400 (nunca 500)
    const resBadJson = await request.post(`${API_URL}/api/health`, {
      headers: { 'Content-Type': 'application/json' },
      data: '{json-quebrado',
    });
    expect(resBadJson.status()).toBe(400);

    // Servidor continua saudável após todos os testes de falha
    const resHealth = await request.get(`${API_URL}/api/health`);
    expect(resHealth.status()).toBe(200);
  });
});
