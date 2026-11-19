import { useCallback, useEffect, useState } from 'react';
import { getApiBaseUrl, prefixApiUrl, resolveApiUrl } from '@/lib/apiBase';
import type { MotoSelecionada } from '@/types/moto';

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

export interface IndiceManualApi {
  manualId: string;
  totalPaginas: number;
  temTextoPesquisavel: boolean;
  extraidoEm: string;
}

export interface ResultadoBuscaPagina {
  pagina: number;
  ocorrencias: number;
  snippets: string[];
}

export interface RespostaBuscaManualApi {
  manualId: string;
  query: string;
  temTextoPesquisavel: boolean;
  totalPaginas: number;
  totalOcorrencias: number;
  resultados: ResultadoBuscaPagina[];
}

export interface PaginaTextoManualApi {
  manualId: string;
  pagina: number;
  totalPaginas: number;
  temTextoPesquisavel: boolean;
  texto: string;
}

export async function consultarIndiceManual(
  manualId: string,
  signal?: AbortSignal,
): Promise<IndiceManualApi> {
  const url = await resolveApiUrl(`/api/manuais/${encodeURIComponent(manualId)}/indice`);
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Falha ao indexar manual PDF (HTTP ${res.status})`);
  }
  return (await res.json()) as IndiceManualApi;
}

export async function buscarTextoManual(
  manualId: string,
  query: string,
  signal?: AbortSignal,
): Promise<RespostaBuscaManualApi> {
  const params = new URLSearchParams({ q: query.trim() });
  const url = await resolveApiUrl(
    `/api/manuais/${encodeURIComponent(manualId)}/buscar?${params.toString()}`,
  );
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Falha ao buscar no manual PDF (HTTP ${res.status})`);
  }
  return (await res.json()) as RespostaBuscaManualApi;
}

export async function lerPaginaTextoManual(
  manualId: string,
  numeroPagina: number,
  signal?: AbortSignal,
): Promise<PaginaTextoManualApi> {
  const url = await resolveApiUrl(
    `/api/manuais/${encodeURIComponent(manualId)}/pagina/${numeroPagina}`,
  );
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    throw new Error(`Falha ao carregar texto da página ${numeroPagina} (HTTP ${res.status})`);
  }
  return (await res.json()) as PaginaTextoManualApi;
}

interface RespostaManuaisApi {
  total: number;
  totalBiblioteca: number;
  manuais: ManualPdfItem[];
}

export interface FiltroManuais {
  marca?: string;
  modelo?: string;
  anoInicio?: number;
  anoFim?: number;
}

export function formatarTamanhoBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2).replace('.', ',')} MB`;
}

export function gerarCaminhoSugeridoManual(moto: MotoSelecionada): {
  pastaRelativa: string;
  exemploArquivo: string;
} {
  const marcaFolder = moto.marca.toLowerCase();
  const prefixoMarca = `${marcaFolder}-`;
  const modeloFolder = moto.modelo.id.toLowerCase().startsWith(prefixoMarca)
    ? moto.modelo.id.slice(prefixoMarca.length)
    : moto.modelo.id;
  const anoFolder =
    moto.geracao.anoInicio === moto.geracao.anoFim
      ? `${moto.geracao.anoInicio}`
      : `${moto.geracao.anoInicio}-${moto.geracao.anoFim}`;

  const pastaRelativa = `public/manuals/${marcaFolder}/${modeloFolder}/${anoFolder}/`;
  return {
    pastaRelativa,
    exemploArquivo: `${pastaRelativa}manual-servico.pdf`,
  };
}

export function useManuais(filtro?: FiltroManuais) {
  const [manuais, setManuais] = useState<ManualPdfItem[]>([]);
  const [totalBiblioteca, setTotalBiblioteca] = useState<number>(0);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  const marca = filtro?.marca;
  const modelo = filtro?.modelo;
  const anoInicio = filtro?.anoInicio;
  const anoFim = filtro?.anoFim;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const params = new URLSearchParams();
      if (marca) params.set('marca', marca);
      if (modelo) params.set('modelo', modelo);
      if (anoInicio !== undefined) params.set('anoInicio', String(anoInicio));
      if (anoFim !== undefined) params.set('anoFim', String(anoFim));

      const qs = params.toString();
      const baseUrl = await getApiBaseUrl();
      const path = qs ? `/api/manuais?${qs}` : '/api/manuais';
      const res = await fetch(prefixApiUrl(baseUrl, path), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Falha ao consultar biblioteca de manuais (HTTP ${res.status})`);
      }

      const data = (await res.json()) as RespostaManuaisApi;
      const lista = Array.isArray(data.manuais)
        ? data.manuais.map((item) => ({
            ...item,
            url: prefixApiUrl(baseUrl, item.url),
          }))
        : [];
      setManuais(lista);
      setTotalBiblioteca(typeof data.totalBiblioteca === 'number' ? data.totalBiblioteca : 0);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar lista de manuais PDF.');
      setManuais([]);
    } finally {
      setCarregando(false);
    }
  }, [marca, modelo, anoInicio, anoFim]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return {
    manuais,
    totalBiblioteca,
    carregando,
    erro,
    recarregar: carregar,
  };
}
