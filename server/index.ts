import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

import {
  buscarNoIndiceManual,
  gerarNomeArquivoCache,
  obterOuCriarIndiceManual,
} from './manualsIndex.js';

const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();
const CLIENT_DIST = path.join(ROOT_DIR, 'dist');
const MANUALS_DIR = path.join(ROOT_DIR, 'public', 'manuals');

export interface ManualPdfItem {
  id: string;
  marca: string;
  modeloSlug: string;
  anoOuFaixa: string | null;
  nomeArquivo: string;
  tituloAmigavel: string;
  tamanhoBytes: number;
  url: string;
}

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// ---------------------------------------------------------------------------
// Servir public/manuals estaticamente em /manuals com visualização inline
// Restrito estritamente a arquivos .pdf (bloqueia README.md e outros arquivos)
// ---------------------------------------------------------------------------
app.use('/manuals', (req, res, next) => {
  if (!req.path.toLowerCase().endsWith('.pdf')) {
    res.status(404).json({ error: 'Arquivo de manual não encontrado.' });
    return;
  }
  next();
});
app.use(
  '/manuals',
  express.static(MANUALS_DIR, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  }),
);
app.use('/manuals', (_req, res) => {
  res.status(404).json({ error: 'Arquivo de manual não encontrado.' });
});

// ---------------------------------------------------------------------------
// Helpers de descoberta e normalização de Manuais PDF
// ---------------------------------------------------------------------------

function normalizarMarca(raw: string): string {
  const lower = raw.trim().toLowerCase();
  if (lower === 'honda') return 'Honda';
  if (lower === 'yamaha') return 'Yamaha';
  if (lower === 'suzuki') return 'Suzuki';
  return raw.trim();
}

function normalizarSlugSimples(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^(honda|yamaha|suzuki)[-_]?/i, '')
    .replace(/[^a-z0-9]/g, '');
}

function inferirTituloAmigavel(nomeArquivo: string): string {
  const base = nomeArquivo.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim();
  const lower = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (/^(manual[-_\s]*(de[-_\s]*)?servico|service[-_\s]*manual)$/i.test(lower)) {
    return 'Manual de Serviço';
  }
  if (/^(manual[-_\s]*(do[-_\s]*)?proprietario|owner[-_\s]*manual)$/i.test(lower)) {
    return 'Manual do Proprietário';
  }
  if (/^(catalogo[-_\s]*(de[-_\s]*)?pecas|parts[-_\s]*catalog)$/i.test(lower)) {
    return 'Catálogo de Peças';
  }
  if (lower.includes('servico') || lower.includes('service') || lower.includes('oficina')) {
    return `Manual de Serviço — ${base}`;
  }
  if (lower.includes('catalogo') || lower.includes('pecas') || lower.includes('parts')) {
    return `Catálogo de Peças — ${base}`;
  }
  if (lower.includes('proprietario') || lower.includes('owner')) {
    return `Manual do Proprietário — ${base}`;
  }
  if (lower.includes('eletric') || lower.includes('diagrama')) {
    return `Diagrama Elétrico — ${base}`;
  }

  return `Manual Oficial — ${base}`;
}

async function listarPdfsRecursivo(dirAtual: string, baseDir: string): Promise<ManualPdfItem[]> {
  if (!existsSync(dirAtual)) return [];

  const entradas = await readdir(dirAtual, { withFileTypes: true });
  const resultado: ManualPdfItem[] = [];

  for (const entrada of entradas) {
    const caminhoCompleto = path.join(dirAtual, entrada.name);

    if (entrada.isDirectory()) {
      const subItens = await listarPdfsRecursivo(caminhoCompleto, baseDir);
      resultado.push(...subItens);
      continue;
    }

    if (!entrada.isFile() || !entrada.name.toLowerCase().endsWith('.pdf')) {
      continue;
    }

    const relPath = path.relative(baseDir, caminhoCompleto);
    const partes = relPath.split(path.sep);
    // Estrutura esperada: <marca>/<modeloSlug>/[<anoOuFaixa>/]<arquivo.pdf>
    const marcaRaw = partes[0] ?? 'Geral';
    const modeloSlug = partes.length >= 3 ? (partes[1] ?? 'geral') : 'geral';
    const anoOuFaixa = partes.length >= 4 ? (partes.slice(2, -1).join('/') || null) : null;
    const nomeArquivo = entrada.name;

    const info = await stat(caminhoCompleto);
    const urlPath = partes.map((segmento) => encodeURIComponent(segmento)).join('/');

    resultado.push({
      id: relPath.replace(/\\/g, '/'),
      marca: normalizarMarca(marcaRaw),
      modeloSlug,
      anoOuFaixa,
      nomeArquivo,
      tituloAmigavel: inferirTituloAmigavel(nomeArquivo),
      tamanhoBytes: info.size,
      url: `/manuals/${urlPath}`,
    });
  }

  return resultado;
}

const ALIASES_SLUG_MODELO: Record<string, string> = {
  bros125: 'nxr125bros',
  nxr125: 'nxr125bros',
  bros150: 'nxr150bros',
  nxr150: 'nxr150bros',
  bros160: 'nxr160bros',
  nxr160: 'nxr160bros',
  c100: 'biz100',
  c100biz: 'biz100',
  biz110: 'biz110i',
  ybr125fazer: 'fazer125',
  en125: 'yes125',
  gn125: 'intruder125',
  start160: 'cg160start',
};

function canonizarSlugModelo(valor: string): string {
  const simples = normalizarSlugSimples(valor);
  return ALIASES_SLUG_MODELO[simples] ?? simples;
}

function modelosCasam(modeloPdfSlug: string, filtroModelo: string): boolean {
  const a = canonizarSlugModelo(modeloPdfSlug);
  const b = canonizarSlugModelo(filtroModelo);
  if (!a || !b) return true;
  if (a === b) return true;
  // Evita cruzar CG 160 Start (tambor/gasolina) com CG 160 Fan/Titan/Cargo (disco/flex)
  if ((a === 'cg160start' && b === 'cg160') || (a === 'cg160' && b === 'cg160start')) {
    return false;
  }
  if (a.length >= 4 && b.includes(a)) return true;
  if (b.length >= 4 && a.includes(b)) return true;
  return false;
}

function anosCasam(anoOuFaixa: string | null, anoInicioQuery?: number, anoFimQuery?: number): boolean {
  if (!anoOuFaixa) return true;
  if (anoInicioQuery === undefined && anoFimQuery === undefined) return true;

  const matches = anoOuFaixa.match(/\b(19\d{2}|20\d{2})\b/g);
  if (!matches || matches.length === 0) return true;

  const anos = matches.map(Number);
  const pdfInicio = Math.min(...anos);
  const pdfFim = Math.max(...anos);

  const qInicio = anoInicioQuery ?? anoFimQuery ?? pdfInicio;
  const qFim = anoFimQuery ?? anoInicioQuery ?? pdfFim;

  return pdfInicio <= qFim && pdfFim >= qInicio;
}

function normalizarIdManualParam(rawParam: unknown): string {
  if (Array.isArray(rawParam)) {
    return rawParam.map((p) => String(p)).join('/').trim();
  }
  if (typeof rawParam === 'string') {
    try {
      return decodeURIComponent(rawParam).trim();
    } catch {
      return rawParam.trim();
    }
  }
  return '';
}

async function localizarManualPorId(
  idParam: string,
): Promise<{ manual: ManualPdfItem; caminhoAbsoluto: string } | null> {
  if (!idParam) return null;

  const todos = await listarPdfsRecursivo(MANUALS_DIR, MANUALS_DIR);
  const idLower = idParam.replace(/\\/g, '/').toLowerCase();
  const slugParam = gerarNomeArquivoCache(idParam);

  const encontrado =
    todos.find((m) => m.id === idParam) ??
    todos.find((m) => m.id.toLowerCase() === idLower) ??
    todos.find((m) => gerarNomeArquivoCache(m.id) === slugParam);

  if (!encontrado) return null;

  const caminhoAbsoluto = path.join(MANUALS_DIR, ...encontrado.id.split('/'));
  if (!existsSync(caminhoAbsoluto)) return null;

  return { manual: encontrado, caminhoAbsoluto };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const api = express.Router();

api.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Guia de Oficina',
    env: IS_PROD ? 'production' : 'development',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

api.get('/manuais', async (req, res) => {
  const todos = await listarPdfsRecursivo(MANUALS_DIR, MANUALS_DIR);

  todos.sort((a, b) => a.id.localeCompare(b.id, 'pt-BR', { numeric: true }));

  const marcaFiltro = typeof req.query.marca === 'string' ? req.query.marca.trim().toLowerCase() : undefined;
  const modeloFiltro = typeof req.query.modelo === 'string' ? req.query.modelo.trim() : undefined;
  const parseAnoQuery = (raw: unknown): number | undefined => {
    if (typeof raw !== 'string') return undefined;
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const anoInicio = parseAnoQuery(req.query.anoInicio);
  const anoFim = parseAnoQuery(req.query.anoFim);

  const filtrados = todos.filter((item) => {
    if (marcaFiltro && item.marca.toLowerCase() !== marcaFiltro) {
      return false;
    }
    if (modeloFiltro && !modelosCasam(item.modeloSlug, modeloFiltro)) {
      return false;
    }
    if (!anosCasam(item.anoOuFaixa, anoInicio, anoFim)) {
      return false;
    }
    return true;
  });

  res.json({
    total: filtrados.length,
    totalBiblioteca: todos.length,
    manuais: filtrados,
  });
});

// ---------------------------------------------------------------------------
// Índice, Busca Instantânea e Modo Leitura de Manuais PDF
// ---------------------------------------------------------------------------
const handleManualIndice = async (req: Request, res: Response) => {
  const idParam = normalizarIdManualParam(req.params.id);
  const localizado = await localizarManualPorId(idParam);

  if (!localizado) {
    res.status(404).json({ error: 'Manual PDF não encontrado.' });
    return;
  }

  const indice = await obterOuCriarIndiceManual(
    localizado.manual.id,
    localizado.caminhoAbsoluto,
  );

  res.json({
    manualId: indice.manualId,
    totalPaginas: indice.totalPaginas,
    temTextoPesquisavel: indice.temTextoPesquisavel,
    extraidoEm: indice.extraidoEm,
  });
};

const handleManualBuscar = async (req: Request, res: Response) => {
  const idParam = normalizarIdManualParam(req.params.id);
  const queryRaw = typeof req.query.q === 'string' ? req.query.q.trim() : '';

  if (queryRaw.length < 2) {
    res.status(400).json({
      error: 'O parâmetro de busca "q" deve ter pelo menos 2 caracteres.',
    });
    return;
  }

  const localizado = await localizarManualPorId(idParam);
  if (!localizado) {
    res.status(404).json({ error: 'Manual PDF não encontrado.' });
    return;
  }

  const indice = await obterOuCriarIndiceManual(
    localizado.manual.id,
    localizado.caminhoAbsoluto,
  );

  if (!indice.temTextoPesquisavel) {
    res.json({
      manualId: indice.manualId,
      query: queryRaw,
      temTextoPesquisavel: false,
      totalPaginas: indice.totalPaginas,
      totalOcorrencias: 0,
      resultados: [],
    });
    return;
  }

  const resultado = buscarNoIndiceManual(indice, queryRaw);
  res.json(resultado);
};

const handleManualPagina = async (req: Request, res: Response) => {
  const idParam = normalizarIdManualParam(req.params.id);
  const numeroRaw = typeof req.params.numero === 'string' ? Number(req.params.numero) : Number.NaN;

  if (!Number.isInteger(numeroRaw) || numeroRaw < 1) {
    res.status(400).json({
      error: 'Número de página inválido.',
    });
    return;
  }

  const localizado = await localizarManualPorId(idParam);
  if (!localizado) {
    res.status(404).json({ error: 'Manual PDF não encontrado.' });
    return;
  }

  const indice = await obterOuCriarIndiceManual(
    localizado.manual.id,
    localizado.caminhoAbsoluto,
  );

  if (numeroRaw > indice.totalPaginas) {
    res.status(400).json({
      error: `A página solicitada (${numeroRaw}) excede o total de páginas do manual (${indice.totalPaginas}).`,
    });
    return;
  }

  const paginaEncontrada = indice.paginas[numeroRaw - 1];

  res.json({
    manualId: indice.manualId,
    pagina: numeroRaw,
    totalPaginas: indice.totalPaginas,
    temTextoPesquisavel: indice.temTextoPesquisavel,
    texto: paginaEncontrada?.texto ?? '',
  });
};

api.get('/manuais/:id/indice', handleManualIndice);
api.get('/manuais/{*id}/indice', handleManualIndice);

api.get('/manuais/:id/buscar', handleManualBuscar);
api.get('/manuais/{*id}/buscar', handleManualBuscar);

api.get('/manuais/:id/pagina/:numero', handleManualPagina);
api.get('/manuais/{*id}/pagina/:numero', handleManualPagina);

// 404 para rotas de API inexistentes (Express 5: wildcard nomeado)
api.all('/{*splat}', (_req, res) => {
  res.status(404).json({ error: 'Rota de API não encontrada.' });
});

app.use('/api', api);

// ---------------------------------------------------------------------------
// Front-end estático (apenas em produção; em dev o Vite serve o React)
// ---------------------------------------------------------------------------
if (IS_PROD && existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { index: false, maxAge: '1h' }));

  // SPA fallback
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// ---------------------------------------------------------------------------
// Tratamento de erros (Express 5 propaga rejeições de handlers async)
// ---------------------------------------------------------------------------
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status =
    typeof err === 'object' && err !== null && 'status' in err && typeof err.status === 'number'
      ? err.status
      : 500;
  if (status >= 400 && status < 500) {
    res.status(status).json({ error: 'Requisição inválida.' });
    return;
  }
  console.error('[server] erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Guia de Oficina API ouvindo em http://0.0.0.0:${PORT} (${IS_PROD ? 'prod' : 'dev'})`);
});

const shutdown = (signal: string) => {
  console.log(`[server] ${signal} recebido, encerrando...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
