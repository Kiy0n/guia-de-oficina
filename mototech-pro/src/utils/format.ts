import type { Alimentacao, Arrefecimento, Cambio, Categoria, Combustivel, Partida, SistemaFreio, TipoFreio } from '@/types/moto';

export const CATEGORIA_LABEL: Record<Categoria, string> = {
  street: 'Street',
  trail: 'Trail',
  cub: 'Cub',
  scooter: 'Scooter',
  custom: 'Custom',
};

export const ALIMENTACAO_LABEL: Record<Alimentacao, string> = {
  carburador: 'Carburador',
  injecao: 'Injeção eletrônica',
};

export const COMBUSTIVEL_LABEL: Record<Combustivel, string> = {
  gasolina: 'Gasolina',
  flex: 'Flex (gasolina/etanol)',
};

export const ARREFECIMENTO_LABEL: Record<Arrefecimento, string> = {
  ar: 'Ar',
  'ar-oleo': 'Ar/óleo',
  liquido: 'Líquido',
};

export const PARTIDA_LABEL: Record<Partida, string> = {
  pedal: 'Pedal',
  eletrica: 'Elétrica',
  'pedal-eletrica': 'Pedal + elétrica',
};

export const FREIO_LABEL: Record<TipoFreio, string> = {
  tambor: 'Tambor',
  disco: 'Disco',
};

export const SISTEMA_FREIO_LABEL: Record<SistemaFreio, string> = {
  convencional: 'Convencional',
  CBS: 'CBS (combinado)',
  UBS: 'UBS (combinado)',
  ABS: 'ABS',
};

export function cambioLabel(cambio: Cambio): string {
  switch (cambio.tipo) {
    case 'manual':
      return `Manual ${cambio.marchas} marchas`;
    case 'semiautomatico':
      return `Semiautomático ${cambio.marchas} marchas`;
    case 'cvt':
      return 'Automático CVT';
  }
}

export function cilindradaLabel(cc: number): string {
  return `${cc.toLocaleString('pt-BR')}cc`;
}
