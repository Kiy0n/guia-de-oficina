import { CATALOGO } from '@/data/catalog';
import type { Geracao, Marca, Modelo, MotoSelecionada } from '@/types/moto';

export function getModelosPorMarca(marca: Marca): Modelo[] {
  return CATALOGO.filter((m) => m.marca === marca).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true, sensitivity: 'base' }),
  );
}

export function contarModelos(marca: Marca): number {
  return getModelosPorMarca(marca).length;
}

export function findModelo(modeloId: string): Modelo | undefined {
  return CATALOGO.find((m) => m.id === modeloId);
}

export function findGeracao(modelo: Modelo, geracaoId: string): Geracao | undefined {
  return modelo.geracoes.find((g) => g.id === geracaoId);
}

export function resolverSelecao(modeloId: string, geracaoId: string): MotoSelecionada | null {
  const modelo = findModelo(modeloId);
  if (!modelo) return null;
  const geracao = findGeracao(modelo, geracaoId);
  if (!geracao) return null;
  return { marca: modelo.marca, modelo, geracao };
}

/** Faixa total de anos coberta pelo modelo, ex.: "2016–2026". */
export function faixaAnosModelo(modelo: Modelo): string {
  const inicio = Math.min(...modelo.geracoes.map((g) => g.anoInicio));
  const fim = Math.max(...modelo.geracoes.map((g) => g.anoFim));
  return `${inicio}–${fim}`;
}

/** Cilindradas distintas do modelo, ex.: "149,3 / 156,9cc". */
export function cilindradaModelo(modelo: Modelo): string {
  const valores = [...new Set(modelo.geracoes.map((g) => g.fichaTecnica.cilindradaCc))].sort((a, b) => a - b);
  return `${valores.map((v) => v.toLocaleString('pt-BR')).join(' / ')}cc`;
}

// ---------------------------------------------------------------------------
// Busca rápida
// ---------------------------------------------------------------------------

/** Minúsculas, sem acentos e sem espaços/pontuação ("CG 160" → "cg160"). */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export interface ResultadoBusca {
  modelo: Modelo;
  /** Gerações que cobrem o ano digitado (vazio se nenhum ano foi informado). */
  geracoesNoAno: Geracao[];
}

/**
 * Busca modelos por texto livre. Aceita marca, nome, aliases e um ano opcional,
 * ex.: "cg 160 2019", "intruder", "honda bros".
 */
export function buscarModelos(consulta: string, modelos: readonly Modelo[] = CATALOGO): ResultadoBusca[] {
  const tokens = consulta.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const ano = tokens.map(Number).find((n) => Number.isInteger(n) && n >= 1980 && n <= 2100);
  const termos = tokens.filter((t) => Number(t) !== ano).map(normalizar).filter(Boolean);
  const termoUnido = termos.join('');

  const resultados: ResultadoBusca[] = [];

  for (const modelo of modelos) {
    const palheiro = normalizar([modelo.marca, modelo.nome, ...(modelo.aliases ?? [])].join(' '));
    const casaTexto = termos.length === 0 || palheiro.includes(termoUnido) || termos.every((t) => palheiro.includes(t));
    if (!casaTexto) continue;

    const geracoesNoAno = ano ? modelo.geracoes.filter((g) => ano >= g.anoInicio && ano <= g.anoFim) : [];
    if (ano && geracoesNoAno.length === 0) continue;

    resultados.push({ modelo, geracoesNoAno });
  }

  return resultados;
}
