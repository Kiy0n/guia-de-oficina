import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PaginaManualExtraida {
  numero: number;
  texto: string;
}

export interface ManualIndexCache {
  manualId: string;
  mtimeMs: number;
  size: number;
  totalPaginas: number;
  temTextoPesquisavel: boolean;
  extraidoEm: string;
  paginas: PaginaManualExtraida[];
}

export interface ResultadoBuscaPagina {
  pagina: number;
  ocorrencias: number;
  snippets: string[];
}

export interface RespostaBuscaManual {
  manualId: string;
  query: string;
  temTextoPesquisavel: boolean;
  totalPaginas: number;
  totalOcorrencias: number;
  resultados: ResultadoBuscaPagina[];
}

const INDEX_DIR = path.join(process.cwd(), 'data', 'manuals-index');
const MIN_CARACTERES_PESQUISAVEIS = 50;
const MAX_SNIPPETS_POR_PAGINA = 3;

// Controle de concorrência em memória para evitar dupla extração simultânea do mesmo PDF
const extracoesEmAndamento = new Map<string, Promise<ManualIndexCache>>();

export function normalizarTextoBusca(texto: string): string {
  return texto
    .normalize('NFC')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function gerarNomeArquivoCache(manualId: string): string {
  const semExt = manualId.replace(/\.pdf$/i, '');
  const seguro = semExt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/]+/g, '__')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '')
    .toLowerCase();

  return `${seguro || 'manual'}.json`;
}

function obterCaminhoCache(manualId: string): string {
  return path.join(INDEX_DIR, gerarNomeArquivoCache(manualId));
}

async function lerCacheValido(
  manualId: string,
  mtimeMs: number,
  size: number,
): Promise<ManualIndexCache | null> {
  const cachePath = obterCaminhoCache(manualId);
  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    const raw = await readFile(cachePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ManualIndexCache> | null;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.manualId !== manualId ||
      typeof parsed.mtimeMs !== 'number' ||
      typeof parsed.size !== 'number' ||
      typeof parsed.totalPaginas !== 'number' ||
      typeof parsed.temTextoPesquisavel !== 'boolean' ||
      typeof parsed.extraidoEm !== 'string' ||
      !Array.isArray(parsed.paginas)
    ) {
      return null;
    }

    // Invalidação automática caso mtimeMs ou size do arquivo tenham mudado
    if (Math.abs(parsed.mtimeMs - mtimeMs) > 1 || parsed.size !== size) {
      return null;
    }

    return parsed as ManualIndexCache;
  } catch {
    return null;
  }
}

async function salvarCacheDisco(cache: ManualIndexCache): Promise<void> {
  await mkdir(INDEX_DIR, { recursive: true });
  const cachePath = obterCaminhoCache(cache.manualId);
  const tempPath = `${cachePath}.tmp`;
  const payload = `${JSON.stringify(cache, null, 2)}\n`;

  try {
    await writeFile(tempPath, payload, 'utf-8');
    await rename(tempPath, cachePath);
  } catch {
    await writeFile(cachePath, payload, 'utf-8');
  }
}

function limparTextoPagina(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((linha) => linha.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extrairPdfDoDisco(
  manualId: string,
  caminhoPdfAbsoluto: string,
  mtimeMs: number,
  size: number,
): Promise<ManualIndexCache> {
  const buffer = await readFile(caminhoPdfAbsoluto);
  const data = new Uint8Array(buffer);

  const loadingTask = getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    verbosity: 0,
  });

  const paginas: PaginaManualExtraida[] = [];
  let totalPaginas = 0;

  try {
    const doc = await loadingTask.promise;
    totalPaginas = doc.numPages;

    for (let numero = 1; numero <= totalPaginas; numero++) {
      try {
        const page = await doc.getPage(numero);
        const textContent = await page.getTextContent();
        let bruto = '';

        for (const item of textContent.items) {
          if (!item || typeof item !== 'object' || !('str' in item)) {
            continue;
          }
          const str = typeof item.str === 'string' ? item.str : '';
          const hasEOL = Boolean((item as { hasEOL?: boolean }).hasEOL);

          if (str.length > 0) {
            if (
              bruto.length > 0 &&
              !bruto.endsWith('\n') &&
              !bruto.endsWith(' ') &&
              !str.startsWith(' ')
            ) {
              bruto += ' ';
            }
            bruto += str;
          }

          if (hasEOL && !bruto.endsWith('\n')) {
            bruto += '\n';
          }
        }

        paginas.push({
          numero,
          texto: limparTextoPagina(bruto),
        });
      } catch {
        paginas.push({
          numero,
          texto: '',
        });
      }
    }
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }

  const totalCaracteresUteis = paginas.reduce(
    (acc, p) => acc + p.texto.replace(/\s+/g, '').length,
    0,
  );

  const cache: ManualIndexCache = {
    manualId,
    mtimeMs,
    size,
    totalPaginas,
    temTextoPesquisavel: totalCaracteresUteis >= MIN_CARACTERES_PESQUISAVEIS,
    extraidoEm: new Date().toISOString(),
    paginas,
  };

  await salvarCacheDisco(cache);
  return cache;
}

export async function obterOuCriarIndiceManual(
  manualId: string,
  caminhoPdfAbsoluto: string,
): Promise<ManualIndexCache> {
  await mkdir(INDEX_DIR, { recursive: true });
  const info = await stat(caminhoPdfAbsoluto);
  const mtimeMs = Math.round(info.mtimeMs);
  const size = info.size;

  const emCache = await lerCacheValido(manualId, mtimeMs, size);
  if (emCache) {
    return emCache;
  }

  const pendente = extracoesEmAndamento.get(manualId);
  if (pendente) {
    return pendente;
  }

  const promessa = extrairPdfDoDisco(manualId, caminhoPdfAbsoluto, mtimeMs, size).finally(() => {
    extracoesEmAndamento.delete(manualId);
  });

  extracoesEmAndamento.set(manualId, promessa);
  return promessa;
}

function extrairSnippetContextual(
  textoOriginalLinear: string,
  inicioMatch: number,
  tamanhoMatch: number,
): { snippet: string; fimJanela: number } {
  const JANELA_ANTES = 65;
  const JANELA_DEPOIS = 95;

  let start = Math.max(0, inicioMatch - JANELA_ANTES);
  let end = Math.min(textoOriginalLinear.length, inicioMatch + tamanhoMatch + JANELA_DEPOIS);

  if (start > 0) {
    const proximoEspaco = textoOriginalLinear.indexOf(' ', start);
    if (proximoEspaco !== -1 && proximoEspaco < inicioMatch && proximoEspaco - start <= 18) {
      start = proximoEspaco + 1;
    }
  }

  if (end < textoOriginalLinear.length) {
    const ultimoEspaco = textoOriginalLinear.lastIndexOf(' ', end);
    if (
      ultimoEspaco !== -1 &&
      ultimoEspaco > inicioMatch + tamanhoMatch &&
      end - ultimoEspaco <= 18
    ) {
      end = ultimoEspaco;
    }
  }

  const trecho = textoOriginalLinear.slice(start, end).trim();
  const prefixo = start > 0 ? '…' : '';
  const sufixo = end < textoOriginalLinear.length ? '…' : '';

  return {
    snippet: `${prefixo}${trecho}${sufixo}`,
    fimJanela: end,
  };
}

export function buscarNoIndiceManual(
  indice: ManualIndexCache,
  queryBruta: string,
): RespostaBuscaManual {
  const query = queryBruta.trim();

  if (!indice.temTextoPesquisavel) {
    return {
      manualId: indice.manualId,
      query,
      temTextoPesquisavel: false,
      totalPaginas: indice.totalPaginas,
      totalOcorrencias: 0,
      resultados: [],
    };
  }

  const termos = Array.from(
    new Set(
      normalizarTextoBusca(query)
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    ),
  );

  if (termos.length === 0) {
    return {
      manualId: indice.manualId,
      query,
      temTextoPesquisavel: true,
      totalPaginas: indice.totalPaginas,
      totalOcorrencias: 0,
      resultados: [],
    };
  }

  const resultados: ResultadoBuscaPagina[] = [];
  let totalOcorrencias = 0;

  for (const pagina of indice.paginas) {
    if (!pagina.texto) continue;

    const textoLinear = pagina.texto.normalize('NFC').replace(/\s+/g, ' ').trim();
    if (!textoLinear) continue;

    const textoNorm = normalizarTextoBusca(textoLinear);

    // Todos os termos buscados devem estar presentes na página
    const contemTodos = termos.every((termo) => textoNorm.includes(termo));
    if (!contemTodos) continue;

    // Coleta todas as posições de ocorrência dos termos na página
    const posicoes: Array<{ index: number; length: number }> = [];

    for (const termo of termos) {
      let cursor = 0;
      while (cursor < textoNorm.length) {
        const idx = textoNorm.indexOf(termo, cursor);
        if (idx === -1) break;
        posicoes.push({ index: idx, length: termo.length });
        cursor = idx + termo.length;
      }
    }

    if (posicoes.length === 0) continue;

    posicoes.sort((a, b) => a.index - b.index);

    const ocorrenciasPagina = posicoes.length;
    totalOcorrencias += ocorrenciasPagina;

    const snippets: string[] = [];
    let ultimoFimJanela = -1;

    for (const pos of posicoes) {
      if (snippets.length >= MAX_SNIPPETS_POR_PAGINA) break;
      // Evita gerar snippets duplicados/sobrepostos para ocorrências muito próximas
      if (ultimoFimJanela !== -1 && pos.index < ultimoFimJanela - 20) {
        continue;
      }
      const { snippet, fimJanela } = extrairSnippetContextual(
        textoLinear,
        pos.index,
        pos.length,
      );
      if (snippet) {
        snippets.push(snippet);
        ultimoFimJanela = fimJanela;
      }
    }

    resultados.push({
      pagina: pagina.numero,
      ocorrencias: ocorrenciasPagina,
      snippets,
    });
  }

  return {
    manualId: indice.manualId,
    query,
    temTextoPesquisavel: true,
    totalPaginas: indice.totalPaginas,
    totalOcorrencias,
    resultados,
  };
}
