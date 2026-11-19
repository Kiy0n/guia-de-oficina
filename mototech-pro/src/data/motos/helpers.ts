import type { Faixa, Geracao, TorqueAperto } from '@/types/moto';

export interface GeracaoInput extends Omit<Geracao, 'id' | 'anosLabel'> {
  /** Sufixo opcional para desambiguar ids com a mesma faixa de anos. */
  sufixoId?: string;
}

export function geracao(modeloId: string, { sufixoId, ...g }: GeracaoInput): Geracao {
  return {
    id: [modeloId, g.anoInicio, g.anoFim, sufixoId].filter(Boolean).join('-'),
    anosLabel: `${g.anoInicio}–${g.anoFim}`,
    ...g,
  };
}

export function faixaMm(min: number, max: number, label?: string): Faixa<'mm'> {
  return { min, max, unidade: 'mm', ...(label ? { label } : {}) };
}

export function faixaRpm(min: number, max: number, label?: string): Faixa<'rpm'> {
  return { min, max, unidade: 'rpm', ...(label ? { label } : {}) };
}

export function torque(
  item: string,
  valorNm: number,
  categoria: TorqueAperto['categoria'],
  observacao?: string,
): TorqueAperto {
  return {
    item,
    categoria,
    torque: { valor: valorNm, unidade: 'N·m' },
    ...(observacao ? { observacao } : {}),
  };
}
