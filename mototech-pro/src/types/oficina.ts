import type { Marca } from '@/types/moto';

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
  marca: Marca;
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

/** Dados pré-preenchidos vindos de outra aba (ex.: Diagnóstico Corretivo ou Iniciar Revisão -> OS). */
export interface RascunhoOrdemServico {
  tipo?: TipoOrdemServico;
  kmAtual?: number;
  proximaTrocaOleoKm?: number;
  apelidoOuPlaca?: string;
  servicosRealizados?: string[];
  pecas?: PecaOrdemServico[];
  observacoes?: string;
}
