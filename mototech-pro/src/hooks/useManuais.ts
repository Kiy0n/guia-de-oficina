import { useCallback, useEffect, useState } from 'react';
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
      const url = qs ? `/api/manuais?${qs}` : '/api/manuais';
      const res = await fetch(url, { headers: { Accept: 'application/json' } });

      if (!res.ok) {
        throw new Error(`Falha ao consultar biblioteca de manuais (HTTP ${res.status})`);
      }

      const data = (await res.json()) as RespostaManuaisApi;
      setManuais(Array.isArray(data.manuais) ? data.manuais : []);
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
