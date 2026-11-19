import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT ?? 3001);
const IS_PROD = process.env.NODE_ENV === 'production';
const ROOT_DIR = process.cwd();
const CLIENT_DIST = path.join(ROOT_DIR, 'dist');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

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
