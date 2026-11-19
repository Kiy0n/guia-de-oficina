/**
 * Agregador único do catálogo de motos do Guia de Oficina.
 *
 * Os dados completos de manual por fabricante e geração estão modularizados em:
 * - `src/data/motos/honda.ts` (12 modelos / 24 gerações)
 * - `src/data/motos/yamaha.ts` (5 modelos / 10 gerações)
 * - `src/data/motos/suzuki.ts` (2 modelos / 3 gerações)
 */
import { HONDA as HONDA_RAW } from '@/data/motos/honda';
import { SUZUKI as SUZUKI_RAW } from '@/data/motos/suzuki';
import { YAMAHA as YAMAHA_RAW } from '@/data/motos/yamaha';
import type { Geracao, ListaGeracoes, Modelo } from '@/types/moto';

function ordenarGeracoes(geracoes: ListaGeracoes): ListaGeracoes {
  const ordenadas = [...geracoes].sort(
    (a, b) => a.anoInicio - b.anoInicio || a.anoFim - b.anoFim,
  );
  const [primeira, ...restante] = ordenadas as [Geracao, ...Geracao[]];
  return [primeira, ...restante];
}

function ordenarModelosEGeracoes(modelos: readonly Modelo[]): Modelo[] {
  return [...modelos]
    .map((modelo) => ({
      ...modelo,
      geracoes: ordenarGeracoes(modelo.geracoes),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true, sensitivity: 'base' }));
}

export const HONDA: Modelo[] = ordenarModelosEGeracoes(HONDA_RAW);
export const YAMAHA: Modelo[] = ordenarModelosEGeracoes(YAMAHA_RAW);
export const SUZUKI: Modelo[] = ordenarModelosEGeracoes(SUZUKI_RAW);

export const CATALOGO: readonly Modelo[] = [...HONDA, ...YAMAHA, ...SUZUKI];
