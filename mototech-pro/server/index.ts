import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

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
// ---------------------------------------------------------------------------
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

function modelosCasam(modeloPdfSlug: string, filtroModelo: string): boolean {
  const a = normalizarSlugSimples(modeloPdfSlug);
  const b = normalizarSlugSimples(filtroModelo);
  if (!a || !b) return true;
  if (a === b) return true;
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

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const api = express.Router();

api.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'MotoTech Pro',
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
  const anoInicioRaw = typeof req.query.anoInicio === 'string' ? Number(req.query.anoInicio) : undefined;
  const anoFimRaw = typeof req.query.anoFim === 'string' ? Number(req.query.anoFim) : undefined;

  const anoInicio = anoInicioRaw !== undefined && !Number.isNaN(anoInicioRaw) ? anoInicioRaw : undefined;
  const anoFim = anoFimRaw !== undefined && !Number.isNaN(anoFimRaw) ? anoFimRaw : undefined;

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
  console.error('[server] erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] MotoTech Pro API ouvindo em http://0.0.0.0:${PORT} (${IS_PROD ? 'prod' : 'dev'})`);
});

const shutdown = (signal: string) => {
  console.log(`[server] ${signal} recebido, encerrando...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
