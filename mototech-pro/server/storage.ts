import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface OficinaData {
  ferramentasPossuidas: string[];
  ordensServico: unknown[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const OFICINA_FILE = path.join(DATA_DIR, 'oficina.json');

const DEFAULT_OFICINA_DATA: OficinaData = {
  ferramentasPossuidas: [],
  ordensServico: [],
};

// Fila em memória para serializar escritas concorrentes com segurança
let writeQueue: Promise<void> = Promise.resolve();

function normalizarOficinaData(raw: unknown): OficinaData {
  if (!raw || typeof raw !== 'object') {
    return {
      ferramentasPossuidas: [],
      ordensServico: [],
    };
  }

  const obj = raw as Record<string, unknown>;
  const ferramentasRaw = Array.isArray(obj.ferramentasPossuidas) ? obj.ferramentasPossuidas : [];
  const ferramentasPossuidas = Array.from(
    new Set(
      ferramentasRaw
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

  const ordensServico = Array.isArray(obj.ordensServico) ? obj.ordensServico : [];

  return {
    ferramentasPossuidas,
    ordensServico,
  };
}

async function gravarArquivoAtomico(dados: OficinaData): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const payload = `${JSON.stringify(dados, null, 2)}\n`;
  const tempFile = `${OFICINA_FILE}.tmp`;

  try {
    await writeFile(tempFile, payload, 'utf-8');
    await rename(tempFile, OFICINA_FILE);
  } catch {
    // Fallback direto para bind mounts Windows/Docker caso rename falhe por lock do host
    await writeFile(OFICINA_FILE, payload, 'utf-8');
  }
}

export async function lerOficinaData(): Promise<OficinaData> {
  await mkdir(DATA_DIR, { recursive: true });

  if (!existsSync(OFICINA_FILE)) {
    const inicial: OficinaData = {
      ferramentasPossuidas: [...DEFAULT_OFICINA_DATA.ferramentasPossuidas],
      ordensServico: [...DEFAULT_OFICINA_DATA.ordensServico],
    };
    await gravarArquivoAtomico(inicial);
    return inicial;
  }

  try {
    const conteudo = await readFile(OFICINA_FILE, 'utf-8');
    const parsed: unknown = JSON.parse(conteudo);
    return normalizarOficinaData(parsed);
  } catch (err) {
    console.warn('[storage] oficina.json inválido ou vazio, recriando estrutura padrão:', err);
    const inicial: OficinaData = {
      ferramentasPossuidas: [],
      ordensServico: [],
    };
    await gravarArquivoAtomico(inicial);
    return inicial;
  }
}

export async function salvarFerramentasPossuidas(ferramentas: string[]): Promise<string[]> {
  const normalizadas = Array.from(
    new Set(ferramentas.map((id) => id.trim()).filter(Boolean)),
  );

  const operacao = writeQueue.then(async () => {
    const atual = await lerOficinaData();
    const atualizado: OficinaData = {
      ...atual,
      ferramentasPossuidas: normalizadas,
    };
    await gravarArquivoAtomico(atualizado);
  });

  writeQueue = operacao.catch((err) => {
    console.error('[storage] falha ao salvar ferramentas em oficina.json:', err);
  });

  await operacao;
  return normalizadas;
}
