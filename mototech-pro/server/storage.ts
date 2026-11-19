import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type TipoOrdemServico = 'preventiva' | 'corretiva' | 'revisao';

export interface PecaOrdemServico {
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export interface OrdemServico {
  id: string;
  criadaEm: string;
  dataServico: string;
  marca: 'Honda' | 'Yamaha' | 'Suzuki';
  modeloId: string;
  modeloNome: string;
  geracaoId: string;
  anosLabel: string;
  apelidoOuPlaca?: string;
  kmAtual: number;
  proximaTrocaOleoKm?: number;
  tipo: TipoOrdemServico;
  servicosRealizados: string[];
  pecas: PecaOrdemServico[];
  maoDeObra?: number;
  observacoes: string;
}

export type OrdemServicoPayload = Omit<OrdemServico, 'id' | 'criadaEm'>;

export interface OficinaData {
  ferramentasPossuidas: string[];
  ordensServico: OrdemServico[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const OFICINA_FILE = path.join(DATA_DIR, 'oficina.json');

const DEFAULT_OFICINA_DATA: OficinaData = {
  ferramentasPossuidas: [],
  ordensServico: [],
};

// Fila em memória para serializar escritas concorrentes com segurança
let writeQueue: Promise<void> = Promise.resolve();

function isMarcaValida(v: unknown): v is 'Honda' | 'Yamaha' | 'Suzuki' {
  return v === 'Honda' || v === 'Yamaha' || v === 'Suzuki';
}

function isTipoOsValido(v: unknown): v is TipoOrdemServico {
  return v === 'preventiva' || v === 'corretiva' || v === 'revisao';
}

export function validarPayloadOrdemServico(
  raw: unknown,
): { ok: true; payload: OrdemServicoPayload } | { ok: false; erro: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, erro: 'Corpo da requisição inválido.' };
  }

  const obj = raw as Record<string, unknown>;

  const dataServico = typeof obj.dataServico === 'string' ? obj.dataServico.trim() : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataServico)) {
    return { ok: false, erro: 'Campo "dataServico" obrigatório no formato YYYY-MM-DD.' };
  }

  if (!isMarcaValida(obj.marca)) {
    return { ok: false, erro: 'Campo "marca" deve ser Honda, Yamaha ou Suzuki.' };
  }

  const modeloId = typeof obj.modeloId === 'string' ? obj.modeloId.trim() : '';
  const modeloNome = typeof obj.modeloNome === 'string' ? obj.modeloNome.trim() : '';
  const geracaoId = typeof obj.geracaoId === 'string' ? obj.geracaoId.trim() : '';
  const anosLabel = typeof obj.anosLabel === 'string' ? obj.anosLabel.trim() : '';

  if (!modeloId || !modeloNome || !geracaoId || !anosLabel) {
    return {
      ok: false,
      erro: 'Campos "modeloId", "modeloNome", "geracaoId" e "anosLabel" são obrigatórios.',
    };
  }

  const kmAtual = Number(obj.kmAtual);
  if (Number.isNaN(kmAtual) || kmAtual < 0) {
    return { ok: false, erro: 'Campo "kmAtual" deve ser um número maior ou igual a zero.' };
  }

  if (!isTipoOsValido(obj.tipo)) {
    return { ok: false, erro: 'Campo "tipo" deve ser preventiva, corretiva ou revisao.' };
  }

  if (!Array.isArray(obj.servicosRealizados)) {
    return { ok: false, erro: 'Campo "servicosRealizados" deve ser um array de strings.' };
  }

  const servicosRealizados = obj.servicosRealizados
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter(Boolean);

  const pecasRaw = Array.isArray(obj.pecas) ? obj.pecas : [];
  const pecas: PecaOrdemServico[] = [];
  for (const p of pecasRaw) {
    if (!p || typeof p !== 'object') continue;
    const rec = p as Record<string, unknown>;
    const nome = typeof rec.nome === 'string' ? rec.nome.trim() : '';
    const quantidade = Number(rec.quantidade ?? 1);
    const valorUnitario = Number(rec.valorUnitario ?? 0);
    if (!nome) continue;
    pecas.push({
      nome,
      quantidade: Number.isNaN(quantidade) || quantidade <= 0 ? 1 : quantidade,
      valorUnitario: Number.isNaN(valorUnitario) || valorUnitario < 0 ? 0 : valorUnitario,
    });
  }

  const apelidoOuPlaca =
    typeof obj.apelidoOuPlaca === 'string' && obj.apelidoOuPlaca.trim().length > 0
      ? obj.apelidoOuPlaca.trim()
      : undefined;

  const proximaTrocaRaw =
    obj.proximaTrocaOleoKm !== undefined && obj.proximaTrocaOleoKm !== null && obj.proximaTrocaOleoKm !== ''
      ? Number(obj.proximaTrocaOleoKm)
      : undefined;
  const proximaTrocaOleoKm =
    proximaTrocaRaw !== undefined && !Number.isNaN(proximaTrocaRaw) && proximaTrocaRaw > 0
      ? Math.round(proximaTrocaRaw)
      : undefined;

  const maoDeObraRaw = obj.maoDeObra !== undefined ? Number(obj.maoDeObra) : 0;
  const maoDeObra = Number.isNaN(maoDeObraRaw) || maoDeObraRaw < 0 ? 0 : maoDeObraRaw;

  const observacoes = typeof obj.observacoes === 'string' ? obj.observacoes.trim() : '';

  return {
    ok: true,
    payload: {
      dataServico,
      marca: obj.marca,
      modeloId,
      modeloNome,
      geracaoId,
      anosLabel,
      ...(apelidoOuPlaca ? { apelidoOuPlaca } : {}),
      kmAtual: Math.round(kmAtual),
      ...(proximaTrocaOleoKm !== undefined ? { proximaTrocaOleoKm } : {}),
      tipo: obj.tipo,
      servicosRealizados,
      pecas,
      maoDeObra,
      observacoes,
    },
  };
}

function normalizarOrdemSalva(raw: unknown): OrdemServico | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const id = typeof obj.id === 'string' ? obj.id.trim() : '';
  const criadaEm = typeof obj.criadaEm === 'string' ? obj.criadaEm.trim() : new Date().toISOString();
  if (!id) return null;

  const validacao = validarPayloadOrdemServico(obj);
  if (!validacao.ok) return null;

  return {
    id,
    criadaEm,
    ...validacao.payload,
  };
}

function ordenarOrdensMaisRecentes(lista: OrdemServico[]): OrdemServico[] {
  return [...lista].sort((a, b) => {
    const cmpData = b.dataServico.localeCompare(a.dataServico);
    if (cmpData !== 0) return cmpData;
    return b.criadaEm.localeCompare(a.criadaEm);
  });
}

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

  const ordensRaw = Array.isArray(obj.ordensServico) ? obj.ordensServico : [];
  const ordensServico = ordenarOrdensMaisRecentes(
    ordensRaw
      .map((item) => normalizarOrdemSalva(item))
      .filter((item): item is OrdemServico => item !== null),
  );

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

export async function listarOrdensServico(): Promise<OrdemServico[]> {
  const dados = await lerOficinaData();
  return ordenarOrdensMaisRecentes(dados.ordensServico);
}

export async function criarOrdemServico(payload: OrdemServicoPayload): Promise<OrdemServico> {
  const nova: OrdemServico = {
    id: `os-${Date.now()}-${randomUUID().slice(0, 8)}`,
    criadaEm: new Date().toISOString(),
    ...payload,
  };

  const operacao = writeQueue.then(async () => {
    const atual = await lerOficinaData();
    const ordens = ordenarOrdensMaisRecentes([nova, ...atual.ordensServico]);
    await gravarArquivoAtomico({
      ...atual,
      ordensServico: ordens,
    });
  });

  writeQueue = operacao.catch((err) => {
    console.error('[storage] falha ao criar OS em oficina.json:', err);
  });

  await operacao;
  return nova;
}

export async function atualizarOrdemServico(
  id: string,
  payload: OrdemServicoPayload,
): Promise<OrdemServico | null> {
  let resultado: OrdemServico | null = null;

  const operacao = writeQueue.then(async () => {
    const atual = await lerOficinaData();
    const idx = atual.ordensServico.findIndex((o) => o.id === id);
    if (idx === -1) {
      resultado = null;
      return;
    }
    const existente = atual.ordensServico[idx];
    if (!existente) {
      resultado = null;
      return;
    }

    const atualizada: OrdemServico = {
      id: existente.id,
      criadaEm: existente.criadaEm,
      ...payload,
    };

    const copia = [...atual.ordensServico];
    copia[idx] = atualizada;

    await gravarArquivoAtomico({
      ...atual,
      ordensServico: ordenarOrdensMaisRecentes(copia),
    });
    resultado = atualizada;
  });

  writeQueue = operacao.catch((err) => {
    console.error('[storage] falha ao atualizar OS em oficina.json:', err);
  });

  await operacao;
  return resultado;
}

export async function removerOrdemServico(id: string): Promise<boolean> {
  let removido = false;

  const operacao = writeQueue.then(async () => {
    const atual = await lerOficinaData();
    const filtradas = atual.ordensServico.filter((o) => o.id !== id);
    if (filtradas.length === atual.ordensServico.length) {
      removido = false;
      return;
    }
    removido = true;
    await gravarArquivoAtomico({
      ...atual,
      ordensServico: filtradas,
    });
  });

  writeQueue = operacao.catch((err) => {
    console.error('[storage] falha ao remover OS em oficina.json:', err);
  });

  await operacao;
  return removido;
}
