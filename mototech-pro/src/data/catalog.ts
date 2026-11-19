/**
 * Agregador único do catálogo de motos do MotoTech Pro.
 *
 * Os dados completos de manual por fabricante e geração estão modularizados em:
 * - `src/data/motos/honda.ts` (8 modelos / 18 gerações)
 * - `src/data/motos/yamaha.ts` (5 modelos / 11 gerações)
 * - `src/data/motos/suzuki.ts` (4 modelos / 6 gerações)
 */
import { HONDA } from '@/data/motos/honda';
import { SUZUKI } from '@/data/motos/suzuki';
import { YAMAHA } from '@/data/motos/yamaha';
import type { Modelo } from '@/types/moto';

export { HONDA, YAMAHA, SUZUKI };

export const CATALOGO: readonly Modelo[] = [...HONDA, ...YAMAHA, ...SUZUKI];
