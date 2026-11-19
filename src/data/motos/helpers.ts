import type { AuditoriaTecnica, Faixa, Geracao, TorqueAperto } from '@/types/moto';

export interface GeracaoInput extends Omit<Geracao, 'id' | 'anosLabel' | 'auditoria'> {
  /** Sufixo opcional para desambiguar ids com a mesma faixa de anos. */
  sufixoId?: string;
  /** Metadados de auditoria técnica; se omitido, assume pendente de conferência com PDF local. */
  auditoria?: AuditoriaTecnica;
}

export function geracao(modeloId: string, { sufixoId, auditoria, ...g }: GeracaoInput): Geracao {
  const anosLabel = `${g.anoInicio}–${g.anoFim}`;
  return {
    id: [modeloId, g.anoInicio, g.anoFim, sufixoId].filter(Boolean).join('-'),
    anosLabel,
    auditoria: auditoria ?? {
      status: 'pendente_conferencia',
      ultimaRevisao: '2026-11-19',
      fonte: `Base técnica de fábrica (${g.nomeGeracao} • ${anosLabel}) — aguardando anexo do PDF local em public/manuals/`,
      notas:
        'Valores preenchidos conforme especificações de serviço da montadora. Adicione o PDF oficial na biblioteca para vincular a conferência página a página.',
    },
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
