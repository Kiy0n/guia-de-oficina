import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface OficinaData {
  ferramentasPossuidas: string[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const OFICINA_FILE = path.join(DATA_DIR, 'oficina.json');

const DEFAULT_OFICINA_DATA: OficinaData = {
  ferramentasPossuidas: [],
};

// Fila em memória para serializar escritas concorrentes com segurança
let writeQueue: Promise<void> = Promise.resolve();

function normalizarOficinaData(raw: unknown): OficinaData {
  if (!raw || typeof raw !== 'object') {
    return {
      ferramentasPossuidas: [],
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

  return {
    ferramentasPossuidas,
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
    const atualizado: OficinaData = {
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

export async function restaurarOficinaBackup(
  raw: unknown,
): Promise<
  | { ok: true; totalFerramentas: number; dados: OficinaData }
  | { ok: false; erro: string }
> {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, erro: 'Arquivo de backup inválido (esperado um objeto JSON).' };
  }

  const obj = raw as Record<string, unknown>;

  if (
    !Array.isArray(obj.ferramentasPossuidas) ||
    !obj.ferramentasPossuidas.every((item) => typeof item === 'string')
  ) {
    return {
      ok: false,
      erro: 'Campo "ferramentasPossuidas" ausente ou inválido (deve ser array de strings).',
    };
  }

  const ferramentasLimpas = Array.from(
    new Set(obj.ferramentasPossuidas.map((s) => s.trim()).filter(Boolean)),
  );

  const novoEstado: OficinaData = {
    ferramentasPossuidas: ferramentasLimpas,
  };

  const operacao = writeQueue.then(async () => {
    await gravarArquivoAtomico(novoEstado);
  });

  writeQueue = operacao.catch((err) => {
    console.error('[storage] falha ao restaurar backup em oficina.json:', err);
  });

  await operacao;

  return {
    ok: true,
    totalFerramentas: novoEstado.ferramentasPossuidas.length,
    dados: novoEstado,
  };
}
